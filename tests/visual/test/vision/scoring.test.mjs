import test from 'node:test';
import assert from 'node:assert/strict';
import { qualityScore, deriveVerdict, reconcileVerdict, severity, priority, aggregate, DIMENSIONS, WEIGHTS } from '../../lib/vision/scoring.mjs';

test('scoring: pesi sommano a 1', () => {
  const sum = DIMENSIONS.reduce((s, d) => s + WEIGHTS[d], 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, `somma pesi=${sum}`);
});

test('scoring: tutto 100 → 100, tutto 0 → 0', () => {
  const all = v => Object.fromEntries(DIMENSIONS.map(d => [d, v]));
  assert.equal(qualityScore(all(100)), 100);
  assert.equal(qualityScore(all(0)), 0);
});

test('scoring: dimensioni mancanti → media pesata sui presenti (no NaN)', () => {
  const s = qualityScore({ footballIntelligence: 80, animationQuality: 60 });
  assert.ok(s > 0 && s <= 100 && Number.isFinite(s));
});

test('scoring: soglie verdict', () => {
  assert.equal(deriveVerdict(90), 'PASS');
  assert.equal(deriveVerdict(60), 'WARNING');
  assert.equal(deriveVerdict(20), 'FAIL');
  assert.equal(deriveVerdict(null), 'BLOCKED');
});

test('scoring: reconcile prende il più severo', () => {
  assert.equal(reconcileVerdict('PASS', 'WARNING'), 'WARNING');
  assert.equal(reconcileVerdict('FAIL', 'PASS'), 'FAIL');
  assert.equal(reconcileVerdict(undefined, 'PASS'), 'PASS');
});

test('scoring: severity/priority coerenti', () => {
  assert.equal(severity('FAIL', 20), 'critical');
  assert.equal(severity('WARNING', 60), 'medium');
  assert.equal(priority('critical', 90), 'P0');
  assert.equal(priority('low', 90), 'P3');
});

test('scoring: aggregate end-to-end', () => {
  const all = v => Object.fromEntries(DIMENSIONS.map(d => [d, v]));
  const a = aggregate({ scores: all(90), confidence: 80, verdict: 'PASS' });
  assert.equal(a.verdict, 'PASS');
  assert.equal(a.qualityScore, 90);
  assert.equal(a.confidence, 80);
  // modello dice PASS ma score basso → reconcile a FAIL
  const b = aggregate({ scores: all(10), confidence: 90, verdict: 'PASS' });
  assert.equal(b.verdict, 'FAIL');
  assert.equal(b.severity, 'critical');
});
