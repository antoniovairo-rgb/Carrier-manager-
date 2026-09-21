/* A close real-highlight frame for the opt-in CGTrader review URL. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, canvasShot } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.join(here, 'evidence');
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await installCdnRoutes(page);
  const result = await openMatch(page, server.address().port, { name: 'CGTrader URL Highlight', query: { hyperCharacter: 'cgtrader-review' } });
  assert.ok(result.total > 0, 'situations did not load');
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-cgtrader-review', { timeout: 90000 });
  const state = await forceSituation(page, 0, { settle: 1100, freeze: true, choose: true });
  fs.mkdirSync(evidence, { recursive: true });
  const image = await canvasShot(page, { timeout: 25000 });
  fs.writeFileSync(path.join(evidence, 'cgtrader-review-url-highlight-mobile.png'), image);
  const report = await page.evaluate(() => ({ status: window.__CPM_HYPER_CASUAL_STATUS, metrics: window.__CPM_CGTRADER_REVIEW_METRICS || null, render: window.__CPM_RINFO769 ? window.__CPM_RINFO769() : null }));
  report.state = state; report.errors = errors;
  fs.writeFileSync(path.join(evidence, 'cgtrader-review-url-highlight.json'), JSON.stringify(report, null, 2));
  assert.ok(report.metrics && report.metrics.scale < 3, 'invalid review scale');
  assert.deepEqual(errors, []);
  console.log('CGTRADER REVIEW URL HIGHLIGHT PASS');
} finally { await browser.close(); server.close(); }
