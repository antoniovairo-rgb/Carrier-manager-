/* CHECK 5 (+3) — ORIENTAMENTO CAMPO & SENSO TATTICO (per-situation)
   - home attacca verso gx=100 (porta avversaria); GK casa@gx≈0, GK away@gx≈100
   - nessun tiro verso la propria porta · niente azioni tatticamente prive di senso
   - cross/verticalizzazioni con prerequisiti coerenti (lanes) */
export default {
  id: 'orientation',
  title: 'Orientamento & senso tattico',
  scope: 'situation',
  run({ sit, state }) {
    const issues = [], warnings = [];
    if (!state || !state.ok) return { pass: false, issues: ['__CPM_STATE non disponibile'], warnings };

    // [HARD] orientamento campo: home difende gx=0, attacca gx=100; GK casa < GK away
    if (state.attackDir !== 1) issues.push(`attackDir=${state.attackDir} (atteso 1, home→gx100)`);
    const hgk = state.players.find(p => p.team === 'home' && p.gk);
    const agk = state.players.find(p => p.team === 'away' && p.gk);
    if (hgk && agk && !(hgk.x < agk.x)) issues.push(`orientamento porte incoerente (GK casa@${hgk.x} vs away@${agk.x})`);

    // [HARD] senso tattico delle SOLE azioni di conclusione (rew:"goal") — stesso criterio di
    //    filterSitActions: i prerequisiti tattici valgono per le azioni-goal, non per save/assist.
    const acts = (sit.actions || []).filter(a => a.rew === 'goal');
    const lanes = sit.tactic && Array.isArray(sit.tactic.lanes) ? sit.tactic.lanes : null;
    for (const a of acts) {
      const l = (a.label || '').toLowerCase();
      if (/cross|traversone/.test(l) && lanes && !lanes.includes('overlap_left') && !lanes.includes('overlap_right'))
        issues.push(`azione-goal cross "${a.label}" senza corsia overlap nella tactic`);
      if (/filtrante|imbucata|verticale/.test(l) && a.stat === 'passaggio' && lanes && !lanes.includes('through_ball_lane'))
        issues.push(`verticalizzazione-goal "${a.label}" senza through_ball_lane`);
      if (/dribbl|sfida|supera/.test(l) && a.stat === 'dribbling' && sit.tactic && sit.tactic.nearby_def === 0)
        issues.push(`dribbling-goal "${a.label}" con nearby_def=0 (nessun avversario)`);
    }

    // [HARD] nessuna conclusione verso la propria porta: una Situation offensiva non conclude da gx<6
    if (sit.type !== 'def' && acts.length && state.ball.x < 6)
      issues.push(`azione offensiva con palla @gx=${state.ball.x} (verso la propria porta?)`);

    return { pass: issues.length === 0, issues, warnings };
  }
};
