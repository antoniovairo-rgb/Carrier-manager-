import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const [gi, k] of (process.env.CASI || '7:0').split(',').map(x => x.split(':').map(Number))) {
const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_DT60 = 1; window.__CPM_BU43 = []; window.__CPM_G342_REC = 1; });
await openMatch(page, port, { skipLoadAll: true, name: 'Testa 342' }); await sleep(1200);
await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 120000 }).catch(() => {});
await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 40000 }).catch(() => {});
await sleep(700); await page.evaluate(a => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, k);
let p = -1; for (let i = 0; i < 80; i++) { await sleep(1500); const n = await page.evaluate(() => window.__CPM_BU43.length); if (n > 10 && n === p) break; p = n; }
const L = await page.evaluate(() => window.__CPM_BU43); await page.close();
/* riassunto per beat: tempo inizio/fine, tipo, tratto del pallone, quota max */
let cur = null; const S = []; for (const r of L) { if (!cur || cur.bi !== r[1]) { cur = { bi: r[1], tag: r[2], kind: r[3], t0: r[0], t1: r[0], bx0: r[4], bx1: r[4], ymax: r[5], y0: r[5], y1: r[5], hx0: r[6], hx1: r[6], aer: r[8] }; S.push(cur); } cur.t1 = r[0]; cur.bx1 = r[4]; cur.y1 = r[5]; cur.hx1 = r[6]; cur.ymax = Math.max(cur.ymax, r[5]); }
console.log('gi' + gi + ' a' + k); for (const s of S) console.log(`  beat ${s.bi} ${String(s.tag).padEnd(8)} ${String(s.kind).padEnd(8)} t ${s.t0}-${s.t1} (${(s.t1 - s.t0).toFixed(2)} s) pallone x ${s.bx0}→${s.bx1} quota ${s.y0}→${s.y1} max ${s.ymax} · eroe x ${s.hx0}→${s.hx1} · aer ${s.aer}`);
}
await b.close(); srv.close();
