/* [7.999.89 PO-172] Guardiano del pallone 3D nelle scene difensive (collaudo Codex, gi133 «Recupero sulla linea di fondo»):
   in scelta il pallone 3D sta vicino al pallone logico (portatore) e dentro il quadro. Prima stava a 27u dall'eroe,
   agganciato a un avversario a meta' campo. Rosso __CPM_NO_FONDO89 (CPM_ROSSO89=1). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_GI || '133,33,31,168,128').split(',').map(Number);
let lontani = 0, fuori = 0, campioni = 0;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; });
  if (process.env.CPM_ROSSO89) await p.addInitScript(() => { window.__CPM_NO_FONDO89 = 1; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Fondo' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  const row = [];
  for (let k = 0; k < 8; k++) {
    await sleep(350);
    const m = await p.evaluate(() => { const S = window.__CPM_STATE(), B = S.ball, t = S.ballTarget;
      return { ph: window.__CPM_PHASE(), d: B && t ? +Math.hypot(B.x - t.x, (B.y - t.y) * 0.68).toFixed(1) : null, nx: B && B.ndc ? +B.ndc.x.toFixed(2) : null }; });
    if (k >= 3 && m.ph === 'hl_choose' && m.d != null) { campioni++; if (m.d > 15) lontani++; if (Math.abs(m.nx) > 1) fuori++; }
    row.push(`${m.ph.replace('hl_', '')} d${m.d} x${m.nx}`);
  }
  console.log('gi' + gi + ': ' + row.join(' | '));
  await ctx.close();
}
await b.close(); srv.close();
console.log(`campioni ${campioni} · pallone 3D a oltre 15u dal logico ${lontani} · pallone fuori quadro ${fuori}`);
if (campioni < 10) { console.log('CIECO'); process.exit(2); }
if (process.env.CPM_ROSSO89) { const v = lontani >= 3 || fuori >= 3; console.log(v ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
const ok = lontani === 0 && fuori === 0; console.log(ok ? 'VERDE' : 'KO'); process.exit(ok ? 0 : 1);
