/* [BL-19] AI Vision — SCORING STORICO: append/read/trend (mock, nessun provider necessario). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { appendHistory, readHistory, computeTrend, makeRecord } from '../../lib/vision/history.mjs';

const mkdir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'cpmhist-'));
const review = (avg, verdicts = { PASS: 4 }, count = 4) => ({ provider: 'mock', model: 'm', promptVersion: 'v2', avgQuality: avg, verdicts, results: Array.from({ length: count }, () => ({})) });
const meta = (v) => ({ generatedAt: '2026-07-15T00:00:00Z', gameVersion: v });

test('history: makeRecord estrae il set compatto', () => {
  const r = makeRecord(review(82.5, { PASS: 3, WARNING: 1 }, 4), meta('7.55.0'), 'PASS');
  assert.equal(r.avgQuality, 82.5);
  assert.equal(r.count, 4);
  assert.equal(r.gameVersion, '7.55.0');
  assert.deepEqual(r.verdicts, { PASS: 3, WARNING: 1 });
  assert.equal(r.decision, 'PASS');
});

test('history: append persiste e read rilegge', () => {
  const dir = mkdir();
  assert.deepEqual(readHistory(dir), []);
  const h1 = appendHistory(dir, review(80), meta('7.55.0'), 'PASS');
  assert.equal(h1.length, 1);
  const h2 = appendHistory(dir, review(85), meta('7.55.1'), 'PASS');
  assert.equal(h2.length, 2);
  assert.deepEqual(readHistory(dir).map(r => r.avgQuality), [80, 85]);
});

test('history: le run SKIPPED non inquinano lo storico', () => {
  const dir = mkdir();
  appendHistory(dir, review(80), meta('7.55.0'), 'PASS');
  const after = appendHistory(dir, { skipped: true, provider: 'mock', results: [] }, meta('7.55.1'), 'SKIPPED');
  assert.equal(after.length, 1); // invariato
  assert.equal(readHistory(dir).length, 1);
});

test('history: cap rolling a 200 run', () => {
  const dir = mkdir();
  let last;
  for (let i = 0; i < 205; i++) last = appendHistory(dir, review(70 + (i % 10)), meta('7.x'), 'PASS');
  assert.equal(last.length, 200);
  assert.equal(readHistory(dir).length, 200);
});

test('history: computeTrend delta/best/worst/dir/spark', () => {
  const dir = mkdir();
  appendHistory(dir, review(70), meta('a'), 'PASS');
  appendHistory(dir, review(90), meta('b'), 'PASS');
  const t3 = computeTrend(appendHistory(dir, review(85), meta('c'), 'PASS'));
  assert.equal(t3.current, 85);
  assert.equal(t3.previous, 90);
  assert.equal(t3.delta, -5);       // 85 - 90
  assert.equal(t3.dir, 'down');
  assert.equal(t3.best, 90);
  assert.equal(t3.worst, 70);
  assert.equal(t3.runs, 3);
  assert.deepEqual(t3.spark, [70, 90, 85]);
});

test('history: computeTrend prima run → dir=first, delta=null', () => {
  const t = computeTrend([makeRecord(review(77), meta('a'), 'PASS')]);
  assert.equal(t.dir, 'first');
  assert.equal(t.delta, null);
  assert.equal(t.current, 77);
});

test('history: computeTrend ignora run senza avgQuality (null)', () => {
  const t = computeTrend([
    makeRecord(review(80), meta('a'), 'PASS'),
    { avgQuality: null, verdicts: {}, count: 0 },
    makeRecord(review(88), meta('c'), 'PASS'),
  ]);
  assert.equal(t.runs, 2);
  assert.equal(t.current, 88);
  assert.equal(t.previous, 80);
  assert.equal(t.delta, 8);
});

test('history: file corrotto → read tollera e ritorna []', () => {
  const dir = mkdir();
  fs.writeFileSync(path.join(dir, 'ai-vision-history.json'), '{ not json');
  assert.deepEqual(readHistory(dir), []);
  const h = appendHistory(dir, review(75), meta('a'), 'PASS'); // riparte pulito
  assert.equal(h.length, 1);
});
