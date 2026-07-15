/* [BL-20 PHASE 5] GATE REGRESSION HISTORY — accumulo build-to-build del fingerprint del gate + trend
   (deriva/regressione/riparazione). Test in isolamento con dati sintetici (nessun browser). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { appendHistory, readHistory, computeTrend, makeRecord } from '../../lib/gate-history.mjs';

const mkSummary = (o = {}) => ({
  generatedAt: o.ts || '2026-07-15T00:00:00Z',
  gameVersion: o.gv || '7.60.0',
  seed: o.seed != null ? o.seed : 987654321,
  total: o.total != null ? o.total : 191,
  ok: o.ok != null ? o.ok : true,
  fingerprint: o.fp || '00001505',
  counts: { failures: o.failures != null ? o.failures : 0, checksFailed: o.checksFailed != null ? o.checksFailed : 0, warnings: o.warnings != null ? o.warnings : 3 },
  failures: [],
});

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'cpmgh-'));

test('gate-history: makeRecord estrae i campi compatti dal run-summary', () => {
  const r = makeRecord(mkSummary({ fp: 'deadbeef', failures: 2, checksFailed: 1 }));
  assert.equal(r.fingerprint, 'deadbeef');
  assert.equal(r.failures, 2);
  assert.equal(r.checksFailed, 1);
  assert.equal(r.ok, true);
  assert.equal(r.total, 191);
});

test('gate-history: append + read persiste la riga su disco', () => {
  const dir = tmp();
  const h = appendHistory(dir, mkSummary());
  assert.equal(h.length, 1);
  const onDisk = readHistory(dir);
  assert.equal(onDisk.length, 1);
  assert.equal(onDisk[0].fingerprint, '00001505');
});

test('gate-history: summary senza fingerprint non inquina lo storico', () => {
  const dir = tmp();
  appendHistory(dir, mkSummary());
  const h = appendHistory(dir, { counts: {} }); // niente fingerprint
  assert.equal(h.length, 1);
});

test('gate-history: trend rileva la REGRESSIONE (pulita → rotta)', () => {
  const dir = tmp();
  appendHistory(dir, mkSummary({ ts: 't1', ok: true, fp: '00001505', failures: 0 }));
  const h = appendHistory(dir, mkSummary({ ts: 't2', ok: false, fp: 'aabbccdd', failures: 3 }));
  const t = computeTrend(h);
  assert.equal(t.regressed, true);
  assert.equal(t.recovered, false);
  assert.equal(t.fpChanged, true);
  assert.equal(t.failDelta, 3);
  assert.equal(t.ok, false);
});

test('gate-history: trend rileva la RIPARAZIONE (rotta → pulita) + clean streak', () => {
  const dir = tmp();
  appendHistory(dir, mkSummary({ ts: 't1', ok: false, fp: 'aabbccdd', failures: 3 }));
  appendHistory(dir, mkSummary({ ts: 't2', ok: true, fp: '00001505', failures: 0 }));
  const h = appendHistory(dir, mkSummary({ ts: 't3', ok: true, fp: '00001505', failures: 0 }));
  const t = computeTrend(h);
  assert.equal(t.recovered, false); // t3 vs t2: entrambe pulite
  assert.equal(t.cleanStreak, 2);   // t2,t3 pulite
  assert.equal(t.regressed, false);
  assert.deepEqual(t.spark, [0, 1, 1]);
});

test('gate-history: run stabili → fpChanged false, streak crescente', () => {
  const dir = tmp();
  for (let i = 0; i < 4; i++) appendHistory(dir, mkSummary({ ts: 't' + i }));
  const t = computeTrend(readHistory(dir));
  assert.equal(t.fpChanged, false);
  assert.equal(t.cleanStreak, 4);
  assert.equal(t.runs, 4);
});

test('gate-history: cap rolling a 200 run', () => {
  const dir = tmp();
  for (let i = 0; i < 210; i++) appendHistory(dir, mkSummary({ ts: 't' + i }));
  assert.equal(readHistory(dir).length, 200);
});

test('gate-history: storico vuoto → trend null', () => {
  assert.equal(computeTrend([]), null);
  assert.equal(computeTrend(null), null);
});
