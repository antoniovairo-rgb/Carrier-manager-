/* CHECK 4 — VALIDAZIONE MOVIMENTI (per-situation)
   Engine a highlight scriptati: il segnale deterministico e verificabile è il CAP movimenti
   post-highlight, coerente col contesto tattico (tactic.pressure / lock).
   - [HARD] cappedMM(sit) valido (0..3) e coerente con la pressione tattica
   - [HARD] moveZone dentro il campo e ben formata
   - [SOFT] confronto con il cap LIVE applicato dal motore (__CPM_MOVES) */
import { cappedMM } from '../lib/situations.mjs';
export default {
  id: 'movements',
  title: 'Movimenti (cap post-highlight)',
  scope: 'situation',
  run({ sit, moves }) {
    const issues = [], warnings = [];
    const cap = cappedMM(sit);
    if (!(Number.isInteger(cap) && cap >= 0 && cap <= 3)) issues.push(`cap movimenti non valido: ${cap}`);

    // coerenza col contesto tattico dichiarato
    const p = sit.tactic && sit.tactic.pressure;
    const expected = sit.lockMovement ? 0 : (p === 'high' ? 0 : p === 'medium' ? 1 : p === 'low' ? 2 : (sit.maxMoves ?? 2));
    if (cap !== expected) issues.push(`cap=${cap} incoerente con pressure="${p}"/lock=${sit.lockMovement} (atteso ${expected})`);

    // moveZone ben formata e dentro il campo
    const mz = sit.moveZone;
    if (mz && mz.x && mz.y) {
      if (mz.x[0] < 0 || mz.x[1] > 100 || mz.x[0] >= mz.x[1]) issues.push(`moveZone.x malformata ${JSON.stringify(mz.x)}`);
      if (mz.y[0] < 0 || mz.y[1] > 100 || mz.y[0] >= mz.y[1]) issues.push(`moveZone.y malformata ${JSON.stringify(mz.y)}`);
    }

    // confronto col cap live applicato dal motore (informativo: il force-to-choose può azzerarlo)
    if (typeof moves === 'number' && moves !== cap) warnings.push(`cap live (__CPM_MOVES=${moves}) ≠ cappedMM=${cap}`);

    return { pass: issues.length === 0, issues, warnings };
  }
};
