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

/* --- A --- */
{
  const src = readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
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

/* quanto viaggia il pallone in una finestra di tempo REALE, risolvendo la stessa azione */
async function travel(gi) {
  await page.evaluate(g => { window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(700);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(250);
  const a = await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); return window.__CPM_BALL(); });
  await sleep(1200);
  const b = await page.evaluate(() => window.__CPM_BALL());
  return +Math.hypot(b.x - a.x, b.y - a.y).toFixed(2);
}
/* il typeof si valuta DENTRO la pagina: una funzione attraversa page.evaluate come `undefined` */
if (await page.evaluate(() => typeof window.__CPM_WD_FILL) !== 'function')
  issues.push('(B) manca la sonda __CPM_WD_FILL: la prova ad anello pieno non e\' stata fatta');
else {
  const vuoto = await travel(8);
  const snapA = await page.evaluate(() => { const s = window.__CPM_WATCH_SNAP(); return s ? s.samples.length : -1; });
  await page.evaluate(() => window.__CPM_WD_FILL());        /* [7.360.0] solo PIENO: il parametro forzava `step`, cioe' simulava il diradamento che non esiste piu' — passarlo qui faceva fallire la (C) con un valore scritto dal test stesso */
  await sleep(250);
  const pieno = await travel(8);
  const snapB = await page.evaluate(() => { const s = window.__CPM_WATCH_SNAP(); return s ? s.samples.length : -1; });
  const rap = vuoto > 0.5 ? +(pieno / vuoto).toFixed(2) : null;
  console.log(`(B) spazio percorso dal pallone in 1,2s → anello vuoto ${vuoto}u · anello pieno ${pieno}u · rapporto ${rap}`);
  if (rap == null) issues.push(`(B) misura non valida: ad anello vuoto il pallone ha percorso ${vuoto}u (troppo poco per confrontare)`);
  else if (rap < 0.7) issues.push(`(B) ad anello pieno il pallone percorre solo il ${Math.round(rap * 100)}% dello spazio: la partita va al RALLENTATORE (il testimone sta saltando frame)`);
  /* (C) [7.360.0] L'ANELLO E' CIRCOLARE: la memoria resta limitata SENZA sacrificare la risoluzione, e la
     traccia restituita e' in ordine cronologico anche dopo il giro (senza il riordino tornava spezzata a
     meta' e il taccuino leggeva un salto temporale all'indietro). */
  const w = await page.evaluate(() => { const s = window.__CPM_WATCH_SNAP(); if (!s) return null;
    let fuoriOrdine = 0; for (let i = 1; i < s.samples.length; i++) if (s.samples[i].t < s.samples[i - 1].t) fuoriOrdine++;
    return { n: s.samples.length, res: s.res, fuoriOrdine }; });
  console.log(`(C) anello dopo il riempimento forzato: ${w ? w.n : '?'} campioni · risoluzione 1 su ${w ? w.res : '?'} · campioni fuori ordine ${w ? w.fuoriOrdine : '?'} (capienza 30000)`);
  if (!w || w.n > 30000) issues.push(`(C) l'anello ha superato la capienza (${w ? w.n : '?'}): la memoria non e' piu' limitata`);
  if (w && w.res !== 1) issues.push(`(C) la risoluzione e' scesa a 1 su ${w.res}: il testimone ha ripreso a diradare e «un fotogramma» torna a non voler dire un fotogramma`);
  if (w && w.fuoriOrdine > 0) issues.push(`(C) ${w.fuoriOrdine} campioni fuori ordine cronologico: dopo il giro dell'anello la traccia e' spezzata`);
  void snapA; void snapB;
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ TESTIMONE OK — anello circolare a risoluzione piena, in ordine, senza rallentare la partita');
