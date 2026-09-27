#!/usr/bin/env node
// Scheda 3: runs original npm guards sequentially, recording every invocation.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cwd = path.join(root, 'tests/visual');
const outDir = path.join(root, 'reports/codex');
const [target, predecessor = '-', countArg = '10'] = process.argv.slice(2);
const count = Number(countArg);
if (!['cartellino', 'passo-velocita'].includes(target) ||
    !['-', 'partita-vera', 'dist-web-partita'].includes(predecessor) ||
    !Number.isInteger(count) || count < 1 || count > 10) {
  throw new Error('Uso: node tests/codex/repeat-unstable.mjs <cartellino|passo-velocita> <-|partita-vera|dist-web-partita> [1..10]');
}
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, '2026-09-27-test-instabili-runs.jsonl');

function run(name, iteration, role) {
  return new Promise(resolve => {
    const started = new Date();
    const t0 = performance.now();
    const child = spawn('npm', ['run', name], {
      cwd, shell: true, windowsHide: true,
      env: { ...process.env, CPM_CHROME: process.env.CPM_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' }
    });
    let output = '';
    child.stdout.on('data', data => { output += String(data); });
    child.stderr.on('data', data => { output += String(data); });
    let timedOut = false;
    // partita-vera has 2 matches × 12 fixed 20 s waits = at least 480 s.
    const limitMs = name === 'partita-vera' ? 900_000 : name === 'dist-web-partita' ? 600_000 : 420_000;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, limitMs);
    child.on('error', error => { output += '\nSPAWN_ERROR: ' + error.message; });
    child.on('close', code => {
      clearTimeout(timer);
      const lines = output.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const errorLines = lines.filter(s => /❌|FAIL|Error:|errori|Timeout|SONDA CIECA|misura non fatta|non mostra|scarto x|fps/i.test(s));
      const fpsLines = lines.filter(s => /\bfps\b|__CPM_FPS/i.test(s));
      const entry = { commit: '76b708a0', target, predecessor, iteration, role, command: `npm run ${name}`,
        started: started.toISOString(), durationMs: Math.round(performance.now() - t0), exitCode: code,
        timedOut, errorLines, fpsLines, output: lines };
      fs.appendFileSync(resultFile, JSON.stringify(entry) + '\n');
      process.stdout.write(`${role} ${iteration}/${count}: ${name} exit=${code} ${entry.durationMs}ms ${errorLines.slice(-2).join(' | ')}\n`);
      resolve(entry);
    });
  });
}

for (let iteration = 1; iteration <= count; iteration++) {
  if (predecessor !== '-') {
    const previous = await run(predecessor, iteration, 'predecessor');
    if (previous.exitCode !== 0 || previous.timedOut) {
      process.stdout.write(`target ${iteration}/${count}: non eseguito, precursore non valido\n`);
      continue;
    }
  }
  await run(target, iteration, 'target');
}
