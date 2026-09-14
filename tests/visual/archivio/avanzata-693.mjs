/* [STRUMENTO] DURANTE LA COSTRUZIONE, IL PALLONE AVANZA?
   Il metro del 7.692 («il pallone dentro la finestra») e' AMBIGUO: la finestra tiene dentro anche i
   cinque secondi dopo la rete, e li' il pallone e' IN PORTA a gx 98 — un massimo che non dice niente
   sulla manovra. Qui si guarda solo la costruzione VIVA (pendingGoal aperto) e si misura l'AVANZATA
   nel verso di chi attacca: quanto lontano arriva il pallone prima che la rete si scriva.
   Riferimenti: 45 = meta' campo · 72 = trequarti · 84 = limite dell'area. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const cs = [];
for (const seme of [7300, 8100, 9200]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const rossi = (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; for (const k of r) window['__CPM_NO' + k] = true; }, rossi);
  await openMatch(page, port, { skipLoadAll: true, name: 'Av' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let cur = null;
  for (let k = 0; k < 900; k++) {
    await sleep(250);
    const r = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE(); const h = window.__CPM_HOLD && window.__CPM_HOLD();
      return { pg: !!(h && h.pg), dir: h ? h.pgDir : null, s: h ? h.pgStep : null, l: h ? h.pgLen : null,
               bx: st && st.ball ? st.ball.x : null, c: st ? st.clock : null };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.pg && !cur) cur = { min: r.c, dir: r.dir, len: r.l, advMax: -1, adv0: null, n: 0, step: r.s };
    if (r.pg && cur) { cur.n++; const adv = r.dir > 0 ? r.bx : 100 - r.bx; if (cur.adv0 == null) cur.adv0 = adv; if (adv > cur.advMax) cur.advMax = adv; if (r.s != null && r.s > (cur.step | 0)) cur.step = r.s; cur.len = r.l; }
    if (!r.pg && cur) { cs.push({ seme, ...cur }); cur = null; }
    if (r.c != null && r.c >= 89) break;
  }
  if (cur) cs.push({ seme, ...cur });
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n=== DURANTE LA COSTRUZIONE, IL PALLONE AVANZA? ===\n');
console.log(`  costruzioni osservate: ${cs.length}\n`);
let inArea = 0, inTre = 0;
for (const c of cs) {
  if (c.advMax >= 84) inArea++; if (c.advMax >= 72) inTre++;
  console.log(`  ${String(c.min).padStart(2)}' · ${String(c.n).padStart(2)} campioni · piano ${c.step}/${c.len} · avanzata ${c.adv0 == null ? '-' : c.adv0.toFixed(0)} → MAX ${c.advMax.toFixed(0)} ${c.advMax >= 84 ? '· IN AREA' : c.advMax >= 72 ? '· trequarti' : '← resta indietro'}`);
}
console.log(`\n  costruzioni che portano il pallone IN AREA (>=84): ${inArea}/${cs.length}`);
console.log(`  costruzioni che superano la trequarti (>=72): ${inTre}/${cs.length}`);
const med = cs.length ? cs.map(c => c.advMax).sort((a, b2) => a - b2)[cs.length >> 1] : 0;
console.log(`  avanzata massima mediana: ${med.toFixed(0)}\n`);
