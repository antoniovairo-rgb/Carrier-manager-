/* [STRUMENTO] IL PALLONE 3D SEGUE IL PALLONE LOGICO? Tutte le mie misure fin qui leggono il pallone
   LOGICO (__CPM_STATE().ball). Lo scatto dice che la camera, che punta il pallone 3D, guarda il
   centrocampo mentre il logico e' a gx 91. Se i due divergono, ogni numero che ho dato descrive un
   pallone che nessuno vede. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const page = await ctx.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Vd' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const camp = [];
for (let k = 0; k < 900; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); const m = window.__CPM_BALL && window.__CPM_BALL();
    return { w: window.__CPM_SAL689_WHY || null, log: st && st.ball ? +st.ball.x.toFixed(1) : null, mesh: m ? m.x : null, c: st ? st.clock : null };
  } catch (_e) { return null; } });
  if (!r) continue;
  if (r.w && r.log != null && r.mesh != null) camp.push(r);
  if (r.c != null && r.c >= 89) break;
}
await b.close(); srv.close();
console.log('\n=== IL PALLONE 3D SEGUE QUELLO LOGICO? ===\n');
console.log(`  campioni dentro una finestra saliente: ${camp.length}`);
if (camp.length) {
  const d = camp.map(c => Math.abs(c.log - c.mesh)).sort((a, b2) => a - b2);
  console.log(`  scarto |logico - mesh| : mediana ${d[d.length >> 1].toFixed(1)}u · max ${d[d.length - 1].toFixed(1)}u`);
  console.log(`  campioni con scarto > 10u: ${d.filter(v => v > 10).length}/${d.length}`);
  console.log('\n  primi 12 campioni (minuto · logico → mesh):');
  for (const c of camp.slice(0, 12)) console.log(`    ${String(c.c).padStart(2)}' [${c.w.padEnd(11)}] ${String(c.log).padStart(5)} → ${String(c.mesh).padStart(6)}   scarto ${(c.log - c.mesh).toFixed(1)}`);
}
console.log('');
