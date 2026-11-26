/* [giro 384 PO-524] SONDA: cosa cresce durante una partita vera sul banco.
   Partita del salvataggio save-194 (come probe-fischio-270), autoplay seedato, si gioca TUTTA (niente salto all'85').
   A ogni minuto di gioco si annotano: secondi di parete da un minuto al successivo, fotogramma mediano/p90 del tratto,
   contatori del DOM (CDP Memory.getDOMCounters: nodi, documenti, ascoltatori JS), heap JS (CDP Runtime.getHeapUsage),
   oggetti di three.js (__CPM_RINFO769: geometrie, texture, programmi, chiamate, triangoli, luci; __CPM_SCN384: oggetti in scena),
   timer e requestAnimationFrame vivi (contatori messi dalla sonda sulle funzioni del browser) e lunghezza dei registri di partita.
   Uso: node misura-384.mjs [pc|tel]   env: CPM_ROOT (altra copia del repo) · TETTO ms · VEL · CPM_ROSSO=1 (arma __CPM_NO_G384) · OUT file json */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const disp = process.argv[2] || 'pc';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(process.env.CPM_ROOT || undefined); const port = srv.address().port; const b = await launchBrowser();
const ctxOpt = disp === 'tel' ? { viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 900 } };
const ctx = await b.newContext(ctxOpt); const page = await ctx.newPage(); await installCdnRoutes(page);
const cdp = await ctx.newCDPSession(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(([s, v, rosso, glb, flag]) => {
  if (glb !== '1') window.__CPM_GLB = false; localStorage.setItem('cpm-match-speed', v); localStorage.setItem('cpm-v3', JSON.stringify(s));
  if (rosso === '1') window.__CPM_NO_G384 = true;
  window.__CPM_SFOC384 = {};/* testimone del campo 2D: sfocature nell'ultimo fotogramma */
  (flag || '').split(',').filter(Boolean).forEach(k => { window[k] = true; });
  /* contatori dei timer: intervalli vivi, timeout in attesa, richieste di fotogramma per fotogramma */
  const C = window.__CPM_T384 = { iv: new Set(), to: new Set(), raf: 0, ivNati: 0, toNati: 0 };
  const _si = window.setInterval, _ci = window.clearInterval, _st = window.setTimeout, _ct = window.clearTimeout, _raf = window.requestAnimationFrame;
  window.setInterval = function (f, ...a) { const id = _si.call(window, f, ...a); C.iv.add(id); C.ivNati++; return id; };
  window.clearInterval = function (id) { C.iv.delete(id); return _ci.call(window, id); };
  window.setTimeout = function (f, ...a) { let id; const g = typeof f === 'function' ? function () { C.to.delete(id); return f.apply(this, arguments); } : f; id = _st.call(window, g, ...a); C.to.add(id); C.toNati++; return id; };
  window.clearTimeout = function (id) { C.to.delete(id); return _ct.call(window, id); };
  window.requestAnimationFrame = function (f) { C.raf++; return _raf.call(window, f); };
}, [save, process.env.VEL || '4', process.env.CPM_ROSSO || '0', process.env.CPM_GLB || '0', process.env.CPM_FLAG || '']);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => { try { return window.__CPM_CAREER.playMatch(true); } catch (e) { return 'err ' + e.message; } });
await sleep(1500);
for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
  await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
    const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
  await sleep(900); }
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 1941, policy: 'seeded', tickMs: 150 }));
await page.evaluate(() => { const R = window.__R384 = { f: [] }; const fr = () => { R.f.push(performance.now()); if (R.f.length > 4000) R.f.splice(0, 2000); requestAnimationFrame(fr); }; requestAnimationFrame(fr); });
const lens = () => page.evaluate(() => {
  const L = (x) => { try { const v = typeof x === 'function' ? x() : x; return Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : null); } catch (e) { return null; } };
  const T = window.__CPM_T384, R = window.__R384; const fr = R.f; const d = []; for (let i = Math.max(1, fr.length - 120); i < fr.length; i++) d.push(fr[i] - fr[i - 1]); d.sort((a, b) => a - b);
  const q = x => d.length ? Math.round(d[Math.floor(d.length * x)]) : null;
  let ri = null; try { ri = window.__CPM_RINFO769 ? window.__CPM_RINFO769() : null; } catch (e) {}
  let scn = null; try { scn = window.__CPM_SCN384 ? window.__CPM_SCN384() : null; } catch (e) {}
  const ev = window.__CPM_EV; const tl = window.__CPM_TIMELINE;
  return { t: performance.now(), m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null,
    dom: document.getElementsByTagName('*').length, fmed: q(.5), fp90: q(.9), iv: T.iv.size, to: T.to.size, raf: T.raf, nfr: fr.length,
    ri, scn, heat: window.__CPM_HEAT23 ? window.__CPM_HEAT23.celle : null, sfoc: window.__CPM_SFOC384 ? window.__CPM_SFOC384.sfoc : null, sfocMax: window.__CPM_SFOC384 ? window.__CPM_SFOC384.max : null, ev: L(ev), tl: L(tl), ivNati: T.ivNati, toNati: T.toNati };
});
const PROF = (process.env.PROF || '').split(',').filter(Boolean).map(Number); const profFatti = new Set();
const out = []; const t0 = Date.now(); let lastM = null, lastRaf = 0, lastFr = 0, ph = null, hlVisto = false; const MIN_FINE = +process.env.MIN_FINE || 999;
while (Date.now() - t0 < (+process.env.TETTO || 1500000)) {
  const s = await lens().catch(() => null); if (!s) { await sleep(1000); continue; } ph = s.ph;
  if (s.ph === 'ended' || s.ph === 'ceremony') break;
  if (s.ph !== 'playing') hlVisto = true;
  if (s.m !== lastM && s.ph === 'playing') {
    const dc = await cdp.send('Memory.getDOMCounters').catch(() => ({})); const hu = await cdp.send('Runtime.getHeapUsage').catch(() => ({}));
    const rafPerFr = (s.nfr - lastFr) > 0 ? +((s.raf - lastRaf) / Math.max(1, s.nfr - lastFr)).toFixed(2) : null; lastRaf = s.raf; lastFr = s.nfr;
    out.push({ ...s, wall: Date.now() - t0, nodes: dc.nodes, docs: dc.documents, lis: dc.jsEventListeners, heapMB: hu.usedSize ? +(hu.usedSize / 1048576).toFixed(1) : null, rafPerFr, hl: hlVisto });
    lastM = s.m; hlVisto = false;
    if ((s.m | 0) >= MIN_FINE) break;
    if (PROF.includes(s.m | 0) && !profFatti.has(s.m | 0)) { profFatti.add(s.m | 0); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 }); await cdp.send('Profiler.start'); await sleep(+process.env.PROF_MS || 6000);
      const { profile } = await cdp.send('Profiler.stop'); fs.writeFileSync(`out/prof-384-${disp}-m${s.m | 0}.cpuprofile`, JSON.stringify(profile)); console.log('PROFILO min', s.m); }
    const r = out[out.length - 1]; console.log(`${Math.round(r.wall / 1000)}s min ${r.m} f ${r.fmed}/${r.fp90} dom ${r.dom} nodi ${r.nodes} lis ${r.lis} heap ${r.heapMB} geo ${r.ri && r.ri.geo} tex ${r.ri && r.ri.tex} prog ${r.ri && r.ri.programs} calls ${r.ri && r.ri.calls} heat ${r.heat} sfoc ${r.sfoc} iv ${r.iv} to ${r.to} raf/f ${rafPerFr} ev ${r.ev} tl ${r.tl}`);
  }
  await sleep(700);
}
fs.writeFileSync(process.env.OUT || `out/misura-384-${disp}.json`, JSON.stringify({ disp, fine: ph, ms: Date.now() - t0, errs, out }, null, 0));
console.log('FINE', ph, Math.round((Date.now() - t0) / 1000) + 's', 'errori', errs.slice(0, 3).join(' | '));
await b.close(); srv.close(); process.exit(0);
