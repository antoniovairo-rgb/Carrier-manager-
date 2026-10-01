/* [F1 · 7.917] Il campo dall'alto: si vede? i pallini seguono il motore? quanto costa?
   Due bracci: VERDE (campo 2D fra gli highlight) e ROSSO (__CPM_NO917, 3D continuo come prima).
   Misura: chiamate di disegno per fotogramma, fotogrammi al secondo, scarto fra i pallini disegnati e le
   posizioni del motore, e una foto per braccio. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'campo2d');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
const ris = {};
for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; const messaggi = [];
  page.on('pageerror', (e) => { errori++; if (messaggi.length < 4) messaggi.push(String(e).slice(0, 160)); });
  await page.addInitScript((rosso) => {
    window.__CPM_GLB = true; if (rosso) window.__CPM_NO917 = true;
    window.__CPM_DRAW = { calls: 0, frames: 0 };
    const wrap = (proto) => { if (!proto) return; for (const n of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) { const o = proto[n]; if (!o) continue; proto[n] = function (...a) { window.__CPM_DRAW.calls++; return o.apply(this, a); }; } };
    wrap(window.WebGLRenderingContext && window.WebGLRenderingContext.prototype);
    wrap(window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype);
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (fn) => raf((t) => { window.__CPM_DRAW.frames++; return fn(t); });
  }, braccio === 'rosso');
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  /* si aspetta di essere in gioco fluido, che e' dove vive il campo 2D */
  for (let i = 0; i < 40; i++) { const f = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } }); if (f === 'playing') break; await sleep(500); }
  await sleep(2500);
  await page.evaluate(() => { window.__CPM_DRAW.calls = 0; window.__CPM_DRAW.frames = 0; });
  const t0 = Date.now(); await sleep(8000); const dt = (Date.now() - t0) / 1000;
  const r = await page.evaluate(() => {
    const cv = document.querySelector('[data-cpm="campo2d"]');
    let pieno = null;
    if (cv) { try { const g = cv.getContext('2d'); const d = g.getImageData(0, 0, cv.width, cv.height).data;
      let verdi = 0, bianchi = 0; for (let i = 0; i < d.length; i += 4 * 97) { const R = d[i], G = d[i+1], B = d[i+2];
        if (G > R + 20 && G > B + 20) verdi++; if (R > 200 && G > 200 && B > 200) bianchi++; }
      pieno = { verdi, bianchi, campioni: Math.floor(d.length / (4 * 97)) }; } catch (_e) {} }
    let st = null; try { const s = window.__CPM_STATE && window.__CPM_STATE(); st = s ? { ball: s.ball } : null; } catch (_e) {}
    return { c2d: !!cv, larghezza: cv ? cv.clientWidth : 0, altezza: cv ? cv.clientHeight : 0, pieno,
      calls: window.__CPM_DRAW.calls, frames: window.__CPM_DRAW.frames, sosp: window.__CPM_SOSP917 === true, fase: (window.__CPM_PHASE && window.__CPM_PHASE()) || null, st };
  });
  const foto = path.join(OUT, `${braccio}.png`);
  await page.screenshot({ path: foto }).catch(() => {});
  ris[braccio] = { ...r, fps: r.frames / dt, perFrame: r.frames ? r.calls / r.frames : 0, errori, messaggi, foto };
  console.log(`${braccio.toUpperCase()}: campo2d ${r.c2d ? r.larghezza + 'x' + r.altezza : 'ASSENTE'} · 3D sospeso ${r.sosp} · chiamate di disegno per fotogramma ${(r.frames ? r.calls / r.frames : 0).toFixed(0)} · fps ${(r.frames / dt).toFixed(1)} · fase ${r.fase} · errori ${errori}${messaggi.length ? ' → ' + messaggi[0] : ''}`);
  if (r.pieno) console.log(`  disegnato: ${r.pieno.verdi} campioni di prato e ${r.pieno.bianchi} di bianco su ${r.pieno.campioni} (un campo vuoto darebbe 0 bianchi)`);
  await browser.close();
}
const v = ris.verde, r = ris.rosso;
console.log(`\n=== F1: campo 2D (verde) contro 3D continuo (rosso) ===`);
console.log(`  chiamate di disegno per fotogramma: ${r.perFrame.toFixed(0)} → ${v.perFrame.toFixed(0)}`);
console.log(`  fotogrammi al secondo al banco: ${r.fps.toFixed(1)} → ${v.fps.toFixed(1)}`);
console.log(`  errori di pagina: rosso ${r.errori} · verde ${v.errori}`);
console.log(`  foto: ${v.foto} · ${r.foto}`);
server.close();
