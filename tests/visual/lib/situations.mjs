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
  // Includiamo i derivatori puri (deriveIntent/deriveBallState/deriveSitCine) così S() popola
  // intent/ballState/cine come nel gioco (loader FEDELE) — prima erano null fuori dal browser.
  const grab = (re) => { const s = lines.findIndex(l => re.test(l)); if (s < 0) return ''; let e = -1; for (let i = s + 1; i < lines.length; i++) { if (/^\}/.test(lines[i])) { e = i; break; } } return lines.slice(s, e + 1).join('\n'); };
  const helpers = [grab(/^function deriveIntent\(sit, act\)\{/), grab(/^function deriveBallState\(sit\)\{/), grab(/^function deriveSitCine\(sit\)\{/)].join('\n');
  const code =
    helpers + '\n' +
    lines.slice(sIdx, aIdx + 1).join('\n').replace(/const /g, 'var ') + '\n' +
    lines.slice(sitStart, sitEnd + 1).join('\n').replace('const SITUATIONS', 'var SITUATIONS') + '\n' +
    'return SITUATIONS;';
  // eslint-disable-next-line no-new-func
  return Function(code)();
}

/* Replica node-side di cappedMM (movement cap data-driven) — stessa logica del gioco. */
export function cappedMM(sit) {
  if (!sit || sit.lockMovement) return 0;
  const p = sit.tactic && sit.tactic.pressure;
  if (p === 'high') return 0;
  if (p === 'medium') return 1;
  if (p === 'low') return 2;
  return sit.maxMoves == null ? 2 : sit.maxMoves; // "none" o tactic assente
}
