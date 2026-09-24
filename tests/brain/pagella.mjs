/* [24/09 POC] PAGELLA DEL BRAIN — numeri di una «partita vera», media per squadra su N partite a cadenza vera
   (22 decisioni al minuto, come in produzione). Uso: node tests/brain/pagella.mjs [N] [ROSSI separati da virgola]
   Riferimento verificato: Opta Analyst, Premier League 2025-26, «league average» take-on success 36,7 %
   (https://theanalyst.com/articles/premier-league-dribblers-stats-2025-26). Le altre soglie qui sotto sono
   BANDE DI BUON SENSO dichiarate come tali, non dati di fonte. */
import { loadMotore, gioca } from './_carica.mjs';
const N = +(process.argv[2] || 20); const ROSSI = (process.argv[3] || '').split(',').filter(Boolean);
globalThis.window = {}; ROSSI.forEach(r => { globalThis.window[r] = true; });
const crea = loadMotore(); const A = {}; const add = (k, v) => { A[k] = (A[k] || 0) + v; };
for (let k = 0; k < N; k++) {
  const { m, evs } = gioca(crea, 1000 + k * 37); const T = m.tabellino();
  for (const t of ['home', 'away']) for (const [c, v] of Object.entries(T[t])) add('tab.' + c, +v || 0);
  let catena = 0, lato = null;
  for (const e of evs) {
    if (e.t === 'passaggio' || e.t === 'cross') {
      const l = (e.da && e.da.team) || e.lato; const adv = x => l === 'home' ? x : 100 - x;
      if (e.from && e.to) { const d = adv(e.to.x) - adv(e.from.x); add(d > 5 ? 'avanti' : d < -5 ? 'indietro' : 'laterale', 1);
        if (d < -5 && adv(e.from.x) < 40) add('indietroMetaPropria', 1); }
      if (l === lato) catena++; else { if (catena >= 3) add('catene3', 1); catena = 1; lato = l; }
    } else if (['intercetto', 'contrasto', 'recupero', 'fuori', 'rinvio', 'presa', 'fallo', 'fuorigioco'].includes(e.t)) { if (catena >= 3) add('catene3', 1); catena = 0; lato = null; }
    if (e.t === 'tiro') add('tiro.' + (e.zona || '?'), 1);
  }
}
const s = x => Math.round((x / (2 * N)) * 10) / 10, p = (a, b) => b ? Math.round(100 * a / b) : null;
const pass = (A.avanti || 0) + (A.indietro || 0) + (A.laterale || 0);
const R = {
  partite: N, rossi: ROSSI,
  passaggi: s(A['tab.passaggi']), precisione: p(A['tab.passOk'], A['tab.passaggi']),
  pctAvanti: p(A.avanti, pass), pctIndietro: p(A.indietro, pass), pctLaterale: p(A.laterale, pass),
  catene3: s(A.catene3 || 0), cross: s(A['tab.cross']), fasce: s(A['tab.fascia']),
  tiri: s(A['tab.tiri']), inPorta: s(A['tab.inPorta']), xg: s(A['tab.xg']),
  tiriArea: p((A['tiro.area'] || 0) + (A['tiro.areaPiccola'] || 0), A['tab.tiri']),
  dribbling: s(A['tab.dribbling']), dribblingPct: p(A['tab.dribblingOk'], A['tab.dribbling']),
  falli: s(A['tab.falli']), corner: s(A['tab.corner']), fuorigioco: s(A['tab.fuorigioco']),
};
console.log(JSON.stringify(R));
