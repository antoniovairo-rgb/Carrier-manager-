/* Estrae il Decision Engine (decideExecution) dal sorgente del gioco per i test node-side.
   decideExecution è PURO e DETERMINISTICO (seed) → testabile senza browser. Usa solo `clamp` + Math:
   forniamo clamp nello scope dell'eval. Stessa tecnica di situations.mjs (zero re-implementazione). */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './harness.mjs';

export function loadDecideExecution() {
  const html = fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8');
  const lines = html.split(/\r?\n/);
  const start = lines.findIndex(l => /^function decideExecution\(intent, ctx\)\{/.test(l));
  if (start < 0) throw new Error('decideExecution non trovata (sorgente cambiato?)');
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) { if (/^\}/.test(lines[i])) { end = i; break; } }
  if (end < 0) throw new Error('chiusura decideExecution non trovata');
  const code = 'const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\n' +
    lines.slice(start, end + 1).join('\n') + '\nreturn decideExecution;';
  // eslint-disable-next-line no-new-func
  return Function(code)();
}
