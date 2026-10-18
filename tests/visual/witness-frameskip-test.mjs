#!/usr/bin/env node
/* [7.352.0] GUARDIANO: IL TESTIMONE NON DEVE RALLENTARE LA PARTITA.
   Il testimone del taccuino (7.339/7.340) registra il pallone in un anello preallocato e, quando l'anello si
   riempie, DIMEZZA la risoluzione. La riga che saltava la registrazione era un `return` — ma sta nel corpo di
   `loop`, la funzione del render-loop, non in una callback: saltava con se' TUTTO IL RESTO DEL FRAME
   (animazioni, moto del pallone, AI, camera, render). Passati ~8 minuti di partita l'anello si riempie e il
   gioco passava a META' dei fotogrammi; al dimezzamento successivo a un quarto. Dal 7.344 gli strumenti sono
   accesi di DEFAULT e sul telefono per direttiva del PO: lo pagava esattamente chi collauda.

   Verifica:
     A. STATICO — nel blocco del testimone non c'e' nessun `return` (in quello scope significa «salta il frame»)
     B. DAL VIVO — ad anello PIENO il pallone percorre lo stesso spazio al secondo di quando e' vuoto:
        e' la misura del sintomo vero (rallentatore), non del meccanismo
     C. [7.360.0] l'anello resta CIRCOLARE e a risoluzione PIENA, con la traccia in ordine cronologico.
        Il dimezzamento c'era ancora, e costava: a ogni riempimento `step` raddoppiava e l'intervallo fra due
        campioni passava da 102ms a 209, 416, 543 — cioe' dopo qualche minuto «in un fotogramma» voleva dire
        «in mezzo secondo», ed e' da li' che nasceva il «SALTO del pallone di 8,7 unita'» finito in quattro
        note del PO sempre con lo stesso numero (la soglia 85 u/s moltiplicata per l'intervallo).
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node witness-frameskip-test.mjs                          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { readFileSync } from 'node:fs';

const issues = [];
const ROSSO = process.env.CPM_ROSSO180 === '1';

/* --- A --- */
{
  let src = readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
  /* [giro 63 PO-180] braccio rosso STATICO: si rimette nel testo (solo in memoria) il `return` del diradamento e il dimezzamento */
  if (ROSSO) src = src.replace('const W=sr.current._wd||(sr.current._wd=', 'const W=sr.current._wd||(sr.current._wd=0||');
  if (ROSSO) { const k = src.indexOf('const W=sr.current._wd||'); src = src.slice(0, k + 200) + ';if(W.skip++%W.step!==0)return;W.step*=2;' + src.slice(k + 200); }
  const at = src.indexOf('const W=sr.current._wd||(sr.current._wd=');
  if (at < 0) issues.push('(A) non trovo il testimone nel sorgente (ancora cambiata?)');
  else {
    const blk = src.slice(at, at + 2600);
    /* mirato sulla riga del DIRADAMENTO: un `return` generico qui dentro e' legittimo (il filtro dei compagni
       gira in una forEach, e li' `return` significa «salta questo giocatore»). Cio' che non deve tornare e'
       il return sulla riga che decide se registrare: quello sta nello scope di `loop` e salta il frame. */
    const bad = /W\.skip\+\+%W\.step!==0\s*\)\s*return/.test(blk);
    if (bad) issues.push('(A) il diradamento del testimone usa di nuovo `return`: in quello scope salta l\'INTERO frame, non la registrazione');
    /* [7.360.0] e non deve tornare nemmeno il DIMEZZAMENTO: era la causa della perdita di risoluzione. */
    const dimezza = /W\.step\*=2/.test(blk);
    if (dimezza) issues.push('(A) l\'anello del testimone dimezza di nuovo la risoluzione: dopo qualche minuto il taccuino chiama «fotogramma» mezzo secondo');
    console.log(`(A) diradamento senza return → ${bad ? '✗' : '✓'} · anello senza dimezzamento → ${dimezza ? '✗' : '✓'}`);
    /* e la bozza non deve tornare a promettere «un fotogramma» senza dire l'intervallo misurato */
    const promessa = /unità in un fotogramma/.test(src);
    if (promessa) issues.push('(A) la bozza del taccuino dichiara di nuovo «in un fotogramma» senza l\'intervallo reale: e\' la riga falsa delle quattro note');
  }
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(1000);

