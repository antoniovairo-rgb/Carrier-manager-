#!/usr/bin/env node
/* [PO-237 «La partita, in particolare la prima è un pò scattosa» — sonda + guardiano]
   Misura nella STESSA pagina, GLB acceso (CGTrader, il default), la PRIMA partita dopo l'avvio del gioco (provino 1) e la
   SECONDA (provino 2). Per ognuna, dalla comparsa della partita (LiveMatch montato) per FINESTRA ms reali:
   - tempi di fotogramma (rAF): distribuzione, p50/p95/max, quanti > 50 e > 100 ms;
   - blocchi lunghi del main thread (PerformanceObserver 'longtask'): numero, somma, il piu' lungo;
   - ATTRIBUZIONE, in pagina, del tempo sincrono speso in: parsing GLB (GLTFLoader.parse fino alla callback), clonazione
     scheletri (SkeletonUtils.clone), compilazione/link degli shader (gl.compileShader/linkProgram/getProgramParameter/
     getShaderParameter), caricamento texture (texImage2D/texSubImage2D/compressedTexImage2D), buffer (bufferData).
   ⚠️ L'headless gira in software (swiftshader): gli fps assoluti NON sono il telefono. Si giudica il RAPPORTO fra prima e seconda
   partita (stesso banco, stessa pagina) e i blocchi lunghi.
   GUARDIANO (CPM_GUARD=1, default): VERDE se nella prima partita il parsing GLB resta sotto 200 ms e il caricamento texture entro
   CPM_RAPP (1,6) volte la seconda + CPM_MARG ms (300). Blocchi lunghi e shader sono stampati come informazione. ROSSO atteso con
   CPM_ROSSO=__CPM_NO_PRE237 (pre-caricamento spento). CPM_ATTESA = ms in home prima del provino (25000).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node prima-partita-237.mjs
        CPM_FINESTRA (ms, 45000) · CPM_ROSSO=__CPM_NO_PRE237 · CPM_JSON=<file> (dump) */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, matchPhase } from './lib/harness.mjs';

