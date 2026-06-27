/* CHECK — TIMELINE COHERENCE (LMQP-2, global)
   Consuma window.__CPM_TIMELINE (event+timeline layer, LMQP-1) raccolto durante la
   passata final-state (force+resolve di ~23 Situations). Valida il backbone
   «Every Highlight Must Tell a Story» a LIVELLO DI EVENTO: ogni highlight risolto
   deve produrre la coppia HighlightForced → ActionResolved con un intent valido,
   coerente tra forced e resolved, e un outcome key presente.
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
        paired++;
      }
    }
    if (resolved === 0) warnings.push('nessun ActionResolved nella timeline (passata final-state non ha risolto?)');
    return { pass: issues.length === 0, issues, warnings, info: { events: timeline.length, forced: Object.keys(forced).length, resolved, paired } };
  },
};
