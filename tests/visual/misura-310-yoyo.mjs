/* [giro 310] Riassunto delle carriere di misura-310-carriera.mjs: promozioni, retrocessioni subito dopo e entro due stagioni, prestigio,
   Europa, infortuni e squalifiche dell'eroe. node misura-310-yoyo.mjs */
import fs from 'node:fs';
const dir = 'out/misura-310'; const F = fs.readdirSync(dir).filter(f => /^carriera-.*\.json$/.test(f)).sort();
const righe = [];
for (const f of F) { const d = JSON.parse(fs.readFileSync(`${dir}/${f}`)); const S = d.stag; let prom = 0, sub = 0, due = 0, eu = null;
  for (let i = 0; i + 1 < S.length; i++) if (S[i].lg === 'Lega B' && S[i + 1].lg === 'Lega A') { prom++;
    if (S[i + 2] && S[i + 2].lg === 'Lega B') sub++; else if (S[i + 3] && S[i + 3].lg === 'Lega B') due++; }
  S.forEach((s, i) => { if (eu == null && s.euro && s.euro.comp) eu = i + 1; });
  const sum = k => S.reduce((a, s) => a + (+s[k] || 0), 0);
  righe.push({ carriera: f.replace(/^carriera-|\.json$/g, ''), stagioni: S.length, percorso: S.map(s => (s.lg === 'Lega A' ? 'A' : 'B') + s.pos + '·' + Math.round(s.base + s.shift)).join(' '),
    promozioni: prom, retroSubito: sub, retroEntroDue: sub + due, primaEuropa: eu, infortuni: sum('inj'), settFuori: sum('injW'), squalifiche: sum('susp'), voto: +(S.reduce((a, s) => a + (+s.voto || 0), 0) / S.length).toFixed(2), ovrFine: S[S.length - 1].ovr }); }
for (const r of righe) console.log(JSON.stringify(r));
const tot = (filt) => righe.filter(filt).reduce((o, r) => ({ n: o.n + 1, st: o.st + r.stagioni, prom: o.prom + r.promozioni, sub: o.sub + r.retroSubito, due: o.due + r.retroEntroDue, inj: o.inj + r.infortuni, sq: o.sq + r.squalifiche }), { n: 0, st: 0, prom: 0, sub: 0, due: 0, inj: 0, sq: 0 });
console.log('gestita verde', JSON.stringify(tot(r => /gestita/.test(r.carriera) && /verde$/.test(r.carriera))));
console.log('gestita rosso C', JSON.stringify(tot(r => /gestita/.test(r.carriera) && /rosso$/.test(r.carriera))));
console.log('trascurata', JSON.stringify(righe.filter(r => /trascurata/.test(r.carriera)).map(r => [r.carriera, r.infortuni, r.settFuori, r.stagioni])));
