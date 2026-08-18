#!/usr/bin/env node
/* GUARDIANO — IL CORPO GUARDA DOVE CALCIA (7.517.0, restyling R3/2).
   Audit: «il corpo non e' orientato verso passaggio/tiro» — lo yaw seguiva SOLO il moto (gate _gsp) e si
   spegneva in decelerazione: il gesto si giocava col facing dell'avvicinamento. Rimedio: mira latchata al
   montaggio della clip (verso il bersaglio dell'arco), turn-rate dedicato per tutto il gesto.
   MISURA: errore angolare |bersaglio - yaw| AL RILASCIO del gesto (testimone __CPM_AIM517, registrato in
   ENTRAMBI i bracci — il bersaglio si annota sempre, la mira comanda solo nel verde).
   Misure a copertura piena (7 rilasci per braccio): verde mediana 0,02 rad (p90 0,06) · rosso __CPM_NO517
   mediana 1,0 (p90 2,02) — separazione 50x. La PRIMA taratura del rosso (>=1,2) veniva da un campione di
   3 rilasci ed era SBAGLIATA: soglie riposte fra i bracci con margine (verde <=0,35 · rosso >=0,5).
   GLB-ON via attore della cronaca R1. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MS = +(process.env.CPM_MS || 180000);
const MED_MAX = +(process.env.CPM_MED_MAX || 0.35);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_AIM517 = []; if (r) window.__CPM_NO517 = 1; }, ROSSO);
await openMatch(page, port);
await sleep(9000);
const glb = await page.evaluate(() => { const g = window.__CPM_GESTURE && window.__CPM_GESTURE(); return !!(g && g.glb); });
if (!glb) { console.log('❌ SONDA CIECA: avatar GLB non montati'); process.exit(2); }
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 }));
await sleep(MS);
const d = await page.evaluate(() => window.__CPM_AIM517 || []);
await b.close(); srv.close();

const v = d.map(x => x.err).sort((a, b2) => a - b2);
const med = v.length ? v[Math.floor(v.length / 2)] : null;
console.log(`rilasci misurati: ${v.length} · errore mediano: ${med} rad · p90: ${v[Math.floor(v.length * 0.9)] ?? '—'}`);
if (v.length < 3) { console.log('❌ SONDA CIECA: meno di 3 rilasci — nessun verdetto'); process.exit(2); }
if (ROSSO) {
  if (med >= 0.5) { console.log(`✅ prova del rosso riuscita: senza la mira il corpo conclude storto (mediana ${med})`); process.exit(0); }
  console.log(`❌ PROVA DEL ROSSO FALLITA: mediana ${med} anche senza mira`); process.exit(2);
}
if (med > MED_MAX) { console.log(`❌ la mira si e' persa: errore mediano ${med} > ${MED_MAX}`); process.exit(2); }
console.log(`✅ il corpo guarda dove calcia (mediana ${med} rad)`);
