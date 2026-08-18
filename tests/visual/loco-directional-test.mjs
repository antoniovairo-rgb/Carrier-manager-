#!/usr/bin/env node
/* GUARDIANO — LA LOCOMOZIONE HA DIREZIONI (7.518.0, restyling R3/3).
   Audit: «movimenti laterali e all'indietro sembrano pattinate» — jog-back/strafe-L/strafe-R erano su
   disco con zero riferimenti. Il selettore (angolo moto-vs-facing, isteresi 0,25s, scambio del canale
   `run` con dissolvenza esplicita — lezione 7.516) li monta al bisogno, azioni pigre.
   MISURA: conteggio selezioni __CPM_LOCO518 su ~2 min di autoplay GLB-ON (prima misura: strR 17 · back 4
   · strL 2 · run 21). Verde: laterali+arretrate >=5 E ritorni a run >=1. Rosso __CPM_NO518: zero. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MS = +(process.env.CPM_MS || 120000);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_LOCO518 = {}; if (r) window.__CPM_NO518 = 1; }, ROSSO);
await openMatch(page, port);
await sleep(9000);
const glb = await page.evaluate(() => { const g = window.__CPM_GESTURE && window.__CPM_GESTURE(); return !!(g && g.glb); });
if (!glb) { console.log('❌ SONDA CIECA: avatar GLB non montati'); process.exit(2); }
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 }));
await sleep(MS);
const d = await page.evaluate(() => window.__CPM_LOCO518 || {});
await b.close(); srv.close();

const lat = (d.back || 0) + (d.strL || 0) + (d.strR || 0);
console.log(`selezioni: ${JSON.stringify(d)} · laterali+arretrate: ${lat}`);
if (ROSSO) {
  if (lat === 0 && !(d.run > 0)) { console.log('✅ prova del rosso riuscita: selettore spento, solo pattinate'); process.exit(0); }
  console.log('❌ PROVA DEL ROSSO FALLITA: selezioni anche col selettore spento'); process.exit(2);
}
if (lat < 5) { console.log(`❌ direzioni assenti: ${lat} < 5 selezioni laterali/arretrate`); process.exit(2); }
if (!(d.run >= 1)) { console.log('❌ nessun ritorno al canale avanti: lo scambio non e\' bidirezionale'); process.exit(2); }
console.log('✅ la locomozione ha direzioni, e torna avanti');
