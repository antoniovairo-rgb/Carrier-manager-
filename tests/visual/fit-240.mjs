/* [giro 240] taratura: per canale, il fattore che serve in funzione del bersaglio. F = resa·lin(viso)/lin(reso); log F = log k − a·log lin(viso) */
import fs from 'node:fs';
const [file, sc, resaS, aS] = process.argv.slice(2); const J = JSON.parse(fs.readFileSync(file)), resa = resaS.split(',').map(Number), aFix = aS ? aS.split(',').map(Number) : null;
const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const C = J.verde.scene[sc].corpi.filter(c => c.fig && c.viso && c.reso && c.reso[0] < 250 && (!process.env.RUOLO || c.ruolo === process.env.RUOLO)); const out = { k: [], a: [] };
for (let i = 0; i < 3; i++) { const X = C.map(c => Math.log(f(c.viso[i]))), Y = C.map(c => Math.log(resa[i] * Math.pow(f(c.viso[i]), aFix ? -0 : 0) * f(c.viso[i]) / f(c.reso[i]))); const n = X.length, mx = X.reduce((s, x) => s + x, 0) / n, my = Y.reduce((s, x) => s + x, 0) / n;
  let a; if (aFix) a = aFix[i]; else { let sxy = 0, sxx = 0; for (let j = 0; j < n; j++) { sxy += (X[j] - mx) * (Y[j] - my); sxx += (X[j] - mx) ** 2; } a = -sxy / sxx; }
  out.a.push(+a.toFixed(3)); out.k.push(+Math.exp(my + a * mx).toFixed(3)); }
console.log(sc, 'corpi', C.length, 'k', out.k.join(','), 'a', out.a.join(','));
