/* [giro 449 PO-645] SONDA (non guardiano, esce sempre 0 salvo pagina rotta): quote di PAREGGI e di partite con 5 o piu' GOL del
   motore della simulazione rapida, accanto alle quote reali dei cinque grandi campionati 2023/24.
   Fonte reale: football-data.co.uk, file https://www.football-data.co.uk/mmz4281/2324/{E0,I1,SP1,D1,F1}.csv (colonne FTHG/FTAG),
   scaricati il 28/11/2026; i conteggi sono in REALE qui sotto. CPM_RICALCOLA=1 li riscarica e li ricalcola (serve l'host
   football-data.co.uk; se la rete lo nega la sonda lo dice e usa i conteggi salvati).
   Motore: stessa via del giro 347 (misura-347.mjs): ogni club della lega fa da squadra dell'eroe per CPM_STAG stagioni col calendario
   vero (legaDopoTrasferimento212) e i semi del gioco (standingsSeed+giornata*31+1), simulateMatch {motore:true}. Deterministico.
   CPM_LEGHE (default: le cinque leghe analoghe) · CPM_STAG (default 2) · CPM_ROSSO=1 aggiunge il braccio __CPM_NO_G347 (taratura
   di prima del giro 347), solo per confronto.
   CPM_CHROME=/opt/pw-browsers/chromium npm run quote-449 */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';

const REALE = { // conteggi da football-data.co.uk 2023/24 (partite, pareggi, partite con >=5 gol, gol)
  E0: { nome: 'Premier League', n: 380, pari: 82, g5: 86, gol: 1246 },
  I1: { nome: 'Serie A', n: 380, pari: 112, g5: 47, gol: 992 },
  SP1: { nome: 'LaLiga', n: 380, pari: 107, g5: 60, gol: 1005 },
  D1: { nome: 'Bundesliga', n: 306, pari: 81, g5: 66, gol: 985 },
  F1: { nome: 'Ligue 1', n: 306, pari: 81, g5: 38, gol: 826 },
};
const ANALOGA = { E0: 'Premier Division', I1: 'Lega A', SP1: 'Liga Ibérica', D1: 'Deutsche Liga', F1: 'Ligue Nationale' };

