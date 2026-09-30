import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_GI || '33,133,134,138,168,31,36,44,45,157').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_REC = 1; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  for (let i = 0; i < 40; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (/hl_move|hl_choose/.test(ph || '')) break; await sleep(200); }
  await sleep(1500);
  const s = await p.evaluate(() => { const S = window.__CPM_STATE(); const h = S.players ? null : null; return { vec: window.__CPM_B3VECCHIO, muo: window.__CPM_B3MUOVI, ph: window.__CPM_PHASE(), hero: S.heroTarget, ball: S.ballTarget, ballW: S.ball, held: S.held || null, sitText: (window.__CPM_SITCTX && window.__CPM_SITCTX()) || null }; }).catch(e => ({ err: String(e) }));
  console.log(gi, JSON.stringify(s).slice(0, 400));
  await ctx.close();
}
await b.close(); srv.close();
