#!/usr/bin/env node
/* [giro 418] sonda: larghezza della barriera gi81 nel tempo, CPU normale e rallentata (CDP). Uso: CPM_LENTO=1,4,6 node misura-418.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const lenti = (process.env.CPM_LENTO || '1,4').split(',').map(Number);
for (const k of lenti) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Bar73' }); await sleep(1000);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: k });
  await p.evaluate(() => { window.__CPM_FORCE_SIT(81, true); window.__CPM_FROZEN = false; });
  await p.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 60000 }).catch(() => {});
  const t0 = Date.now(); const righe = [];
  while (Date.now() - t0 < 12000) {
    const r = await p.evaluate(() => { const s = window.__CPM_STATE(); const bl = s.ball;
      const w = s.players.filter(q => q.team === 'away' && !q.gk).map(q => ({ d: Math.hypot(q.x - bl.x, (q.y - bl.y) * 0.68), y: q.y, x: q.x })).filter(q => q.d > 7 && q.d < 12).sort((a, c) => a.d - c.d).slice(0, 4);
      const m = (window.__CPM_MUR72 || []).map(o => o.y); const mi=(window.__CPM_MUR72||[]).map(o=>o.i).join(',');
      return { ph: window.__CPM_PHASE(), n: w.length, largo: w.length ? Math.max(...w.map(q => q.y)) - Math.min(...w.map(q => q.y)) : null,
        ys: s.players.map((q,i)=>({i,q,d:Math.hypot(q.x - bl.x, (q.y - bl.y) * 0.68)})).filter(o=>o.q.team==='away'&&!o.q.gk&&o.d<14).map(o=>o.i+':'+(o.q.role||'?')+'@'+o.d.toFixed(1)+'/'+o.q.y.toFixed(0)).join(' '), mur: m.length ? (Math.max(...m) - Math.min(...m)).toFixed(1) + '(' + mi + ')' : '-', ball: bl.x.toFixed(0) + ',' + bl.y.toFixed(0) }; });
    righe.push(`${((Date.now() - t0) / 1000).toFixed(1)}s ${r.ph} n=${r.n} largo=${r.largo == null ? '-' : r.largo.toFixed(1)} ys=${r.ys} bersagli=${r.mur} palla=${r.ball}`);
    await sleep(700);
  }
  console.log(`== CPU ×${k}`); console.log(righe.join('\n')); await p.close();
}
await b.close(); srv.close();