if (process.env.CPM_RICALCOLA === '1') {
  for (const k of Object.keys(REALE)) {
    try {
      const r = await fetch(`https://www.football-data.co.uk/mmz4281/2324/${k}.csv`, { redirect: 'follow' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const righe = (await r.text()).replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
      const h = righe[0].split(','); const iH = h.indexOf('FTHG'), iA = h.indexOf('FTAG');
      let n = 0, pari = 0, g5 = 0, gol = 0;
      for (const l of righe.slice(1)) { const c = l.split(','); if (c[iH] === '' || c[iH] == null) continue;
        const a = +c[iH], b = +c[iA]; n++; pari += a === b; g5 += a + b >= 5; gol += a + b; }
      const v = REALE[k]; const ok = v.n === n && v.pari === pari && v.g5 === g5 && v.gol === gol;
      console.log(`ricalcolo ${k}: ${n} partite · ${pari} pareggi · ${g5} con >=5 gol · ${gol} gol ${ok ? '= conteggi salvati' : '≠ CONTEGGI SALVATI'}`);
      Object.assign(v, { n, pari, g5, gol });
    } catch (e) { console.log(`ricalcolo ${k}: fonte non raggiungibile (${e.cause?.code || e.message}): serve l'host football-data.co.uk, uso i conteggi salvati`); }
  }
}

const LEGHE = (process.env.CPM_LEGHE || Object.values(ANALOGA).join(',')).split(',').map(s => s.trim()).filter(Boolean);
const STAG = +(process.env.CPM_STAG || 2);
const BRACCI = process.env.CPM_ROSSO === '1' ? ['verde', 'rosso'] : ['verde'];
const { page, browser, srv, errors } = await apri(EROE);
const mot = {};
for (const br of BRACCI) {
  mot[br] = await page.evaluate(({ LEGHE, STAG, br }) => {
    window.__CPM_NO_G347 = br === 'rosso' ? 1 : undefined;
    const sim = window.__CPM_simMatch; const out = {};
    for (const lg of LEGHE) { const cl = CLUBS.filter(c => c.lg === lg); const s0 = out[lg] = { n: 0, pari: 0, g5: 0, gol: 0, club: cl.length };
      for (const c of cl) for (let s = 1; s <= STAG; s++) {
        const L = legaDopoTrasferimento212({ season: s, week: 1, clubPrestigeShifts: {} }, c, {});
        const cal = L.newCalendarFull.filter(e => !e.type).sort((a, b) => a.matchday - b.matchday);
        const ovr = Math.max(50, Math.min(90, c.p));
        for (const md of cal) { const o = L.lcs.find(x => x.id === md.opponentId); if (!o) continue;
          const sd = (standingsSeed(c.id, s, md.week) + (md.matchday || 0) * 31 + 1) >>> 0;
          const a = sim(c, o, ovr, md.isHome, sd, {}, { motore: true });
          const t = a.homeScore + a.awayScore; s0.n++; s0.pari += a.homeScore === a.awayScore; s0.g5 += t >= 5; s0.gol += t; } } }
    window.__CPM_NO_G347 = undefined; return out;
  }, { LEGHE, STAG, br });
}
await browser.close(); srv.close();

const pc = (a, n) => (100 * a / n).toFixed(1).replace('.', ',') + '%';
const f2 = x => x.toFixed(2).replace('.', ',');
// intervallo di Wilson al 95% (quanto si muove una quota per il solo campione)
const wil = (k, n) => { const z = 1.96, p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return `${(100 * (c - m)).toFixed(1).replace('.', ',')}-${(100 * (c + m)).toFixed(1).replace('.', ',')}`; };
const somma = arr => arr.reduce((t, v) => ({ n: t.n + v.n, pari: t.pari + v.pari, g5: t.g5 + v.g5, gol: t.gol + v.gol }), { n: 0, pari: 0, g5: 0, gol: 0 });
const riga = (et, v) => console.log(`${et.padEnd(34)} | ${String(v.n).padStart(5)} | ${f2(v.gol / v.n)} | ${pc(v.pari, v.n).padStart(6)} (${wil(v.pari, v.n)}) | ${pc(v.g5, v.n).padStart(6)} (${wil(v.g5, v.n)})`);

console.log('\nfonte reale: football-data.co.uk 2023/24 (mmz4281/2324/*.csv) · motore: simulazione rapida, semi del gioco, ' + STAG + ' stagioni per club');
console.log('braccio                            | partite | gol | pareggi (IC 95%) | >=5 gol (IC 95%)');
for (const [k, v] of Object.entries(REALE)) riga(`reale ${v.nome}`, v);
const R = somma(Object.values(REALE)); riga('REALE cinque campionati', R);
for (const br of BRACCI) {
  for (const [lg, v] of Object.entries(mot[br])) if (v.n) riga(`motore${br === 'rosso' ? ' (rosso 347)' : ''} ${lg}`, v);
  const M = somma(Object.values(mot[br])); riga(`MOTORE${br === 'rosso' ? ' rosso 347' : ''} totale`, M);
  console.log(`scarto motore − reale${br === 'rosso' ? ' (rosso)' : ''}: pareggi ${((100 * M.pari / M.n) - (100 * R.pari / R.n)).toFixed(1).replace('.', ',')} punti · >=5 gol ${((100 * M.g5 / M.n) - (100 * R.g5 / R.n)).toFixed(1).replace('.', ',')} punti · gol ${f2(M.gol / M.n - R.gol / R.n)}`);
  if (M.n < 2000) console.log(`⚠️ campione del motore sotto 2.000 partite (${M.n}): alzare CPM_STAG o CPM_LEGHE`);
}
fs.mkdirSync('out/quote-449', { recursive: true });
fs.writeFileSync('out/quote-449/quote.json', JSON.stringify({ reale: REALE, motore: mot, leghe: LEGHE, stagioni: STAG }, null, 1));
console.log(`errori di pagina: ${errors.length}${errors.length ? ' · ' + errors.slice(0, 2).join(' | ') : ''}`);
process.exit(errors.length && !Object.keys(mot).length ? 1 : 0);
