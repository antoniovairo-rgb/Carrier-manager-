/* [7.999.93 PO-143, taccuino #140 «Siamo in vantaggio — gestisci!»] Guardiano della conduzione e della palla persa: dopo che il pallone e' partito, niente piu' di 500 ms fermo (011) e nessuna azione riuscita che va all'indietro (012). Tempo reale. Rosso __CPM_NO_CONDUCI93 (CPM_ROSSO93=1). Uso: CPM_GUARD=1. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = (process.env.CPM_GI || '140').split(',').map(Number);
const ESITI = (process.env.CPM_ESITO || 'success,fail').split(',');
const AZ = (process.env.CPM_AZ || '0,1').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const tot = { casi: 0, c005: 0, c014: 0, c012: 0, c011: 0, salti: 0 };
for (const gi of GI) for (const az of AZ) for (const es of ESITI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_DTREAL = 1; if (r) window.__CPM_NO_CONDUCI93 = 1; }, !!process.env.CPM_ROSSO93);
  await openMatch(p, port, { skipLoadAll: true, name: 'Conduci' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  for (let i = 0; i < 40; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE()); if (ph === 'hl_move' || ph === 'hl_choose') break; await sleep(300); }
  await sleep(1200);
  if (await p.evaluate(() => window.__CPM_PHASE()) === 'hl_move') { const bt = await p.$$('button'); for (const x of bt) { const t = (await x.innerText().catch(() => '')) || ''; if (/^Scegli/i.test(t.trim())) { await x.click().catch(() => {}); break; } } }
  for (let i = 0; i < 20; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE()); if (ph === 'hl_choose') break; await sleep(300); }
  await sleep(800);
  const lbl = await p.evaluate(() => { try { return [...document.querySelectorAll('[data-cpm="scelte"] button')].map(x => x.textContent.trim().slice(0, 30)); } catch (e) { return []; } });
  if (az >= Math.max(lbl.length, 1)) { await ctx.close(); continue; }
  await p.evaluate(([e, a]) => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(a); }, [es, az]).catch(() => {});
  const S = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 4500) { const m = await p.evaluate(() => { const s = window.__CPM_STATE(); return { ph: window.__CPM_PHASE(), b: s.ball, pl: (s.players || []).map(q => [q.x, q.y]).concat([[s.hero.x, s.hero.y]]) }; }); S.push({ t: Date.now() - t0, ...m }); await sleep(45); }
  const tl = await p.evaluate(() => { try { const a = (window.__CPM_TIMELINE() || []).filter(e => e.type === 'ActionResolved').pop(); return a ? (a.outcome || a.key || '') + '' : null; } catch (e) { return null; } });
  const R = S.filter(f => f.ph === 'hl_result');
  let anc = null, ancT = 0; let c005 = 0, c014 = 0, c011 = 0, salti = 0, dirTimes = [], still = 0, stillMax = 0, dxTot = 0;
  for (let k = 1; k < R.length; k++) {
    const a = R[k - 1].b, c = R[k].b, dt = R[k].t - R[k - 1].t; const d = Math.hypot(c.x - a.x, c.y - a.y);
    dxTot += c.x - a.x;
    if (d / Math.max(dt, 1) * 50 > 2) salti++;
    if (!R[k].mosso) R[k].mosso = R[k-1].mosso || d > 0.5; if (R[k].mosso && c.x > 3 && c.x < 97) { if (!anc || Math.hypot(c.x - anc.x, c.y - anc.y) > 0.3) { anc = c; ancT = R[k].t; } else stillMax = Math.max(stillMax, R[k].t - ancT); } else anc = null;
    if (k >= 2) { const z = R[k - 2].b; const v1 = [a.x - z.x, a.y - z.y], v2 = [c.x - a.x, c.y - a.y]; const n1 = Math.hypot(...v1), n2 = Math.hypot(...v2);
      if (n1 > 0.4 && n2 > 0.4) { const ang = Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / n1 / n2))) * 180 / Math.PI;
        if (ang > 60) { const near = R[k].pl.some(q => Math.hypot(q[0] - a.x, q[1] - a.y) < 1.5); if (!near) c005++; dirTimes.push(R[k].t); } } }
  }
  for (let i = 1; i < dirTimes.length; i++) if (dirTimes[i] - dirTimes[i - 1] < 400) c014++;
  if (stillMax > 500) c011 = 1;
  const c012 = (dxTot < 0 && es === 'success') ? 1 : 0;
  tot.casi++; tot.c005 += c005; tot.c014 += c014; tot.c012 += c012; tot.c011 += c011; tot.salti += salti;
  console.log(`gi${gi} az${az} «${lbl[az] || '?'}» ${es} (tl ${tl}) · campioni ${R.length} · 005:${c005} 014:${c014} 012:${c012}(dx ${dxTot.toFixed(1)}) 011:${c011}(${stillMax}ms) salti:${salti}`);
  console.log('   pallone ' + R.filter((_, i) => i % 5 === 0).map(f => f.t + ':' + f.b.x.toFixed(0) + ',' + f.b.y.toFixed(0)).join(' '));
  await ctx.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(tot));
if (process.env.CPM_GUARD) {
  if (tot.casi < 3) { console.log('CIECO'); process.exit(2); }
  if (process.env.CPM_ROSSO93) { const v = tot.c011 >= tot.casi * 0.5; console.log(v ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
  const ok = tot.c011 <= tot.casi * 0.25 && tot.c012 === 0; console.log(ok ? 'VERDE' : 'KO'); process.exit(ok ? 0 : 1);
}
