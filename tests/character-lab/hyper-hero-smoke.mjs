import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer, openMatch, forceSituation, installCdnRoutes } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.join(here, 'evidence', 'hyper-hero-smoke.json');
const server = await startServer();
const chrome = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1228', 'chrome-win64', 'chrome.exe');
assert.equal(fs.existsSync(chrome), true, 'Playwright Chromium is unavailable');
const browser = await chromium.launch({ headless: true, executablePath: chrome, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !/\[BABEL\].*deoptimised/.test(message.text())) errors.push(message.text()); });

try {
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = true;
    window.__CPM_HYPER_CASUAL = 'hero';
  });
  await openMatch(page, server.address().port, { name: 'Hyper Hero' });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS !== 'loading', { timeout: 30000 });
  const report = await page.evaluate(() => ({
    status: window.__CPM_HYPER_CASUAL_STATUS,
    glbReady: window.__CPM_GLB_READY,
    glbFailure: window.__CPM_GLB_FAIL || null,
    hyperAssetRequested: performance.getEntriesByType('resource').some(r => /hyper-casual-korward-football-authored(?:-(?:brown|black|red))?\.glb/.test(r.name)),
    heroVisible: (() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return !!(s && s.ok && s.players && s.players.length); })()
  }));
  await forceSituation(page, 0, { settle: 700, choose: true });
  report.errors = errors;
  fs.mkdirSync(path.dirname(evidence), { recursive: true });
  fs.writeFileSync(evidence, JSON.stringify(report, null, 2));
  assert.equal(report.status, 'ready', `Hero POC did not load: ${report.status}`);
  assert.equal(report.glbFailure, null, `Legacy GLB loader failed: ${report.glbFailure}`);
  assert.equal(report.hyperAssetRequested, true, 'Animated Hero asset was not requested');
  assert.equal(report.heroVisible, true, 'Match state did not expose the Hero');
  assert.deepEqual(errors, [], `Browser errors:\n${errors.join('\n')}`);
  console.log('Hyper Hero POC smoke PASS', report);
} finally {
  await browser.close();
  server.close();
}
