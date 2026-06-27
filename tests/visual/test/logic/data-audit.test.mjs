/* TEST LOGIC — SITUATIONS DATA AUDIT (rete di sicurezza per il FINE-TUNING delle situations).
   Valida la QUALITÀ DEI DATI di tutte le 179 situations: ogni azione ben formata (stat/rew/fail/nrg/
   label), tassonomie corrette (stat ∈ 8 attributi · rew ∈ esiti di SUCCESSO · fail ∈ esiti di
   FALLIMENTO · intent ∈ 13), zone note, startZone valida. Pensato per intercettare ERRORI DI DATO
   introdotti durante il fine-tuning (stat scritta male, esito nello slot sbagliato, azione mancante).
   Tassonomie derivate dai dati reali (audit 5.38.0): rew={assist,goal,recovery,save}, fail=8 chiavi. */
import { test } from 'node:test';
import assert from 'node:assert';
import { loadSituations } from '../../lib/situations.mjs';

const sits = loadSituations();
const STATS = new Set(['velocità', 'tecnica', 'fisico', 'mentalità', 'tiro', 'passaggio', 'dribbling', 'posizionamento']);
const REW_OK = new Set(['goal', 'assist', 'save', 'recovery']);            // esiti di SUCCESSO (slot rew)
const FAIL_KEYS = new Set(['miss', 'miss_easy', 'intercept', 'goal_against', 'nothing', 'through', 'foul', 'loose']); // esiti di FALLIMENTO (slot fail)
const INTENTS = new Set(['penalty', 'freekick', 'cross', 'through', 'dribble', 'onetwo', 'insertion', 'shot', 'progression', 'switch', 'recover', 'anticipate', 'intercept', 'header']);
const ZONES = new Set(['area', 'bordo', 'trequarti', 'centro', 'difesa', 'propria', 'fascia']);

test('ogni situation ha azioni ben formate (label/stat/rew/fail/nrg)', () => {
  const bad = [];
  sits.forEach((s, gi) => {
    if (!s.actions || s.actions.length < 1) { bad.push(`gi${gi}: nessuna azione`); return; }
    s.actions.forEach((a, k) => {
      if (!a.label || !String(a.label).trim()) bad.push(`gi${gi}.a${k}: label vuota`);
      if (!STATS.has(a.stat)) bad.push(`gi${gi}.a${k}: stat invalida "${a.stat}"`);
      if (!REW_OK.has(a.rew)) bad.push(`gi${gi}.a${k}: rew "${a.rew}" non è un esito di SUCCESSO`);
      if (!FAIL_KEYS.has(a.fail)) bad.push(`gi${gi}.a${k}: fail "${a.fail}" non è un esito di FALLIMENTO`);
      if (typeof a.nrg !== 'number' || a.nrg < 0) bad.push(`gi${gi}.a${k}: nrg non valido "${a.nrg}"`);
    });
  });
  assert.strictEqual(bad.length, 0, `azioni malformate (${bad.length}):\n` + bad.slice(0, 25).join('\n'));
});

test('intent e startZone validi su tutte le situations', () => {
  const bad = [];
  sits.forEach((s, gi) => {
    if (!INTENTS.has(s.intent)) bad.push(`gi${gi}: intent fuori taxonomy "${s.intent}"`);
    const sz = s.startZone;
    if (!sz || !sz.x || !sz.y || sz.x.length !== 2 || sz.y.length !== 2) bad.push(`gi${gi}: startZone malformata`);
    else {
      if (!(sz.x[0] <= sz.x[1] && sz.x[0] >= 0 && sz.x[1] <= 100)) bad.push(`gi${gi}: startZone.x fuori range ${JSON.stringify(sz.x)}`);
      if (!(sz.y[0] <= sz.y[1] && sz.y[0] >= 0 && sz.y[1] <= 100)) bad.push(`gi${gi}: startZone.y fuori range ${JSON.stringify(sz.y)}`);
    }
  });
  assert.strictEqual(bad.length, 0, `intent/startZone non validi (${bad.length}):\n` + bad.slice(0, 25).join('\n'));
});

test('convenzioni (warn-soft): 3 azioni per situation · zone note', () => {
  // soft: non blocca, ma segnala deviazioni dalla convenzione (utile durante il fine-tuning)
  const odd = sits.filter(s => (s.actions || []).length !== 3).length;
  const unkZone = sits.filter(s => !ZONES.has((s.zones && s.zones[0]))).length;
  if (odd) console.log(`ℹ ${odd} situations non hanno 3 azioni (convenzione)`);
  if (unkZone) console.log(`ℹ ${unkZone} situations con zona fuori dal set noto (nuova zona? verifica)`);
  assert.ok(true);
});
