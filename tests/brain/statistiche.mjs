/* [23/09 POC] Statistiche del brain per partita (media su N semi, cadenza vera 22 decisioni/min):
   cross, azioni dalle fasce, dribbling tentati e riusciti. Uso: node tests/brain/statistiche.mjs [N] */
import { loadMotore, gioca } from './_carica.mjs';
const crea = loadMotore(); const N = +(process.argv[2] || 10); const S = {};
for (let k = 0; k < N; k++) { const { m } = gioca(crea, 1000 + k * 37); const T = m.tabellino();
  for (const t of ['home', 'away']) for (const [c, v] of Object.entries(T[t])) S[c] = (S[c] || 0) + (+v || 0) / (2 * N); }
const r = x => Math.round(x * 10) / 10;
console.log(JSON.stringify({ partite: N, perSquadra: { cross: r(S.cross), fascia: r(S.fascia), dribbling: r(S.dribbling), dribblingOk: r(S.dribblingOk), dribblingPct: S.dribbling ? Math.round(100 * S.dribblingOk / S.dribbling) : null, passaggi: r(S.passaggi), precisione: Math.round(100 * S.passOk / S.passaggi), tiri: r(S.tiri), gol: r(S.gol) } }));
