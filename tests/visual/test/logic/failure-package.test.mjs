/* [7.58.x PHASE 5 · BL-20] FAILURE PACKAGE — ogni fallimento porta una REPRO RECIPE azionabile
   (seed deterministico + force-sit) + i campi già presenti (check/gi/situation/intent/shot).
   Test in isolamento del Failure Collector con dati sintetici (nessun browser). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { collectFailures } from '../../lib/failure-collector.mjs';

const mkData = () => ({
  meta: { generatedAt: '2026-07-15T00:00:00Z', gameVersion: '7.58.0', seed: 987654321, total: 185 },
  categories: [
    { id: 'golden', scope: 'state', pass: false, issues: ['#42 firma divergente dalla baseline'], warnings: [] },
    { id: 'data-coherence', scope: 'coherence', pass: false, issues: ['regola globale violata'], warnings: [] },
    { id: 'timeline', scope: 'semantic', pass: true, issues: [], warnings: [], info: { coverage: { intents: 10 }, baseline: 'ok' } },
  ],
  situations: [{ gi: 42, text: '💥 Tiro dal limite', intent: 'shot', shotInitial: 'shots/s42_a.png' }],
});

test('failure-package: repro con force-sit + seed per fallimento con gi', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmfp-'));
  const s = collectFailures(dir, mkData());
  const f = s.failures.find(x => x.gi === 42);
  assert.ok(f, 'fallimento gi42 presente');
  assert.equal(f.check, 'golden');
  assert.equal(f.situation, '💥 Tiro dal limite');
  assert.equal(f.intent, 'shot');
  assert.match(f.repro, /__CPM_FORCE_SIT\(42\)/);
  assert.match(f.repro, /__CPM_RESEED\(987654321\)/);
});

test('failure-package: repro con run-command per fallimento globale (gi null)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmfp-'));
  const s = collectFailures(dir, mkData());
  const g = s.failures.find(x => x.gi == null && x.check === 'data-coherence');
  assert.ok(g, 'fallimento globale presente');
  assert.match(g.repro, /CPM_RESEED=987654321/);
  assert.match(g.repro, /data-coherence/);
});

test('failure-package: summary scritto con fingerprint + counts coerenti', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmfp-'));
  const s = collectFailures(dir, mkData());
  assert.equal(s.ok, false);
  assert.equal(s.counts.failures, 2);
  assert.equal(s.counts.checksFailed, 2);
  assert.match(s.fingerprint, /^[0-9a-f]{8}$/);
  const onDisk = JSON.parse(fs.readFileSync(path.join(dir, 'run-summary.json'), 'utf8'));
  assert.equal(onDisk.fingerprint, s.fingerprint);
  assert.ok(onDisk.failures.every(f => typeof f.repro === 'string' && f.repro.length > 0), 'ogni failure ha una repro recipe');
});

test('failure-package: run pulita (0 issue) → ok true, nessun failure', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmfp-'));
  const clean = { meta: { generatedAt: 't', gameVersion: '7.58.0', seed: 1, total: 185 }, categories: [{ id: 'golden', scope: 'state', pass: true, issues: [], warnings: [] }], situations: [] };
  const s = collectFailures(dir, clean);
  assert.equal(s.ok, true);
  assert.equal(s.failures.length, 0);
});
