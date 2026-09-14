import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const page = await ctx.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Tr' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 9200, policy: 'seeded', tickMs: 300 }));
const t = [];
for (let k = 0; k < 900; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); const h = window.__CPM_HOLD && window.__CPM_HOLD();
    return { w: window.__CPM_SAL689_WHY || null, c: st ? st.clock : null, pg: !!(h && h.pg), s: h ? h.pgStep : null, l: h ? h.pgLen : null, tk: h ? h.pgTicks : null, bx: st && st.ball ? +st.ball.x.toFixed(0) : null };
  } catch (_e) { return null; } });
  if (r) t.push(r);
  if (r && r.c >= 89) break;
}
await b.close(); srv.close();
let prev = '';
for (const r of t) { const k = `${r.w}|${r.pg}|${r.s}/${r.l}`; if (k !== prev) { console.log(`${String(r.c).padStart(2)}' why=${String(r.w).padEnd(12)} pg=${r.pg?1:0} piano=${r.s}/${r.l} tick=${r.tk} bx=${r.bx}`); prev = k; } }
console.log(`\ncampioni: ${t.length} · clock finale ${t.length?t[t.length-1].c:'-'}`);
