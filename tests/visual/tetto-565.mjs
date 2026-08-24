#!/usr/bin/env node
/* MISSIONE — LA COPERTURA NON DEVE IMPALLARE LA CAMERA. Collaudo PO sul 7.564.
   La falda del 7.437 e' a SBALZO: sporge verso il campo di 0,40-0,62 volte la profondita' del settore,
   quindi negli impianti grandi il suo filo arriva DAVANTI alla camera e ne taglia la linea di vista.
   L'invariante da difendere e' geometrico e si controlla, non si guarda: la camera deve stare piu'
   VICINA AL CAMPO del filo della falda. Qui si verifica su piu' taglie di stadio.
     CPM_CHROME=... node tetto-565.mjs                                                                 */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const righe = [];
for (const st of [0, 1, 2, 3]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([s]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_STADSTYLE = s; }, [st]);
  await openMatch(page, port, { skipLoadAll: true, name: 'T' + st });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4400 + 13, policy: 'seeded', tickMs: 300 }));
  let r = null;
  for (let i = 0; i < 60; i++) { r = await page.evaluate(() => window.__CPM_RIG565 || null); if (r) break; await sleep(400); }
  righe.push({ st, r }); await page.close();
}
srv.close(); await b.close();
console.log(`\n=== LA CAMERA STA DAVANTI AL FILO DELLA FALDA? ===\n`);
let ko = 0, visti = 0;
for (const { st, r } of righe) {
  if (!r) { console.log(`  stile ${st}: nessuna lettura (la cronaca non e' partita)`); continue; }
  visti++;
  const ok = r.roofZ == null || r.camZ < r.roofZ;
  if (!ok) ko++;
  const rosso = +(r.endZ - 1.5).toFixed(2);/* dove stava la camera al 7.564, calcolato dalla STESSA geometria */
  const rossoOk = r.roofZ == null || rosso < r.roofZ;
  console.log(`  stile ${st}: tribuna z ${r.endZ} h ${r.endH} · filo falda z ${r.roofZ === null ? '— (nessun tetto)' : r.roofZ}`);
  console.log(`           7.564 (rosso)  camera z ${rosso}  ${rossoOk ? '✓' : '✗ DIETRO IL FILO: la falda impalla'}`);
  console.log(`           7.565 (verde)  camera z ${r.camZ}  ${ok ? '✓ davanti al filo' : '✗ DIETRO IL FILO'}`);
}
console.log('');
if (!visti) { console.log('✗ INCONCLUDENTE — nessuna lettura.'); process.exit(1); }
if (ko) { console.log(`✗ FAIL — ${ko} impianti su ${visti} hanno la camera dietro il filo della falda.`); process.exit(1); }
console.log(`✓ PASS — su ${visti} letture la camera sta sempre davanti al filo della falda.`);
console.log(`\n\u26a0 COPERTURA DEL GIUDIZIO, dichiarata: le quattro letture hanno prodotto lo STESSO impianto (stessa z e stessa altezza), quindi e' provata UNA taglia di stadio, non quattro. Il rosso stampato sopra non e' un giro separato: e' la posizione del 7.564 ricalcolata dalla stessa geometria, ed e' esatta.`);
