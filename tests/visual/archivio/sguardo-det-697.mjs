#!/usr/bin/env node
/* [STRUMENTO] IL CODICE 007 SU SCENE IDENTICHE — il metro che mancava.
   La sonda `sguardo-696` gioca highlight reattivi: ogni giro sono scene diverse, e la varianza fra
   scene copre l'effetto. PROVA DI RIPETIBILITA' che me l'ha insegnato: due passate sullo STESSO
   codice hanno dato 91 campioni con inversione (mediana 85 gradi/s) e 31 (mediana 53). Fattore tre a
   codice invariato: con quel metro non si decide niente, e una revoca motivata con quei numeri e' una
   revoca motivata col rumore.
   Qui le scene sono FORZATE: stessa lista di situazioni, stesso esito, stesso ordine, in verde e in
   rosso. Cio' che cambia fra i due bracci e' solo il codice. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const GIS = (process.env.CPM_GIS || '8,30,55,60,80,115,120,132').split(',').map(x => +x.trim()).filter(n => n >= 0);
const RIP = +(process.env.CPM_RIP || 2);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
  for (const k of r) window['__CPM_NO' + k] = true;
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {} }, (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean));
await openMatch(page, port, { skipLoadAll: true, name: 'Sd' });
await sleep(900);
const out = [];
for (let r = 0; r < RIP; r++) for (const gi of GIS) {
  const armed = await page.evaluate(g => { try { return !!(window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(g, 0)); } catch (e) { return false; } }, gi);
  if (!armed) continue;
  await page.waitForFunction(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_result'; } catch (e) { return false; } }, { timeout: 30000 }).catch(() => {});
  await sleep(2600);
  const s = await page.evaluate(() => { try {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); if (!snap || !snap.samples) return null;
    const S = snap.samples; const ks = S.map(q => q.sk).filter(k => k != null && k >= 0); if (!ks.length) return null;
    const W = S.filter(q => q.sk === Math.max(...ks)); if (W.length < 8) return null;
    let yRev = 0, yPrev = 0; const gsPan = [], gsRev = []; let yp2 = 0;
    for (let i = 1; i < W.length; i++) { const a = W[i - 1], c = W[i];
      if (a.lx == null || c.lx == null || a.cx == null || c.cx == null) continue;
      const dtm = (c.t - a.t) / 1000; if (!(dtm > 0.004 && dtm < 0.4)) continue;
      const y1 = Math.atan2(a.lx - a.cx, a.lz - a.cz), y2 = Math.atan2(c.lx - c.cx, c.lz - c.cz);
      let dy = ((y2 - y1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      const gs = Math.abs(dy) * 57.2958 / dtm; if (gs > 400) continue;
      const inv = yp2 && Math.sign(dy) !== Math.sign(yp2) && Math.abs(dy) > 0.006;
      if (Math.abs(dy) > 0.006) { if (yPrev && Math.sign(dy) !== Math.sign(yPrev)) yRev++; yPrev = dy; yp2 = dy; }
      (inv ? gsRev : gsPan).push(gs); }
    const dur = Math.max(0.001, (W[W.length - 1].t - W[0].t) / 1000);
    return { n: W.length, inv: +(yRev / dur).toFixed(2), nRev: gsRev.length, nPan: gsPan.length,
             medRev: gsRev.length ? +gsRev.sort((x, y) => x - y)[gsRev.length >> 1].toFixed(0) : null,
             p99Pan: gsPan.length ? +gsPan.sort((x, y) => x - y)[Math.floor(gsPan.length * 0.99)].toFixed(0) : null };
  } catch (e) { return null; } });
  if (s) out.push({ gi, ...s });
  await page.evaluate(() => { try { window.__CPM_RESOLVE && window.__CPM_RESOLVE(0); } catch (e) {} }).catch(() => {});
  await sleep(500);
  const ph = await matchPhase(page);
  if (ph === 'ended' || ph == null) { try { await openMatch(page, port, { skipLoadAll: true, name: 'Sd' }); await sleep(900); } catch (e) { break; } }
}
await b.close(); srv.close();
const ord = a => a.slice().sort((x, y) => x - y);
const invs = ord(out.map(o => o.inv));
const nrev = out.reduce((s, o) => s + o.nRev, 0), npan = out.reduce((s, o) => s + o.nPan, 0);
console.log(`\n=== CODICE 007 SU SCENE FORZATE ${process.env.CPM_ROSSO ? '· ROSSO ' + process.env.CPM_ROSSO : '· VERDE'} ===\n`);
console.log(`  scene misurate: ${out.length} (su ${GIS.length * RIP} tentate)`);
if (invs.length) console.log(`  inversioni/s: mediana ${invs[invs.length >> 1].toFixed(2)} · max ${invs[invs.length - 1].toFixed(2)} · scene sopra 2,0: ${invs.filter(v => v >= 2).length}/${invs.length}`);
console.log(`  campioni con inversione: ${nrev} · senza: ${npan} · quota tremore ${npan + nrev ? (100 * nrev / (npan + nrev)).toFixed(1) : '—'}%`);
console.log('\n  per scena (gi · inversioni/s · campioni-inv):');
for (const o of out) console.log(`    gi${String(o.gi).padStart(3)} · ${String(o.inv).padStart(5)} · ${String(o.nRev).padStart(3)}`);
console.log('');
