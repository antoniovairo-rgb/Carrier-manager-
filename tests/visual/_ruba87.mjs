import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = (process.env.CPM_GI || '185').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of GI) for (let rep = 0; rep < 2; rep++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_REC = 1; window.__CPM_FILTR23 = null; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' + rep }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => {});
  for (let i = 0; i < 40; i++) { if ((await p.evaluate(() => window.__CPM_PHASE())) === 'hl_choose') break; await sleep(150); }
  const azioni = await p.evaluate(() => [...document.querySelectorAll('[data-cpm="scelte-righe"] button')].map(b => b.textContent.slice(0, 40)));
  await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); }).catch(() => {});
  const traccia = [];
  for (let i = 0; i < 30; i++) {
    const s = await p.evaluate(() => { const S = window.__CPM_STATE(); const im = window.__CPM_INTM80 && window.__CPM_INTM80(); const d = im && S.ball ? +Math.hypot(S.ball.x - 50 - im[0], (S.ball.y - 50) * 0.68 - im[1]).toFixed(1) : null; return { ph: window.__CPM_PHASE(), esito: !!document.querySelector('[data-cpm="esito"]'), d, b: S.ballTarget, bw: S.ball, im, int: (window.__CPM_INT10 || []).length }; });
    traccia.push(s); await sleep(200);
  }
  const ar = await p.evaluate(() => { const t = window.__CPM_TIMELINE() || []; const a = t.filter(x => x.type === 'ActionResolved').pop(); const h = t.filter(x => x.type === 'HighlightForced').pop(); return { a, h }; });
  console.log(`gi${gi}#${rep} azioni ${JSON.stringify(azioni)}\n  esito ${JSON.stringify(ar.a)}\n  scena ${JSON.stringify(ar.h)}\n  filtr23 ${JSON.stringify(await p.evaluate(() => window.__CPM_FILTR23))} · fine palla-intercettore ${JSON.stringify(await p.evaluate(() => { const S = window.__CPM_STATE(); const m = window.__CPM_INTM80 && window.__CPM_INTM80(); return m && S.ball ? +Math.hypot(S.ball.x - m[0], (S.ball.z ?? 0) - m[1]).toFixed(1) : null; }))} · intercetti INT10 ${JSON.stringify(await p.evaluate(() => window.__CPM_INT10))} · interc.mesh ${JSON.stringify(traccia.find(t => t.im)?.im || null)}\n  dist palla-intercettore in hl_result: ${traccia.filter(t => t.ph === 'hl_result').map(t => (t.esito ? '*' : '') + t.d).join(' ')}
  palla mesh: ${traccia.filter((_, i) => i % 5 === 0).map(t => t.bw ? t.bw.x + ',' + t.bw.z : '-').join(' | ')}`);
  await ctx.close();
}
await b.close(); srv.close();
