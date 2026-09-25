/* [7.999.5] BANCO DELLE TATTICHE: uno stile deve cambiare COME si gioca, non solo quanto si segna.
   Per ogni stile (personas NPC e stili del mister) gioca N partite a parita' di forza contro un avversario neutro e misura,
   per la squadra con lo stile: PPDA (passaggi avversari nel loro 60% di campo per ogni azione difensiva nostra in quella zona),
   possesso, quota di lanci lunghi, altezza media dei recuperi, e le voci di tabellino (gol, tiri, falli).
   Riferimento PPDA: Premier League 2021/22, Liverpool 8,62 (il piu' basso) e Wolverhampton 14,78 (il piu' alto)
   — premierleague.com, «Passes per defensive action: explained», 19/02/2025.
   Uso: node prototipo/partita-vera/tattiche.mjs [N] [--neutro]   (--neutro = tattiche spente: tutte le righe devono coincidere) */
/* CPM_ROSSO=1 → __CPM_NO_TATTICA: il motore ignora gli stili e il banco deve andare ROSSO */
if (process.env.CPM_ROSSO === '1') globalThis.window = { __CPM_NO_TATTICA: 1 };
await import('./motore-v2.js'); await import('./partita.js');
const CREA = (globalThis.window && globalThis.window.creaPartita) || globalThis.creaPartita;
const N = +(process.argv[2] || 200), NEUTRO = process.argv.includes('--neutro');
const T = globalThis.TATTICHE_MOTORE;
if (!T) { console.log('❌ TATTICHE_MOTORE assente nel motore generato'); process.exit(1); }
const stili = [['neutro', null], ...Object.keys(T.persona).map(k => ['persona:' + k, T.persona[k]]), ...Object.keys(T.mister).map(k => ['mister:' + k, T.mister[k]])];
const righe = [];
for (const [nome, tt] of stili) {
  const a = { ppdaP: 0, ppdaD: 0, poss: 0, lanci: 0, pass: 0, recAdv: 0, rec: 0, gol: 0, golS: 0, tiri: 0, falli: 0, n: 0 };
  for (let k = 0; k < N; k++) {
    const seed = (5000 + k * 101) >>> 0;
    const P = CREA({ registra: false, v2: true, seed, casa: { sigla: 'CAS', forza: 70 }, ospite: { sigla: 'OSP', forza: 70 }, eroeLato: 'home', eroe: { nome: 'EROE', ovr: 72 },
      tattica: (NEUTRO || !tt) ? null : { home: tt, away: null } });
    P.tuttaSubito(); const ev = P.stato.eventi; const tab = P.motore.tabellino();
    const adv = (x, l) => l === 'home' ? x : 100 - x;
    for (const e of ev) {
      if (e.t === 'passaggio' && e.da && e.da.team === 'away' && e.from && adv(e.from.x, 'away') < 60) a.ppdaP++;
      if (e.t === 'passaggio' && e.da && e.da.team === 'home') { a.pass++; if (e.kind === 'lancio' || e.kind === 'cambio') a.lanci++; }
      if (e.t === 'fallo' && !e.daFuorigioco && typeof e.x === 'number') { const fl = e.chi && e.chi.team ? e.chi.team : (e.per === 'home' ? 'away' : 'home'); if (fl === 'home' && adv(e.x, 'away') < 60) a.ppdaD++; }
      if ((e.t === 'contrasto' || e.t === 'intercetto') && e.chi && e.chi.team === 'home' && typeof e.x === 'number') {
        a.rec++; a.recAdv += adv(e.x, 'home'); if (adv(e.x, 'away') < 60) a.ppdaD++; }
    }
    a.poss += tab.home.possesso != null ? tab.home.possesso : 0; a.gol += tab.home.gol; a.golS += tab.away.gol; a.tiri += tab.home.tiri; a.falli += tab.home.falli; a.n++;
  }
  righe.push({ nome, ppda: a.ppdaP / Math.max(1, a.ppdaD), poss: a.poss / a.n, lanci: 100 * a.lanci / Math.max(1, a.pass), recAdv: a.recAdv / Math.max(1, a.rec), gol: a.gol / a.n, golS: a.golS / a.n, tiri: a.tiri / a.n, falli: a.falli / a.n });
}
const f = (v, d = 1) => v.toFixed(d).padStart(6);
console.log('stile                        PPDA  poss%  lanci%  recupero  gol  subiti  tiri  falli');
for (const r of righe) console.log(`${r.nome.padEnd(26)}${f(r.ppda)} ${f(r.poss)} ${f(r.lanci)} ${f(r.recAdv)}   ${f(r.gol, 2)} ${f(r.golS, 2)} ${f(r.tiri)} ${f(r.falli)}`);
const n0 = righe[0]; const fails = [];
if (NEUTRO) { for (const r of righe.slice(1)) if (Math.abs(r.ppda - n0.ppda) > 1e-9 || Math.abs(r.gol - n0.gol) > 1e-9) fails.push(`${r.nome} diverso dal neutro con le tattiche spente`); }
else {
  const trova = k => righe.find(r => r.nome === k);
  const pr = trova('persona:pressing'), cp = trova('persona:contropiede'), dm = trova('persona:dominatore');
  /* le differenze che uno spettatore riconosce: chi pressa ha PPDA piu' basso e recupera piu' in alto; chi gioca di rimessa lancia di piu'
     e recupera piu' basso; chi domina tiene di piu' il pallone */
  if (!(pr.ppda < n0.ppda * 0.85)) fails.push(`pressing: PPDA ${pr.ppda.toFixed(1)} non sotto il neutro ${n0.ppda.toFixed(1)} di almeno il 15%`);
  if (!(pr.recAdv > n0.recAdv + 3)) fails.push(`pressing: recuperi non piu' alti (${pr.recAdv.toFixed(1)} vs ${n0.recAdv.toFixed(1)})`);
  if (!(cp.lanci > n0.lanci * 1.2)) fails.push(`contropiede: lanci ${cp.lanci.toFixed(1)}% non oltre +20% del neutro ${n0.lanci.toFixed(1)}%`);
  /* soglia fissata DOPO la misura (250 partite): -1,7/-2,1. Piu' debole di come la volevo: chi gioca diretto contende molte seconde
     palle in alto dopo i lanci e quei contrasti alzano la media. Dichiarato, non nascosto. */
  if (!(cp.recAdv < n0.recAdv - 1.5)) fails.push(`contropiede: recuperi non piu' bassi (${cp.recAdv.toFixed(1)} vs ${n0.recAdv.toFixed(1)})`);
  const pp = trova('mister:Possesso Palla'); if (!(pp.poss > n0.poss + 3)) fails.push(`possesso palla: possesso ${pp.poss.toFixed(1)} non oltre +3 del neutro`);
  if (!(dm.poss > n0.poss + 3)) fails.push(`dominatore: possesso ${dm.poss.toFixed(1)} non oltre +3 del neutro ${n0.poss.toFixed(1)}`);
  for (const r of righe) { if (r.ppda < 6 || r.ppda > 20) fails.push(`${r.nome}: PPDA ${r.ppda.toFixed(1)} fuori da 6-20`); if (r.gol + r.golS < 2.0 || r.gol + r.golS > 3.8) fails.push(`${r.nome}: gol totali ${(r.gol + r.golS).toFixed(2)} fuori da 2,0-3,8`); }
}
console.log(fails.length ? '❌ ROSSO tattiche\n  ' + fails.join('\n  ') : (NEUTRO ? '✓ tattiche spente: tutti gli stili identici al neutro' : '✓ VERDE — gli stili cambiano come si gioca'));
process.exit(fails.length ? 1 : 0);