/* [giro 63 PO-180] RISCRITTA. La versione 7.352/7.360 misurava lo spazio percorso dal PALLONE in 1,2 s dopo la risoluzione
   della scena 8: dipendeva dalla cinematica d'esito (a volte la palla e' ferma nel post-highlight: 0-0,42u contro 3-6u) e
   non dal testimone. E chiedeva la sonda __CPM_WD_FILL un secondo dopo l'apertura, quando il render-loop poteva non averla
   ancora definita (nasce DENTRO il blocco del testimone, al primo fotogramma utile). Il campione «fuori ordine» era un
   artefatto del riempimento forzato: WD_FILL dichiara pieno un anello che ha scritto solo poche centinaia di posti, e i
   posti mai scritti (t=0) finivano in mezzo alla traccia.
   Ora (B) misura il SINTOMO senza passare dal pallone: in una finestra di 2 s di rAF della pagina, quanti campioni scrive
   il testimone. Un campione per fotogramma del render-loop = il frame arriva fino in fondo al blocco; il vecchio `return`
   con step 2 ne scriveva uno su due. Rapporto prima e dopo il riempimento, stessa pagina, stesse condizioni. */
const pronta = await page.waitForFunction(() => typeof window.__CPM_WD_FILL === 'function' && typeof window.__CPM_WATCH_SNAP === 'function', null, { timeout: 30000, polling: 250 }).then(() => true, () => false);
async function rapporto() {
  return page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    const tick = now => { n++; if (now - t0 < 2000) requestAnimationFrame(tick); else {
      const s = window.__CPM_WATCH_SNAP(); const t1 = performance.now();
      const k = s ? s.samples.filter(c => c.t > t0 && c.t <= t1).length : -1;
      res({ raf: n, campioni: k, r: n ? +(k / n).toFixed(2) : null }); } };
    requestAnimationFrame(tick);
  }));
}
if (!pronta) issues.push('(B) la sonda __CPM_WD_FILL non e\' comparsa entro 30 s: la prova ad anello pieno non e\' stata fatta');
else {
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const vuoto = await rapporto();
  await page.evaluate(() => window.__CPM_WD_FILL());
  await sleep(300);
  const pieno = await rapporto();
  console.log(`(B) campioni del testimone per fotogramma rAF in 2 s → anello vuoto ${vuoto.campioni}/${vuoto.raf} (${vuoto.r}) · anello pieno ${pieno.campioni}/${pieno.raf} (${pieno.r})`);
  if (vuoto.r == null || vuoto.raf < 5) issues.push(`(B) misura non valida: ${vuoto.raf} fotogrammi in 2 s`);
  else if (vuoto.r < 0.7) issues.push(`(B) ad anello VUOTO il testimone scrive solo ${vuoto.campioni} campioni su ${vuoto.raf} fotogrammi: il render-loop non arriva in fondo al blocco`);
  else if (pieno.r < 0.7 * vuoto.r) issues.push(`(B) ad anello PIENO il testimone scrive ${pieno.r} campioni a fotogramma contro ${vuoto.r} a vuoto: il frame viene saltato (rallentatore)`);
  /* (C) [7.360.0] l'anello e' circolare, a risoluzione piena e in ordine. Si giudicano solo i posti SCRITTI (t>0). */
  const w = await page.evaluate(() => { const s = window.__CPM_WATCH_SNAP(); if (!s) return null;
    const v = s.samples.filter(c => c.t > 0); let fuoriOrdine = 0; for (let i = 1; i < v.length; i++) if (v[i].t < v[i - 1].t) fuoriOrdine++;
    return { n: s.samples.length, scritti: v.length, res: s.res, fuoriOrdine }; });
  console.log(`(C) anello dopo il riempimento forzato: ${w ? w.n : '?'} posti (${w ? w.scritti : '?'} scritti) · risoluzione 1 su ${w ? w.res : '?'} · fuori ordine ${w ? w.fuoriOrdine : '?'} (capienza 30000)`);
  if (!w || w.n > 30000) issues.push(`(C) l'anello ha superato la capienza (${w ? w.n : '?'}): la memoria non e' piu' limitata`);
  if (w && w.res !== 1) issues.push(`(C) la risoluzione e' scesa a 1 su ${w.res}: il testimone ha ripreso a diradare`);
  /* un solo salto all'indietro e' legittimo: il punto in cui la traccia passa dai campioni scritti prima del riempimento
     (posti alti, ora i piu' vecchi) a quelli nuovi scritti da 0. Due o piu' = traccia spezzata. */
  if (w && w.fuoriOrdine > 1) issues.push(`(C) ${w.fuoriOrdine} salti all'indietro nella traccia: dopo il giro dell'anello la traccia e' spezzata`);
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ TESTIMONE OK — anello circolare a risoluzione piena, in ordine, senza rallentare la partita');
