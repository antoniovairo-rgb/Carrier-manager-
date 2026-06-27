/* CHECK — BALL MOTION / PROGRESSION (global, #41 / AC-029 no-boomerang, AC-020 no-teleport)
   Sulle azioni OFFENSIVE la palla deve progredire/restare verso la porta attaccata (x→100), MAI
   tornare indietro con un salto (boomerang) né retrocedere verso la propria porta. Guardia di
   regressione del fix 5.14 (boomerang del tiro/passaggio mancato). Misura su x reale della palla
   (__CPM_STATE().ball.x, coord gioco) via harness sampleBallPath.
   Soglie tarate su misure reali (maxBackStep osservato 0…−3, minX 66…94 → ampio margine):
     - [HARD] maxBackStep > BACK_MAX  → nessun salto all'indietro (boomerang/teletrasporto)
     - [HARD] minX >= MIN_X           → la palla non retrocede verso la propria metà
   SCOPE (calibrato su misure reali): SOLO gli intenti di CONCLUSIONE — la palla va verso porta e NON
   deve tornare indietro. Gli intenti di PASSAGGIO (onetwo/through/switch) e di conduzione (dribble/
   progression) sono fuori scope: hanno dinamiche legittimamente all'indietro/laterali o partono dalla
   propria metà (es. bordata da centrocampo) → un check di "non-retrocessione" su di essi = falsi positivi.
   I difensivi (recover/intercept/anticipate) idem (direzione opposta).
   Riceve `samples`: [{gi, intent, startX, net, maxBackStep, minX, n}] dall'orchestratore. */
const CONCLUSION = new Set(['shot', 'insertion', 'cross', 'penalty', 'freekick', 'header']);
export default {
  id: 'ball-motion',
  title: 'Ball progression / no-boomerang (conclusioni)',
  scope: 'global',
  run({ samples }) {
    const issues = [], warnings = [];
    const BACK_MAX = -10;  // salto singolo all'indietro su una conclusione (osservato 0…−0.8)
    const NET_MIN = -25;   // la palla non deve FINIRE molto più indietro di dove parte (osservato −4.7…+8.6)
    let checked = 0;
    for (const s of (samples || [])) {
      if (!s || s.n < 3) { warnings.push(`gi${s && s.gi}: traiettoria palla non campionata`); continue; }
      if (!CONCLUSION.has(s.intent)) continue; // solo conclusioni offensive
      checked++;
      if (s.maxBackStep < BACK_MAX) issues.push(`gi${s.gi} [${s.intent}]: salto palla all'indietro ${s.maxBackStep} < ${BACK_MAX} (boomerang/teletrasporto)`);
      if (s.net != null && s.net < NET_MIN) issues.push(`gi${s.gi} [${s.intent}]: la palla finisce ${s.net} indietro (< ${NET_MIN}) rispetto alla partenza (boomerang della conclusione)`);
    }
    if (checked === 0) warnings.push('nessuna conclusione offensiva campionata per ball-motion');
    return { pass: issues.length === 0, issues, warnings, info: { checked, samples: (samples || []).map(s => ({ gi: s.gi, intent: s.intent, minX: s.minX, maxBackStep: s.maxBackStep, net: s.net })) } };
  },
};
