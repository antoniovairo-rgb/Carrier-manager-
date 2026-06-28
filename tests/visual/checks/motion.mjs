/* CHECK — MOTION / OFF-BALL LIVENESS (global, B2 / #17 / AC-081…090 "No Dead Players")
   Valida che la scena VIVA: durante la fase attiva (hl_choose, off-ball AI in moto) un numero
   significativo dei 22 giocatori si MUOVE realmente (mesh, non posizioni logiche), senza teletrasporti.
   Misura su posizioni MESH reali via __CPM_STATE().players (derivate da mesh.position, vedi harness
   sampleMotion). Soglie tarate su misure reali (alive osservati 19–21/21, maxFrameDelta 2.7–4.2):
     - [HARD] alive >= ALIVE_MIN  → almeno N giocatori in movimento (No Dead Players)
     - [HARD] maxFrameDelta < TP  → nessun salto/teletrasporto mesh tra due campioni
   Riceve `samples`: [{gi, players, alive, maxFrameDelta, avgDisp}] dall'orchestratore. */
export default {
  id: 'motion',
  title: 'Motion / off-ball liveness & reactivity (No Dead Players · Every Player Reacts)',
  scope: 'global',
  run({ samples }) {
    const issues = [], warnings = [];
    const ALIVE_MIN = 13;     // su ~21 giocatori; da 5.43.15 i 2 PORTIERI restano in posizione di pronto (fermi, realistico) → non più contati come "in movimento" (prima jitteravano = liveness falsa). Soglia abbassata di 2 di conseguenza.
    const TP_MAX = 12;        // salto mesh tra due campioni (osservati 2.7–4.2 → ampio margine)
    const DEF_ENGAGE = 24;    // #24: un difensore deve impegnare il portatore (osservato minDist <= 8 in azione)
    const PRESS_HALF = 50;    // applica la reattività SOLO con palla nella metà offensiva (no rimesse/GK restart)
    for (const s of (samples || [])) {
      if (!s || s.players === 0) { warnings.push(`gi${s && s.gi}: nessun giocatore campionato (motion non disponibile)`); continue; }
      if (s.alive < ALIVE_MIN) issues.push(`gi${s.gi}: solo ${s.alive}/${s.players} giocatori in movimento off-ball (atteso >=${ALIVE_MIN} — No Dead Players)`);
      if (s.maxFrameDelta > TP_MAX) issues.push(`gi${s.gi}: salto mesh ${s.maxFrameDelta} > ${TP_MAX} (teletrasporto giocatore)`);
      // #24 Every Player Reacts: dove c'è pressing atteso (palla in metà offensiva) almeno un difensore impegna il portatore.
      // Esclude rimesse/restart dal portiere (palla profonda, difensori legittimamente alti).
      if (s.defMinEver != null && s.ballX != null && s.ballX > PRESS_HALF && s.defMinEver > DEF_ENGAGE)
        issues.push(`gi${s.gi}: palla in metà offensiva (x${s.ballX}) ma difensori lontani (minDist ${s.defMinEver} > ${DEF_ENGAGE}) — nessuno reagisce al portatore`);
    }
    return { pass: issues.length === 0, issues, warnings, info: { samples: (samples || []).map(s => ({ gi: s.gi, alive: s.alive, players: s.players, maxFrameDelta: s.maxFrameDelta, defMinEver: s.defMinEver, defNear: s.defNear, ballX: s.ballX })) } };
  },
};
