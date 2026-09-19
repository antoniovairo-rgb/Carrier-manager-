/* Renderer-only baseline. It does not alter the simulation, event flow or match decisions. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidenceDir = path.join(here, 'evidence');
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = true;
    window.__CPM_GLB_URL = './assets/korward-regular-player.glb';
    window.__CPM_AUDIT_DRAW = { calls: 0, frames: 0 };
    for (const proto of [window.WebGLRenderingContext && window.WebGLRenderingContext.prototype, window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype]) {
      if (!proto) continue;
      for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const original = proto[name]; if (!original) continue;
        proto[name] = function (...args) { window.__CPM_AUDIT_DRAW.calls++; return original.apply(this, args); };
      }
    }
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => raf(time => { window.__CPM_AUDIT_DRAW.frames++; callback(time); });
  });
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Animation Audit' });
  await page.evaluate(() => window.__CPM_LOAD_ALL && window.__CPM_LOAD_ALL());
  await page.evaluate(() => window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(0, true));
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 });
  await sleep(3500);
  await page.evaluate(() => { window.__CPM_AUDIT_DRAW.calls = 0; window.__CPM_AUDIT_DRAW.frames = 0; });
  const t0 = Date.now(); await sleep(6000); const elapsed = (Date.now() - t0) / 1000;
  const report = await page.evaluate(() => {
    const draw = window.__CPM_AUDIT_DRAW || {};
    const animation = window.__CPM_ANIM_AUDIT ? window.__CPM_ANIM_AUDIT() : null;
    const render = window.__CPM_RINFO769 ? window.__CPM_RINFO769() : null;
    const fps = window.__CPM_FPS907 ? window.__CPM_FPS907() : null;
    const memory = performance.memory ? { usedJSHeapSize: performance.memory.usedJSHeapSize, totalJSHeapSize: performance.memory.totalJSHeapSize } : null;
    return { draw, animation, render, fps, memory };
  });
  report.seconds = elapsed;
  report.drawsPerFrame = report.draw.frames ? +(report.draw.calls / report.draw.frames).toFixed(1) : null;
  report.benchmarkFps = +(report.draw.frames / elapsed).toFixed(1);
  report.errors = errors;
  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, 'animation-performance-baseline.png') });
  fs.writeFileSync(path.join(evidenceDir, 'animation-performance-baseline.json'), JSON.stringify(report, null, 2));
  if (!report.animation || !report.animation.avatars) throw new Error('Regular player avatars are not observable in the match scene');
  if (!report.drawsPerFrame || !report.render || !report.render.tri) throw new Error('renderer did not produce a measurable 3D frame; benchmark is inconclusive');
  if (errors.length) throw new Error(`browser errors: ${errors.join(' | ')}`);
  console.log('ANIMATION PERFORMANCE BASELINE PASS');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  server.close();
}
