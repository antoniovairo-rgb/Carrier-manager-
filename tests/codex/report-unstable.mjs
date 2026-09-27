#!/usr/bin/env node
// Convert the raw sequential runs into a reproducible per-run table.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const base = path.join(root, 'reports/codex/2026-09-27-test-instabili');
const raw = fs.readFileSync(base + '-runs.jsonl', 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
const targets = [];
const excluded = [];
for (let i = 0; i < raw.length; i++) {
  const row = raw[i];
  if (row.role !== 'target') continue;
  const prev = row.predecessor === '-' ? null : raw[i - 1];
  if (prev && (prev.role !== 'predecessor' || prev.iteration !== row.iteration || prev.target !== row.target || prev.timedOut || prev.exitCode !== 0)) {
    excluded.push(row);
    continue;
  }
  targets.push({ ...row, predecessorRun: prev });
}
const outcome = r => r == null ? '—' : r.timedOut ? 'timeout' : r.exitCode === 0 ? 'PASS' : `FAIL(${r.exitCode})`;
const sec = r => r == null ? '—' : (r.durationMs / 1000).toFixed(1);
const clean = value => String(value || '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
const table = [
  '| Test | Modalità | Giro | Precursore: esito / s | Esito | Durata s | Riga errore esatta | FPS stampati |',
  '|---|---|---:|---|---|---:|---|---|',
  ...targets.map(r => `| ${r.target} | ${r.predecessor === '-' ? 'isolato' : `dopo ${r.predecessor}`} | ${r.iteration} | ${outcome(r.predecessorRun)} / ${sec(r.predecessorRun)} | ${outcome(r)} | ${sec(r)} | ${clean(r.errorLines?.join(' ; '))} | ${clean(r.fpsLines?.join(' ; '))} |`)
];
const groups = {};
for (const r of targets) {
  const key = `${r.target}/${r.predecessor}`;
  (groups[key] ||= []).push(r);
}
const stats = Object.fromEntries(Object.entries(groups).map(([key, rows]) => [key, {
  runs: rows.length, passed: rows.filter(r => r.exitCode === 0).length,
  failed: rows.filter(r => r.exitCode !== 0).length,
  durationSeconds: rows.map(r => +(r.durationMs / 1000).toFixed(3))
}]));
fs.writeFileSync(base + '-tabella.md', table.join('\n') + '\n');
fs.writeFileSync(base + '-statistiche.json', JSON.stringify({ version: '7.999.34', commit: '76b708a0', source: path.basename(base + '-runs.jsonl'), stats, excluded: excluded.map(r => ({ target: r.target, predecessor: r.predecessor, iteration: r.iteration, started: r.started })) }, null, 2));
console.log(JSON.stringify({ stats, excluded: excluded.length }));
