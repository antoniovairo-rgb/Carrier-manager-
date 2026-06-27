/* Estrae BG_MATCH (cronaca di background) dal sorgente per i test node-side (zero re-implementazione).
   Array di oggetti {txt, ef, w, poss?, bpos, pd, ms?, momThreshold?, minClock?}. Nessun riferimento a
   funzioni → estraibile come array puro (stessa tecnica di situations.mjs). */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './harness.mjs';

export function loadBgMatch() {
  const lines = fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').split(/\r?\n/);
  const s = lines.findIndex(l => /^const BG_MATCH=\[/.test(l));
  if (s < 0) throw new Error('BG_MATCH non trovato');
  let e = -1; for (let i = s; i < lines.length; i++) { if (/^\];/.test(lines[i])) { e = i; break; } }
  if (e < 0) throw new Error('chiusura BG_MATCH non trovata');
  const code = lines.slice(s, e + 1).join('\n').replace('const BG_MATCH', 'var BG_MATCH') + '\nreturn BG_MATCH;';
  // eslint-disable-next-line no-new-func
  return Function(code)();
}
