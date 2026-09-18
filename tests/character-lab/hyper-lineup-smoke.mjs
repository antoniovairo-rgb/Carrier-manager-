import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer, openMatch, forceSituation, installCdnRoutes } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.join(here, 'evidence', 'hyper-lineup-smoke.json');
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
    window.__CPM_HYPER_CASUAL = 'intro';
  });
  await openMatch(page, server.address().port, { name: 'Hyper Hero' });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup' || String(window.__CPM_HYPER_CASUAL_STATUS || '').startsWith('fallback:'), { timeout: 30000 });
  const report = await page.evaluate(() => ({
    status: window.__CPM_HYPER_CASUAL_STATUS,
    glbReady: window.__CPM_GLB_READY,
    glbFailure: window.__CPM_GLB_FAIL || null,
    hyperAssetRequested: performance.getEntriesByType('resource').some(r => /hyper-casual-korward-football(?:-(?:brown|black|red))?\.glb/.test(r.name)),
    heroVisible: (() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return !!(s && s.ok && s.players && s.players.length); })(),
    lineup: window.__CPM_HYPER_LINEUP || null
  }));
  report.errors = errors;
  fs.mkdirSync(path.dirname(evidence), { recursive: true });
  fs.writeFileSync(evidence, JSON.stringify(report, null, 2));
  await page.screenshot({ path: path.join(here, 'evidence', 'hyper-lineup-mobile.png'), fullPage: false });
  assert.equal(report.status, 'ready-lineup', `Hero POC did not load: ${report.status}`);
  assert.equal(report.glbFailure, null, `Legacy GLB loader failed: ${report.glbFailure}`);
  assert.equal(report.hyperAssetRequested, true, 'Animated Hero asset was not requested');
  assert.equal(report.heroVisible, true, 'Match state did not expose the Hero');
  assert.ok(report.lineup && report.lineup.avatars >= 22, 'Hyper lineup did not contain the full entrance squad');
  assert.equal(report.lineup.hyper, report.lineup.avatars, 'A non-Hyper avatar remains in the entry lineup');
  assert.equal(report.lineup.legacyRoots, 0, 'A legacy CH38 lineup root remains attached');
  assert.ok(report.lineup.home > 0 && report.lineup.away > 0 && report.lineup.goalkeepers >= 2 && report.lineup.officials >= 1, 'Role mapping is incomplete');
  assert.ok(report.lineup.kitVariants >= 3, 'Home, away, goalkeeper and official kit variants were not retained');

  assert.deepEqual(errors, [], `Browser errors:\n${errors.join('\n')}`);
  console.log('Hyper intro lineup POC smoke PASS', report);
} finally {
  await browser.close();
  server.close();
}
