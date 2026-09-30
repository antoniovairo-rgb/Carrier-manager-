#!/usr/bin/env node
/* [7.999.75 guardiano — collaudo PO «l'eroe vola, dovrebbe correre o camminare» (festa di fine partita, foto 12:26)]
   Nella festa l'eroe riceveva un saltello continuo fino a 0,22u, pensato per il corpo procedurale: col corpo 3D la clip porta gia'
   il suo movimento e i piedi si staccavano dal prato mentre le gambe correvano. VERDE → corpi 3D accesi, festa leggera forzata
   (__CPM_FORCE_CEREMONY): quota massima dell'eroe fuori dal palco ≤ 0,02. ROSSO (__CPM_NO_VOLO75) → ≥ 0,15. Uso: node volo-75.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_REC = 1; if (r) window.__CPM_NO_VOLO75 = 1; }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'Volo75' }); await sleep(1200);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => { window.__CPM_VOLO75 = null; window.__CPM_FORCE_CEREMONY({ light: true }); });
  await sleep(9000);
  const r = await p.evaluate(() => window.__CPM_VOLO75 || null); await p.close(); return r;
}
const v = await braccio(false), r = await braccio(true);
console.log(`VERDE: ${v ? `quota max eroe ${v.maxY} su ${v.n} fotogrammi · corpo 3D ${v.glb}` : 'CIECO'}`);
console.log(`ROSSO (__CPM_NO_VOLO75): ${r ? `quota max ${r.maxY} su ${r.n} fotogrammi` : 'CIECO'}`);
const ok = v && r && v.glb === 1 && v.n >= 5 && v.maxY <= 0.02 && r.maxY >= 0.15;
await b.close(); srv.close();
console.log(ok ? '✅ volo-75 verde (e il rosso si vede)' : '❌ volo-75 ROSSO'); process.exit(ok ? 0 : 1);
