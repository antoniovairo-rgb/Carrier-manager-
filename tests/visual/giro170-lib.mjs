/* [giro 170 · PO-367] attrezzi comuni delle sonde fotografiche delle scene 3D. SOLO MISURA: non tocca src/.
   CONTA170: avvolge THREE.WebGLRenderer prima che il gioco lo usi, cosi' OGNI scena three.js (anche quelle senza testimoni propri)
   dichiara draw call, triangoli, pixelRatio, ombre e il tempo di CPU speso in render(). In headless il rendering e' SOFTWARE
   (SwiftShader): i ms e gli fps valgono solo come confronto FRA scene, mai come previsione del telefono. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
export const OUT = path.join(ROOT, 'docs/collaudo/giro170');
fs.mkdirSync(OUT, { recursive: true });
export const FORMATI = { tel: { width: 375, height: 812 }, pc: { width: 1440, height: 900 } };
export const CONTA170 = () => {
  window.__R170 = []; window.__J170 = { n: 0, ms: 0, max: 0 };
  /* tempo di CALCOLO (JavaScript) speso dentro i callback di requestAnimationFrame: e' la parte CPU del fotogramma (animazioni, regia, invio dei comandi di disegno) */
  const _raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => _raf((t) => { const a = performance.now(); try { cb(t); } finally { const d = performance.now() - a; const J = window.__J170; J.n++; J.ms += d; if (d > J.max) J.max = d; } });
  const avvolgi = (T) => { if (!T || T.__g170) return; let O = T.WebGLRenderer;
    const W = function (p) { const r = new O(p); const rec = { r, n: 0, ms: 0, calls: 0, tri: 0, t0: performance.now(), tl: 0 }; window.__R170.push(rec);
      const rr = r.render.bind(r); r.render = function (s, c) { const a = performance.now(); rr(s, c); const d = performance.now() - a; rec.n++; rec.ms += d; rec.calls = r.info.render.calls; rec.tri = r.info.render.triangles; rec.tl = a; rec.sc = s; };
      return r; };
    try { Object.defineProperty(T, 'WebGLRenderer', { configurable: true, get() { return O ? W : undefined; }, set(v) { O = v; } }); T.__g170 = 1; } catch (e) {} };
  let _T = window.THREE; if (_T) avvolgi(_T);
  try { Object.defineProperty(window, 'THREE', { configurable: true, get() { return _T; }, set(v) { _T = v; avvolgi(v); } }); } catch (e) {}
  /* azzera i contatori e, dopo `ms`, restituisce per ogni renderer VIVO (che ha disegnato nella finestra) i numeri */
  window.__misura170 = (ms) => new Promise(res => { const now = performance.now(); window.__R170.forEach(x => { x._n = x.n; x._ms = x.ms; }); const J0 = { ...window.__J170 }; window.__J170.max = 0;
    let raf = 0; const f = () => { raf++; if (performance.now() - now < ms) requestAnimationFrame(f); else {
      const el = (performance.now() - now) / 1000; const out = window.__R170.filter(x => x.n > x._n).map(x => { const r = x.r, n = x.n - x._n; let luci = 0, ombreL = 0, mesh = 0, skinned = 0, inst = 0;
        try { x.sc.traverse(o => { if (o.isLight) { luci++; if (o.castShadow) ombreL++; } if (o.isMesh && o.visible) mesh++; if (o.isSkinnedMesh) skinned++; if (o.isInstancedMesh) inst++; }); } catch (e) {}
        const c = r.domElement; return { fpsRender: +(n / el).toFixed(1), msRender: +((x.ms - x._ms) / n).toFixed(1), calls: x.calls, tri: x.tri, pr: +r.getPixelRatio().toFixed(2), canvas: c.width + 'x' + c.height,
          ombre: !!r.shadowMap.enabled, luci, luciOmbra: ombreL, mesh, skinned, inst, geo: r.info.memory.geometries, tex: r.info.memory.textures, tone: r.toneMapping, enc: r.outputEncoding }; });
      const J = window.__J170; res({ fpsRaf: +(raf / el).toFixed(1), jsMsPerSec: +((J.ms - J0.ms) / el).toFixed(0), jsMsMaxCallback: +J.max.toFixed(0), renderer: out }); } }; requestAnimationFrame(f); });
};
export const REG = [];
export async function foto(page, scena, fmt, nome, extra) { const f = `${scena}-${fmt}-${nome}.png`; await page.screenshot({ path: path.join(OUT, f) }).catch(e => console.log('foto KO', f, String(e).slice(0, 80)));
  REG.push({ scena, fmt, nome, f, ...(extra || {}) }); console.log('  📷', f, extra ? JSON.stringify(extra).slice(0, 300) : ''); return f; }
export async function misura(page, scena, fmt, ms = 3000) { const m = await page.evaluate(t => window.__misura170 ? window.__misura170(t) : null, ms).catch(() => null);
  REG.push({ scena, fmt, misura: m }); console.log('  ⏱', scena, fmt, JSON.stringify(m)); return m; }
export function salva(nome) { const p = path.join(OUT, nome); let prev = []; try { prev = JSON.parse(fs.readFileSync(p)); } catch (e) {} fs.writeFileSync(p, JSON.stringify(prev.concat(REG), null, 1)); REG.length = 0; }
