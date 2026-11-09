#!/usr/bin/env node
/* [giro 128 PO-330 — strumento di STUDIO, NON guardiano, NON tocca il gioco] COM'E' FATTA OGGI LA FOLLA DEL 3D.
   Misura, a parita' di tutto (stesso build, stadio forzato, contesto folla forzato, ora congelata, scena gi13),
   due bracci: FOLLA ACCESA (texture dipinte animate alla cadenza vera di riposo, 110 ms, + prime file 3D) e
   FOLLA SPENTA (piani-pubblico e prime file nascosti dalla sonda, nessun ridisegno). Il gioco non ha un
   interruttore per la folla: la sonda la riconosce dal di fuori (texture canvas 1024/2048x512 = makeCrowdTex,
   InstancedMesh cilindro r0,17 / sfera r0,145 = prime file) catturando la scena da WebGLRenderer.render.
   Per ogni braccio e viewport: draw call, triangoli, ms CPU dentro renderer.render, intervallo fra fotogrammi
   (rAF), MB/s caricati sulla GPU (texImage2D) e memoria GPU stimata delle texture folla. Foto da tre inquadrature.
   ⚠️ Headless = rendering software (SwiftShader): valgono i CONFRONTI fra bracci, non i valori assoluti.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node folla-128.mjs   (CPM_GIRI=2 default, CPM_VP=360x800,1440x900) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
const GIRI = +(process.env.CPM_GIRI || 2);
const VPS = (process.env.CPM_VP || '360x800,1440x900').split(',').map(s => s.split('x').map(Number));
const OUT = path.join(__dirname, '..', '..', '..', 'docs', 'collaudo-grafico', '128', 'foto'); fs.mkdirSync(OUT, { recursive: true });
export const CROWD = { tier: 'big', fill: 0.85, awayFill: 0.6, intensity: 0.85, passion: 75, loyalty: 70, capacity: 50000, attendance: 42500, seed: 128, meteo23: '',
  profile: { market: 70, passion: 75, history: 70, loyalty: 70, econ: 60 } };
export const CAMS = {
  gioco: null, // la camera della scena forzata (inquadratura di gioco vera)
  tv: { x: 0, y: 16, z: 34, lx: 0, ly: 4, lz: -30 },
  vicino: { x: 6, y: 9, z: -22, lx: 0, ly: 11, lz: -60 },
  ingresso: { x: -6, y: 13, z: 10, lx: -3, ly: 9, lz: -50 }, // come la foto del PO 184: dal campo, alta, verso la tribuna
};
/* init script condiviso: cattura scena/renderer, cronometra render, conta i byte caricati sulla GPU */
export function initProbe(o) {
  window.__CPM_GLB = false; window.__CPM_TOD = 'day'; window.__CPM_STADIUM_TPL_FORCE = 'moderno_it'; window.__CPM_STADIUM_CAP_FORCE = 50000;
  window.__CPM_CROWD_OVERRIDE = o.crowd; window.__CPM_CROWD_MS = 110;
  const P = window.__P128 = { rMs: 0, rN: 0, upB: 0, upN: 0, scene: null, renderer: null };
  const hookUp = proto => { if (!proto) return; const f = proto.texImage2D; proto.texImage2D = function () {
    const a = arguments; const src = a.length === 6 ? a[5] : (a.length >= 9 ? null : null);
    let w = 0, h = 0; if (a.length === 6 && src) { w = src.width || 0; h = src.height || 0; } else if (a.length >= 9) { w = a[3]; h = a[4]; }
    P.upB += w * h * 4; P.upN++; const t0 = performance.now(); const rv = f.apply(this, a); P.upMs = (P.upMs || 0) + performance.now() - t0; return rv; }; };
  hookUp(window.WebGLRenderingContext && WebGLRenderingContext.prototype); hookUp(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype);
  let T; Object.defineProperty(window, 'THREE', { configurable: true, get() { return T; }, set(v) { T = v; const iv = setInterval(() => { if (!T || !T.WebGLRenderer) return; clearInterval(iv); const v = T;
    try { const W = v.WebGLRenderer; v.WebGLRenderer = function (o) { const rr = new W(o); const R = rr.render;
      rr.render = function (s, c) { const t0 = performance.now(); const r = R.call(this, s, c); P.rMs += performance.now() - t0; P.rN++; P.scene = s; P.renderer = rr; return r; }; return rr; };
      v.WebGLRenderer.prototype = W.prototype; } catch (e) {} }, 5); } });
}
/* riconosce la folla nella scena: piani con canvas di makeCrowdTex + prime file istanziate */
export async function crowdParts(page, hide) {
  return page.evaluate(h => { const P = window.__P128; const s = P.scene; if (!s) return null;
    const tex = new Set(), canv = new Set(); let planes = 0, planeTri = 0, inst = 0, instTri = 0, instN = 0;
    s.traverse(o => { if (!o.isMesh) return; const m = o.material, mp = m && m.map, im = mp && mp.image;
      const g = o.geometry, idx = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      const isCrowdPlane = im && im.tagName === 'CANVAS' && im.height === 512 && (im.width === 2048 || im.width === 1024);
      const gp = g.parameters || {};
      const isFront = o.isInstancedMesh && ((g.type === 'CylinderGeometry' && Math.abs(gp.radiusTop - 0.17) < 1e-6) || (g.type === 'SphereGeometry' && Math.abs(gp.radius - 0.145) < 1e-6));
      if (isCrowdPlane) { planes++; planeTri += idx; tex.add(mp); canv.add(im); if (h) o.visible = false; }
      if (isFront) { inst++; instN += o.count; instTri += idx * o.count; if (h) o.visible = false; } });
    let texBytes = 0; tex.forEach(t => { texBytes += t.image.width * t.image.height * 4 * 1.333; });
    let canvBytes = 0; canv.forEach(c => { canvBytes += c.width * c.height * 4; });
    if (h) window.__CPM_CROWD_MS = 1e12;
    return { planes, planeTri, texObjs: tex.size, canvases: canv.size, canvW: [...canv].map(c => c.width + 'x' + c.height), gpuMB: +(texBytes / 1048576).toFixed(1), canvasRamMB: +(canvBytes / 1048576).toFixed(1), frontMeshes: inst, frontInstances: instN, frontTri: instTri };
  }, hide);
}
export async function sample(page, ms) {
  await page.evaluate(() => { const P = window.__P128; P.rMs = 0; P.rN = 0; P.upB = 0; P.upN = 0; P.upMs = 0; P.fr = []; let last = performance.now();
    const f = () => { const n = performance.now(); P.fr.push(n - last); last = n; if (P.fr.length < 100000) P._raf = requestAnimationFrame(f); }; P._raf = requestAnimationFrame(f); });
  await sleep(ms);
  return page.evaluate(sec => { const P = window.__P128; cancelAnimationFrame(P._raf); const fr = P.fr.slice(2).sort((a, b) => a - b);
    const ri = window.__CPM_RINFO769 && window.__CPM_RINFO769();
    return { frames: fr.length, frameMs: fr.length ? +(fr.reduce((a, b) => a + b, 0) / fr.length).toFixed(1) : null, frameP95: fr.length ? +fr[Math.floor(fr.length * 0.95)].toFixed(1) : null,
      renderMs: P.rN ? +(P.rMs / P.rN).toFixed(2) : null, uploadMBs: +(P.upB / 1048576 / sec).toFixed(2), uploads: P.upN, uploadMsTot: +(P.upMs || 0).toFixed(1), uploadMsPerFrame: fr.length ? +((P.upMs || 0) / fr.length).toFixed(1) : null, calls: ri && ri.calls, tri: ri && ri.tri, tex: ri && ri.tex, geo: ri && ri.geo }; }, ms / 1000);
}
export async function setCam(page, c) { await page.evaluate(c => { window.__CPM_CAM904 = c; }, c); }
export async function shoot(page, file) { await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }).catch(() => {}); await page.screenshot({ path: file }); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const risultati = [];
  for (const [w, h] of VPS) for (let g = 0; g < GIRI; g++) for (const braccio of (process.env.CPM_BRACCI || 'accesa,statica,spenta').split(',')) { const spenta = braccio === 'spenta';
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await page.addInitScript(initProbe, { crowd: CROWD });
    await openMatch(page, port, { skipLoadAll: true, name: 'Folla128' }); await sleep(800);
    await page.evaluate(() => window.__CPM_FORCE_SIT(13, true)); await sleep(3500);
    const parti = await crowdParts(page, spenta); if (braccio === 'statica') await page.evaluate(() => { window.__CPM_CROWD_MS = 1e12; });
    const r = { vp: `${w}x${h}`, giro: g, folla: braccio, parti, errs: errs.slice(0, 2), viste: {} };
    for (const [nome, cam] of Object.entries(CAMS)) {
      await setCam(page, cam); await sleep(cam ? 2500 : 300);
      r.viste[nome] = await sample(page, 5000);
      if (g === 0) await shoot(page, path.join(OUT, `oggi-${nome}-${w}x${h}-${braccio}.png`));
    }
    console.log(JSON.stringify(r)); risultati.push(r); await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, '..', `misure-oggi-${VPS.map(v => v.join('x')).join('_')}${process.env.CPM_BRACCI ? '-' + process.env.CPM_BRACCI.replace(/,/g, '') : ''}.json`), JSON.stringify(risultati, null, 1));
  await b.close(); srv.close();
}
