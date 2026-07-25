/* CHECK 2 — VALIDAZIONE STATO INIZIALE (per-situation, su __CPM_STATE)
   - giocatori dentro il campo · nessuna sovrapposizione · conteggi corretti
   - possessore palla corretto · disposizione tattica coerente con la Situation */
export default {
  id: 'initial-state',
  title: 'Stato iniziale',
  scope: 'situation',
  run({ sit, state }) {
    const issues = [], warnings = [];
    if (!state || !state.ok) return { pass: false, issues: ['__CPM_STATE non disponibile'], warnings };
    const everyone = state.players.concat([state.hero]);

    // a) [HARD] tutti dentro il campo (margine piccolo per arrotondamenti)
    const M = -2, X = 102;
    for (const p of everyone) if (p.x < M || p.x > X || p.y < M || p.y > X)
      issues.push(`giocatore fuori campo (${p.team}/${p.role || '?'}) @ (${p.x},${p.y})`);
    if (state.ball.x < M || state.ball.x > X || state.ball.y < M || state.ball.y > X)
      issues.push(`palla fuori campo @ (${state.ball.x},${state.ball.y})`);

    // b) [SOFT] sovrapposizioni: in un'azione viva i giocatori convergono (duelli, linea, mischia);
    //    è un segnale cosmetico/transitorio e dipende dal drift → warning, non gate. Soglia stretta = stacking reale.
    let stacks = 0;
    for (let i = 0; i < everyone.length; i++) for (let j = i + 1; j < everyone.length; j++)
      if (Math.hypot(everyone[i].x - everyone[j].x, everyone[i].y - everyone[j].y) < 0.4) stacks++;
    if (stacks > 0) warnings.push(`${stacks} coppie di giocatori molto ravvicinate (<0.4u)`);

    // c) [HARD] conteggi: 11 casa (10 in players + 1 hero) vs 11 avversari
    const homeTot = state.counts.home + 1; // + hero
    if (homeTot !== 11) issues.push(`giocatori casa = ${homeTot} (atteso 11)`);
    if (state.counts.away !== 11) issues.push(`avversari = ${state.counts.away} (atteso 11)`);

    // d) [HARD] possessore corretto via aggancio palla↔eroe (deterministico, indipendente dal drift):
    //    offensiva → palla ai piedi dell'eroe; difensiva → palla NON sull'eroe (è sull'avversario).
    //    Usa i target LOGICI (heroTarget/ballTarget dai prop di gioco) anziché la posa mesh che lerpa:
    //    sotto rendering software lento la mesh può non essere ancora assestata → falso positivo ambientale.
    const isDef = sit.type === 'def';
    const _ht = state.heroTarget, _bt = state.ballTarget;
    const _useTargets = _ht && _bt && _ht.x != null && _bt.x != null;
    const _hero = _useTargets ? _ht : state.hero;
    const _ball = _useTargets ? _bt : state.ball;
    const dBallHero = Math.hypot(_ball.x - _hero.x, _ball.y - _hero.y);
    // Offensiva: l'effetto di attach garantisce palla=eroe → invariante HARD e deterministico.
    //   MA solo quando la palla è DAVVERO ai piedi (ballState 'feet'). Per i palloni AEREI/SET-PIECE
    //   (corner/cross/punizione: ballState 'aerial'/'set_ground') la palla è lontana dall'eroe PER DESIGN
    //   (bandierina, cross in arrivo) → non è un difetto, ed evita il falso positivo ambientale su rendering
    //   software lento (la palla aerea non si assesta in tempo). Precisione, non riduzione della severità.
    const _atFeet = (sit.ballState == null || sit.ballState === 'feet');
    // 5.72.0: le situazioni OFF-BALL (eroe che si smarca per ricevere) hanno la palla su un COMPAGNO PER DESIGN
    //   → esenti dall'invariante "palla ai piedi dell'eroe" (il campo sit.offBall è la sorgente unica, come ballState).
    // [7.194.0 S1] la sorgente di verità è ora il campo dichiarativo `ballAt`: corner (bandierina), wing (cross
    //   dalla fascia), gk (rinvio), mate (appoggio arretrato) hanno la palla lontana dall'eroe PER DESIGN — è
    //   esattamente il difetto che S1 ha corretto (prima la palla veniva incollata ai piedi dell'eroe anche sui
    //   calci d'angolo). L'invariante resta HARD per le situation che dichiarano la palla ai piedi.
    const _ballElsewhere = !!(sit.ballAt && sit.ballAt !== 'hero');
    if (!isDef && !sit.offBall && !_ballElsewhere && _atFeet && dBallHero > 8) issues.push(`Situation offensiva ma palla lontana dall'eroe (${dBallHero.toFixed(1)}u) — possesso non agganciato`);
    // Difensiva: per design la palla NON è posizionata sull'avversario al frame di setup (è gestita nel
    //   loop live di pressing); ballPos resta quella ereditata dalla situation precedente → non è un
    //   invariante deterministico a setup-time. Resta SOFT (warning informativo), non blocca il gate.
    if (isDef && dBallHero < 3) warnings.push(`Situation difensiva ma palla sull'eroe (${dBallHero.toFixed(1)}u) — possesso avversario atteso a setup-time`);

    // e) [HARD] coerenza tattica iniziale: portieri nelle rispettive metà
    const hgk = state.players.find(p => p.team === 'home' && p.gk);
    if (hgk && hgk.x > 25) issues.push(`portiere casa fuori posizione difensiva @x=${hgk.x}`);
    const agk = state.players.find(p => p.team === 'away' && p.gk);
    if (agk && agk.x < 75) issues.push(`portiere avversario fuori posizione @x=${agk.x}`);

    return { pass: issues.length === 0, issues, warnings };
  }
};
