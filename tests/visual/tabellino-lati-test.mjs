#!/usr/bin/env node
/* [7.999.10] GUARDIANO DEL TABELLINO (collaudo PO: vinta 0-3 in trasferta con 1 gol e 2 assist; tabellino con le colonne invertite e un gol solo;
   «sotto di due» sul 3-0).
   A (node, motore da solo): un assist riuscito in una scena SENZA ricevente dichiarato scrive comunque il gol del compagno nel tabellino
     della squadra dell'eroe; due assist + un gol dell'eroe = 3 gol.
   B (browser): il tabellino di fine gara prende la squadra dell'eroe da «home» del motore sia in casa sia in trasferta; lo scarto nelle
     frasi e' il numero vero (3 → «tre», non «due»).
   CPM_ROSSO=1 → __CPM_NO_TAB10: deve andare ROSSO.
   C [PO-280 bis, decisione PO 17/10 «Tabellino come intestazione»] l'ordine delle colonne e' quello dell'intestazione (casa a sinistra,
     ospite a destra) in casa e in trasferta, e ogni numero resta sotto la sua squadra; la colonna dell'eroe e' dichiarata (evidenziata).
     CPM_ROSSO_ORD=1 → __CPM_NO_ORD280 (eroe sempre a sinistra): C deve andare ROSSO, A e B restano verdi. */
const ROSSO_ORD = process.env.CPM_ROSSO_ORD === '1';
import '../../prototipo/partita-vera/motore-v2.js'; import '../../prototipo/partita-vera/partita.js';
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const fails = [];
globalThis.window = ROSSO ? { __CPM_NO_TAB10: 1 } : {};
{
  for (const stadio of ['home', 'away']) {
    const P = globalThis.creaPartita({ registra: false, v2: true, seed: 777, casa: { sigla: 'CAS', forza: 70 }, ospite: { sigla: 'OSP', forza: 70 }, eroeLato: stadio, eroe: { nome: 'EROE', ovr: 74 } });
    for (let k = 0; k < 60; k++) P.passo();
    const M = P.motore; const g0 = M.tabellino().home.gol;
    M.risolviEroe.eventi('assist', { rew: 'assist', ok: true, cast: {}, tipo: 'pass' });
    M.risolviEroe.eventi('assist', { rew: 'assist', ok: true, cast: {}, tipo: 'cross' });
    M.risolviEroe.eventi('goal', { rew: 'goal', ok: true, cast: {}, tipo: 'shot' });
    const g1 = M.tabellino().home.gol;
    console.log(`A · stadio ${stadio}: due assist senza ricevente dichiarato + un gol dell'eroe → gol della squadra dell'eroe ${g0} → ${g1}`);
    if (g1 - g0 !== 3) fails.push(`A: in ${stadio} il motore conta ${g1 - g0} gol su 3 (assist senza ricevente persi)`);
  }
}
delete globalThis.window;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
try {
  const page = await b.newPage(); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_TAB10 = 1; if (o.o) window.__CPM_NO_ORD280 = 1; }, { r: ROSSO, o: ROSSO_ORD });
  await openMatch(page, port, { skipLoadAll: true, name: 'Tabellino10' });
  const B = await page.evaluate(() => { const T = { home: { gol: 3, tiri: 6 }, away: { gol: 0, tiri: 2 } };
    const casa = window.__CPM_LATI10(T, true), fuori = window.__CPM_LATI10(T, false);
    return { casa: [casa.mine.gol, casa.loro.gol], fuori: [fuori.mine.gol, fuori.loro.gol], s3: window.__CPM_SCARTO10(3), s2: window.__CPM_SCARTO10(2), S3: window.__CPM_SCARTO10(3, true) }; });
  console.log(`B · squadra dell'eroe 3-0 nel motore: in casa ${B.casa.join('-')} · in trasferta ${B.fuori.join('-')} · scarto 3 → «${B.s3}» / «${B.S3}» · scarto 2 → «${B.s2}»`);
  if (B.fuori[0] !== 3 || B.casa[0] !== 3) fails.push('B: il tabellino di fine gara attribuisce i numeri alla squadra sbagliata');
  if (B.s3 !== 'tre' || B.S3 !== 'Tre gol' || B.s2 !== 'due') fails.push(`B: lo scarto nelle frasi non e' quello vero («${B.s3}»)`);
  /* C: motore con eroe 3-0 (home del motore = eroe). Intestazione: casa a sinistra. In casa l'eroe e' la casa → sx 3, dx 0, eroe sx;
     in trasferta la casa sono gli avversari → sx 0, dx 3, eroe dx. */
  const C = await page.evaluate(() => { const T = { home: { gol: 3, tiri: 6, possesso: 58 }, away: { gol: 0, tiri: 2, possesso: 42 } };
    const f = (h) => { const o = window.__CPM_ORD280(T, h); return { sx: [o.sx.gol, o.sx.tiri, o.sx.possesso], dx: [o.dx.gol, o.dx.tiri, o.dx.possesso], eroe: o.eroeSx ? 'sx' : 'dx' }; };
    return window.__CPM_ORD280 ? { casa: f(true), fuori: f(false) } : null; });
  console.log(`C · intestazione casa—ospite, eroe 3-0: in casa ${JSON.stringify(C && C.casa)} · in trasferta ${JSON.stringify(C && C.fuori)}`);
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (!C || !eq(C.casa, { sx: [3, 6, 58], dx: [0, 2, 42], eroe: 'sx' })) fails.push('C: in casa l\'ordine o i valori del tabellino non seguono l\'intestazione');
  if (!C || !eq(C.fuori, { sx: [0, 2, 42], dx: [3, 6, 58], eroe: 'dx' })) fails.push('C: in trasferta l\'ordine o i valori del tabellino non seguono l\'intestazione');
  await page.close();
} catch (e) { fails.push('B: ' + String(e.message).slice(0, 120)); }
await b.close(); srv.close();
if (ROSSO_ORD) { const ok = fails.length > 0 && fails.every(f => f.startsWith('C:'));
  console.log(ok ? '✅ ROSSO come atteso: col vecchio ordine (eroe sempre a sinistra) in trasferta il tabellino non segue l\'intestazione' : '❌ il rosso ORD non riproduce il difetto\n  ' + fails.join('\n  ')); process.exit(ok ? 0 : 1); }
if (ROSSO) { const ok = fails.some(f => f.startsWith('A:')) && fails.some(f => f.startsWith('B:'));
  console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.10 il tabellino sbaglia' : '❌ il rosso non riproduce il difetto\n  ' + fails.join('\n  ')); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL tabellino-lati\n  ' + fails.join('\n  ') : '✅ PASS tabellino-lati'); process.exit(fails.length ? 1 : 0);
