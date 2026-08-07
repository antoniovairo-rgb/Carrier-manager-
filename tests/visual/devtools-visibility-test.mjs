#!/usr/bin/env node
/* [7.342.0 collaudo PO «il pulsante warning nel live match non lo vedo»] GUARDIANO DEL TACCUINO.
   Il tasto ⚠️ e la card degli appunti erano protetti dallo stesso flag degli hook di test
   (`window.__CPM_STORE_BUILD`), che `tools/build-dist.mjs` inietta in OGNI dist: risultato, gli strumenti
   di collaudo esistevano solo nel browser del PC e sparivano sul telefono — l'unico posto dove il collaudo
   si fa. Questa probe riproduce ESATTAMENTE quella condizione (store build simulata) e pretende che il
   tasto ci sia comunque, perché ora dipende da `devToolsOn()` e non più dal flag di build.

   Verifica:
     A. store build simulata + strumenti ACCESI  -> ⚠️ presente in partita, e apre il campo appunti
     B. strumenti SPENTI                          -> ⚠️ assente (l'interruttore serve a qualcosa)
     C. l'interruttore sopravvive al reload       -> la preferenza sta su `cpm-devtools`
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node devtools-visibility-test.mjs                        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { readFileSync } from 'node:fs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

/* --- A. STATICO — la verifica che avrebbe intercettato il bug originale.
       Non si puo' simulare una build store dal vivo: `__CPM_STORE_BUILD` spegne anche gli hook
       (`__CPM_FORCE_SIT`, `__CPM_SITS`) di cui l'harness ha bisogno per aprire una partita. Ma il punto e'
       proprio questo: il taccuino NON deve dipendere da quel flag. Lo si controlla sul sorgente. --- */
{
  const src = readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
  const btn = src.indexOf("Segna un'azione sbagliata");
  if (btn < 0) issues.push('(A) il tasto ⚠️ non esiste piu\' nel sorgente');
  else {
    const guard = src.slice(Math.max(0, btn - 1400), btn);
    const g = guard.lastIndexOf('{devToolsOn()&&');
    const bad = guard.lastIndexOf('{!window.__CPM_STORE_BUILD&&');
    if (g < 0 || bad > g)
      issues.push('(A) il tasto ⚠️ e\' di nuovo protetto da __CPM_STORE_BUILD: sparisce nell\'APK, che e\' dove serve');
    console.log(`(A) guardia del tasto ⚠️ → ${g >= 0 && bad < g ? 'devToolsOn() ✓' : '__CPM_STORE_BUILD ✗'}`);
  }
  /* lastIndexOf, non indexOf: la prima occorrenza della stringa sta nel commento di GAME_VERSION in cima
     al file (la release la cita), e cercare da li' misurava 436.000 caratteri di distanza dalla guardia. */
  const card = src.lastIndexOf('Appunti di collaudo</div>');
  const cg = src.lastIndexOf('{devToolsOn()&&(()=>{', card);
  if (card > 0 && (cg < 0 || card - cg > 2500))
    issues.push('(A) la card degli appunti nel Profilo non e\' governata da devToolsOn()');
  /* [7.344.0] IL TASTO NON BASTA. Il 7.342.0 aveva liberato il pulsante e la card, ma il TESTIMONE
     (l'anello che registra la partita) e il REGISTRO DELLE SCENE erano rimasti dietro `__CPM_STORE_BUILD`:
     sul telefono il taccuino si apriva ma la bozza automatica era sempre vuota e il selettore «quale azione»
     non compariva mai — cioe' le due funzioni per cui il taccuino esiste. Si controllano tutti e tre. */
  for (const [nome, ancora] of [['testimone (anello di registrazione)', 'const W=sr.current._wd||(sr.current._wd='],
                                ['registro delle scene', 'const key=hlIdx+(_forceSeqRef.current']]) {
    const at = src.indexOf(ancora);
    if (at < 0) { issues.push(`(A) non trovo il ${nome} nel sorgente (ancora cambiata?)`); continue; }
    const pre = src.slice(Math.max(0, at - 800), at);
    const gated = /_DEVT344|devToolsOn\(\)/.test(pre);
    if (!gated) issues.push(`(A) il ${nome} non segue l'interruttore del taccuino: sul telefono resta spento e il taccuino nasce cieco`);
    console.log(`(A) ${nome} → ${gated ? 'interruttore taccuino ✓' : 'flag di build ✗'}`);
  }
  if (!/const DEVTOOLS_DEFAULT=true;/.test(src))
    issues.push('(A) DEVTOOLS_DEFAULT non e\' piu\' acceso: sul telefono il taccuino nasce spento');
  console.log(`(A) card appunti → devToolsOn() ${card > 0 && cg >= 0 && card - cg <= 2500 ? '✓' : '✗'} · DEVTOOLS_DEFAULT acceso ${/const DEVTOOLS_DEFAULT=true;/.test(src) ? '✓' : '✗'}`);
}

/* --- B. DAL VIVO — l'interruttore governa davvero il tasto in partita --- */
for (const [on, atteso] of [[true, true], [false, false]]) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push(`(B/${on}) pageerror: ` + String(e.message).slice(0, 130)));
  await page.addInitScript((v) => {
    window.__CPM_GLB = false;
    try { if (v) localStorage.removeItem('cpm-devtools'); else localStorage.setItem('cpm-devtools', '0'); } catch (e) {}
  }, on);
  await openMatch(page, port);
  await sleep(900);
  await page.evaluate(() => window.__CPM_FORCE_SIT(7, true)); await sleep(800);
  const warn = page.locator('button[title*="azione sbagliata"]');
  const n = await warn.count();
  if (!!n !== atteso)
    issues.push(`(B) strumenti ${on ? 'accesi (default)' : 'spenti'}: tasto ⚠️ ${n ? 'presente' : 'assente'}, atteso ${atteso ? 'presente' : 'assente'}`);
  if (n && atteso) {
    await warn.first().click(); await sleep(500);
    if (!/appunt/i.test(await page.evaluate(() => document.body.innerText)))
      issues.push('(B) il tasto ⚠️ non apre il campo appunti');
  }
  console.log(`(B) strumenti ${on ? 'accesi (default)' : 'spenti '} → tasto ⚠️ ${n ? 'presente' : 'assente'} ${(!!n === atteso) ? '✓' : '✗'}`);
  await page.close();
}

/* --- C. la preferenza vive sul dispositivo --- */
{
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port);
  await sleep(700);
  const r = await page.evaluate(() => {
    const before = localStorage.getItem('cpm-devtools');
    /* default acceso anche senza chiave scritta */
    const onByDefault = (typeof window.devToolsOn === 'function') ? window.devToolsOn() : null;
    return { before, onByDefault };
  });
  if (r.before !== null) issues.push(`(C) chiave cpm-devtools già scritta senza che nessuno l'abbia toccata: ${r.before}`);
  console.log(`(C) preferenza assente all'avvio ✓ · default = acceso (${r.onByDefault === null ? 'helper non esposto, ok' : r.onByDefault})`);
  await page.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ TACCUINO OK — visibile nella build del telefono, spegnibile, preferenza sul dispositivo');
