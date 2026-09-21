import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.join(here, 'evidence');
const read = name => JSON.parse(fs.readFileSync(path.join(evidence, name), 'utf8'));
const off = read('animation-scheduler-off.json');
const on = read('animation-scheduler-on.json');
const delta = report => report.schedulerDelta;
const perFrame = report => delta(report).mixerUpdates / delta(report).observations;
const offPerFrame = perFrame(off), onPerFrame = perFrame(on);
const report = {
  basis: 'desktop SwiftShader workbench at 412x915; mixer/skeleton cadence only, not a phone FPS claim',
  disabled: { frames: delta(off).observations, mixerUpdates: delta(off).mixerUpdates, perFrame: +offPerFrame.toFixed(2) },
  enabled: { frames: delta(on).observations, mixerUpdates: delta(on).mixerUpdates, perFrame: +onPerFrame.toFixed(2), protected: delta(on).protected, remoteSelections: delta(on).halfRate + delta(on).quarterRate },
  normalizedReductionPercent: +((1 - onPerFrame / offPerFrame) * 100).toFixed(1),
  renderer: { disabledErrors: off.errors, enabledErrors: on.errors, enabledDrawCalls: on.end.render?.calls ?? null, enabledTriangles: on.end.render?.tri ?? null },
  limitation: 'Draw calls and triangles are unchanged by mixer scheduling. Device FPS/frame-time and visual continuity during a live public match remain required.'
};
assert.equal(off.enabled, false);
assert.equal(on.enabled, true);
assert.deepEqual(off.errors, []);
assert.deepEqual(on.errors, []);
assert.equal(offPerFrame, 23, 'A/B disabled path must update every field mixer');
assert.ok(onPerFrame < offPerFrame * 0.5, 'enabled scheduler did not reduce mixer updates by at least 50%');
assert.ok(report.enabled.remoteSelections > 0, 'no remote player used the reduced cadence');
fs.writeFileSync(path.join(evidence, 'animation-scheduler-ab.json'), JSON.stringify(report, null, 2));
console.log('ANIMATION SCHEDULER A/B PASS');
console.log(JSON.stringify(report, null, 2));
