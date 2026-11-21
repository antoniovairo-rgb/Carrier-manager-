/* [giro 309] SOLA MISURA, in node puro: analizza out/misura-309/motore-*.json (scritti da misura-309-motore.mjs).
   Colonne: club, stagione, giornata, settimana, casa, avv, avvP, A(gioco: h,a), B(semi indipendenti: h,a), V(come il live: h,a), P(Poisson storico: h,a), ms */
import fs from 'node:fs';
const D = 'out/misura-309'; const rows = [];
for (const f of fs.readdirSync(D).filter(f => /^motore-.*\.json$/.test(f) && !/-1-1-/.test(f))) rows.push(...JSON.parse(fs.readFileSync(`${D}/${f}`)));
const P = { A: [7, 8], B: [9, 10], V: [11, 12], P: [13, 14] };
const CP = { aug: 66, mai: 68, kol: 65, wer: 72, hof: 70 };
const out = { partite: rows.length, percorsi: {} };
const esito = (h, a) => h > a ? 'V' : h === a ? 'N' : 'P';
for (const [k, [ih, ia]] of Object.entries(P)) {
  const cnt = {}; let gf = 0, ga = 0, W = 0, Dd = 0, L = 0;
  for (const r of rows) { const s = r[ih] + '-' + r[ia]; cnt[s] = (cnt[s] || 0) + 1; gf += r[ih]; ga += r[ia]; const e = esito(r[ih], r[ia]); if (e === 'V') W++; else if (e === 'N') Dd++; else L++; }
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s, n]) => `${s} ${(100 * n / rows.length).toFixed(1)}%`);
  const H = -Object.values(cnt).reduce((a, n) => a + (n / rows.length) * Math.log2(n / rows.length), 0);
  // strisce per club-stagione
  const by = {}; rows.forEach(r => { const key = r[0] + '|' + r[1]; (by[key] = by[key] || []).push(r); });
  const st = Object.values(by).map(v => { v.sort((a, b) => a[2] - b[2]); let b = 0, c = 0, bS = 0, cS = 0, prev = null, lag = [0, 0];
    v.forEach(r => { const e = esito(r[ih], r[ia]); c = e === 'P' ? c + 1 : 0; b = Math.max(b, c); const sc = r[ih] + '-' + r[ia]; cS = sc === prev ? cS + 1 : 1; bS = Math.max(bS, cS); prev = sc; }); return [b, bS]; });
  // autocorrelazione lag-1 della sconfitta
  let n11 = 0, n1 = 0, nl = 0, nt = 0; Object.values(by).forEach(v => { for (let i = 1; i < v.length; i++) { const a = esito(v[i - 1][ih], v[i - 1][ia]) === 'P', b = esito(v[i][ih], v[i][ia]) === 'P'; if (a) { n1++; if (b) n11++; } nt++; if (b) nl++; } });
  out.percorsi[k] = { V: +(W / rows.length).toFixed(3), N: +(Dd / rows.length).toFixed(3), P: +(L / rows.length).toFixed(3), gf: +(gf / rows.length).toFixed(2), ga: +(ga / rows.length).toFixed(2), entropiaBit: +H.toFixed(2), punteggiDistinti: Object.keys(cnt).length, top,
    strisciaSconfMedia: +(st.reduce((a, x) => a + x[0], 0) / st.length).toFixed(2), quotaStagioniGe5: +(st.filter(x => x[0] >= 5).length / st.length).toFixed(3), quotaStagioniGe8: +(st.filter(x => x[0] >= 8).length / st.length).toFixed(3), maxStriscia: Math.max(...st.map(x => x[0])),
    strisciaPunteggioIdenticoMax: Math.max(...st.map(x => x[1])), strisciaPunteggioIdenticoMedia: +(st.reduce((a, x) => a + x[1], 0) / st.length).toFixed(2),
    PsconfittaDopoSconfitta: +(n11 / Math.max(1, n1)).toFixed(3), Psconfitta: +(nl / nt).toFixed(3), stagioni: st.length };
}
// RIFERIMENTO: Poisson indipendente con medie gol per (differenza di forza a gradini di 5, casa/trasferta) stimate dal percorso V e dal percorso A
function riferimento(ih, ia, forzaDi) {
  const bins = {}; rows.forEach(r => { const d = Math.round((r[6] - forzaDi(r)) / 5) * 5, key = d + '|' + r[4]; const b = bins[key] = bins[key] || [0, 0, 0, 0, 0, 0]; b[0] += r[ih]; b[1] += r[ia]; b[2]++; const e = esito(r[ih], r[ia]); b[3 + (e === 'V' ? 0 : e === 'N' ? 1 : 2)]++; });
  let s = 0x309; const R = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const pois = l => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; };
  const by = {}; rows.forEach(r => { const key = r[0] + '|' + r[1]; (by[key] = by[key] || []).push(r); });
  const cal = Object.values(by).map(v => v.sort((a, b) => a[2] - b[2]).map(r => { const d = Math.round((r[6] - forzaDi(r)) / 5) * 5; return bins[d + '|' + r[4]]; }));
  const M = 40; let tot = 0, ge5 = 0, ge8 = 0, sum = 0, ge5b = 0, ge8b = 0, sumb = 0;
  for (let m = 0; m < M; m++) for (const c of cal) { let b = 0, cc = 0, bb = 0, cb = 0;
    for (const bin of c) { const h = pois(bin[0] / bin[2]), a = pois(bin[1] / bin[2]); cc = h < a ? cc + 1 : 0; b = Math.max(b, cc);
      const pl = bin[5] / bin[2]; cb = R() < pl ? cb + 1 : 0; bb = Math.max(bb, cb); }
    tot++; sum += b; if (b >= 5) ge5++; if (b >= 8) ge8++; sumb += bb; if (bb >= 5) ge5b++; if (bb >= 8) ge8b++; }
  return { stagioniSimulate: tot, poisson: { strisciaMedia: +(sum / tot).toFixed(2), quotaGe5: +(ge5 / tot).toFixed(3), quotaGe8: +(ge8 / tot).toFixed(4) },
    bernoulliStessiEsiti: { strisciaMedia: +(sumb / tot).toFixed(2), quotaGe5: +(ge5b / tot).toFixed(3), quotaGe8: +(ge8b / tot).toFixed(4) }, bins };
}
const rifA = riferimento(7, 8, r => CP[r[0]]), rifV = riferimento(11, 12, r => CP[r[0]]);
out.riferimentoA = { ...rifA, bins: undefined }; out.riferimentoV = { ...rifV, bins: undefined };
// probabilita' di sconfitta per differenza di forza (percorso V, come il live) e la sequenza della foto
const pl = (d, casa) => { const b = rifV.bins[Math.round(d / 5) * 5 + '|' + casa]; return b ? b[5] / b[2] : null; };
const seqFoto = [['WRK', 89, 0], ['FLZ', 88, 1], ['WSF', 93, 0], ['BKP', 62, 0], ['FFT', 79, 0], ['FBL', 80, 1], ['WSR', 72, 0], ['FRB', 76, 1]];
let prod = 1; out.fotoSequenza = seqFoto.map(([a, p, c]) => { const q = pl(p - 66, c); prod *= q; return `${a}(${p},${c ? 'c' : 't'}) Psconf=${q == null ? '?' : q.toFixed(2)}`; });
out.fotoP8di8 = +prod.toExponential(2);
out.tabellaPsconfitta = Object.entries(rifV.bins).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).map(([k, b]) => `${k}: n${b[2]} V${(b[3] / b[2]).toFixed(2)} N${(b[4] / b[2]).toFixed(2)} P${(b[5] / b[2]).toFixed(2)} gf${(b[0] / b[2]).toFixed(2)} ga${(b[1] / b[2]).toFixed(2)}`);
fs.writeFileSync(`${D}/analisi-motore.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
