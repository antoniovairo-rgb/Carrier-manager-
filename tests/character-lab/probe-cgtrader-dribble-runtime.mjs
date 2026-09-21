/* Diagnostic only: exercises one authored dribble scene with the opt-in CGTrader Hero.
   It does not alter match state outside the browser test instance. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from '../visual/lib/harness.mjs';

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
  await page.addInitScript(() => { window.__CPM_REC = true; });
  await openMatch(page, server.address().port, { name: 'CGTrader Dribble Runtime Probe', query: { hyperCharacter: 'cgtrader-review' } });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-cgtrader-review', { timeout: 90000 });
  const packageMap = await page.evaluate(() => window.__CPM_CGTRADER_REVIEW_GESTURES || null);
  const before = await forceSituation(page, 18, { settle: 250, choose: false });
  const armed = await page.evaluate(() => ({ actions: window.__CPM_ACTS ? window.__CPM_ACTS() : null, lastAction: window.__CPM_LAST_K ?? null, state: window.__CPM_STATE() }));
  await page.waitForFunction(() => window.__CPM_GST?.cur === 'dribble', { timeout: 9000 });
  /* Probe measured source frames while the action is still mounted. */
  const contactProbes = [];
  for (const expected of [{ contact: 'left', u: 0.27 }, { contact: 'right', u: 0.36 }, { contact: 'left', u: 0.79 }]) {
    await page.evaluate(u => { window.__CPM_CGTRADER_DRIBBLE_TEST_TIME = u; }, expected.u);
    await page.waitForFunction(({ contact, u }) => { const touch = window.__CPM_CGTRADER_DRIBBLE_TOUCH; return touch?.contact === contact && Math.abs(touch.u - u) < 0.002; }, expected, { timeout: 9000 });
    contactProbes.push({ expected, actual: await page.evaluate(() => window.__CPM_CGTRADER_DRIBBLE_TOUCH || null) });
  }
  await page.evaluate(() => { delete window.__CPM_CGTRADER_DRIBBLE_TEST_TIME; });
  const approachSamples = [];
  for (let i = 0; i < 20; i++) {
    await sleep(150);
    approachSamples.push(await page.evaluate(() => ({ state: window.__CPM_STATE(), gesture: window.__CPM_GESTURE ? window.__CPM_GESTURE() : null, runtime: window.__CPM_GST || null, touch: window.__CPM_CGTRADER_DRIBBLE_TOUCH || null })));
  }
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; return window.__CPM_RESOLVE && window.__CPM_RESOLVE(0); });
  const samples = [];
  for (let i = 0; i < 24; i++) {
    await sleep(150);
    samples.push(await page.evaluate(() => ({
      state: window.__CPM_STATE(),
      gesture: window.__CPM_GST || null,
      hero: window.__CPM_STATE && window.__CPM_STATE().hero || null,
    })));
  }
  fs.mkdirSync(evidence, { recursive: true });
  const report = { packageMap, before, armed, approachSamples, samples, errors };
  fs.writeFileSync(path.join(evidence, 'cgtrader-dribble-runtime-probe.json'), JSON.stringify(report, null, 2));
  assert.deepEqual(errors, [], `browser errors: ${errors.join(' | ')}`);
  assert.equal(packageMap?.dribble, true, 'the CGTrader package did not mount its dribble clip');
  assert.ok(approachSamples.some(sample => sample.gesture?.glb?.gName === 'dribble'), 'the CGTrader Hero never played the dribble clip during the dribble approach');
  assert.ok(approachSamples.some(sample => sample.runtime?.cur === 'dribble' && sample.runtime?.ts === 1), 'the approach dribble did not retain authored playback speed');

  report.contactProbes = contactProbes;
  assert.ok(contactProbes.every(({ expected, actual }) => actual?.contact === expected.contact && Math.abs(actual.u - expected.u) < 0.002), `the action-clock marker did not match measured contacts: ${JSON.stringify(contactProbes)}`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  server.close();
}
