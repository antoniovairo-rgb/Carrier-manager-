#!/usr/bin/env node
/* [7.999.45 sonda] Ritardo dell'eroe dal suo bersaglio in hl_result (testimone __CPM_LAG44): quante scene lo fanno SCATTARE
   (ritardo > 6 u → 13 u/s, src/12 driver dell'eroe). Pagina nuova per scena, build-up acceso, corpi spenti (il driver e' lo stesso).
   CPM_SCENE=gi,... · CPM_INIT=codice da iniettare (per i bracci). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '0,16,17,42,46,50,82,83,84,87,91,96,100,102,148,38,152,176').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [];
for (const gi of SCENE) {
  const page = await b.newPage({ viewport: { width: 360, height: 260 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_LAG44_REC = 1; });
  if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
  await openMatch(page, port, { skipLoadAll: true, name: 'Lag45' }); await sleep(600);
  await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', { timeout: 30000 }).catch(() => {});
  await sleep(500);
  await page.evaluate(() => { window.__CPM_LAG44 = null; window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await sleep(5000);
  const W = await page.evaluate(() => window.__CPM_LAG44 || null); await page.close();
  const r = W ? { gi, fotogrammi: W.n, ritardoMax: W.max, scatto: W.scatto, vMax: Math.max(0, ...W.fr.map(x => x[1])) } : { gi, fotogrammi: 0 };
  out.push(r); console.log(JSON.stringify(r));
}
await b.close(); srv.close();
const c = out.filter(r => r.fotogrammi);
console.log(`\nscene ${c.length} · con scatto (ritardo > 6 u) ${c.filter(r => r.scatto > 0).length} · fotogrammi di scatto ${c.reduce((s, r) => s + (r.scatto || 0), 0)} su ${c.reduce((s, r) => s + r.fotogrammi, 0)}`);
