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
    const PRESS_HALF = 50;
    const QUOTA_MAX = 0.34;   // [7.550.0] oltre un terzo delle scene senza nessuno sul portatore = difetto
    const press = [], lontani = [];    // applica la reattività SOLO con palla nella metà offensiva (no rimesse/GK restart)
    for (const s of (samples || [])) {
      if (!s || s.players === 0) { warnings.push(`gi${s && s.gi}: nessun giocatore campionato (motion non disponibile)`); continue; }
      if (s.alive < ALIVE_MIN) issues.push(`gi${s.gi}: solo ${s.alive}/${s.players} giocatori in movimento off-ball (atteso >=${ALIVE_MIN} — No Dead Players)`);
      if (s.maxFrameDelta > TP_MAX) issues.push(`gi${s.gi}: salto mesh ${s.maxFrameDelta} > ${TP_MAX} (teletrasporto giocatore)`);
      // #24 Every Player Reacts: dove c'è pressing atteso (palla in metà offensiva) almeno un difensore impegna il portatore.
      // Esclude rimesse/restart dal portiere (palla profonda, difensori legittimamente alti).
      /* [7.550.0 — collaudo PO «una marea di run failed, come mai?»] SI GIUDICA SULLA QUOTA, NON SUL CASO
         SINGOLO. Questa regola falliva appena UNO dei sei campioni sforava, e il gioco vive a un passo
         dalla soglia (26,9 m contro 24): TRE GIRI SULLO STESSO IDENTICO CODICE davano ❌ ❌ ✅. Un
         guardiano che dà tre risposte diverse sullo stesso commit non è una porta, è un dado — e il
         rumore lo ha reso invisibile, che è il modo peggiore in cui un controllo può fallire.
         ⚠️ LA SOGLIA IN METRI NON È STATA TOCCATA (DEF_ENGAGE resta 24, e resta severa: 24 metri sono già
         «nessuno ti sta addosso» — nel calcio vero, palla in area, il difensore più vicino sta a uno o
         due metri). Cambia SOLO la regola di giudizio: si guarda la quota dei campioni giudicabili,
         perché la grandezza è rumorosa e un singolo campione non la rappresenta. Il caso peggiore resta
         SEMPRE stampato come warning, così non sparisce dal report. */
      if (s.defMinEver != null && s.ballX != null && s.ballX > PRESS_HALF) {
        press.push(s);
        if (s.defMinEver > DEF_ENGAGE) lontani.push(s);
      }
    }
    if (press.length) {
      const quota = lontani.length / press.length;
      const peggio = lontani.slice().sort((a, b) => b.defMinEver - a.defMinEver)[0];
      if (peggio) warnings.push(`caso peggiore — gi${peggio.gi}: palla a x${peggio.ballX}, difensore più vicino ${peggio.defMinEver} m (soglia ${DEF_ENGAGE})`);
      if (quota > QUOTA_MAX)
        issues.push(`nessuno reagisce al portatore in ${lontani.length}/${press.length} scene con palla in metà offensiva (${(quota * 100).toFixed(0)}% > ${(QUOTA_MAX * 100).toFixed(0)}%) — soglia ${DEF_ENGAGE} m`);
    }
    return { pass: issues.length === 0, issues, warnings, info: { samples: (samples || []).map(s => ({ gi: s.gi, alive: s.alive, players: s.players, maxFrameDelta: s.maxFrameDelta, defMinEver: s.defMinEver, defNear: s.defNear, ballX: s.ballX })) } };
  },
};
