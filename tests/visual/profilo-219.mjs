#!/usr/bin/env node
/* [giro 219 · PO-484 «a volte l'evento post tocco e' un po' ritardato e sembra che non ho premuto»] SONDA di profilo (non giudica):
   dove va il tempo del filo principale nelle scene 3D — ingresso in campo, highlight, festa (cerimonia leggera), premiazione —
   e quanto aspetta un tocco su «Salta». Corpi 3D ACCESI (direttiva PO: mai misurare senza), notte, percorso vero dalla carriera.
   Per scena, una PAGINA NUOVA (una pagina stanca non e' il gioco):
     fotogrammi  = intervalli fra requestAnimationFrame (mediana, p90, massimo) per FIN ms;
     compiti     = PerformanceObserver 'longtask' (>50 ms): quanti, durata totale, il piu' lungo;
     profilo CPU = CDP Profiler (campione ogni 1 ms): tempo proprio per CATEGORIA (disegno three · animazione ossa · ciclo di gioco ·
                   React · GC · resto) e le 14 funzioni piu' care; in piu' il tempo INCLUSIVO sotto render / mixer / ciclo;
     tocco       = lib/tocco-213 su «Salta»: attesa del pointerdown (filo occupato), riscontro, effetto (scena chiusa).
   Telefono: 375x667 isMobile+hasTouch dpr 2, CPU x4 (Emulation.setCPUThrottlingRate) · PC: 1366x768 senza freno.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node profilo-219.mjs [--rosso]   CPM_DOVE=tel,pc · CPM_SCENE=ingresso,highlight,festa,premiazione
        CPM_OUT=<json> · CPM_FIN=6000 · CPM_GLB=0 (corpi procedurali, solo per confronto col giro 213) */
import fs from 'node:fs';
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166 } from './lib/partita-166.mjs';
import { misura } from './lib/tocco-213.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.argv.includes('--rosso');
const DOVE = (process.env.CPM_DOVE || 'tel,pc').split(',');
const SCENE = (process.env.CPM_SCENE || 'ingresso,highlight,festa,premiazione').split(',');
const FIN = +(process.env.CPM_FIN || 4000), GLB = process.env.CPM_GLB !== '0', OUT = process.env.CPM_OUT || '';
const RIGHE = [];
const fase = (p) => p.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }).catch(() => null);
const perSel = (s) => `const L=[...document.querySelectorAll(${JSON.stringify(s)})].filter(b=>b.offsetParent!==null||getComputedStyle(b).position==='fixed');return L[0]||null;`;

