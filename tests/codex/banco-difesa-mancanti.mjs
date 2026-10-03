#!/usr/bin/env node
// Inventario read-only dei casi richiesti dal banco difesa 3D.
import fs from 'node:fs';
import zlib from 'node:zlib';

const raw = JSON.parse(zlib.gunzipSync(fs.readFileSync('tests/codex/banco-difesa-3d.json.gz')));
const scenes = [33,133,134,138,168,31,32,36,44,45,128,137,157,184,24,2];
const repeated = new Set([33,133,45,24]);
const expected = scenes.flatMap(gi => ['success','fail'].flatMap(outcome =>
  ['procedurale','glb'].flatMap(mode => Array.from({length: repeated.has(gi) ? 2 : 1},
    (_,repeat) => `gi${gi}-${outcome}-${mode}-r${repeat}`))));
const valid = new Set(raw.cases.filter(c => c.valid && c.clockMode === 'one-tick-per-browser-frame' &&
  c.settleMode === 'fixed-45-frames' && c.chooseFrames >= 45 && c.photos?.length === 6).map(c => c.id));
const missing = expected.filter(id => !valid.has(id));
console.log(JSON.stringify({expected: expected.length, valid: expected.length-missing.length,
  missing: missing.length, missingGlb: missing.filter(id => id.includes('-glb-')).length,
  missingProcedural: missing.filter(id => id.includes('-procedurale-')).length,
  firstMissing: missing[0] || null}, null, 2));
