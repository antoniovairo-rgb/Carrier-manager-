// COLLAUDO L6 — sonda (solo misura): sul salvataggio 190, cosa resta in openingPending() dopo i rollover?
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../lib/harness.mjs';
const saveJson = fs.readFileSync(path.join(ROOT, 'tests', 'visual', 'fixtures', 'save-190-s12-ovr93.json'), 'utf-8');
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; try { localStorage.setItem('cpm-v3', s); } catch (e) {} }, saveJson);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1000);
const log = [];
for (let i = 0; i < 120; i++) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); const scr = C.screen(); const op = C.openingPending(); C.dismiss(); const p = C.snapshot(); return { res, scr, op: Array.isArray(op) ? op : op, s: p.season, w: p.week, lived: !!p.weekLived, pendingDetail: JSON.stringify(op).slice(0, 200) }; });
  log.push(`${i} ${r.res} scr=${r.scr} S${r.s}W${r.w} lived=${r.lived} op=${r.pendingDetail}`);
  if (r.res === 'seasonEnd') await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
  if (i > 3 && String(r.res) === 'opening-resolved' && log.filter(l => l.includes('opening-resolved')).length > 12) break;
  await sleep(30);
}
console.log(log.slice(0, 60).join('\n'));
await browser.close(); srv.close(); console.log('FINE');
