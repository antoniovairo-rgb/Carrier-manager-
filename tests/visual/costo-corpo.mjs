/* [D7 verifica] DOVE sta il costo di un corpo: chiamate di disegno, geometrie, texture, programmi e triangoli,
   corpo PIENO contro corpo LEGGERO. Serve a spiegare la misura del PO sul telefono (pieni 31-32 fps, leggeri
   29-30: alleggerire i triangoli non ha dato fotogrammi). Il conteggio delle chiamate di disegno si fa
   avvolgendo il contesto WebGL nella pagina: nessuna modifica al prodotto. Sola lettura.
   CPM_CORPO=pieno|leggero (default: tutti e due). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'costo-corpo');
fs.mkdirSync(OUT, { recursive: true });
const BRACCI = (process.env.CPM_CORPO ? [process.env.CPM_CORPO] : ['pieno', 'leggero']);
const server = await startServer();
const port = server.address().port;

const ris = {};
for (const braccio of BRACCI) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; page.on('pageerror', () => { errori++; });
  const url = braccio === 'pieno' ? './assets/footballer.glb' : './assets/footballer-lite.glb';
  await page.addInitScript((u) => {
    window.__CPM_GLB = true; window.__CPM_GLB_URL = u;
    /* conta le chiamate di disegno per fotogramma, avvolgendo il contesto WebGL */
    window.__CPM_DRAW = { calls: 0, frames: 0, tri: 0 };
    const wrap = (proto) => {
      if (!proto) return;
      for (const nome of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const orig = proto[nome]; if (!orig) continue;
        proto[nome] = function (...a) { window.__CPM_DRAW.calls++; return orig.apply(this, a); };
      }
    };
    wrap(window.WebGLRenderingContext && window.WebGLRenderingContext.prototype);
    wrap(window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype);
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (fn) => raf((t) => { window.__CPM_DRAW.frames++; return fn(t); });
  }, url);
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_LOAD_ALL) window.__CPM_LOAD_ALL(); }).catch(() => {});
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  await sleep(4000);
  await page.evaluate(() => { window.__CPM_DRAW.calls = 0; window.__CPM_DRAW.frames = 0; });
  const t0 = Date.now(); await sleep(8000); const dt = (Date.now() - t0) / 1000;
  const r = await page.evaluate(() => {
    let tri = 0, fps = null, corpi = null;
    try { tri = window.__CPM_TRI907 ? window.__CPM_TRI907() : 0; } catch (_e) {}
    try { const f = window.__CPM_FPS907 && window.__CPM_FPS907(); if (f) { fps = f.fps5s; corpi = f.corpi; } } catch (_e) {}
    return { calls: window.__CPM_DRAW.calls, frames: window.__CPM_DRAW.frames, tri, fps, corpi };
  });
  const perFrame = r.frames ? r.calls / r.frames : 0;
  ris[braccio] = { ...r, perFrame, fpsBanco: r.frames / dt, errori };
  console.log(`corpo ${braccio.toUpperCase()}: chiamate di disegno per fotogramma ${perFrame.toFixed(0)} · triangoli ${r.tri} · fotogrammi al secondo (banco) ${(r.frames / dt).toFixed(1)} · contatore in pagina ${r.fps} (${r.corpi}) · errori ${errori}`);
  await browser.close();
}
if (ris.pieno && ris.leggero) {
  const p = ris.pieno, l = ris.leggero;
  console.log(`\n=== confronto pieno → leggero ===`);
  console.log(`  triangoli ${p.tri} → ${l.tri} (${(100 * (l.tri / p.tri - 1)).toFixed(1)} %)`);
  console.log(`  chiamate di disegno per fotogramma ${p.perFrame.toFixed(0)} → ${l.perFrame.toFixed(0)} (${(100 * (l.perFrame / p.perFrame - 1)).toFixed(1)} %)`);
  console.log(`  fotogrammi al secondo al banco ${p.fpsBanco.toFixed(1)} → ${l.fpsBanco.toFixed(1)}`);
  console.log(`  lettura: se i triangoli crollano e le chiamate di disegno NON scendono, il costo è PER CORPO (mesh, ossa, materiali), non per triangolo.`);
}
server.close();
