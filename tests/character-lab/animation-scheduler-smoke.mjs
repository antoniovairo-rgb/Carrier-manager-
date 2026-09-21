/* Renderer-only A/B smoke for mixer cadence.  It never writes match state. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidenceDir = path.join(here, 'evidence');
const enabled = process.argv[2] !== 'off';
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await installCdnRoutes(page);
  await page.addInitScript(value => { window.__CPM_GLB = true; window.__CPM_ANIM_LOD = value; }, enabled);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: `Animation Scheduler ${enabled ? 'on' : 'off'}` });
  await page.evaluate(() => window.__CPM_LOAD_ALL && window.__CPM_LOAD_ALL());
  await page.evaluate(() => window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(0, true));
  await page.waitForFunction(() => window.__CPM_GLB_READY === true && !!window.__CPM_ANIM_AUDIT, { timeout: 90000 });
  await sleep(2500);
  const begin = await page.evaluate(() => window.__CPM_ANIM_AUDIT());
  await sleep(6000);
  const end = await page.evaluate(() => ({ animation: window.__CPM_ANIM_AUDIT(), render: window.__CPM_RINFO769 ? window.__CPM_RINFO769() : null, fps: window.__CPM_FPS907 ? window.__CPM_FPS907() : null }));
  const a = begin.scheduler, b = end.animation.scheduler;
  const frames = b.frames - a.frames;
  const report = { enabled, begin, end, schedulerDelta: {
    mixerUpdates: b.mixerUpdates - a.mixerUpdates,
    protected: b.protected - a.protected,
    fullRate: b.fullRate - a.fullRate,
    halfRate: b.halfRate - a.halfRate,
    quarterRate: b.quarterRate - a.quarterRate,
    observations: frames,
  }, errors };
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, `animation-scheduler-${enabled ? 'on' : 'off'}.json`), JSON.stringify(report, null, 2));
  await page.screenshot({ path: path.join(evidenceDir, `animation-scheduler-${enabled ? 'on' : 'off'}.png`) });
  assert.equal(errors.length, 0, `browser errors: ${errors.join(' | ')}`);
  assert.ok(end.animation?.avatars >= 23, 'expected 22 players plus the hero');
  assert.equal(end.animation.scheduler.enabled, enabled, 'scheduler switch was not honoured');
  assert.ok(report.schedulerDelta.mixerUpdates > 0, 'no mixer updates were observed');
  if (enabled) assert.ok(report.schedulerDelta.halfRate + report.schedulerDelta.quarterRate > 0, 'no remote cadence was selected');
  console.log('ANIMATION SCHEDULER SMOKE PASS');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  server.close();
}
