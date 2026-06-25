/* Estrae l'array SITUATIONS dal sorgente del gioco (stesso S/A reali, zero re-implementazione).
   Ritorna oggetti { text, zones, moveZone, startZone, actions, lockMovement, maxMoves, type, ctx, tactic }. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './harness.mjs';

export function loadSituations() {
  const html = fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8');
  const lines = html.split('\n');
  const find = re => { for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i; return -1; };
  const sIdx = find(/^const S=\(text,zones,mz,sz,actions/);
  const aIdx = find(/^const A=\(label,stat,bon,rew,fail,nrg\)/);
  const sitStart = find(/^const SITUATIONS=\[/);
  let sitEnd = -1; for (let i = sitStart; i < lines.length; i++) { if (/^\];/.test(lines[i])) { sitEnd = i; break; } }
  if (sIdx < 0 || aIdx < 0 || sitStart < 0 || sitEnd < 0) throw new Error('estrazione SITUATIONS fallita (sorgente cambiato?)');
  const code =
    lines.slice(sIdx, aIdx + 1).join('\n').replace(/const /g, 'var ') + '\n' +
    lines.slice(sitStart, sitEnd + 1).join('\n').replace('const SITUATIONS', 'var SITUATIONS') + '\n' +
    'return SITUATIONS;';
  // eslint-disable-next-line no-new-func
  return Function(code)();
}
