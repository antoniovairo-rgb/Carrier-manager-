#!/usr/bin/env node
/* GUARDIANO — IL FINALIZZATORE GUARDA LA PORTA (7.527.0).
   Collaudo PO ×2 su 7.525 (#47/#163): «il compagno ha tirato/segnato con il corpo ALL'INDIETRO rispetto
   alla porta». Causa: il canale riceve-e-tira (_rcvT, 3DV-14b) congela il driver di corsa ma nessuno
   girava la mesh — restava la rotazione dell'ultima corsa (5.43.11). Rimedio: slerp verso lo specchio
   durante il gesto (pattern aim-latch 7.517). MISURATO alla taratura: verde 1° · rosso 136° — il rosso
   E' la nota del PO. Testimone __CPM_FIN531: errore angolare corpo->porta al 50% del gesto.
   PROVA DEL ROSSO: CPM_ROSSO=1 → __CPM_NO531 (nessuna rotazione). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, waitBallSettle, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const SCENE = [47, 163, 107, 114, 111, 174, 152, 27, 47, 114, 163, 107];/* famiglie pass/assist/onetwo, con ripetizioni: non tutte passano dal canale — servono >=2 misure */
const MED_MAX = +(process.env.CPM_FIN_MAX || 25);      /* ° mediana e1, verde (taratura: 1-3°) */
/* PROVA DEL ROSSO SULLA CORREZIONE, non sull'errore finale: chi arriva gia' girato verso la porta
   conclude bene anche senza rotazione (misurato: rosso a 14° su un arrivo favorevole). Nel rosso il
   gesto NON corregge: e1 ≈ e0 (delta mediano sotto 10°). Nel verde corregge sempre: e1 piccolo
   QUALUNQUE sia e0 (taratura: e0 136° -> e1 1°). */
const RED_DELTA_MAX = +(process.env.CPM_FIN_RED_DELTA || 10);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_FIN531 = []; if (r) window.__CPM_NO531 = 1; }, ROSSO);
await openMatch(page, port);
await sleep(600);
for (const gi of SCENE) {
  await forceSituation(page, gi, { settle: 400, choose: true });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await waitBallSettle(page, { maxMs: 10000, quietMs: 800 });
}
const E = await page.evaluate(() => window.__CPM_FIN531 || []);
await b.close(); srv.close();
const cop = E.map(e => ({ e0: +(e.e0 * 57.3).toFixed(0), e1: +(e.e1 * 57.3).toFixed(0) }));
console.log(`finalizzazioni misurate: ${cop.length} · ${cop.map(c => c.e0 + '°→' + c.e1 + '°').join(' · ')}`);
if (cop.length < 2) { console.log('❌ SONDA CIECA: meno di 2 finalizzazioni dal canale riceve-e-tira'); process.exit(2); }
const meds = a => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
const medE1 = meds(cop.map(c => c.e1));
const medDelta = meds(cop.map(c => Math.abs(c.e1 - c.e0)));
if (ROSSO) {
  if (medDelta <= RED_DELTA_MAX) { console.log(`✅ prova del rosso riuscita: il gesto non corregge (delta mediano ${medDelta}° <= ${RED_DELTA_MAX}°)`); process.exit(0); }
  console.log(`❌ PROVA DEL ROSSO FALLITA: correzione ${medDelta}° anche senza rotazione`); process.exit(2);
}
if (medE1 > MED_MAX) { console.log(`❌ il finalizzatore non guarda la porta: mediana finale ${medE1}° > ${MED_MAX}°`); process.exit(2); }
console.log('✅ il finalizzatore guarda la porta (e1 mediana ' + medE1 + '°)');
