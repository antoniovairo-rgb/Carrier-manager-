/* TEST LOGIC — LA CONSEGNA NON E' UNA CONCLUSIONE (invariante permanente di 7.784 e 7.786).
   Due release di oggi hanno chiuso la stessa classe di difetto: un'azione il cui esito dichiarato e'
   un ASSIST veniva resa come un TIRO IN PORTA, e da li' il Decision Engine sceglieva l'esito con la
   lente-tiro — che fra i suoi esiti possibili non ha «assist» (goal/saved/blocked/post/wide). Il
   fallimento di un tacco veniva cosi' raccontato come una parata del portiere su un pallone che al
   portiere non era mai stato indirizzato.
   Senza una banda che lo difenda, l'invariante si perde: basta una stat nuova senza ramo proprio, o un
   ripiego di zona spostato, e le consegne tornano conclusioni senza che nessuno se ne accorga. Il gate
   `backbone-regression` fotografa la STRUTTURA (e infatti oggi ha elencato esattamente le nove scene
   cambiate), ma una baseline si rigenera: dice CHE COSA e' cambiato, non che il cambiamento sia
   sbagliato. Questa regola invece non si rigenera.
   REGOLA: se `act.rew === "assist"`, il gesto non puo' essere una conclusione verso la porta.
   Fuori dalla regola, per progetto:
     · `freekick` — la punizione ha gia' le sue varianti di consegna (freekick_cross_*, freekick_short);
     · `header_flick` — lo smistamento di testa introdotto dalla 7.786: il GESTO e' un colpo di testa
       (giusto: si incorna davvero) ma il bersaglio e' un compagno, non la porta. */
import { test } from 'node:test';
import assert from 'node:assert';
import { loadSituations } from '../../lib/situations.mjs';
import { loadCine } from '../../lib/cine.mjs';

const sits = loadSituations();
const { deriveHL } = loadCine();
const CONCLUSIONE = new Set(['shot', 'header', 'penalty']);

test('un esito ASSIST non viene reso come una conclusione in porta', () => {
  const colpevoli = [];
  sits.forEach((sit, gi) => {
    (sit.actions || []).forEach((act, ai) => {
      if (!act || act.rew !== 'assist') return;
      const hl = deriveHL(sit, act) || {};
      if (!CONCLUSIONE.has(hl.type)) return;
      if (hl.variant === 'header_flick') return;   // 7.786: smistamento, bersaglio su un compagno
      colpevoli.push(`gi${gi}.${ai} [${hl.type}/${hl.variant}] «${String(act.label || '').slice(0, 34)}» in «${String(sit.text || '').slice(0, 34)}»`);
    });
  });
  assert.strictEqual(colpevoli.length, 0,
    `CONSEGNE RESE COME CONCLUSIONE (${colpevoli.length}) — vedi 7.784/7.786:\n` + colpevoli.slice(0, 20).join('\n'));
});

test('ogni colpo di testa con esito ASSIST usa lo smistamento, non una variante d\'attacco', () => {
  const attesi = [], sbagliati = [];
  sits.forEach((sit, gi) => {
    (sit.actions || []).forEach((act, ai) => {
      if (!act || act.rew !== 'assist') return;
      const hl = deriveHL(sit, act) || {};
      if (hl.type !== 'header') return;
      attesi.push(`gi${gi}.${ai}`);
      if (hl.variant !== 'header_flick') sbagliati.push(`gi${gi}.${ai} variant=${hl.variant}`);
    });
  });
  /* ⚠️ campione minimo: se un giorno nessun colpo di testa dichiara piu' assist, questa banda smette di
     giudicare invece di passare a vuoto — «una banda che non puo' giudicare e' peggio di una banda
     rossa» (lezione 7.695, gia' costata due volte). */
  assert.ok(attesi.length >= 4, `campione sotto il minimo: ${attesi.length} colpi di testa con esito assist (attesi >= 4)`);
  assert.strictEqual(sbagliati.length, 0, `COLPI DI TESTA CHE MIRANO AL PALO (${sbagliati.length}):\n` + sbagliati.join('\n'));
});