/* categorie del profilo: dall'indirizzo dello script e dal nome della funzione */
function categoria(cf) {
  const u = cf.url || '', n = cf.functionName || '';
  if (n === '(garbage collector)') return 'GC';
  if (n === '(idle)') return 'riposo';
  if (n === '(program)') return 'programma (nativo: disegno/composizione/attesa GPU)';
  if (/three/i.test(u)) { if (/AnimationMixer|AnimationAction|PropertyMixer|PropertyBinding|Interpolant|KeyframeTrack|_update|interpolate_|evaluate|setValue|accumulate|apply/.test(n)) return 'three: animazione (mixer)';
    if (/updateMatrix|updateMatrixWorld|Skeleton|multiplyMatrices|compose|Bone/.test(n)) return 'three: matrici e ossa';
    return 'three: disegno (renderer)'; }
  if (/react/i.test(u)) return 'React';
  if (/babel/i.test(u)) return 'Babel';
  if (/GLTF|Skeleton|loader/i.test(u)) return 'caricatori';
  return 'gioco (ciclo, scene, logica)';
}
function leggiProfilo(prof, lunghi, marca, t0pag) {
  const N = new Map(prof.nodes.map(n => [n.id, n])); const par = new Map(); for (const n of prof.nodes) for (const c of (n.children || [])) par.set(c, n.id);
  const self = new Map(); const dt = prof.timeDeltas || []; let tot = 0;
  for (let i = 0; i < prof.samples.length; i++) { const d = (dt[i] || 0) / 1000; self.set(prof.samples[i], (self.get(prof.samples[i]) || 0) + d); tot += d; }
  const cat = {}, fun = {}; const incl = { 'renderer.render': 0, 'mixer.update': 0, 'ciclo 3D (loop)': 0, 'React (commit+render)': 0, 'texImage/bufferData (caricamenti GPU)': 0, 'compilazione shader': 0 };
  const cacheA = new Map(); const antenati = (id) => { if (cacheA.has(id)) return cacheA.get(id); const L = []; let x = id; while (x != null) { const n = N.get(x); L.push(n.callFrame); x = par.get(x); } cacheA.set(id, L); return L; };
  for (const [id, ms] of self) { const cf = N.get(id).callFrame; const c = categoria(cf); cat[c] = (cat[c] || 0) + ms;
    if (!/^\((idle|program)\)$/.test(cf.functionName)) { const k = (cf.functionName || '(anonima)') + ' · ' + ((cf.url || 'gioco').split('/').pop().slice(0, 24) || 'gioco'); fun[k] = (fun[k] || 0) + ms; }
    const A = antenati(id); const ha = (rx, urx) => A.some(f => rx.test(f.functionName || '') && (!urx || urx.test(f.url || '')));
    if (cf.functionName !== '(idle)') {
      if (ha(/^(render|WebGLRenderer\.render|this\.render)$/, /three/i)) incl['renderer.render'] += ms;
      if (ha(/^update$|AnimationMixer/, /three/i) && A.some(f => /AnimationMixer|_update|PropertyMixer|Interpolant|AnimationAction/.test(f.functionName || ''))) incl['mixer.update'] += ms;
      if (ha(/^loop$/)) incl['ciclo 3D (loop)'] += ms;
      if (A.some(f => /react/i.test(f.url || ''))) incl['React (commit+render)'] += ms;
      if (/texImage2D|texSubImage2D|bufferData|bufferSubData|uploadTexture|setTexture2D/.test(cf.functionName || '') || ha(/uploadTexture|setTexture2D|texImage2D/)) incl['texImage/bufferData (caricamenti GPU)'] += ms;
      if (ha(/WebGLProgram|getProgramInfoLog|compileShader|linkProgram|acquireProgram|initMaterial/)) incl['compilazione shader'] += ms;
    } }
  /* percorsi: gli ultimi 4 nomi di funzione (non anonime) lungo la pila, dal piu' esterno; tempo proprio sommato */
  const perc = {}; for (const [id, ms] of self) { const cf = N.get(id).callFrame; if (/^\((idle|program|garbage collector)\)$/.test(cf.functionName)) continue;
    const A = antenati(id).filter(f => f.functionName && !/^\(/.test(f.functionName)).map(f => f.functionName + (/three/i.test(f.url || '') ? '³' : '')).reverse(); const k = A.slice(0, 2).concat(A.length > 4 ? ['…'] : [], A.slice(Math.max(2, A.length - 2))).join(' > ') || '(solo anonime)'; perc[k] = (perc[k] || 0) + ms; }
  /* sincronia orologio del profilo ↔ orologio della pagina: la funzione __marca219 gira all'istante `marca` (performance.now) */
  let perLungo = null; if (lunghi && marca != null) { let t = prof.startTime, tm = null; const T = []; for (let i = 0; i < prof.samples.length; i++) { t += (dt[i] || 0); T.push(t); if (tm == null && N.get(prof.samples[i]).callFrame.functionName === '__marca219') tm = t; }
    if (tm != null) { perLungo = []; for (const [ini, dur] of lunghi.filter(x => x[1] >= 150)) { const a0 = tm + (ini + t0pag - marca) * 1000, a1 = a0 + dur * 1000; const P = {};
        for (let i = 0; i < T.length; i++) { if (T[i] < a0 || T[i] > a1) continue; const id = prof.samples[i]; const cf = N.get(id).callFrame; const A = antenati(id).filter(f => f.functionName && !/^\((root)\)$/.test(f.functionName)).map(f => f.functionName + (/three/i.test(f.url || '') ? '³' : '')).reverse();
          const k = (A.slice(0, 2).concat(A.length > 4 ? ['…'] : [], A.slice(Math.max(2, A.length - 2))).join(' > ')) || '(anonime)'; P[k] = (P[k] || 0) + (dt[i] || 0) / 1000; }
        perLungo.push({ inizio: ini, durata: dur, cosa: Object.fromEntries(Object.entries(P).sort((x, y) => y[1] - x[1]).slice(0, 7).map(([k, v]) => [k, Math.round(v)])) }); } } }
  const r = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, Math.round(v)]));
  return { totale: Math.round(tot), categorie: r(cat), inclusivo: r(incl), funzioni: Object.fromEntries(Object.entries(r(fun)).slice(0, 14)), percorsi: Object.fromEntries(Object.entries(r(perc)).slice(0, 22)), perLungo };
}
const REG = () => { const R = window.__P219 = { f: [], lt: [], t0: performance.now(), on: true, gl0: Object.assign({}, window.__GL219 || {}), pr0: (() => { try { return (window.__CPM_PROGS16() || []).map(x => x.n + '|' + x.k.length + '|' + x.k.slice(0, 60)); } catch (e) { return null; } })(), heap0: performance.memory ? performance.memory.usedJSHeapSize : null }; let u = 0; window.__marca219 = function __marca219() { const t = performance.now(); let x = 0; while (performance.now() - t < 12) x += Math.sqrt(x + 1); return t; };
  const g = (t) => { if (!R.on) return; if (u) R.f.push(t - u); u = t; requestAnimationFrame(g); }; requestAnimationFrame(g); const hi = setInterval(() => { if (!R.on) { clearInterval(hi); return; } if (R.holdFine == null && window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout' && window.__CPM_WALKHOLD74 === false) R.holdFine = performance.now(); }, 50);
  try { R.po = new PerformanceObserver(l => { for (const e of l.getEntries()) R.lt.push([Math.round(e.startTime - R.t0), Math.round(e.duration)]); }); R.po.observe({ type: 'longtask' }); } catch (e) {} };
const LEG = () => { const R = window.__P219; R.on = false; try { R.po.disconnect(); } catch (e) {} const f = R.f.slice().sort((a, b) => a - b); const q = (p) => f.length ? Math.round(f[Math.min(f.length - 1, Math.floor(p * f.length))]) : null;
  const d = performance.now() - R.t0; return { ms: Math.round(d), fotogrammi: f.length, fps: +(f.length / d * 1000).toFixed(1), fotMed: q(0.5), fotP90: q(0.9), fotMax: q(0.999), lunghi: R.lt.length, lunghiMs: R.lt.reduce((a, x) => a + x[1], 0), lunghiMax: R.lt.reduce((a, x) => Math.max(a, x[1]), 0), t0pag: R.t0, marca: R.marca, attesaFine: R.holdFine == null ? null : Math.round(R.holdFine - R.t0),
    quotaBloccata: +(R.lt.reduce((a, x) => a + Math.max(0, x[1] - 50), 0) / d * 100).toFixed(1), elenco: R.lt.slice(0, 40), heapMB: performance.memory ? [Math.round(R.heap0 / 1048576), Math.round(performance.memory.usedJSHeapSize / 1048576)] : null, progNuovi: (() => { try { const a = new Set(R.pr0 || []); const L = (window.__CPM_PROGS16() || []); return { prima: (R.pr0 || []).length, dopo: L.length, nuovi: L.map(x => x.n + '|' + x.k.length + '|' + x.k.slice(0, 60)).filter(x => !a.has(x)).map(x => x.slice(0, 70)) }; } catch (e) { return null; } })(), gl: (() => { const G = window.__GL219 || {}; const o = {}; for (const k in G) o[k] = G[k] - ((R.gl0 || {})[k] || 0); return o; })() }; };

async function profila(dove, scena, page, cdp, innesco, fin) {
  if (dove === 'tel') await cdp.send('Emulation.setCPUThrottlingRate', { rate: +(process.env.CPM_CPU || 4) });/* il freno si mette in scena: l'attesa dei corpi (velo opaco, nessun tasto) non e' cio' che si misura */
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
  await page.evaluate(REG); await cdp.send('Profiler.start'); await page.evaluate(() => { window.__P219.marca = window.__marca219(); }); if (innesco) await innesco(); await sleep(fin || FIN);
  const { profile } = await cdp.send('Profiler.stop'); const fot = await page.evaluate(LEG); const pr = leggiProfilo(profile, fot.elenco, fot.marca, fot.t0pag);
  const riga = { dove, scena, rosso: ROSSO, glb: GLB, ...fot, profilo: pr }; RIGHE.push(riga);
  console.log(`  [${dove} · ${scena}] ${fot.fps} fps · fotogramma med ${fot.fotMed} / p90 ${fot.fotP90} / max ${fot.fotMax} ms · compiti lunghi ${fot.lunghi} (${fot.lunghiMs} ms, max ${fot.lunghiMax}) · bloccato ${fot.quotaBloccata}%`);
  console.log('    categorie ' + JSON.stringify(pr.categorie)); console.log('    inclusivo ' + JSON.stringify(pr.inclusivo)); console.log('    funzioni  ' + JSON.stringify(pr.funzioni)); console.log('    percorsi  ' + JSON.stringify(pr.percorsi)); for (const L of (pr.perLungo || [])) console.log(`    compito lungo a ${L.inizio} ms, ${L.durata} ms: ` + JSON.stringify(L.cosa)); if (fot.attesaFine != null) console.log('    fine attesa corpi a ' + fot.attesaFine + ' ms'); console.log('    lunghi [inizio,durata] ' + JSON.stringify(fot.elenco) + ' · GL ' + JSON.stringify(fot.gl)); console.log('    heap MB [inizio,fine] ' + JSON.stringify(fot.heapMB) + ' · programmi ' + JSON.stringify(fot.progNuovi));
  return riga;
}
async function tocco(riga, page, cdp, mobile, o) {
  await page.evaluate(REG); await cdp.send('Profiler.start'); await page.evaluate(() => { window.__P219.marca = window.__marca219(); });
  const r = await misura(page, mobile ? cdp : null, mobile, o).catch(e => ({ err: e.message }));
  try { const { profile } = await cdp.send('Profiler.stop'); const fot = await page.evaluate(LEG); const pr = leggiProfilo(profile, fot.elenco, fot.marca, fot.t0pag); riga.salto = { lunghi: fot.elenco, perLungo: pr.perLungo, percorsi: pr.percorsi };
    console.log('    durante il salto: lunghi ' + JSON.stringify(fot.elenco)); for (const L of (pr.perLungo || [])) console.log(`      compito lungo a ${L.inizio} ms, ${L.durata} ms: ` + JSON.stringify(L.cosa)); } catch (e) { console.log('    (profilo del salto: ' + e.message + ')'); }
  riga.tocco = r ? { attesa: r.ritardoIngresso, lavoro: r.lavoro, riscontro: r.riscontro == null ? null : Math.round(r.riscontro), rotella: r.rotella == null ? null : Math.round(r.rotella), effetto: r.effetto == null ? null : Math.round(r.effetto), durFot: r.durFot, eventi: r.eventi, err: r.err } : { assente: true };
  console.log('    tocco «Salta» ' + JSON.stringify(riga.tocco));
}
async function apri(dove) {
  const mobile = dove === 'tel'; const vp = mobile ? { width: 375, height: 667 } : { width: 1366, height: 768 };
  const init = { __CPM_PRESENT: 1, __CPM_WALKTEST74: 1, __CPM_T196ON: 1, __CPM_TOD: 'night', ...(ROSSO ? { __CPM_NO_G219: 1 } : {}) };
  const A = await apriCarriera166({ vp, mobile, init, glb: GLB, nome: 'Profilo Tocco' }); const cdp = await A.ctx.newCDPSession(A.page);
  /* la pagina di prova traduce il JSX nel browser (Babel): ~1,1 GB di scarti che il gioco pubblicato in negozio non ha. Si raccolgono QUI, prima della misura, altrimenti la loro raccolta (3 s a CPU x4) cade dentro una scena a caso */
  try { await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.collectGarbage'); } catch (e) {}
  /* contatori GL (sui prototipi: valgono per ogni contesto, anche gia' creato) */
  await A.page.evaluate(() => { const G = window.__GL219 = {}; for (const P of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) { if (!P) continue; for (const n of ['linkProgram', 'compileShader', 'texImage2D', 'texSubImage2D', 'bufferData', 'drawElements', 'drawArrays', 'getProgramParameter', 'readPixels']) { const f = P.prototype[n]; if (!f || f.__g) continue; const w = function () { G[n] = (G[n] || 0) + 1; if (n === 'texImage2D') { try { const a = arguments; const src = a.length >= 9 ? null : a[5]; const k = 'tex ' + (a.length >= 9 ? a[3] + 'x' + a[4] : (src ? (src.width || src.videoWidth) + 'x' + (src.height || src.videoHeight) + (src.tagName ? ' ' + src.tagName : ' dati') : '?')) + (a[1] ? ' mip' : ''); G[k] = (G[k] || 0) + 1; } catch (e) {} } return f.apply(this, arguments); }; w.__g = 1; P.prototype[n] = w; } } });
  return { ...A, cdp, mobile };
}
/* dal prompt fino alla fase voluta: 'walkout' oppure 'playing' */
async function finoA(p, voluta) {
  await apriPrompt166(p);
  await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (b) b.click(); });
  const t0 = Date.now();
  while (Date.now() - t0 < 240000) { const f = await fase(p); if (f === voluta) return true; if (voluta === 'walkout' && f === 'playing') return false;
    if (f === 'walkout' && voluta === 'playing') { await p.evaluate(() => { const b = document.querySelector('[data-cpm="salta-ingresso-v2"]'); if (b && !window.__s219) { window.__s219 = 1; b.click(); } }); await sleep(500); continue; }
    await p.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {} const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Vedi le formazioni|Gioca la partita|Ingresso in campo|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok|Siamo pronti)/i.test((x.textContent || '').trim()) && !/Salta/i.test(x.textContent || '')); if (B.length) B[B.length - 1].click(); }).catch(() => {});
    await sleep(600); }
  return false;
}

