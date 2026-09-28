#!/usr/bin/env node
// Read-only Playwright video of five measured worst and two comparison scenes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startServer, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'reports/codex/video-fluidita-3d');
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(new URL('../visual/package.json', import.meta.url))('playwright');
const chrome = process.env.CPM_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const headed = process.env.CPM_HEADED === '1';
const launch = { executablePath: chrome, headless: !headed,
  args: [...(headed ? [] : ['--headless=new']), '--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] };
const defaultGroups = [
  { name: 'peggiori', ids: [87, 50, 25, 92, 176] },
  { name: 'confronto', ids: [0, 42] }
];
const groups = process.env.CPM_VIDEO_IDS
  ? [{ name: process.env.CPM_VIDEO_NAME || 'prova', ids: process.env.CPM_VIDEO_IDS.split(',').map(Number) }]
  : defaultGroups;
const manifestName = process.env.CPM_VIDEO_IDS ? `manifest-${groups[0].name}.json` : 'manifest.json';
const manifest = { command: 'node tests/codex/video-fluidita-3d.mjs', launch, viewport: [412, 915], deviceScaleFactor: 2, groups: [], errors: [] };
const server = await startServer();
const browser = await chromium.launch(launch);
try {
  for (const group of groups) {
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2,
      recordVideo: { dir: outDir, size: { width: 412, height: 915 } } });
    const page = await context.newPage();
    const video = page.video();
    const wallStart = performance.now();
    page.on('pageerror', error => manifest.errors.push({ group: group.name, error: String(error.message) }));
    await installCdnRoutes(page);
    await page.addInitScript(() => {
      window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
      window.__CPM_TIRO34_REC = 1; window.__CPM_WS38_REC = 1;
      window.__QA_RAF = { last: null, dt: [] };
      const tick = t => { const r = window.__QA_RAF; if (window.__CPM_PHASE?.() === 'hl_result') {
        if (r.last != null && r.dt.length < 1000) r.dt.push(t - r.last); r.last = t;
      } else r.last = null; requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await openMatch(page, server.address().port, { skipLoadAll: true, name: 'FluiditaVideo' });
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0 && !!window.__CPM_GESTURE?.()?.glb, null, { timeout: 90000 });
    const scenes = [];
    for (const gi of group.ids) {
      await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CPM_WS38 = []; window.__QA_RAF = { last: null, dt: [] };
        window.__CPM_FORCE_SIT(g, true); window.__CPM_FROZEN = false; }, gi);
      await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_choose', null, { timeout: 20000 });
      const offsetSec = +((performance.now() - wallStart) / 1000).toFixed(2);
      await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
      await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_result', null, { timeout: 20000 });
      await sleep(6500);
      const data = await page.evaluate(() => ({ dt: window.__QA_RAF.dt, frames: window.__CPM_TIRO34?.f?.length || 0,
        glb: !!window.__CPM_GESTURE?.()?.glb, mxclip: window.__CPM_MXCLIP | 0 }));
      const sorted = data.dt.filter(Number.isFinite).sort((a,b) => a-b);
      const medianDt = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
      const row = { gi, offsetSec, durationSec: 6.5, frames: data.frames, rafFrames: sorted.length,
        fpsMedian: medianDt ? +(1000 / medianDt).toFixed(2) : null, glb: data.glb, mxclip: data.mxclip };
      scenes.push(row);
      console.log(`${group.name} gi${gi}: offset=${offsetSec}s fps=${row.fpsMedian} frames=${row.frames}`);
    }
    await context.close();
    const oldPath = await video.path();
    const target = path.join(outDir, `${group.name}.webm`);
    fs.renameSync(oldPath, target);
    manifest.groups.push({ name: group.name, file: path.relative(root, target).replaceAll('\\', '/'), scenes });
    fs.writeFileSync(path.join(outDir, manifestName), JSON.stringify(manifest, null, 2));
  }
} finally {
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(outDir, manifestName), JSON.stringify(manifest, null, 2));
}
