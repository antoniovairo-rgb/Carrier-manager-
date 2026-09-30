/* [7.999.84 PO-151] Guardiano dell'apertura delle scene difensive (codice 001 del collaudo Codex 30/09):
   pagina nuova per scena, pallone logico campionato per 3 s dall'apertura. Verde: il pallone e' SEMPRE su un
   avversario vicino (tra 1,5 e 14 unita' dall'eroe) — mai a meta' campo, mai sui piedi dell'eroe.
   Rosso __CPM_NO_PALLA84 (CPM_ROSSO84P=1): deve comparire il difetto (oltre 20u o sull'eroe). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO84P;
const SCENE = (process.env.CPM_GI || '33,168,133,138,31,157').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = [];
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript((R) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; if (R) window.__CPM_NO_PALLA84 = 1; }, ROSSO);
  await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  for (let i = 0; i < 40; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (/hl_move|hl_choose/.test(ph || '')) break; await sleep(150); }
  const d = [];
  for (let i = 0; i < 10; i++) {
    const s = await p.evaluate(() => { const S = window.__CPM_STATE(); return [S.heroTarget.x, S.heroTarget.y, S.ballTarget.x, S.ballTarget.y]; }).catch(() => null);
    if (s) d.push(+Math.hypot(s[0] - s[2], s[1] - s[3]).toFixed(1));
    await sleep(300);
  }
  const bad = d.filter(x => x > 14 || x < 1.5).length;
  ris.push({ gi, d, bad }); console.log(`gi${gi} distanze pallone-eroe: ${d.join(' ')} · fuori banda ${bad}`);
  await ctx.close();
}
await b.close(); srv.close();
const campioni = ris.reduce((a, r) => a + r.d.length, 0), fuori = ris.reduce((a, r) => a + r.bad, 0);
console.log(`campioni ${campioni} · fuori banda ${fuori}`);
if (campioni < SCENE.length * 6) { console.log('CIECO'); process.exit(2); }
if (ROSSO) { console.log(fuori > campioni * 0.3 ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(fuori > campioni * 0.3 ? 0 : 1); }
const ok = fuori <= campioni * 0.05; console.log(ok ? 'VERDE' : 'KO'); process.exit(ok ? 0 : 1);
