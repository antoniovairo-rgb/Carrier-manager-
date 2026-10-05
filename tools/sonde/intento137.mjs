import fs from 'node:fs';
const src = fs.readFileSync('/home/user/cm-poc/src/14-motore-possesso.jsx', 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + 25);
const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, { __CPM_NO_TETTO202: true });
const rows = process.argv[2].split(',').filter(f => fs.existsSync(f)).flatMap(f => JSON.parse(fs.readFileSync(f))).filter(r => r.reg && r.reg.log);
const call = (M, n, a) => { const p = n.split('.'); let o = M; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; const f = o[p[p.length - 1]]; if (typeof f === 'function') return f.apply(o, a || []); };
const T = {}; const add = (k, f, v) => { T[k] = T[k] || { scene: 0, gol: 0, xg: 0, nx: 0 }; T[k][f] += v; };
for (const r of rows) { const M = crea(r.reg.cfg); let ult = 'naturale', g = null;
  for (const [n, a] of r.reg.log) { let ret; try { ret = call(M, n, a); } catch (e) {}
    if (n === 'tick' && Array.isArray(ret)) for (const e of ret) if (e && e.t === 'occasione_eroe') ult = e.origine ? e.origine.kind : 'naturale';
    if (n === 'giocaScena') { const kk = a[0].fam + '/' + (a[0].intent || '-'); add(kk, 'scene', 1); if (ret && ret.ok) add(kk, 'gol', 1); if (ret && ret.xg != null) { add(kk, 'xg', ret.xg); add(kk, 'nx', 1); } }
    if (n === 'risolviEroe.eventi') { add('TUTTE', 'scene', 1); if (a && (a[0] === 'goal')) add('TUTTE', 'gol', 1); } } }
const N = rows.length; for (const [k, v] of Object.entries(T)) console.log(k.padEnd(10), 'scene', (v.scene / N).toFixed(2), '· gol eroe', (v.gol / N).toFixed(2), '· gol per scena', (v.gol / Math.max(1, v.scene)).toFixed(2), '· xG medio (con talento)', (v.xg / Math.max(1, v.nx)).toFixed(3));
