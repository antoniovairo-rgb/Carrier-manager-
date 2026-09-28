#!/usr/bin/env node
/* [7.999.39 sonda — il blocco all'apertura della scena] Misurato con punizione-apertura-sonda: all'apertura di una scena del brain un
   solo long task di ~3,2 s (GLB spento), nessun fotogramma 3D per ~2,9 s. Qui: partita vera col pilota automatico, richiesta di un
   piazzato come la fa il gioco, profilo CPU (CDP Profiler) dalla richiesta a 4 s dopo l'apertura; stampa le funzioni col maggior
   tempo PROPRIO e quelle col maggior tempo TOTALE (proprio + chiamate). Sola lettura. CPM_KIND=foul|pen|corner, CPM_GLB=1. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const KIND = process.env.CPM_KIND || 'foul', GLB = process.env.CPM_GLB === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(o => { if (!o.glb) window.__CPM_GLB = false; window.__CPM_CINE = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, { glb: GLB });
await openMatch(page, port, { skipLoadAll: true, name: 'Profilo' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 8181, policy: 'seeded', tickMs: 300 }));
if (GLB) { await page.waitForFunction(() => !!window.__CPM_GLB_READY, null, { timeout: 90000 }).catch(() => {}); await sleep(+(process.env.CPM_ATTESA || 15000)); }
const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
const t0 = Date.now(); let fatto = false, aperta = 0;
while (Date.now() - t0 < 120000) {
  const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  if (!fatto && (GLB || Date.now() - t0 > 15000) && ph === 'playing') { await cdp.send('Profiler.start'); fatto = await page.evaluate(k => { try { window.__CPM_MOTORE_OBJ().chiedi.piazzato({ kind: k, x: 78, y: 44, lato: 'home', batt: 21, hold: 6 }); return true; } catch (e) { return false; } }, KIND); }
  if (fatto && !aperta && /^hl/.test(ph || '')) aperta = Date.now();
  if (aperta && Date.now() - aperta > 4000) break;
  await sleep(100);
}
if (!aperta) { console.log('❌ nessuna scena aperta'); process.exit(2); }
const { profile } = await cdp.send('Profiler.stop'); await b.close(); srv.close();
const N = new Map(profile.nodes.map(n => [n.id, n])); const self = new Map(); const dt = profile.timeDeltas; const smp = profile.samples;
for (let i = 0; i < smp.length; i++) self.set(smp[i], (self.get(smp[i]) || 0) + (dt[i] || 0));
const par = new Map(); for (const n of profile.nodes) for (const c of (n.children || [])) par.set(c, n.id);
const nome = n => { const f = n.callFrame; return `${f.functionName || '(anonima)'} @${(f.url || '').split('/').pop().split('?')[0]}:${f.lineNumber + 1}`; };
const perSelf = new Map(), perTot = new Map();
for (const [id, us] of self) { const n = N.get(id); const k = nome(n); perSelf.set(k, (perSelf.get(k) || 0) + us);
  const visti = new Set(); let c = id; while (c != null) { const kk = nome(N.get(c)); if (!visti.has(kk)) { visti.add(kk); perTot.set(kk, (perTot.get(kk) || 0) + us); } c = par.get(c); } }
const tot = [...self.values()].reduce((a, b) => a + b, 0);
const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `  ${(v / 1000).toFixed(0).padStart(6)} ms  ${(100 * v / tot).toFixed(1).padStart(5)}%  ${k}`).join('\n');
console.log(`profilo: ${(tot / 1000).toFixed(0)} ms campionati (${KIND}, GLB ${GLB ? 'ON' : 'OFF'})`);
console.log('TEMPO PROPRIO:\n' + top(perSelf, 18));
console.log('TEMPO TOTALE:\n' + top(perTot, 30));
