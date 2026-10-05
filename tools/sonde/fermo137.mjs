import fs from 'node:fs';
const src = fs.readFileSync('/home/user/cm-poc/src/14-motore-possesso.jsx', 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + 25);
const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, { __CPM_NO_TETTO202: true });
const rows = process.argv[2].split(',').flatMap(f => JSON.parse(fs.readFileSync(f))).filter(r => r.reg && r.reg.log);
const call = (M, n, a) => { const p = n.split('.'); let o = M; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; const f = o[p[p.length - 1]]; if (typeof f === 'function') return f.apply(o, a || []); };
let tot = 0, fermi = 0, dtF = 0, possH = 0, possA = 0, ori = 0;
for (const r of rows) { const M = crea(r.reg.cfg); for (const [n, a] of r.reg.log) { if (n === 'tick') { tot++; if (M._S.scena) { fermi++; dtF += (a[0] && a[0].dt) || 0; } else { if (M._S.poss && M._S.poss.lato === 'home') possH++; else possA++; } if (M._S.richieste && M._S.richieste.origini) ori++; } try { call(M, n, a); } catch (e) {} } }
const N = rows.length; console.log('battiti per partita', (tot / N).toFixed(0), '· in scena (fermi)', (fermi / N).toFixed(0), '· minuti fermi', (dtF / N).toFixed(1), '· possesso nei battiti giocati casa/trasferta', (100 * possH / (possH + possA)).toFixed(1) + '%', '· battiti con origini richieste', (100 * ori / tot).toFixed(0) + '%');
