#!/usr/bin/env node
/* [7.999.68 guardiano — taccuino PO #58 «il portiere non e' sulla linea» (rigore in partita)] Sul rigore il portiere restava sul bersaglio della
   situazione (x 93,6), cinque unita' davanti alla linea di porta (98,6). VERDE → nella scelta del rigore (gi58, GLB-ON) il portiere avversario
   sta a x >= 97; ROSSO (__CPM_NO_RIG69) → torna davanti alla linea (x < 95). Uso: node rigore-69.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; if (r) window.__CPM_NO_RIG69 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Rig69' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_FORCE_SIT(58, true); window.__CPM_FROZEN = false; });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(1500);
  const x = await page.evaluate(() => { const s = window.__CPM_STATE(); const g = s.players.find(p => p.gk && p.team === 'away'); return g ? g.x : null; });
  await page.close(); return x;
}
const v = await braccio(false), r = await braccio(true);
console.log(`VERDE: portiere a x ${v} · ROSSO (__CPM_NO_RIG69): x ${r} (linea di porta 98,6)`);
await b.close(); srv.close();
const ok = v != null && v >= 97 && r != null && r < 95;
console.log(ok ? '✅ rigore-69: portiere sulla linea (e il rosso si vede)' : '❌ rigore-69 ROSSO'); process.exit(ok ? 0 : 1);
