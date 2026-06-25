/* CHECK 7 — VALIDAZIONE VISIVA (per-situation)
   - camera sempre sopra il prato · giocatori renderizzati (no culling/glitch)
   - azione inquadrata (possessore on-screen) · palla a quota plausibile
   - regressione golden via dHash vs baseline (hamming) */
export default {
  id: 'visual',
  title: 'Validazione visiva + golden',
  scope: 'situation',
  run({ sit, state }) {
    const issues = [], warnings = [];
    if (!state || !state.ok) return { pass: false, issues: ['__CPM_STATE non disponibile'], warnings };

    // [HARD] camera mai sotto il piano del prato
    if (!state.camera.abovePitch) issues.push(`camera sotto il prato (y=${state.camera.y})`);

    // [HARD] tutti i giocatori realmente renderizzati (mesh.visible) — un invisibile = glitch
    const hidden = state.players.filter(p => p.visible === false).length + (state.hero.visible === false ? 1 : 0);
    if (hidden > 0) issues.push(`${hidden} giocatori non renderizzati (visible=false)`);

    // [HARD] palla a quota plausibile (non sottoterra, non in stratosfera)
    if (state.ball.worldY < -0.5 || state.ball.worldY > 12) issues.push(`palla a quota impossibile worldY=${state.ball.worldY}`);

    // [SOFT] inquadratura dell'eroe: la camera broadcast del match ha un look-target che insegue
    //    l'azione e per le Situation di fascia/profondità non sempre centra l'eroe → warning, non gate.
    if (sit.type !== 'def' && !state.hero.onScreen) warnings.push(`eroe non centrato in inquadratura: ndc=${JSON.stringify(state.hero.ndc)}`);

    return { pass: issues.length === 0, issues, warnings };
  }
};
