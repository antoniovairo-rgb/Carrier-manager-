/* [giro 347 PO-599] analisi delle uscite di misura-347.mjs. node misura-347-analisi.mjs out/misura-347/prima-*.json [--braccio rosso] [--md] */
import fs from 'node:fs';
const args = process.argv.slice(2); const MD = args.includes('--md');
const bi = args.indexOf('--braccio'); const SOLO = bi >= 0 ? args[bi + 1] : null;
const files = args.filter((a, i) => a.endsWith('.json') && args[i - 1] !== '--braccio');
const per = {}; // braccio -> righe
for (const f of files) { const d = JSON.parse(fs.readFileSync(f, 'utf8')); for (const [b, rows] of Object.entries(d)) { if (SOLO && b !== SOLO) continue; (per[b] = per[b] || []).push(...rows); } }
const f2 = (x, n = 2) => (+x).toFixed(n).replace('.', ',');
function stat(rows) {
  const N = rows.length; let g = 0, xg = 0, tiri = 0, pari = 0, casa = 0, fuori = 0, sc = {}, yH = 0, yA = 0, rH = 0, rA = 0, yE = 0, rE = 0;
  const fasce = { '0-4': [0, 0, 0], '5-9': [0, 0, 0], '10-19': [0, 0, 0], '20+': [0, 0, 0] }; let ptsF = 0, ptsD = 0, nFD = 0, dgF = 0;
  let sxy = 0, sxx = 0; // pendenza: differenza reti (casa-ospite dal lato eroe) contro differenza di prestigio
  const stag = {};
  for (const r of rows) { const [lg, id, s, md, isH, p, op, hs, as, ah, aa, eh, ea, xh, xa, th, ta, ye, re] = r;
    const tot = hs + as; g += tot; xg += xh + xa; tiri += th + ta; yH += ah; yA += aa; rH += eh; rA += ea; yE += ye; rE += re;
    const k = Math.max(hs, as) + '-' + Math.min(hs, as); sc[k] = (sc[k] || 0) + 1;
    if (hs === as) pari++; else { const realeCasaVince = isH ? hs > as : as > hs; if (realeCasaVince) casa++; else fuori++; }
    const d = p - op, ad = Math.abs(d); const fb = ad < 5 ? '0-4' : ad < 10 ? '5-9' : ad < 20 ? '10-19' : '20+';
    if (d !== 0) { const fs_ = d > 0 ? hs : as, ds = d > 0 ? as : hs; fasce[fb][fs_ > ds ? 0 : fs_ === ds ? 1 : 2]++;
      if (ad >= 10) { nFD++; ptsF += fs_ > ds ? 3 : fs_ === ds ? 1 : 0; ptsD += ds > fs_ ? 3 : fs_ === ds ? 1 : 0; dgF += fs_ - ds; } }
    sxy += d * (hs - as); sxx += d * d;
    const sk = lg + '|' + id + '|' + s; (stag[sk] = stag[sk] || []).push([md, hs, as]); }
  // strisce
  let sumMax = 0, ge5 = 0, ge8 = 0, ns = 0, LL = 0, Lp = 0, Ltot = 0, Ntot = 0, idMax = 0, idGe5 = 0, distinti = 0;
  for (const arr of Object.values(stag)) { arr.sort((a, b) => a[0] - b[0]); let c = 0, m = 0, prevL = false, ci = 0, mi = 0, prevE = null; const ds = new Set();
    for (const [, hs, as] of arr) { const L = hs < as; Ntot++; if (L) Ltot++; if (prevL) { Lp++; if (L) LL++; } prevL = L; c = L ? c + 1 : 0; m = Math.max(m, c);
      const e = hs + '-' + as; ds.add(e); ci = e === prevE ? ci + 1 : 1; prevE = e; mi = Math.max(mi, ci); }
    ns++; sumMax += m; if (m >= 5) ge5++; if (m >= 8) ge8++; idMax += mi; if (mi >= 3) idGe5++; distinti += ds.size; }
  const top = Object.entries(sc).sort((a, b) => b[1] - a[1]); let H = 0; for (const [, v] of top) { const q = v / N; H -= q * Math.log2(q); }
  const q = k => 100 * (sc[k] || 0) / N; let ge5g = 0; for (const [k, v] of top) { const [a, b] = k.split('-').map(Number); if (a + b >= 5) ge5g += v; }
  return { N, gol: g / N, xg: xg / N, tiri: tiri / N, pari: 100 * pari / N, casa: 100 * casa / N, fuori: 100 * fuori / N,
    s00: q('0-0'), s10: q('1-0'), s11: q('1-1'), s20: q('2-0'), s21: q('2-1'), s22: q('2-2'), s30: q('3-0'), s31: q('3-1'), g5: 100 * ge5g / N,
    distinti: top.length, H, fasce, ptsF: ptsF / nFD, ptsD: ptsD / nFD, dgF: dgF / nFD, nFD, pend: sxy / sxx,
    strMax: sumMax / ns, str5: 100 * ge5 / ns, str8: 100 * ge8 / ns, pLL: LL / Lp, pL: Ltot / Ntot, idMax: idMax / ns, distStag: distinti / ns,
    yH: yH / N, yA: yA / N, rH: rH / N, rA: rA / N, yE: yE / N, rE: rE / N };
}
const res = {};
for (const [b, rows] of Object.entries(per)) { res[b] = { tutte: stat(rows) }; const lgs = [...new Set(rows.map(r => r[0]))];
  for (const lg of lgs) res[b][lg] = stat(rows.filter(r => r[0] === lg)); }
