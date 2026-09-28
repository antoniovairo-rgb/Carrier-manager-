#!/usr/bin/env node
/* [7.999.39 sonda — taccuino PO su 7.999.34, SIT #81 «Punizione — muro a 9 metri!», esito gol: «codice 001: all'apertura il pallone
   non e' ai piedi di nessuno dei nostri (compagno piu' vicino 24,8u, eroe >=43,3u)» + «SALTO del pallone di 37,3 unita' a 24,1s,
   scrittore: scena»] Partita vera col pilota automatico; si chiede al motore una punizione dal limite con l'eroe battitore (la
   richiesta dei piazzati, come piazzati-eroe-test). Dall'apertura della scena si registra a ogni campione: fase, pallone, eroe e
   lo scrittore del pallone (__CPM_WS38). Stampa distanza pallone-eroe all'apertura, in scelta e al calcio, e il salto peggiore.
   Sola lettura. CPM_X/CPM_Y punto del fallo (campo 0-100), CPM_GLB=1 corpi accesi, CPM_ROSSO=nome del flag rosso da accendere. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const X = +(process.env.CPM_X || 78), Y = +(process.env.CPM_Y || 44), GLB = process.env.CPM_GLB === '1', ROSSO = process.env.CPM_ROSSO || '';
const WS = ["—","scena","arco","inseguitore","portatore","addosso","palo","respinta","ricevente-cross","ricevente-pass","consegna","buildup-aereo","buildup-fine","buildup-volo","testa"];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const E = []; page.on('pageerror', e => E.push(e.message));
await page.addInitScript(o => { if (!o.glb) window.__CPM_GLB = false; window.__CPM_CINE = 1; if (o.r) window[o.r] = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, { glb: GLB, r: ROSSO });
await page.addInitScript(() => { window.__GLCTX = []; const og = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k, o) { const r = og.call(this, k, o); if (/webgl/.test(String(k)) && r && !this.__ctxN) { this.__ctxN = 1; window.__GLCTX.push([Math.round(performance.now()), String(k), this.width + 'x' + this.height]); } return r; }; });
await page.addInitScript(() => { window.__LT = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__LT.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {} });
await openMatch(page, port, { skipLoadAll: true, name: 'Punizione' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 8181, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now(); let chiesto = false; const C = []; let tRich = 0, visto = false;
while (Date.now() - t0 < 150000) {
  const r = await page.evaluate(() => { try { const s = window.__CPM_STATE(); const q = window.__CPM_CURSIT && window.__CPM_CURSIT();
    return { t: performance.now(), ph: window.__CPM_PHASE(), bx: s.ball.x, by: s.ball.y, hx: s.hero ? s.hero.x : null, hy: s.hero ? s.hero.y : null, sit: q ? String(q.text || '').slice(0, 40) : null }; } catch (e) { return null; } }).catch(() => null);
  if (!r) { await sleep(200); continue; }
  if (!chiesto && Date.now() - t0 > 15000 && r.ph === 'playing') {
    chiesto = await page.evaluate(o => { try { window.__CPM_WS38 = []; window.__CPM_WS38_REC = 1; window.__CPM_MOTORE_OBJ().chiedi.piazzato({ kind: 'foul', x: o.x, y: o.y, lato: 'home', batt: 21, hold: 6 }); return true; } catch (e) { return false; } }, { x: X, y: Y });
    tRich = r.t; }
  if (chiesto && /^hl/.test(r.ph || '')) { visto = true; C.push(r); if (r.ph === 'hl_choose' && C.filter(c => c.ph === 'hl_choose').length === 6) await page.evaluate(() => { try { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); } catch (e) {} }); }
  if (visto && !/^hl/.test(r.ph || '')) break;
  await sleep(150);
}
const W = await page.evaluate(() => window.__CPM_WS38 || []).catch(() => []);
const LT = await page.evaluate(() => window.__LT || []).catch(() => []);
const GLC = await page.evaluate(() => window.__GLCTX || []).catch(() => []);
await b.close(); srv.close();
if (!C.length) { console.log('❌ nessuna scena di punizione aperta'); process.exit(2); }
const d = c => c.hx == null ? null : +Math.hypot(c.bx - c.hx, (c.by - c.hy) * 0.68).toFixed(1);
const primo = C[0], scelta = C.find(c => c.ph === 'hl_choose'), res = C.find(c => c.ph === 'hl_result');
console.log(`scena: «${primo.sit}» · fasi ${[...new Set(C.map(c => c.ph))].join(' → ')}`);
console.log(`apertura (${primo.ph}): pallone (${primo.bx.toFixed(1)},${primo.by.toFixed(1)}) eroe (${primo.hx && primo.hx.toFixed(1)},${primo.hy && primo.hy.toFixed(1)}) distacco ${d(primo)} · punto del fallo (${X},${Y})`);
if (scelta) console.log(`in scelta: distacco ${d(scelta)} · pallone (${scelta.bx.toFixed(1)},${scelta.by.toFixed(1)})`);
if (res) console.log(`all'esito: distacco ${d(res)}`);
const tA = W.length ? W[0][0] : 0; let peggio = null;
const tScena = primo.t;
for (let i = 1; i < W.length; i++) { const [t, c, x, z] = W[i], [tp, cp, xp, zp] = W[i - 1]; if (t < tScena) continue; const dt = Math.max(1, t - tp) / 1000, dd = Math.hypot(x - xp, z - zp), ecc = dd - (60 * dt + 3);
  if (ecc > 0 && (!peggio || ecc > peggio.ecc)) peggio = { ecc: +ecc.toFixed(1), d: +dd.toFixed(1), ms: Math.round(dt * 1000), a: +((t - tScena) / 1000).toFixed(2), prima: WS[cp] || cp, dopo: WS[c] || c, da: [+xp.toFixed(1), +zp.toFixed(1)], a_: [+x.toFixed(1), +z.toFixed(1)] }; }
console.log('salto peggiore dall\'apertura: ' + (peggio ? JSON.stringify(peggio) : 'nessuno'));
if (process.env.CPM_TRACCIA) { let ult = -1e9; for (const w of W) { if (w[0] < tScena - 500) continue; if (w[0] - ult >= 200) { ult = w[0]; const f = C.reduce((acc, c) => c.t <= w[0] ? c.ph : acc, '?'); console.log(`  ${((w[0] - tScena) / 1000).toFixed(2)}s ${f.padEnd(9)} ${String(WS[w[1]] || w[1]).padEnd(12)} (${w[2].toFixed(1)}, ${w[3].toFixed(1)})`); } } }
{ const tS = C[0].t; const lt = LT.filter(([t]) => t > tS - 3000 && t < tS + 8000); console.log('long task intorno all\'apertura (s dall\'apertura, ms): ' + lt.map(([t, d]) => ((t - tS) / 1000).toFixed(2) + ':' + d).join(' · ')); }
console.log('contesti WebGL creati (s dall\'apertura della scena): ' + GLC.map(([t, k, wh]) => ((t - C[0].t) / 1000).toFixed(2) + ' ' + k + ' ' + wh).join(' · '));
for (const e of E.slice(0, 3)) console.log('⚠ pageerror: ' + e);
