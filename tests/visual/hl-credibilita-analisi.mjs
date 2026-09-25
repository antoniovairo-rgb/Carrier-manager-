#!/usr/bin/env node
/* Analisi dei campioni di hl-credibilita.mjs. Metri: x logico × 1,05, y logico × 0,68 (campo 0-100 su 105 × 68 m).
   Tre domande del PO: (1) passaggi a vuoto, (2) compagni fermi o sbagliati, (3) difensori finti. */
import fs from 'fs';
const D = JSON.parse(fs.readFileSync(process.argv[2] || 'out/hl-credibilita.json', 'utf8'));
const M = (x, y) => [x * 1.05, y * 0.68], dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return +s[s.length >> 1].toFixed(2); };
const pct = (n, d) => d ? +(100 * n / d).toFixed(1) : null;
const W2L = (wx, wz) => [wx + 50, wz / 0.68 + 50];
const perFase = {};
let voli = [], comp = { campioni: 0, fermi: 0, avanti: 0, indietro: 0, liberi: [], smarcati0: 0, frames: 0 }, dif = { frames: 0, distPort: [], senzaPressione: 0, chiude: 0, apre: 0, fermi: 0, camp: 0 }, scene = 0;
for (const camp of D) {
  // scene: salto di tempo > 1,5 s
  let sc = []; const tutte = [];
  for (const f of camp) { if (sc.length && f.t - sc[sc.length - 1].t > 1500) { tutte.push(sc); sc = []; } sc.push(f); } if (sc.length) tutte.push(sc);
  for (const S of tutte) {
    scene++;
    const corpi = f => f.P.map((p, i) => ({ i, team: p[0], gk: p[1], m: M(p[2], p[3]) })).concat([{ i: 21, team: 1, gk: 0, m: M(f.H[0], f.H[1]), eroe: 1 }]);
    const dirOf = f => { const g = f.P.find(p => p[0] === 1 && p[1]); return g && g[2] > 50 ? -1 : 1; };
    // (1) voli
    for (let k = 1; k < S.length; k++) {
      const a = S[k].arc, p = S[k - 1].arc;
      const nuovo = a && (!p || Math.abs(a[0] - p[0]) > 0.5 || Math.abs(a[1] - p[1]) > 0.5 || a[2] < p[2]);
      if (!nuovo) continue;
      const f0 = S[k - 1], C0 = corpi(f0), b0 = M(f0.B[0], f0.B[1]);
      const pass = C0.reduce((m, c) => (!m || dist(c.m, b0) < dist(m.m, b0)) ? c : m, null);
      const T = M(...W2L(a[0], a[1]));
      if (T[0] > 104 || T[0] < 1) continue; /* verso lo specchio: e' un tiro */
      let j = k; while (j < S.length && S[j].arc && Math.abs(S[j].arc[0] - a[0]) < 0.5 && Math.abs(S[j].arc[1] - a[1]) < 0.5) j++;
      if (j >= S.length) continue;
      const f1 = S[Math.min(j + 1, S.length - 1)], C1 = corpi(f1), b1 = M(f1.B[0], f1.B[1]);
      const ric = C1.filter(c => c !== undefined).reduce((m, c) => (!m || dist(c.m, b1) < dist(m.m, b1)) ? c : m, null);
      const compT = C0.filter(c => c.team === pass.team && c.i !== pass.i && !c.gk).reduce((m, c) => Math.min(m, dist(c.m, T)), 1e9);
      const avvT = C0.filter(c => c.team !== pass.team && c.team).reduce((m, c) => Math.min(m, dist(c.m, T)), 1e9);
      const dir = dirOf(f0) * (pass.team === 1 ? 1 : -1);
      voli.push({ ht: S[k].ht, bg: !S[k].ht, lung: +dist(b0, T).toFixed(1), avanti: +((T[0] - b0[0]) * dir).toFixed(1), compagnoAlBersaglio: +compT.toFixed(1), avversarioAlBersaglio: +avvT.toFixed(1),
        ricevente: ric && dist(ric.m, b1) < 2.5 ? (ric.team === pass.team ? 'compagno' : 'avversario') : 'nessuno', distRic: ric ? +dist(ric.m, b1).toFixed(1) : null, passaDaEroe: !!pass.eroe });
    }
    // (2)(3) movimento
    for (let k = 1; k < S.length; k++) {
      const f0 = S[k - 1], f1 = S[k], dt = (f1.t - f0.t) / 1000; if (dt <= 0.05 || dt > 0.6) continue;
      const C0 = corpi(f0), C1 = corpi(f1), b = M(f1.B[0], f1.B[1]);
      const port = C1.reduce((m, c) => (!m || dist(c.m, b) < dist(m.m, b)) ? c : m, null); if (!port || dist(port.m, b) > 2) continue;
      if (port.team !== 1) continue; /* solo quando la squadra dell'eroe ha il pallone */
      const dir = dirOf(f1);
      comp.frames++;const PF = perFase[f1.ph] || (perFase[f1.ph] = { fr: 0, cF: 0, cN: 0, dF: 0, dN: 0, press: 0 }); PF.fr++;
      for (const c of C1) {
        if (c.gk || c.eroe || c.i === port.i) continue; const c0 = C0.find(x => x.i === c.i); const v = dist(c.m, c0.m) / dt; const dB = dist(c.m, b);
        if (c.team === 1 && dB < 35) { comp.campioni++; PF.cN++; if (v < 0.5) PF.cF++; if (v < 0.5) comp.fermi++; else if ((c.m[0] - c0.m[0]) * dir > 0) comp.avanti++; else comp.indietro++;
          const libero = C1.filter(o => o.team === 2).reduce((m, o) => Math.min(m, dist(o.m, c.m)), 1e9); comp.liberi.push(libero); }
        if (c.team === 2 && dB < 35) { dif.camp++; PF.dN++; if (v < 0.5) { dif.fermi++; PF.dF++; } }
      }
      const opts = C1.filter(c => c.team === 1 && !c.gk && c.i !== port.i && dist(c.m, b) > 5 && dist(c.m, b) < 30 && C1.filter(o => o.team === 2).every(o => dist(o.m, c.m) > 4)).length;
      if (opts === 0) comp.smarcati0++;
      dif.frames++;
      const near = C1.filter(c => c.team === 2 && !c.gk).reduce((m, c) => (!m || dist(c.m, port.m) < dist(m.m, port.m)) ? c : m, null);
      if (near) { const d1 = dist(near.m, port.m); dif.distPort.push(d1); if (d1 > 5) { dif.senzaPressione++; PF.press++; }
        const n0 = C0.find(x => x.i === near.i), p0 = C0.find(x => x.i === port.i); if (n0 && p0) { const d0 = dist(n0.m, p0.m); if (d1 < d0 - 0.05) dif.chiude++; else if (d1 > d0 + 0.05) dif.apre++; } }
    }
  }
}
const pas = voli.filter(v => v.lung > 4 && !/shot|penalty|freekick|header/.test(v.ht || ''));
const R = {
  scene, voli: pas.length,
  passaggi: { aVuoto: pct(pas.filter(v => v.ricevente === 'nessuno').length, pas.length), agliAvversari: pct(pas.filter(v => v.ricevente === 'avversario').length, pas.length), alCompagno: pct(pas.filter(v => v.ricevente === 'compagno').length, pas.length),
    bersaglioSenzaCompagnoEntro3m: pct(pas.filter(v => v.compagnoAlBersaglio > 3).length, pas.length), avversarioPiuVicinoAlBersaglio: pct(pas.filter(v => v.avversarioAlBersaglio < v.compagnoAlBersaglio).length, pas.length),
    indietro: pct(pas.filter(v => v.avanti < -3).length, pas.length), lunghezzaMediana: med(pas.map(v => v.lung)), perTipo: pas.reduce((o, v) => { const k = v.ht || 'cronaca'; o[k] = (o[k] | 0) + 1; return o; }, {}) },
  compagni: { fotogrammi: comp.frames, fermi: pct(comp.fermi, comp.campioni), avanti: pct(comp.avanti, comp.campioni), indietro: pct(comp.indietro, comp.campioni), distanzaMedianaDalMarcatore: med(comp.liberi), fotogrammiSenzaUnCompagnoLibero: pct(comp.smarcati0, comp.frames) },
  difensori: { fotogrammi: dif.frames, distanzaMedianaDalPortatore: med(dif.distPort), portatoreSenzaNessunoEntro5m: pct(dif.senzaPressione, dif.frames), ilPiuVicinoChiude: pct(dif.chiude, dif.frames), ilPiuVicinoSiAllontana: pct(dif.apre, dif.frames), avversariFermiEntro35m: pct(dif.fermi, dif.camp) },
  perFase: Object.fromEntries(Object.entries(perFase).map(([k, v]) => [k, { fotogrammi: v.fr, compagniFermi: pct(v.cF, v.cN), avversariFermi: pct(v.dF, v.dN), portatoreLibero5m: pct(v.press, v.fr) }])),
  esempiVoli: pas.slice(0, 12)
};
console.log(JSON.stringify(R, null, 1));
fs.writeFileSync('out/hl-credibilita-analisi.json', JSON.stringify(R, null, 1));
