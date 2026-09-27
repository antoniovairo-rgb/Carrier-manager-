import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..', '..');
const visual = path.join(root, 'tests', 'visual');
const logPath = path.join(root, 'reports', 'codex', '2026-09-27-fattibilita-gate.txt');
fs.mkdirSync(path.dirname(logPath), { recursive: true });
const log = fs.createWriteStream(logPath, { flags: 'w' });
const started = Date.now();
const child = spawn(process.execPath, [
  '--import', pathToFileURL(path.join(root, 'tests', 'codex', 'isolated-visual.mjs')).href,
  path.join(visual, 'validate-situations.mjs'),
], { cwd: visual, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
let timedOut = false;
const timeout = setTimeout(() => {
  timedOut = true;
  const message = `TIMEOUT dopo ${Date.now() - started} ms: termino PID ${child.pid}\n`;
  log.write(message);
  console.error(message.trim());
  child.kill();
  const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  killer.stdout.on('data', data => log.write(data));
  killer.stderr.on('data', data => log.write(data));
  killer.on('close', code => log.write(`taskkill exit=${code}\n`));
  killer.on('error', error => log.write(`taskkill error=${error.message}\n`));
}, 900_000);
for (const stream of [child.stdout, child.stderr]) stream.on('data', data => {
  log.write(data);
  const s = data.toString('utf8');
  for (const line of s.split(/\r?\n/)) if (/\/\d+|failure|PASS|FAIL|Error|run-summary|Total|validat|WebGL/i.test(line) && line.trim()) console.log(line.slice(0, 350));
});
child.on('error', error => { log.write(`RUNNER ERROR: ${error.stack}\n`); console.error(error.stack); });
child.on('close', (code, signal) => {
  clearTimeout(timeout);
  log.end();
  console.log(JSON.stringify({ code, signal, timedOut, durationMs: Date.now() - started, logPath }));
  process.exitCode = timedOut ? 124 : (code ?? 1);
});