fs.writeFileSync('out/misura-347/analisi.json', JSON.stringify(res, null, 1));
for (const [b, R] of Object.entries(res)) { console.log(`\n=== braccio ${b} ===`);
  console.log('lega | partite | gol | xG | tiri | 0-0 | 1-0 | 1-1 | 2-1 | ≥5 gol | pareggi | V casa | V fuori | forte: punti | debole: punti | pendenza dr/forza');
  for (const [lg, s] of Object.entries(R)) console.log(`${lg} | ${s.N} | ${f2(s.gol)} | ${f2(s.xg)} | ${f2(s.tiri, 1)} | ${f2(s.s00, 1)}% | ${f2(s.s10, 1)}% | ${f2(s.s11, 1)}% | ${f2(s.s21, 1)}% | ${f2(s.g5, 1)}% | ${f2(s.pari, 1)}% | ${f2(s.casa, 1)}% | ${f2(s.fuori, 1)}% | ${f2(s.ptsF)} | ${f2(s.ptsD)} | ${f2(s.pend, 3)}`);
  const t = R.tutte; console.log('fasce di differenza (V/N/P della piu\' forte, %):', Object.entries(t.fasce).map(([k, v]) => { const n = v[0] + v[1] + v[2]; return `${k}: ${f2(100 * v[0] / n, 1)}/${f2(100 * v[1] / n, 1)}/${f2(100 * v[2] / n, 1)} (n ${n})`; }).join(' · '));
  console.log(`strisce di sconfitte: media max ${f2(t.strMax)} · ≥5 ${f2(t.str5, 1)}% · ≥8 ${f2(t.str8, 1)}% · P(S|S) ${f2(t.pLL, 3)} contro P(S) ${f2(t.pL, 3)}`);
  console.log(`stampo: punteggi distinti ${t.distinti} · entropia ${f2(t.H)} bit · per stagione ${f2(t.distStag, 1)} distinti · striscia di punteggio identico ${f2(t.idMax)}`);
  console.log(`cartellini a partita: gialli eroe-squadra ${f2(t.yH)} · avversario ${f2(t.yA)} · rossi ${f2(t.rH, 3)}/${f2(t.rA, 3)} · gialli eroe ${f2(t.yE, 3)} · rossi eroe ${f2(t.rE, 4)}`);
  console.log(`altri punteggi: 2-0 ${f2(t.s20, 1)}% · 2-2 ${f2(t.s22, 1)}% · 3-0 ${f2(t.s30, 1)}% · 3-1 ${f2(t.s31, 1)}%`); }
