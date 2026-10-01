import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = (process.env.CPM_GI || '38,134,33,24,2,152').split(',').map(Number);
const ESITI = (process.env.CPM_ESITO || 'success,fail').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let tot = 0, casi = 0;
for (const gi of GI) for (const es of ESITI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_DTREAL = 1; window.__CPM_CAMT767ON = 1; window.__CPM_CAMSTEP93ON = 1; if (r) window.__CPM_NO_CAM93 = 1; }, !!process.env.CPM_ROSSO93);
  await openMatch(p, port, { skipLoadAll: true, name: 'Camera' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  for (let i = 0; i < 40; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE()); if (ph === 'hl_move' || ph === 'hl_choose') break; await sleep(300); }
  await sleep(1000);
  if (await p.evaluate(() => window.__CPM_PHASE()) === 'hl_move') { const bt = await p.$$('button'); for (const x of bt) { const t = (await x.innerText().catch(() => '')) || ''; if (/^Scegli/i.test(t.trim())) { await x.click().catch(() => {}); break; } } }
  for (let i = 0; i < 20; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE()); if (ph === 'hl_choose') break; await sleep(300); }
  await sleep(800);
  await p.evaluate((e) => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(0); }, es).catch(() => {});
  const S = []; const t0 = Date.now();
  while (Date.now() - t0 < 6000) { const m = await p.evaluate(() => { const c = window.__CPM_CAMT767; return { ph: window.__CPM_PHASE(), cut: !!(window.__CPM_CUTLIVE && window.__CPM_CUTLIVE()), k: (window.__CPM_STATE().act || {}).kind, c: c ? [c.cx, c.cy, c.cz, c.lx, c.ly, c.lz].map(Number) : null }; }); S.push({ t: Date.now() - t0, ...m }); await sleep(40); }
  const R = S.filter(f => f.ph === 'hl_result' && f.c);
  const salti = [];
  for (let k = 1; k < R.length; k++) { const a = R[k - 1].c, c = R[k].c, dt = (R[k].t - R[k - 1].t) / 1000; const dp = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]), dl = Math.hypot(c[3] - a[3], c[4] - a[4], c[5] - a[5]);
    const v = dp / dt; if (dt > 0 && dp >= 2.5 && v >= 150 && !R[k].cut && !R[k - 1].cut) salti.push(`${R[k].t}ms v${v.toFixed(0)} pos ${dp.toFixed(1)} look ${dl.toFixed(1)} in ${Math.round(dt*1000)}ms`); }
  const cs = await p.evaluate(() => (window.__CPM_CAMSTEP93 || []).filter(e => e.ph === 'hl_result'));
  console.log('   passi>2.5u: ' + JSON.stringify(cs).slice(0, 600));
  casi++; tot += salti.length;
  console.log(`gi${gi} ${es} [${R.length ? R[R.length - 1].k : ''}]: campioni ${R.length} · salti ${salti.length} ${salti.slice(0, 4).join(' | ')}`);
  await ctx.close();
}
await b.close(); srv.close();
console.log(`casi ${casi} · salti ${tot}`);
