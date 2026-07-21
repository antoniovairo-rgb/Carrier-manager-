/* TEST LOGIC — DECISION ENGINE (decideExecution) — #19 Football Intelligence + #30 piede preferito.
   decideExecution è puro/deterministico (seed): testabile node-side senza browser, zero flakiness.
   Valida: determinismo, dominio degli esiti (no esiti impossibili), plausibilità calcistica
   (forte+libero >> debole+sotto pressione) e l'effetto del piede debole sul cross/tiro. */
import { test } from 'node:test';
import assert from 'node:assert';
import { loadDecideExecution } from '../../lib/decision.mjs';

const decide = loadDecideExecution();
const ATTR = (v) => ({ tiro: v, tecnica: v, passaggio: v, dribbling: v, velocità: v, fisico: v, mentalità: v, posizionamento: v });
const ctx = (o = {}) => ({ attrs: ATTR(70), pressure: 1, fatigue: 20, morale: 65, x: 80, weather: 'clear', seed: 1, ...o });

// domini degli esiti per intento (da decideExecution) — un esito fuori dominio = regressione
const OUT = {
  cross: ['assist', 'goal', 'corner', 'blocked', 'intercepted', 'out'],
  shot: ['goal', 'saved', 'blocked', 'post', 'wide'],
  dribble: ['beat_man', 'fouled', 'dispossessed', 'shielded_out'],
  through: ['assist', 'chance', 'intercepted', 'offside', 'overhit'],
  onetwo: ['assist', 'chance', 'intercepted', 'offside', 'overhit'],
  progression: ['advance', 'win_freekick', 'stopped', 'lost'],
  intercept: ['ball_won', 'foul', 'missed', 'deflected_out'],
  recover: ['ball_won', 'foul', 'missed', 'deflected_out'],
  anticipate: ['ball_won', 'foul', 'missed', 'deflected_out'],
  header: ['goal', 'saved', 'blocked', 'wide'],
  penalty: ['goal', 'saved', 'post', 'wide'],
  freekick: ['goal', 'saved', 'wall_blocked', 'wide'],
};
const POSITIVE = new Set(['assist', 'goal', 'beat_man', 'advance', 'ball_won', 'chance', 'win_freekick']);

const avgQ = (intent, over, n = 300) => { let s = 0; for (let i = 0; i < n; i++) s += decide(intent, ctx({ seed: i * 2654435761 >>> 0, ...over })).quality; return s / n; };
const posRate = (intent, over, n = 300) => { let p = 0; for (let i = 0; i < n; i++) if (POSITIVE.has(decide(intent, ctx({ seed: i * 40503 + 7, ...over })).outcome)) p++; return p / n; };

test('determinismo: stessa intent+ctx+seed → stesso risultato', () => {
  const a = decide('shot', ctx({ seed: 42 }));
  const b = decide('shot', ctx({ seed: 42 }));
  assert.deepStrictEqual(a, b);
  assert.notDeepStrictEqual(decide('shot', ctx({ seed: 1 })), decide('shot', ctx({ seed: 2 })));
});

test('quality sempre in [0.02, 0.99]', () => {
  for (const intent of Object.keys(OUT)) for (let i = 0; i < 50; i++) {
    const q = decide(intent, ctx({ seed: i * 99991 + 3 })).quality;
    assert.ok(q >= 0.02 && q <= 0.99, `${intent} q=${q} fuori range`);
  }
});

test('no esiti impossibili: outcome sempre nel dominio dell\'intento', () => {
  for (const intent of Object.keys(OUT)) {
    const allowed = new Set(OUT[intent]);
    for (let i = 0; i < 200; i++) {
      const o = decide(intent, ctx({ seed: i * 2246822519 >>> 0 })).outcome;
      assert.ok(allowed.has(o), `${intent}: esito "${o}" fuori dominio [${OUT[intent]}]`);
    }
  }
});

test('#19 FI: forte+libero >> debole+sotto pressione (quality e tasso positivo)', () => {
  const strong = { attrs: ATTR(90), pressure: 0, fatigue: 0, morale: 85 };
  const weak = { attrs: ATTR(40), pressure: 4, fatigue: 80, morale: 40 };
  for (const intent of ['shot', 'cross', 'dribble', 'through']) {
    const qs = avgQ(intent, strong), qw = avgQ(intent, weak);
    assert.ok(qs > qw + 0.2, `${intent}: quality forte ${qs.toFixed(2)} non >> debole ${qw.toFixed(2)}`);
    const ps = posRate(intent, strong), pw = posRate(intent, weak);
    assert.ok(ps > pw, `${intent}: tasso positivo forte ${ps.toFixed(2)} non > debole ${pw.toFixed(2)}`);
  }
});

test('#30 piede preferito: cross di piede debole peggiore · tiro da fascia opposta = taglio interno (bonus)', () => {
  // foot R, side L = fascia opposta. CROSS: davvero di piede debole → quality minore (malus −8).
  // TIRO [7.115.0 fix B3]: dalla fascia opposta tagli DENTRO sul piede FORTE (inverted winger) → leggero bonus (+2),
  // NON un malus. Il vecchio assert (weakF < strong anche sul tiro) era la semantica pre-7.115.0.
  {
    const strong = avgQ('cross', { foot: 'R', side: 'R' });
    const weakF = avgQ('cross', { foot: 'R', side: 'L' });
    assert.ok(weakF < strong, `cross: piede debole ${weakF.toFixed(3)} non < piede forte ${strong.toFixed(3)}`);
  }
  {
    const sameFlank = avgQ('shot', { foot: 'R', side: 'R' });
    const inverted = avgQ('shot', { foot: 'R', side: 'L' });
    assert.ok(inverted >= sameFlank, `shot: taglio interno ${inverted.toFixed(3)} non >= stessa fascia ${sameFlank.toFixed(3)} (bonus inverted winger 7.115.0)`);
    assert.ok(inverted - sameFlank < 0.08, `shot: bonus taglio interno ${((inverted - sameFlank)).toFixed(3)} sospettosamente grande (atteso ~+2 su scala quality)`);
  }
});
