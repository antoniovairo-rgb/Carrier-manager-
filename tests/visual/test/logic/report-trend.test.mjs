/* [BL-20 PHASE 5] REPORT HTML — la Regression history (trend del gate) è renderizzata nella LMQP Dashboard.
   Test di generazione HTML da dati sintetici (nessun browser). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeReports } from '../../report.mjs';

const mkData = (gateTrend) => ({
  meta: { generatedAt: '2026-07-15T00:00:00Z', gameVersion: '7.60.0', seed: 1, total: 191 },
  categories: [{ id: 'golden', title: 'Golden', scope: 'state', pass: true, issues: [], warnings: [], info: {} }],
  situations: [],
  runSummary: { ok: true, fingerprint: '00001505', counts: { checks: 14, checksFailed: 0, failures: 0, warnings: 3 }, checks: [{ id: 'golden', pass: true, issues: 0, warnings: 0 }], coverage: {}, baseline: {}, failures: [] },
  gateTrend,
});

test('report-trend: stabile → mostra streak nella dashboard', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmrt-'));
  writeReports(dir, mkData({ current: '00001505', previous: '00001505', fpChanged: false, failDelta: 0, regressed: false, recovered: false, ok: true, cleanStreak: 5, runs: 5, spark: [1, 1, 1, 1, 1] }));
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.match(html, /Regression history/);
  assert.match(html, /stabile/);
  assert.match(html, /5 run pulite/);
});

test('report-trend: REGRESSIONE → banner rosso nella dashboard', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmrt-'));
  writeReports(dir, mkData({ current: 'aabbccdd', previous: '00001505', fpChanged: true, failDelta: 3, regressed: true, recovered: false, ok: false, cleanStreak: 0, runs: 6, spark: [1, 1, 1, 1, 1, 0] }));
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.match(html, /REGRESSIONE/);
  assert.match(html, /pulita → rotta/);
});

test('report-trend: nessun gateTrend → nessun blocco (retro-compat)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmrt-'));
  writeReports(dir, mkData(null));
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /Regression history/);
});
