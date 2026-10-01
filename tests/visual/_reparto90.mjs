import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = (process.env.CPM_GI || '134,36,33').split(',').map(Number);
const ESITI = (process.env.CPM_ESITO || 'success,fail').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of GI) for (const es of ESITI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; if (!window.__NO_DTREAL) window.__CPM_DTREAL = 1; });
  if (process.env.CPM_ROSSO90) await p.addInitScript(() => { window.__CPM_NO_REPARTO90 = 1; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Reparto' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  await sleep(1500);
  const snap = () => p.evaluate(() => { const S = window.__CPM_STATE(); return { ph: window.__CPM_PHASE(), mp: window.__CPM_MP && window.__CPM_MP(), k: (window.__CPM_STATE().act||{}).kind, b: window.__CPM_STATE().ball, adv: window.__CPM_ADV773, pl: (S.players || []).map(q => ({ t: q.team, x: q.x, y: q.y, h: !!q.hero, gk: !!q.gk, n: q.ndc })) }; });
  const a = await snap();
  await p.evaluate(e => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(0); }, es).catch(() => {});
  const fr = [];
  for (let k = 0; k < 10; k++) { await sleep(250); fr.push(await snap()); }
  const res = fr.filter(f => f.ph === 'hl_result');
  const per = t => { if (res.length < 2) return null; const f0 = res[0].pl, f1 = res[res.length - 1].pl; let s = 0, n = 0, fermi = 0, vis = 0;
    f0.forEach((q, i) => { if (q.t !== t || q.h || q.gk) return; const r = f1[i]; if (!r) return; const d = Math.hypot(r.x - q.x, r.y - q.y); s += d; n++; if (d < 0.5) fermi++; if (r.n && Math.abs(r.n.x) < 1 && Math.abs(r.n.y) < 1) vis++; }); return { media: +(s / n).toFixed(2), fermi, n, vis }; };
  const lg = (() => { if (res.length < 2) return null; const a0 = res[0].mp, a1 = res[res.length - 1].mp; let s = 0, n = 0; a0.forEach((q, i) => { if (!q || q.gk) return; const r = a1[i]; s += Math.hypot(r.x - q.x, r.y - q.y); n++; }); return +(s / n).toFixed(2); })();
  console.log(`logico ${lg} kind ${res[0] && res[0].k} pallone ${res.length?res.map(f=>f.b.x.toFixed(0)+','+f.b.y.toFixed(0)).join(' '):''}`);
  console.log(res.map(f=>JSON.stringify(f.adv)).join(' '));
  console.log(`gi${gi} ${es}: result ${res.length}/10 · casa ${JSON.stringify(per('home'))} · ospiti ${JSON.stringify(per('away'))}`);
  await ctx.close();
}
await b.close(); srv.close();
