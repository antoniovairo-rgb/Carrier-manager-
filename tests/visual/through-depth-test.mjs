#!/usr/bin/env node
/* [7.354.0] GUARDIANO DELLA PROFONDITA' — collaudo PO gi23 «Scatto in profondita'»: «e' un passaggio al
   compagno piu' vicino, non un filtrante».
   La causa non era il passaggio: davanti all'eroe non c'era NESSUNO a cui darlo. La regia delle corse
   pre-azione (CINE-4) manda gli attaccanti a `eroe+19u`, ma si attivava solo su pattern CROSS/SHOT/
   COMBINATION/THROUGH — e in `hl_move`, quando le corse devono maturare, nessuna azione e' ancora scelta e
   il pattern e' BUILDUP: per una situation di profondita' non partiva niente. Ora vale anche l'INTENTO
   congelato della situation (`through`).

   ⚠️ Questa misura ESIGE `__CPM_FORCE_INTRO` (7.353.0). Senza, la forzatura salta `hl_intro`, `preActionT`
   resta -1 e l'INTERA regia e' spenta: si misurerebbe un sistema fermo e si concluderebbe che il fix non
   serve a niente. E' esattamente l'errore che mi ha fatto buttare tre tentativi di correzione buoni.

   Verifica, sulle situations con intento `through`:
     A. la regia viene ESEGUITA (preActionT armato + ramo profondita' entrato)
     B. esiste almeno un compagno DAVANTI all'eroe a cui giocare il filtrante
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node through-depth-test.mjs                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

if (await page.evaluate(() => typeof window.__CPM_FORCE_INTRO === 'undefined' && typeof window.__CPM_FORCE_SIT !== 'function'))
  issues.push('manca il percorso con intro: la misura sarebbe fatta a regia spenta');

/* campione: le situations con intento `through` (piu' gi156 come controllo «gia' sano») */
const gis = await page.evaluate(() => (window.__CPM_SITS || [])
  .map((s, i) => ({ i, it: s.intent, t: String(s.text || '').slice(0, 38) }))
  .filter(r => r.it === 'through').slice(0, 8));
console.log(`situations con intento through nel campione: ${gis.length}`);

let senza = 0;
for (const g of gis) {
  await page.evaluate(i => { window.__CPM_PRE = null; window.__CPM_FORCE_INTRO = true; window.__CPM_FORCE_SIT(i, false); }, g.i);
  await sleep(2500);
  const r = await page.evaluate(() => {
    const s = window.__CPM_STATE(); const h = s.hero; const q = window.__CPM_PRE || {};
    const m = (s.players || []).filter(p => p.team === 'home' && !p.gk).map(p => +(p.x - h.x).toFixed(1)).sort((a, b) => b - a);
    return { pT: q.pT, ran: q.ranThrough || 0, thr: !!q.thr, best: m[0], av: m.filter(v => v > 6).length };
  });
  const ok = r.av >= 1;
  if (!ok) senza++;
  console.log(`  gi${String(g.i).padStart(3)} «${g.t}» preActionT=${r.pT} regia=${r.ran > 0 ? 'eseguita' : 'NON eseguita'} · compagno piu' avanzato ${r.best}u · avanti>6u ${r.av} ${ok ? '✓' : '✗'}`);
  if (r.pT === -1 || r.pT == null) issues.push(`(A) gi${g.i}: preActionT non armato (${r.pT}) — la regia non gira, la misura non vale`);
  /* il ramo profondita' che NON gira non e' di per se' un difetto: una situation puo' essere presa prima da
     un ramo piu' specifico (cross/header/cutback) che la serve altrettanto bene — gi52 «Lancio lungo, il
     portiere esce» finisce li' e ha comunque un compagno 10,8u davanti. Diventa un difetto solo se il
     risultato manca: nessun ramo l'ha servita E non c'e' nessuno in profondita'. */
  else if (!r.ran && !ok) issues.push(`(A) gi${g.i}: nessun ramo della regia l'ha servita e non c'e' nessun compagno oltre l'eroe`);
}
/* soglia sul CAMPIONE, non sulla singola scena: la geometria di partenza varia, ma un intento di
   profondita' senza NESSUN compagno davanti non e' un filtrante — e' un appoggio. */
if (senza > Math.floor(gis.length / 3))
  issues.push(`(B) ${senza}/${gis.length} situations di profondita' non hanno NESSUN compagno oltre l'eroe: il filtrante non ha bersaglio`);
console.log(`(B) senza nessun compagno in profondita': ${senza}/${gis.length}`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PROFONDITA\' OK — la regia delle corse gira e il filtrante ha a chi essere giocato');
