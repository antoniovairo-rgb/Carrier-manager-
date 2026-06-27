/* TEST LOGIC — CINE BACKBONE (#16 Semantic/Narrative Validator, copertura COMPLETA).
   Per OGNI situation × OGNI azione: deriva l'highlight (deriveHL), costruisce la timeline
   (buildHLTimeline) e verifica gli INVARIANTI calcistici (validateHLTimeline: possesso continuo,
   no teletrasporto palla, testa⇐cross, n. passaggi per pattern) + chiusura coerente (ultimo beat
   conclusivo). Copre tutte le 179 situations (vs sole 23 live nel gate). Puro/deterministico. */
import { test } from 'node:test';
import assert from 'node:assert';
import { loadSituations } from '../../lib/situations.mjs';
import { loadCine } from '../../lib/cine.mjs';

const sits = loadSituations();
const { deriveHL, buildHLTimeline, validateHLTimeline } = loadCine();
const CONCL = new Set(['shot', 'header', 'layoff']);
const mid = (z, d) => (z && z[d]) ? (z[d][0] + z[d][1]) / 2 : (d === 'x' ? 70 : 50);

test('179 situations caricate con intent/ballState/cine', () => {
  assert.ok(sits.length >= 170, `solo ${sits.length} situations`);
  for (const s of sits) { assert.ok(s.intent, `situation senza intent: ${s.text}`); assert.ok(s.ballState, `situation senza ballState: ${s.text}`); }
});

test('#16 backbone narrativo valido per OGNI situation × azione (invarianti calcistiche)', () => {
  let checked = 0; const viol = [];
  sits.forEach((sit, gi) => {
    const x = mid(sit.startZone, 'x'), y = mid(sit.startZone, 'y');
    (sit.actions || []).forEach(act => {
      const hl = deriveHL(sit, act);
      if (!hl || !hl.type) return;
      const tl = buildHLTimeline(hl, { x, y });
      const v = validateHLTimeline(tl, hl);
      checked++;
      if (v.length) viol.push(`gi${gi} [${(act.label || '').slice(0, 18)}] ${hl.pattern}: ${v.join('; ')}`);
      // chiusura: l'ultimo beat deve concludere/scaricare l'azione
      const last = (tl.beats || [])[tl.beats.length - 1];
      if (last && !CONCL.has(last.tag)) viol.push(`gi${gi} ${hl.pattern}: ultimo beat "${last.tag}" non conclusivo`);
    });
  });
  assert.ok(checked >= 300, `solo ${checked} combinazioni controllate`);
  assert.strictEqual(viol.length, 0, `violazioni backbone (${viol.length}):\n` + viol.slice(0, 25).join('\n'));
});

test('CINE invariante: colpo di testa SOLO con palla aerea (coerenza, FAIL bloccante nel gate)', () => {
  // NB: la volée acrobatica (rovesciata/sforbiciata) è ESENTE per design (il gesto alza la palla,
  //   deriveHL 6750) → si valida solo header⇒aerial, che deriveHL garantisce strutturalmente (6723).
  const bad = [];
  sits.forEach((sit, gi) => (sit.actions || []).forEach(act => {
    const hl = deriveHL(sit, act);
    if (hl && hl.type === 'header' && sit.ballState !== 'aerial') bad.push(`gi${gi} [${act.label}] header con ballState=${sit.ballState}`);
  }));
  assert.strictEqual(bad.length, 0, `violazioni header⇒aerea:\n` + bad.slice(0, 20).join('\n'));
});
