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
  title: 'Motion / off-ball liveness (No Dead Players)',
  scope: 'global',
  run({ samples }) {
    const issues = [], warnings = [];
    const ALIVE_MIN = 15;   // su ~21 giocatori (osservati 19–21 attivi in fase choose)
    const TP_MAX = 12;      // salto mesh tra due campioni (osservati 2.7–4.2 → ampio margine)
    for (const s of (samples || [])) {
      if (!s || s.players === 0) { warnings.push(`gi${s && s.gi}: nessun giocatore campionato (motion non disponibile)`); continue; }
      if (s.alive < ALIVE_MIN) issues.push(`gi${s.gi}: solo ${s.alive}/${s.players} giocatori in movimento off-ball (atteso >=${ALIVE_MIN} — No Dead Players)`);
      if (s.maxFrameDelta > TP_MAX) issues.push(`gi${s.gi}: salto mesh ${s.maxFrameDelta} > ${TP_MAX} (teletrasporto giocatore)`);
    }
    return { pass: issues.length === 0, issues, warnings, info: { samples: (samples || []).map(s => ({ gi: s.gi, alive: s.alive, players: s.players, maxFrameDelta: s.maxFrameDelta, avgDisp: s.avgDisp })) } };
  },
};
