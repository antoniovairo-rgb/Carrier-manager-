import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = +(process.env.CPM_GI || 133);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const p = await ctx.newPage();
await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; });
if (process.env.CPM_ROSSO89) await p.addInitScript(() => { window.__CPM_NO_FONDO89 = 1; });
await openMatch(p, port, { skipLoadAll: true, name: 'Fondo' }); await sleep(800);
await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), GI).catch(() => {});
for (let k = 0; k < 8; k++) {
  await sleep(350);
  const m = await p.evaluate(() => { const S = window.__CPM_STATE(), c = window.__CPM_CAMT767; return { ph: window.__CPM_PHASE(), cam: c && [c.cx, c.cy, c.cz], look: c && [c.lx, c.ly, c.lz], hs: c && c.hs94, eroe: S.heroTarget, bt: S.ballTarget, ball: S.ball && { x: S.ball.x, y: S.ball.y, ndc: S.ball.ndc }, b3: window.__CPM_BALL3 && window.__CPM_BALL3(), p84: window.__CPM_PALLA84 }; });
  console.log(JSON.stringify(m));
}
await b.close(); srv.close();
