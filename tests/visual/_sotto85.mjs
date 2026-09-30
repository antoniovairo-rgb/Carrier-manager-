import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_GI || '33,168,31,133,138,157,24,2').split(',').map(Number);
const GLB = !!process.env.CPM_GLBON;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript((G) => { window.__CPM_GLB = G; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; if (window.__R85) window.__CPM_NO_SOTTO85 = 1; }, GLB);
  if (process.env.CPM_ROSSO85S) await p.addInitScript(() => { window.__CPM_NO_SOTTO85 = 1; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  for (let i = 0; i < 60; i++) { if ((await p.evaluate(() => window.__CPM_PHASE())) === 'hl_choose') break; await sleep(200); }
  const row = [];
  for (let k = 0; k < 4; k++) {
    await sleep(700);
    const m = await p.evaluate(() => { const c = window.__CPM_CAMT767, v = c && c.hs94; const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; const R = cv.getBoundingClientRect();
      const s = document.querySelector('[data-cpm="scelte"]'); const t = s ? Math.round(s.getBoundingClientRect().top) : null;
      return v ? { hy: Math.round(R.top + (1 - v[1]) / 2 * R.height), top: t } : null; });
    if (m) row.push(m.top != null ? (m.top - m.hy) : 'n/a');
  }
  console.log(`gi${gi} margine scheda-eroe (px, positivo = eroe sopra la scheda): ${row.join(' ')}`);
  await ctx.close();
}
await b.close(); srv.close();