const FINESTRA = +(process.env.CPM_FINESTRA || 45000);
const RAPP = +(process.env.CPM_RAPP || 1.6), MARG = +(process.env.CPM_MARG || 300);
const ROSSO = process.env.CPM_ROSSO || '';
const ATTESA = +(process.env.CPM_ATTESA != null ? process.env.CPM_ATTESA : 25000);

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const page = await ctx.newPage();
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.addInitScript((rosso) => {
  if (rosso) String(rosso).split(',').forEach(r => { window[r.trim()] = 1; });
  try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {}
  const P = window.__P237 = { fr: [], lt: [], at: [], mk: [], tx: [], big: [] };
  let last = 0; const loop = t => { if (last) P.fr.push([t, t - last]); last = t; requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  try { new PerformanceObserver(l => { l.getEntries().forEach(e => P.lt.push([e.startTime, e.duration])); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  const rec = (k, t0) => { const d = performance.now() - t0; if (d > 0.3) P.at.push([t0, d, k]); };
  const wrapGL = proto => { if (!proto) return;
    const M = { compileShader: 'shader', linkProgram: 'shader', getProgramParameter: 'shader', getShaderParameter: 'shader', getProgramInfoLog: 'shader',
      texImage2D: 'texture', texSubImage2D: 'texture', compressedTexImage2D: 'texture', generateMipmap: 'texture', bufferData: 'buffer' };
    Object.keys(M).forEach(n => { const f = proto[n]; if (!f) return; proto[n] = function () { const t0 = performance.now(); try { return f.apply(this, arguments); } finally { rec(M[n], t0);
      const d = performance.now() - t0; if (M[n] === 'texture') { const sz = [...arguments].find(a => a && typeof a === 'object' && ('width' in a)); if (sz && sz.width >= 512) P.big.push([t0, d, this.canvas && this.canvas.width]); }
      if (M[n] === 'texture' && d > 25) { const src = [...arguments].find(a => a && typeof a === 'object' && ('width' in a)); P.tx.push([t0, Math.round(d), n, src ? (src.constructor && src.constructor.name) + ' ' + src.width + 'x' + src.height + (src.src ? ' ' + String(src.src).split('/').pop().slice(0, 40) : '') : '?']); } } }; }); };
  wrapGL(window.WebGLRenderingContext && WebGLRenderingContext.prototype); wrapGL(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype);
  const iv = setInterval(() => { const T = window.THREE; if (!T || !T.GLTFLoader || !T.SkeletonUtils) return; clearInterval(iv);
    const pp = T.GLTFLoader.prototype.parse; T.GLTFLoader.prototype.parse = function (data, path, onLoad, onError) { const t0 = performance.now(); let sync = 0;
      const r = pp.call(this, data, path, function () { rec('glb-parse-cb', t0); return onLoad && onLoad.apply(this, arguments); }, onError); sync = performance.now() - t0; P.at.push([t0, sync, 'glb-parse-sync']); return r; };
    /* INIZIO PARTITA = creazione del renderer della partita (unico con powerPreference 'high-performance', src/12:395). Il segnale di
       fase arriva DOPO: l'effetto del componente 3D (figlio) gira prima di quello di LiveMatch e la scena si costruisce in un blocco
       sincrono — misurato, la seconda partita caricava 98 texture prima che la fase cambiasse. */
    const R = T.WebGLRenderer; T.WebGLRenderer = function (o) { if (o && o.powerPreference === 'high-performance') P.mk.push([performance.now(), '#renderer']); return new R(o); }; T.WebGLRenderer.prototype = R.prototype;
    const cl = T.SkeletonUtils.clone; T.SkeletonUtils.clone = function () { const t0 = performance.now(); try { return cl.apply(this, arguments); } finally { rec('clone', t0); } };
  }, 20);
  let ph = null; setInterval(() => { let p = null; try { p = window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) {} if (p !== ph) { P.mk.push([performance.now(), p]); ph = p; } }, 50);
}, ROSSO);

const t0 = Date.now();
/* ATTESA IN HOME (CPM_ATTESA, 25 s): un giocatore non entra in partita due secondi dopo l'avvio — passa dalla home, crea il
   calciatore, legge la schermata del provino. La sonda la emula restando in home prima del flusso del provino; con 0 si misura
   l'ingresso immediato. Il pre-caricamento parte a 2,5 s e procede nei momenti d'ozio. */
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await sleep(ATTESA);
const pre = await page.evaluate(() => ({ pre: window.__CPM_PRE237 || null, teste: Object.keys(window.__CPM_TESTE237 || {}) }));
/* flusso del provino SENZA ricaricare (openMatch fa page.goto: azzererebbe il pre-caricamento appena misurato) */
const clickT = async (rx, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { const ok = await page.evaluate(s => { const r = new RegExp(s, 'i'); const el = [...document.querySelectorAll('button')].find(b => r.test((b.textContent || '').trim())); if (el) { el.click(); return true; } return false; }, rx); if (ok) return true; await sleep(250); } throw new Error('flusso: «' + rx + '» non trovato'); };
await clickT('Nuova carriera'); await sleep(700);
await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const st = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; st.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, 'Prima237');
await clickT('INIZIA I PROVINI'); await sleep(400); await clickT('Inizia il provino');
await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function' && typeof window.__CPM_PHASE === 'function', null, { timeout: 30000 });
/* finestra 1: dalla comparsa della prima partita */
const rend = async () => page.evaluate(() => window.__P237.mk.filter(x => x[1] === '#renderer').map(x => x[0]));
const s1 = (await rend())[0];
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2371, policy: 'seeded', tickMs: 300 }));
await sleep(FINESTRA);
const aud1 = await page.evaluate((() => { const r = {}; try { r.lod = window.__CPM_CGTRADER_LOD_AUDIT ? window.__CPM_CGTRADER_LOD_AUDIT() : null; } catch (e) { r.lod = 'err'; } try { r.corpi = window.__CPM_CORPI232 ? window.__CPM_CORPI232() : null; } catch (e) {} r.canvas = document.querySelectorAll('canvas').length; return JSON.stringify(r).slice(0, 400); }));
/* fine della prima partita: si lascia correre (velocita' 2x) e si attraversano le schermate del dopo-partita fino al provino 2 */
const clicca = async rx => page.evaluate(s => { const r = new RegExp(s, 'i'); const bs = [...document.querySelectorAll('button')].filter(b => r.test((b.textContent || '').trim()) && b.offsetParent); const el = bs[bs.length - 1]; if (el) { el.click(); return (el.textContent || '').trim().slice(0, 40); } return null; }, rx);
let s2 = null; const tFine = Date.now();
while (Date.now() - tFine < 420000) {
  const ph = await matchPhase(page).catch(() => null);
  const n = await page.evaluate(() => window.__P237.mk.length);
  if (n > 0) { const st = await page.evaluate(() => window.__P237.mk.slice(-3)); if (process.env.CPM_DBG) console.log('  dbg', ((Date.now() - t0) / 1000) | 0, ph, JSON.stringify(st.map(x => x[1]))); }
  if (ph === 'ended') { await page.keyboard.press('Enter').catch(() => {}); await sleep(800); }
  if (ph === 'ended' || ph == null) {
    const c = await clicca('^(⚡ )?Inizia il provino|Vai al Provino 2|Continua|Avanti|Chiudi|Salta|Prosegui|OK$');
    if (process.env.CPM_DBG && c) console.log('  click', c);
  }
  /* la seconda partita e' partita quando la fase torna attiva dopo un 'ended' */
  const rr = await rend(); if (rr.length >= 2) { s2 = rr[1]; await sleep(2000); break; }
  await sleep(1500);
}
if (!s2) { console.log('❌ seconda partita non raggiunta'); await b.close(); srv.close(); process.exit(3); }
await page.evaluate(() => { try { window.__CPM_AUTOPLAY(true, { seed: 2372, policy: 'seeded', tickMs: 300 }); } catch (e) {} });
await sleep(FINESTRA);
const aud2 = await page.evaluate((() => { const r = {}; try { r.lod = window.__CPM_CGTRADER_LOD_AUDIT ? window.__CPM_CGTRADER_LOD_AUDIT() : null; } catch (e) { r.lod = 'err'; } try { r.corpi = window.__CPM_CORPI232 ? window.__CPM_CORPI232() : null; } catch (e) {} r.canvas = document.querySelectorAll('canvas').length; return JSON.stringify(r).slice(0, 400); }));
const P = await page.evaluate(() => window.__P237);
const RES = await page.evaluate(() => performance.getEntriesByType('resource').filter(e => /\.(glb|png)(\?|$)/.test(e.name)).map(e => [e.startTime, e.name.split('/').pop()]));
await b.close(); srv.close();

