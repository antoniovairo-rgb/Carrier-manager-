/* Tests the opt-in CGTrader review URL with the actual local asset path. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.join(here, 'evidence');
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [], requests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.url().includes('cgtrader-unreal-axis-corrected-retarget-full-ground-pass-review.glb')) requests.push({ status: response.status(), url: response.url() }); });

try {
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'CGTrader URL review', query: { hyperCharacter: 'cgtrader-review' } });
  await page.evaluate(() => window.__CPM_LOAD_ALL && window.__CPM_LOAD_ALL());
  await page.evaluate(() => window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(0, true));
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-cgtrader-review' || String(window.__CPM_HYPER_CASUAL_STATUS || '').startsWith('fallback:'), { timeout: 90000 });
  await sleep(2500);
  const report = await page.evaluate(() => ({
    status: window.__CPM_HYPER_CASUAL_STATUS,
    metrics: window.__CPM_CGTRADER_REVIEW_METRICS || null,
    animations: window.__CPM_HYPER_ANIMATIONS || [],
    animation: window.__CPM_ANIM_AUDIT ? window.__CPM_ANIM_AUDIT() : null,
    render: window.__CPM_RINFO769 ? window.__CPM_RINFO769() : null,
  }));
  report.requests = requests; report.errors = errors;
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(path.join(evidence, 'cgtrader-review-url-smoke.json'), JSON.stringify(report, null, 2));
  await page.screenshot({ path: path.join(evidence, 'cgtrader-review-url-smoke.png') });
  assert.equal(report.status, 'ready-cgtrader-review');
  assert.ok(report.metrics && report.metrics.skeletonHeight > 0.5 && report.metrics.scale > 0.1 && report.metrics.scale < 3, 'CGTrader height normalization is invalid');
  assert.ok(requests.some(request => request.status === 200), 'CGTrader review asset was not fetched');
  for (const clip of ['idle', 'jog', 'pass', 'kick', 'header', 'dribble']) assert.ok(report.animations.includes(clip), `missing ${clip}`);
  assert.deepEqual(errors, []);
  console.log('CGTRADER REVIEW URL SMOKE PASS');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); server.close(); }
