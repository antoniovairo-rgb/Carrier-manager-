/* [STRUMENTO] LA SCENA SALIENTE VEDE IL TIRO, O SI CHIUDE PRIMA?
   Il piano del gol ha 2-3 passi; l'ULTIMO porta il pallone al limite dell'area / secondo palo ed e'
   l'unico marcato come tiro. Se la finestra 3D si apre all'INIZIO della costruzione e ha un tetto di
   18s, puo' chiudersi mentre il piano e' ancora a centrocampo: e' esattamente cio' che il PO vede
   («si vede solo gioco finto a centrocampo»). Qui si misura, per ogni costruzione: dove sta il piano
   quando la finestra si apre e dove sta quando si chiude. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const fin = [];
for (const seme of [7300, 8100, 9200]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const rossi = (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; for (const k of r) window['__CPM_NO' + k] = true; }, rossi);
  await openMatch(page, port, { skipLoadAll: true, name: 'Fp' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let cur = null;
  for (let k = 0; k < 900; k++) {
    await sleep(300);
    const r = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE();
      const h = window.__CPM_HOLD && window.__CPM_HOLD();
      return { w: window.__CPM_SAL689_WHY || null, bx: st && st.ball ? st.ball.x : null, clock: st ? st.clock : null,
               step: h ? h.pgStep : null, len: h ? h.pgLen : null, tick: h ? h.pgTicks : null, pg: !!(h && h.pg) };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.w && !cur) cur = { causa: r.w, min: r.clock, step0: r.step, len: r.len, bx0: r.bx, bxMax: r.bx || 50, bxMin: r.bx || 50, n: 0, stepMax: r.step == null ? -1 : r.step, len1: r.len };
    if (r.w && cur) { cur.n++; if (r.bx > cur.bxMax) cur.bxMax = r.bx; if (r.bx < cur.bxMin) cur.bxMin = r.bx;
      if (r.step != null && r.step > cur.stepMax) { cur.stepMax = r.step; cur.len1 = r.len; } cur.step1 = r.step; cur.bx1 = r.bx; }
    if (!r.w && cur) { fin.push({ seme, ...cur }); cur = null; }
    if (r.clock != null && r.clock >= 89) break;
  }
  if (cur) fin.push({ seme, ...cur });
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n=== LA SCENA VEDE IL TIRO O SI CHIUDE PRIMA? ===\n');
console.log(`  finestre osservate: ${fin.length}\n`);
let visto = 0;
for (const f of fin) {
  const conPiano = f.len1 != null;
  const arriva = conPiano && f.stepMax >= f.len1;
  if (arriva) visto++;
  console.log(`  [${String(f.causa).padEnd(12)}] ${String(f.min).padStart(2)}' · ${String(f.n).padStart(2)} campioni · palla ${f.bx0 == null ? '-' : f.bx0.toFixed(0)}→${f.bx1 == null ? '-' : f.bx1.toFixed(0)} (max ${f.bxMax.toFixed(0)}, min ${f.bxMin.toFixed(0)}) · piano ${conPiano ? `${f.stepMax}/${f.len1}` : '—'} ${arriva ? '· TIRO VISTO' : conPiano ? '← chiusa PRIMA del tiro' : ''}`);
}
console.log(`\n  finestre con piano che arriva al tiro: ${visto}/${fin.length}`);
console.log('');