const finestra = (s) => { const e = s + FINESTRA; const inW = x => x[0] >= s && x[0] < e;
  const fr = P.fr.filter(inW).map(x => x[1]).sort((a, b) => a - b); const lt = P.lt.filter(inW);
  const q = p => fr.length ? +fr[Math.min(fr.length - 1, Math.floor(p * fr.length))].toFixed(1) : null;
  const at = {}; P.at.filter(inW).forEach(([, d, k]) => { at[k] = (at[k] || 0) + d; }); Object.keys(at).forEach(k => at[k] = Math.round(at[k]));
  const top = lt.slice().sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, d]) => { const att = {}; P.at.filter(x => x[0] >= t - 1 && x[0] < t + d).forEach(([, dd, k]) => { att[k] = (att[k] || 0) + dd; }); Object.keys(att).forEach(k => att[k] = Math.round(att[k])); return { a: +((t - s) / 1000).toFixed(1), ms: Math.round(d), att }; });
  return { frames: fr.length, p50: q(0.5), p95: q(0.95), max: q(1), sopra50: fr.filter(x => x > 50).length, sopra100: fr.filter(x => x > 100).length, sopra250: fr.filter(x => x > 250).length,
    longtask: lt.length, ltSomma: Math.round(lt.reduce((a, x) => a + x[1], 0)), ltMax: Math.round(lt.reduce((a, x) => Math.max(a, x[1]), 0)), attribuzione: at, peggiori: top };
};
const A = finestra(s1), B = finestra(s2);
const fasi = (s) => P.mk.filter(x => x[0] >= s && x[0] < s + FINESTRA).map(x => ((x[0] - s) / 1000).toFixed(1) + 's:' + x[1]).join(' ');
console.log(`PO-237 prima vs seconda partita · finestra ${FINESTRA} ms · ${ROSSO ? 'ROSSO ' + ROSSO : 'verde'}`);
console.log('  pre-caricamento all\'ingresso in partita (dopo ' + ATTESA + ' ms in home):', JSON.stringify(pre));
console.log('  corpi a fine finestra: prima', aud1, '· seconda', aud2);
const resW = s => RES.filter(x => x[0] >= s && x[0] < s + FINESTRA).map(x => ((x[0] - s) / 1000).toFixed(1) + 's ' + x[1]);
console.log('  file .glb/.png richiesti nella finestra: prima', JSON.stringify(resW(s1)), '· seconda', JSON.stringify(resW(s2)));
console.log('  prima  :', JSON.stringify(A));
console.log('  fasi 1 :', fasi(s1));
const txW = s => P.tx.filter(x => x[0] >= s && x[0] < s + FINESTRA).map(x => ((x[0] - s) / 1000).toFixed(1) + 's ' + x[1] + 'ms ' + x[2] + ' ' + x[3]);
console.log('  texture lente 1:', JSON.stringify(txW(s1)));
console.log('  seconda:', JSON.stringify(B));
console.log('  fasi 2 :', fasi(s2));
console.log('  texture lente 2:', JSON.stringify(txW(s2)));
const bigW = s => { const b = P.big.filter(x => x[0] >= s && x[0] < s + FINESTRA); return { n: b.length, ms: Math.round(b.reduce((a, x) => a + x[1], 0)), canvas: [...new Set(b.map(x => x[2]))] }; };
console.log('  texture >=512 caricate: prima', JSON.stringify(bigW(s1)), '· seconda', JSON.stringify(bigW(s2)));
{ const b = P.big.filter(x => x[0] >= s1 + FINESTRA && x[0] < s2); const t = P.big.filter(x => x[0] < s1); console.log('  texture >=512 fra le due finestre:', b.length, Math.round(b.reduce((a, x) => a + x[1], 0)), 'ms · prima della prima finestra:', t.length, Math.round(t.reduce((a, x) => a + x[1], 0)), 'ms'); }
if (errs.length) console.log('  pageerror:', errs.slice(0, 3));
/* GIUDIZIO. Si giudicano i costi PER SESSIONE che il pre-caricamento sposta fuori dalla partita: parsing dei GLB e caricamento
   texture. La compilazione degli shader al primo disegno e' riportata ma NON giudicata: in headless la seconda partita la paga
   meno grazie alla cache dei programmi del processo GPU, che il pre-caricamento non tocca (vedi docs/sviluppo/RAPPORTO-giro15.md). */
