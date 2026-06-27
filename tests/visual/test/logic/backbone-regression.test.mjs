/* TEST LOGIC — BACKBONE REGRESSION (D / #7, Regression Engine ricca).
   Firma STRUTTURALE del backbone narrativo per situation: per ogni azione `type/pattern:nBeats:lastBeat`.
   Confrontata con una baseline committata (backbone-baseline.json). Una deriva = regressione narrativa
   strutturale (es. un pattern che cambia, un beat di conclusione che sparisce). Complementa golden
   (firma STATO) e decision-baseline (firma DECISIONE intent|hlType|ballState) con la dimensione NARRATIVA.
   Rigenera: CPM_UPDATE_BASELINE=1 npm run test:logic  (o lo script :update-baseline). */
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSituations } from '../../lib/situations.mjs';
import { loadCine } from '../../lib/cine.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(__dir, '..', '..', 'backbone-baseline.json');
const sits = loadSituations();
const { deriveHL, buildHLTimeline } = loadCine();
const mid = (z, d) => (z && z[d]) ? (z[d][0] + z[d][1]) / 2 : (d === 'x' ? 70 : 50);

function signatures() {
  const sig = {};
  sits.forEach((sit, gi) => {
    const x = mid(sit.startZone, 'x'), y = mid(sit.startZone, 'y'); const parts = [];
    (sit.actions || []).forEach(act => {
      const hl = deriveHL(sit, act); if (!hl || !hl.type) return;
      const tl = buildHLTimeline(hl, { x, y }); const beats = tl.beats || [];
      parts.push(`${hl.type}/${hl.pattern}:${beats.length}:${(beats[beats.length - 1] || {}).tag}`);
    });
    sig[gi] = parts.join('|');
  });
  return sig;
}

test('#7 regressione strutturale del backbone narrativo vs baseline', () => {
  const sig = signatures();
  const update = process.env.CPM_UPDATE_BASELINE === '1';
  if (update || !fs.existsSync(BASELINE)) {
    fs.writeFileSync(BASELINE, JSON.stringify(sig, null, 1) + '\n');
    console.log(`backbone-baseline ${update ? 'AGGIORNATA' : 'CREATA'} (${Object.keys(sig).length} situations)`);
    return;
  }
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const drift = [], added = [];
  for (const gi in sig) {
    if (base[gi] === undefined) added.push(gi);
    else if (base[gi] !== sig[gi]) drift.push(`gi${gi}: "${base[gi]}" → "${sig[gi]}"`);
  }
  if (added.length) console.log(`ℹ nuove situations non in baseline: ${added.join(', ')} (rigenera con CPM_UPDATE_BASELINE=1)`);
  assert.strictEqual(drift.length, 0, `BACKBONE REGRESSION (${drift.length}):\n` + drift.slice(0, 25).join('\n'));
});
