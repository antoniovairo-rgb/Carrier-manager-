/* [7.999.29 guardiano — collaudo PO «voto sproporzionato: 9,5 con 2 gol su 4 tiri»] VOTO DEGLI ATTACCANTI PER NUMERO DI GOL, su N partite
   del motore (letto da src/14, v2, cadenza vera 22 decisioni al minuto). Bersaglio deciso dal PO il 26/09: doppietta ~8, tripletta ~8,5-9,
   10 quasi mai. Soglie qui sotto = bande intorno alla decisione del PO, non dati di fonte.
   Uso: node tests/brain/voto-gol-census.mjs [N]   ·   CPM_ROSSO=1 → __CPM_NO_VOTO29 (vecchia scala): deve FALLIRE. */
import { loadMotore, giocatori } from './_carica.mjs';
const N = +(process.argv[2] || 300); const RED = process.env.CPM_ROSSO === '1';
globalThis.window = RED ? { __CPM_NO_VOTO29: true } : {};
const crea = loadMotore(); const per = {};
for (let k = 0; k < N; k++) {
  const m = crea({ v2: true, seed: 5000 + k * 41, giocatori: giocatori(), eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 78 }, forza: { home: 72, away: 66 } });
  for (let t = 1; t <= 92; t++) for (let d = 0; d < 22; d++) m.tick({ min: t, dt: 1 / 22, dec: true });
  for (const p of m.pagelle()) { if (p.rep !== 'A' && !p.eroe) continue; const g = Math.min(4, p.gol | 0); (per[g] = per[g] || []).push(p.voto); }
}
const R = {}; for (const [g, a] of Object.entries(per)) { a.sort((x, y) => x - y); R[g] = { n: a.length, media: +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2), mediana: a[a.length >> 1], max: a[a.length - 1], da9: a.filter(x => x >= 9).length, dieci: a.filter(x => x >= 10).length }; }
console.log(JSON.stringify({ partite: N, rosso: RED, ...R }));
const err = []; const chk = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
chk(R[1] && R[1].media >= 7.0 && R[1].media <= 7.8, `un gol: media 7,0-7,8 (${R[1] && R[1].media})`);
chk(R[2] && R[2].media >= 7.7 && R[2].media <= 8.4, `doppietta: media ~8 (7,7-8,4) (${R[2] && R[2].media})`);
chk(!R[3] || (R[3].mediana >= 8.3 && R[3].mediana <= 9.1), `tripletta: mediana 8,3-9,1 (${R[3] && R[3].mediana})`);
chk(!R[0] || R[0].da9 === 0, `nessun 9 senza gol (${R[0] && R[0].da9})`);
const dieci = Object.values(R).reduce((s, x) => s + x.dieci, 0); chk(dieci <= Math.max(1, Math.round(N / 200)), `il 10 quasi mai (${dieci} su ${N} partite)`);
if (err.length) { console.log('\nVOTO PER GOL: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nVOTO PER GOL: PASS'); process.exit(0);
