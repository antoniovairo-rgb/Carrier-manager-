import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_GI || '33,168,133').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  const t0 = Date.now(); const row = [];
  for (let i = 0; i < 24; i++) {
    const s = await p.evaluate(() => { const S = window.__CPM_STATE(); return [window.__CPM_PHASE(), S.heroTarget.x, S.ballTarget.x, S.ballTarget.y]; }).catch(() => null);
    if (s) row.push(`${((Date.now() - t0) / 1000).toFixed(1)}s ${s[0].replace('hl_', '')} eroe ${s[1]} palla ${s[2]},${s[3]}`);
    await sleep(250);
  }
  console.log('gi' + gi + '\n  ' + row.filter((r, i) => i < 6).join('\n  '));
  await ctx.close();
}
await b.close(); srv.close();
