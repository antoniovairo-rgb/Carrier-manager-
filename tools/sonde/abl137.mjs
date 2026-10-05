import fs from 'node:fs';
const src = fs.readFileSync('/home/user/cm-poc/src/14-motore-possesso.jsx', 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + 25);
const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, { __CPM_NO_TETTO202: true });
const rows = process.argv[2].split(',').flatMap(f => JSON.parse(fs.readFileSync(f))).filter(r => r.reg && r.reg.log);
const call = (M, n, a) => { const p = n.split('.'); let o = M; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; const f = o[p[p.length - 1]]; if (typeof f === 'function') return f.apply(o, a || []); };
const conta = {}; for (const r of rows) for (const [n] of r.reg.log) conta[n] = (conta[n] | 0) + 1;
console.log('chiamate per partita', Object.fromEntries(Object.entries(conta).filter(([k]) => k !== 'tick').map(([k, v]) => [k, +(v / rows.length).toFixed(1)])));
const prova = (nome, togli) => { let ts = 0, tf = 0, gs = 0, gf = 0; for (const r of rows) { const M = crea(r.reg.cfg); for (const [n, a] of r.reg.log) { if (togli.some(t => n.startsWith(t))) continue; try { call(M, n, a); } catch (e) {} } const t = M.tabellino(); ts += t.away.tiri; tf += t.home.tiri; gs += t.away.gol; gf += t.home.gol; }
  const N = rows.length; console.log(nome.padEnd(30), 'tiri', (tf / N).toFixed(1), '-', (ts / N).toFixed(1), '· gol', (gf / N).toFixed(2), '-', (gs / N).toFixed(2)); };
prova('com\'e\'', []);
for (const t of process.argv[3] ? JSON.parse(process.argv[3]) : []) prova('senza ' + t.join('+'), t);
