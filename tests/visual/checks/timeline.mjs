/* CHECK — TIMELINE COHERENCE (LMQP-2, global)
   Consuma window.__CPM_TIMELINE (event+timeline layer, LMQP-1) raccolto durante la
   passata final-state (force+resolve di ~23 Situations). Valida il backbone
   «Every Highlight Must Tell a Story» a LIVELLO DI EVENTO: ogni highlight risolto
   deve produrre la coppia HighlightForced → ActionResolved con un intent valido,
   coerente tra forced e resolved, e un outcome key presente.
   LMQP-3: verifica anche gli INVARIANTI CINE sulla DECISIONE LIVE (hlType/variant/
   ballState emessi a runtime): testa⟹aerea, volée⟹aerea, set-piece⟹palla ferma,
   intento↔tipo per i set-piece — mirror dal vivo di data-coherence.
   È il primo gradino del Semantic/Narrative Validator (LIVE_MATCH_QA_SPEC cap. 3.4). */

const INTENTS = new Set([
  'penalty', 'freekick', 'cross', 'through', 'dribble', 'onetwo', 'insertion',
  'shot', 'progression', 'switch', 'recover', 'anticipate', 'intercept', 'header',
]);

export default {
  id: 'timeline',
  title: 'Timeline coherence (event backbone)',
  scope: 'global',
  run({ timeline }) {
    const issues = [], warnings = [];
    if (!Array.isArray(timeline) || timeline.length === 0) {
      return { pass: true, issues: [], warnings: ['timeline vuota — probe __CPM_TIMELINE non disponibile (skip)'], info: { events: 0 } };
    }
    const forced = {};           // gi -> intent dell'ultimo HighlightForced
    let resolved = 0, paired = 0;
    for (const e of timeline) {
      if (e.type === 'HighlightForced') {
        forced[e.gi] = e.intent;
        if (!e.intent) warnings.push(`HighlightForced gi=${e.gi} senza intent`);
      } else if (e.type === 'ActionResolved') {
        resolved++;
        if (e.intent == null) { issues.push(`ActionResolved gi=${e.gi} senza intent`); continue; }
        if (!INTENTS.has(e.intent)) issues.push(`ActionResolved gi=${e.gi} intent fuori taxonomy: ${e.intent}`);
        if (!(e.gi in forced)) { issues.push(`ActionResolved gi=${e.gi} senza HighlightForced precedente (highlight senza inizio)`); continue; }
        if (forced[e.gi] !== e.intent) issues.push(`incoerenza intent gi=${e.gi}: forced=${forced[e.gi]} vs resolved=${e.intent}`);
        if (!e.key) issues.push(`ActionResolved gi=${e.gi} senza outcome key`);
        if (typeof e.ok !== 'boolean') issues.push(`ActionResolved gi=${e.gi} senza esito (ok) booleano`);

        // ── LMQP-3: invarianti CINE verificati sulla DECISIONE LIVE (hlType/variant/ballState emessi a runtime) ──
        //   Mirror dal vivo di data-coherence: la coerenza non è solo nel dato statico, ma nella decisione reale.
        const hlType = e.hlType || null, hlVariant = e.hlVariant || null, ballState = e.ballState || null;
        if (hlType) {
          // testa SOLO su palla aerea (invariante CINE, FAIL bloccante anche nella suite statica)
          if (hlType === 'header' && ballState !== 'aerial')
            issues.push(`CINE: gi=${e.gi} hlType=header ma ballState=${ballState} (atteso aerial)`);
          // volée SOLO su palla aerea
          if (hlVariant === 'shot_volley' && ballState !== 'aerial')
            issues.push(`CINE: gi=${e.gi} variant=shot_volley ma ballState=${ballState} (atteso aerial)`);
          // set-piece battuto dall'eroe ⟹ palla ferma
          if ((hlType === 'penalty' || hlType === 'freekick') && ballState !== 'set_ground')
            issues.push(`CINE: gi=${e.gi} hlType=${hlType} ma ballState=${ballState} (atteso set_ground)`);
          // coerenza intento↔tipo per i set-piece (mapping diretto)
          if (e.intent === 'penalty' && hlType !== 'penalty')
            issues.push(`intent=penalty ma hlType=${hlType} (gi=${e.gi})`);
          if (e.intent === 'freekick' && hlType !== 'freekick' && hlType !== 'cross')
            issues.push(`intent=freekick ma hlType=${hlType} (gi=${e.gi})`);
        } else {
          warnings.push(`ActionResolved gi=${e.gi} senza fatti cinematici (hlType) — derivazione non disponibile`);
        }
        paired++;
      }
    }
    if (resolved === 0) warnings.push('nessun ActionResolved nella timeline (passata final-state non ha risolto?)');
    return { pass: issues.length === 0, issues, warnings, info: { events: timeline.length, forced: Object.keys(forced).length, resolved, paired } };
  },
};
