#!/usr/bin/env node
/* [giro 34] SOLO COLLAUDO: legge i log di nomi-219 (c1.log, c2.log, ... + cN.start) in una cartella, stampa le corse e ricampiona per seme (bootstrap 20 000 corse) le forme del guardiano: rossi falsi a corsa e percentili. Uso: node nomi-219-ricampiona.mjs <cartella dei log> */
import fs from 'node:fs'; const D = process.argv[2]; const corse = [];
for (const f of fs.readdirSync(D).filter(f => /^c\d+\.log$/.test(f)).sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1)))) {
  const t = fs.readFileSync(D + '/' + f, 'utf8'); const r = { f, verde: [], rosso: [] };
  for (const m of t.matchAll(/^(verde|rosso) seme (\d+) fine \S+ nominati (\d+) vicini (\d+) lontani (\d+)/gm)) r[m[1]].push({ sd: +m[2], n: +m[3], v: +m[4], l: +m[5] });
  const fine = t.match(/FINE (\d+) (\d+)/); const st = fs.existsSync(D + '/' + f.replace('.log', '.start')) ? +fs.readFileSync(D + '/' + f.replace('.log', '.start'), 'utf8') : 0;
  r.esito = fine ? +fine[1] : null; r.min = fine && st ? ((+fine[2] - st) / 60).toFixed(1) : '?'; r.ver = (t.match(/[✅❌].*/) || [''])[0]; corse.push(r); }
const sum = (a, k) => a.reduce((x, y) => x + y[k], 0);
for (const r of corse) { const V = r.verde, R = r.rosso; console.log(r.f, 'verde', sum(V,'v') + '/' + sum(V,'n'), (100*sum(V,'v')/Math.max(1,sum(V,'n'))).toFixed(1) + '%', 'lont', sum(V,'l'), '| rosso', sum(R,'v') + '/' + sum(R,'n'), (100*sum(R,'v')/Math.max(1,sum(R,'n'))).toFixed(1) + '%', 'lont', sum(R,'l'), '|', r.min, 'min', r.esito, r.ver); }
const PV = corse.flatMap(r => r.verde), PR = corse.flatMap(r => r.rosso);
console.log('POOL verde', sum(PV,'v') + '/' + sum(PV,'n'), 'partite', PV.length, 'lontani', sum(PV,'l'), '| rosso', sum(PR,'v') + '/' + sum(PR,'n'), 'partite', PR.length, 'lontani', sum(PR,'l'));
// forma: {nv, nr, soglia, minNom, sep, lontMin}
const forma = (nv, nr, so, mn, sep, lm, guardaLontVerde) => { let fv = 0, rp = 0, N = 20000; const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  for (let i = 0; i < N; i++) { const v = Array.from({ length: nv }, () => rnd(PV)), r = Array.from({ length: nr }, () => rnd(PR)), rr = Array.from({ length: nv }, () => rnd(PR));
    const q = (a) => sum(a,'n') ? sum(a,'v') / sum(a,'n') : 0;
    const okV = sum(v,'n') >= mn && q(v) >= so; const okSep = (q(v) - q(r) >= sep) || sum(r,'l') >= lm;
    if (!(okV && okSep)) fv++;
    // un verde che gioca come il rosso: passerebbe?
    if (sum(rr,'n') >= mn && q(rr) >= so) rp++; }
  return { falsiRossi: (100 * fv / N).toFixed(1) + '%', rossoPassa: (100 * rp / N).toFixed(1) + '%' }; };
if (PV.length && PR.length) for (const [nv, nr, so, mn] of [[18,9,.75,12],[18,9,.75,20],[21,9,.75,20],[24,9,.75,20],[27,9,.75,12],[36,9,.75,12],[27,9,.70,12],[36,12,.70,15],[24,9,.75,12]]) console.log('forma', nv + '+' + nr, 'soglia', so, 'min', mn, JSON.stringify(forma(nv, nr, so, mn, .20, 1)));
if (PV.length && PR.length) { console.log('forma VECCHIA (giro 22) 8+8 soglia 0.90 min 12, rosso solo distacco 20', JSON.stringify(forma(8, 8, .90, 12, .20, Infinity)));
  console.log('forma attuale ma rosso SOLO distacco 20', JSON.stringify(forma(18, 9, .75, 12, .20, Infinity)));
  const pc = (a, p) => a.slice().sort((x, y) => x - y)[Math.floor(p * (a.length - 1))]; const rnd = (a) => a[Math.floor(Math.random() * a.length)]; const qv = [], qr = [], nv = [], lr = [];
  for (let i = 0; i < 20000; i++) { const v = Array.from({ length: 18 }, () => rnd(PV)), r = Array.from({ length: 9 }, () => rnd(PR)); nv.push(sum(v,'n')); qv.push(sum(v,'v') / Math.max(1, sum(v,'n'))); qr.push(sum(r,'v') / Math.max(1, sum(r,'n'))); lr.push(sum(r,'l')); }
  console.log('attuale, percentili 1/5/50 verde quota', [.01,.05,.5].map(p => (100*pc(qv,p)).toFixed(1)).join('/'), '· nominati verde 1/5%', pc(nv,.01), pc(nv,.05), '· rosso quota 50/95/99', [.5,.95,.99].map(p => (100*pc(qr,p)).toFixed(1)).join('/'), '· rosso lontani 1/5%', pc(lr,.01), pc(lr,.05)); }
