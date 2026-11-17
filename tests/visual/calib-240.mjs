/* [giro 240] taratura di RESA240: dal file di una misura (CPM_MISURA=1) la correzione per canale, in lineare, che porta il viso reso
   sul viso della figurina (mediana sui corpi). Uso: node calib-240.mjs [file] [resa attuale r,g,b] */
import fs from 'node:fs';
const J = JSON.parse(fs.readFileSync(process.argv[2] || 'out/g240/pelle-240.json')), cur = (process.argv[3] || '1,1,1').split(',').map(Number);
const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }, med = a => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
for (const br of ['verde', 'rosso']) { const R = J[br]; if (!R) continue; for (const sc in R.scene) { const S = R.scene[sc]; if (!S || !S.corpi) continue; const C = S.corpi.filter(c => c.fig && c.viso && c.reso && c.reso[0] < 250); if (!C.length) continue;
    const G = process.env.GRUPPI ? [...new Set(C.map(c => c.ruolo))] : [null]; for (const gr of G) { const D = gr ? C.filter(c => c.ruolo === gr) : C; const k = [0, 1, 2].map(i => med(D.map(c => f(c.viso[i]) / f(c.reso[i])))); console.log(br, sc, gr || '', 'corpi', D.length, 'fattore', k.map(x => x.toFixed(3)).join(','), '→ RESA', k.map((x, i) => (x * cur[i]).toFixed(3)).join(',')); } } }