const glb = x => Math.round((x.attribuzione['glb-parse-cb'] || 0) + (x.attribuzione['glb-parse-sync'] || 0));
const tex = x => Math.round(x.attribuzione.texture || 0);
const okGlb = glb(A) <= 200, okTex = tex(A) <= RAPP * tex(B) + MARG;
const okMax = A.ltMax <= RAPP * B.ltMax + MARG, okSom = A.ltSomma <= RAPP * B.ltSomma + MARG;
console.log(`  parsing GLB in partita ${glb(A)} vs ${glb(B)} ms → ${okGlb ? 'ok' : 'FUORI'} (tetto 200) · texture ${tex(A)} vs ${tex(B)} ms → ${okTex ? 'ok' : 'FUORI'} (tetto ${RAPP}x + ${MARG})`);
console.log(`  [informativo] blocco piu' lungo ${A.ltMax} vs ${B.ltMax} ms (${okMax ? 'entro' : 'oltre'} ${RAPP}x+${MARG}) · somma longtask ${A.ltSomma} vs ${B.ltSomma} ms (${okSom ? 'entro' : 'oltre'}) · shader ${Math.round(A.attribuzione.shader || 0)} vs ${Math.round(B.attribuzione.shader || 0)} ms`);
if (process.env.CPM_JSON) fs.writeFileSync(process.env.CPM_JSON, JSON.stringify({ A, B, pre, rosso: ROSSO, finestra: FINESTRA, attesa: ATTESA }, null, 1));
if (process.env.CPM_GUARD === '0') process.exit(0);
const ok = okGlb && okTex;
console.log(ok ? '✅ VERDE — la prima partita non paga piu\' parsing GLB e texture che la seconda non paga' : '❌ ROSSO — la prima partita paga parsing GLB / texture che la seconda non paga');
process.exit(ok ? 0 : 1);
