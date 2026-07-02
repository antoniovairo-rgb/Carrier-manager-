/* CHECK 14 — LIVE-SMOKE (globale, BLOCCANTE): partita REALE non forzata su pagina pulita.
   Esercita il tick di `playing` (clock che avanza, cronaca BG, coda degli HL reattivi) che la passata
   force-sit bypassa per costruzione: il soft-lock BLK-1 (fixato in 5.75.0) viveva esattamente qui e
   NESSUN check lo eseguiva. Primo gradino di ARC-1a (audit 2026-07): il gate vede il gioco vero. */
export default {
  id: 'live-smoke',
  title: 'Live smoke (tick playing reale)',
  scope: 'global',
  run({ p0, p1, numHL0, numHL1, errors }) {
    const issues = [], warnings = [];
    if (!p0 || !p1) return { pass: false, issues: ['probe non disponibile (__CPM_PROBE)'], warnings, info: {} };
    for (const e of (errors || []).slice(0, 5)) issues.push('pageerror durante il tick playing: ' + e);
    const c0 = p0.clock ?? 0, c1 = p1.clock ?? 0;
    if (!(c1 > c0)) issues.push(`clock NON avanza in playing (da ${c0}' a ${c1}') — tick rotto o congelato`);
    if (numHL0 != null && numHL1 != null && !(numHL1 > numHL0)) issues.push(`coda HL reattiva non processata (numHL ${numHL0}→${numHL1}) — path reactive del tick rotto`);
    if (p1.phase === 'playing' && numHL1 > (numHL0 ?? 0)) warnings.push('HL reattivo schedulato ma non ancora entrato in hl_* nella finestra osservata');
    return { pass: issues.length === 0, issues, warnings, info: { clockFrom: c0, clockTo: c1, numHL0, numHL1, phase: p1.phase || null, errors: (errors || []).length } };
  }
};
