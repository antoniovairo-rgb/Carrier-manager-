/* CHECK — POST-HIGHLIGHT (global): durata dinamica, fluidità camera, coerenza animazioni.
   Campiona la traiettoria del post-highlight (camera/palla/giocatori) su un set di Situations e verifica:
   - [HARD] durata dinamica entro [1800,4000]ms (no più 1s fisso che tagliava palla+slow-mo)
   - [HARD] fluidità camera: nessun salto frame-to-frame oltre soglia (no "cambio brusco")
   - [HARD] coerenza animazioni: la palla non "teletrasporta" (delta frame-to-frame limitato)
   - [SOFT] movimento simultaneo: warning se troppi giocatori si muovono insieme (le esultanze gol
     muovono legittimamente molti giocatori → non blocca, solo informativo)
   Soglie tarate su misure reali (camera≤~11, palla≤~16, esultanza≤10) con ampio margine.
   Riceve `samples`: [{gi, durMs, maxCam, maxBall, movers}] raccolti dall'orchestratore. */
export default {
  id: 'post-highlight',
  title: 'Post-highlight (durata/camera/animazioni)',
  scope: 'global',
  run({ samples }) {
    const issues = [], warnings = [];
    const CAM_CUT = 30, BALL_TP = 42, DUR_MIN = 1800, DUR_MAX = 4000, MOVERS_MAX = 16;
    const durs = [];
    for (const s of (samples || [])) {
      if (s.durMs == null) { warnings.push(`gi${s.gi}: durata post-highlight non catturata`); continue; }
      durs.push(s.durMs);
      if (s.durMs < DUR_MIN || s.durMs > DUR_MAX) issues.push(`gi${s.gi}: durata ${s.durMs}ms fuori range [${DUR_MIN},${DUR_MAX}]`);
      /* [7.502.0] una scena i cui campioni sono quasi tutti mal spaziati non e' «senza salti»: e' non
         misurata, e va detto invece di contarla come verde. */
      if (s.coppie != null && s.coppie < 4) { warnings.push(`gi${s.gi}: solo ${s.coppie} coppie ben spaziate (${s.scartati} scartate) — camera non giudicata`); }
      else if (s.maxCam > CAM_CUT) issues.push(`gi${s.gi}: salto camera ${s.maxCam.toFixed(1)} > ${CAM_CUT} (cambio inquadratura brusco)`);
      if (s.maxBall > BALL_TP) issues.push(`gi${s.gi}: salto palla ${s.maxBall.toFixed(1)} > ${BALL_TP} (teletrasporto/anim incoerente)`);
      if (s.movers > MOVERS_MAX) warnings.push(`gi${s.gi}: ${s.movers} giocatori in movimento simultaneo (>${MOVERS_MAX})`);
    }
    // dinamicità: le durate non devono essere tutte identiche (deve dipendere dall'azione)
    if (durs.length >= 3 && new Set(durs).size === 1) warnings.push(`durata post-highlight non dinamica (tutte ${durs[0]}ms)`);
    return { pass: issues.length === 0, issues, warnings, info: { durations: durs, samples: (samples || []).length } };
  }
};