for (const dove of DOVE) {
  console.log(`\n== ${dove} ${ROSSO ? '[ROSSO __CPM_NO_G219]' : ''} corpi 3D ${GLB ? 'accesi' : 'spenti'}`);
  for (const scena of SCENE) {
    const A = await apri(dove); const p = A.page;
    try {
      if (scena === 'ingresso') {
        if (!await finoA(p, 'walkout')) throw new Error('ingresso non raggiunto');
        /* la scena si misura da quando si VEDE: finita l'attesa dei corpi (velo opaco del giro 196) e la tenuta al tunnel */
        for (let i = 0; i < 720; i++) { if (await p.evaluate(() => { try { return window.__CPM_PHASE() !== 'walkout' || (!!window.__CPM_PRONTI196().pronti && !window.__CPM_ATT196 && window.__CPM_WALKHOLD74 === false); } catch (e) { return false; } }).catch(() => false)) break; await sleep(250); }
        await sleep(800); const r = await profila(dove, scena, p, A.cdp, null, +(process.env.CPM_FIN_ING || 5000));
        if ((await fase(p)) === 'walkout') await tocco(r, p, A.cdp, A.mobile, { trova: perSel('[data-cpm="salta-ingresso-v2"]'), effetto: `try{return window.__CPM_PHASE()!=='walkout';}catch(e){return false;}`, finestra: 9000 });
        else console.log('    (ingresso gia\' finito: tocco non misurato)');
      } else {
        if (!await finoA(p, 'playing')) throw new Error('partita non raggiunta');
        for (let i = 0; i < 480; i++) { if (await p.evaluate(() => { try { return !!window.__CPM_PRONTI196().pronti && !window.__CPM_ATT196; } catch (e) { return true; } }).catch(() => false)) break; await sleep(250); } await sleep(6000);/* corpi pronti e sei secondi di gioco: la scena forzata parte da una partita a regime */
        if (scena === 'highlight') { await p.evaluate(() => window.__CPM_FORCE_SIT(21)); await sleep(3000); const r = await profila(dove, scena, p, A.cdp); r.fase = await fase(p); console.log('    fase ' + r.fase); }
        else { const o = scena === 'festa' ? { name: 'Doppietta', kind: 'bigwin', light: true, festa: { titolo: 'Doppietta', punteggio: '2 – 1', avversario: 'FC Prova', casa: true, facce: [{ eroe: true, id: 0 }], voci: [{ n: 2, et: 'gol', oro: true }, { n: '7,8', et: 'voto', oro: true }] } } : { name: 'CAMPIONI!', kind: 'league' };
          const r = await profila(dove, scena, p, A.cdp, () => p.evaluate((o) => window.__CPM_FORCE_CEREMONY(o), o), +(process.env.CPM_FIN_CER || 5000));
          if ((await fase(p)) === 'ceremony') await tocco(r, p, A.cdp, A.mobile, { trova: perSel('[data-cpm="salta"]'), effetto: `try{return window.__CPM_PHASE()!=='ceremony';}catch(e){return false;}`, finestra: 9000 });
          else console.log('    (cerimonia gia\' finita: tocco non misurato)'); }
      }
    } catch (e) { console.log(`  ! ${dove} ${scena}: ${e.message}`); RIGHE.push({ dove, scena, errore: e.message }); }
    if (A.errs.length) console.log('    errori di pagina: ' + A.errs.slice(0, 3).join(' | '));
    await A.b.close(); A.srv.close();
  }
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify(RIGHE, null, 1));
