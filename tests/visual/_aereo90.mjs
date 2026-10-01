import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = (process.env.CPM_GI || '134').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of GI) {
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const p = await ctx.newPage();
await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; });
if (process.env.CPM_ROSSO90) await p.addInitScript(() => { window.__CPM_NO_AEREO90 = 1; });
await openMatch(p, port, { skipLoadAll: true, name: 'Aereo' }); await sleep(800);
await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
const row = [];
for (let k = 0; k < 16; k++) {
  await sleep(40);
  const m = await p.evaluate(() => { const S = window.__CPM_STATE(), c = window.__CPM_CAMT767; const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; const R = cv.getBoundingClientRect();
    const hs = c && c.hs94; const H = S.players && S.players.find(q => q.hero);
    return { ph: window.__CPM_PHASE(), e: hs ? Math.round(R.top + (1 - hs[1]) / 2 * R.height) : null, ex: hs ? +hs[0].toFixed(2) : null, eroe: S.heroTarget, hm: H ? { x: H.x, y: H.y } : null, cam: c ? [c.cx, c.cy, c.cz, c.lx, c.lz].map(v => +(+v).toFixed(1)) : null, cut: !!(window.__CPM_CUTLIVE && window.__CPM_CUTLIVE()), t: Math.round(performance.now()) }; });
  row.push(JSON.stringify(m));
}
console.log('gi' + gi + '\n' + row.join('\n'));
await ctx.close(); }
await b.close(); srv.close();
