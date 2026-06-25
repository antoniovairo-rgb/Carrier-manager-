/* CHECK 6 — VALIDAZIONE STATO FINALE (per-situation, dopo __CPM_RESOLVE)
   Risolta l'azione, verifica l'evento conclusivo e l'assenza di stati impossibili.
   - evento conclusivo presente (outKey + ok)
   - tutti i giocatori e la palla dentro il campo, palla a quota sana
   - coerenza palla↔esito (home attacca gx=100): tiri/assist verso la porta avversaria,
     goal_against verso la propria, recuperi/parate in zona difensiva */
export default {
  id: 'final-state',
  title: 'Stato finale',
  scope: 'situation',
  run({ outcome, finalState }) {
    const issues = [], warnings = [];
    if (!outcome || !outcome.outKey) { warnings.push('esito non catturato (timing di risoluzione)'); return { pass: true, issues, warnings }; }
    if (!finalState || !finalState.ok) return { pass: false, issues: ['__CPM_STATE finale non disponibile'], warnings };
    const key = outcome.outKey;

    // assenza di stati impossibili
    const M = -2, X = 102;
    for (const p of finalState.players.concat([finalState.hero]))
      if (p.x < M || p.x > X || p.y < M || p.y > X) issues.push(`stato finale: giocatore fuori campo @(${p.x},${p.y})`);
    const b = finalState.ball;
    if (b.x < M || b.x > X || b.y < M || b.y > X) issues.push(`stato finale: palla fuori campo @(${b.x},${b.y})`);
    if (b.worldY < -0.5 || b.worldY > 15) issues.push(`stato finale: palla a quota impossibile worldY=${b.worldY}`);

    // coerenza palla ↔ esito
    const attacking = ['goal', 'miss', 'miss_easy', 'assist', 'loose'];
    if (attacking.includes(key) && b.x < 45) issues.push(`esito "${key}" ma palla @gx=${b.x} (lontana dalla porta avversaria gx=100)`);
    if (key === 'goal_against' && b.x > 40) issues.push(`esito "goal_against" ma palla @gx=${b.x} (lontana dalla propria porta gx=0)`);
    if ((key === 'save' || key === 'recovery') && b.x > 78) warnings.push(`esito "${key}" con palla in zona offensiva @gx=${b.x}`);

    return { pass: issues.length === 0, issues, warnings };
  }
};
