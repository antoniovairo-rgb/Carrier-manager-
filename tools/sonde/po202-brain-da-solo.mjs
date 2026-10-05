// PO-202, 05/10: le partite vissute registrate (rec136-*.json, __CPM_REG202) rigiocate in node in quattro bracci.
//  V   = la vissuta com'e' (rigiocata dal registro: deve coincidere col tabellino registrato)
//  V0  = la vissuta senza la leva fin202 (le altre correzioni sono nelle chiamate registrate e restano)
//  B1  = IL BRAIN DA SOLO: stessa configurazione della partita vera (giocatori, forze, tattiche, seme), senza fin202,
//        occasioni dell'eroe decise ed eseguite dal motore (occasioniV2), battiti come la simulazione rapida
//  B0  = come B1 ma senza occasioni dell'eroe
import fs from 'node:fs';
const D = '/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/';
const src = fs.readFileSync('/home/user/cm-poc/src/14-motore-possesso.jsx', 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + 25);
const crea = (W) => Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W);
const files = (process.argv[2] || 'rec136-a.json,rec136-b.json').split(',');
const rows = files.filter(f => fs.existsSync(D + f)).flatMap(f => JSON.parse(fs.readFileSync(D + f))).filter(r => r.reg && r.reg.cfg && r.reg.log);
const call = (M, n, a) => { const p = n.split('.'); let o = M; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; const f = o[p[p.length - 1]]; if (typeof f === 'function') return f.apply(o, a || []); };
const replay = (cfg, log) => { const M = crea({ __CPM_NO_TETTO202: true })(cfg); for (const [n, a] of log) { try { call(M, n, a); } catch (e) {} } return M; };
let _occ = 0; const tk = (M, o) => { const e = M.tick(o); if (Array.isArray(e)) for (const x of e) if (x && x.t === 'occasione_eroe') _occ++; };
const sim = (cfg) => { _occ = 0; const M = crea({ __CPM_NO_TETTO202: true })(cfg); const B = 22;
  for (let m = 1; m <= 46; m++) for (let b = 0; b < B; b++) tk(M, { min: Math.min(m, 45), dt: 1 / B, dec: true });
  M.chiedi.riprendi({ centro: true, lato: 'away' });
  for (let m = 46; m <= 93; m++) for (let b = 0; b < B; b++) tk(M, { min: Math.min(m, 90), dt: 1 / B, dec: true }); M._occ = _occ; return M; };
const somma = () => ({ occ: 0, n: 0, gf: 0, gs: 0, tf: 0, ts: 0, W: 0, D: 0, L: 0, scarto: 0, eroeGol: 0 });
const add = (a, M, occ) => { const t = M.tabellino(); a.n++; a.occ += (occ != null ? occ : (M._occ | 0)); a.gf += t.home.gol; a.gs += t.away.gol; a.tf += t.home.tiri; a.ts += t.away.tiri; a.scarto += t.home.gol - t.away.gol;
  if (t.home.gol > t.away.gol) a.W++; else if (t.home.gol < t.away.gol) a.L++; else a.D++;
  try { const pg = M.pagelle ? M.pagelle() : []; const e = pg.find(x => x.eroe || x.i === M.HERO); if (e) a.eroeGol += (e.gol | 0); } catch (e) {} };
const out = (nome, a) => { const f = k => +(a[k] / a.n).toFixed(2); console.log(nome.padEnd(44), `gol ${f('gf')}-${f('gs')} · tiri ${f('tf')}-${f('ts')} · V/N/P ${a.W}/${a.D}/${a.L} · scarto ${f('scarto')} · gol eroe ${f('eroeGol')} · scene/occasioni eroe ${f('occ')}`); };
const A = { V: somma(), V0: somma(), B1: somma(), B0: somma(), B1x: somma(), B0x: somma() }; const NS = +(process.env.NS || 20); let uguali = 0;
for (const r of rows) {
  const nSc = r.reg.log.filter(([n]) => n === 'risolviEroe.eventi').length; const M = replay(r.reg.cfg, r.reg.log); add(A.V, M, nSc);
  const t = M.tabellino(); if (r.tab && r.tab.home && t.home.gol === r.tab.home.gol && t.away.gol === r.tab.away.gol && t.home.tiri === r.tab.home.tiri) uguali++;
  add(A.V0, replay(Object.assign({}, r.reg.cfg, { fin202: null }), r.reg.log), nSc);
  add(A.B1, sim(Object.assign({}, r.reg.cfg, { fin202: null, occasioniV2: true })));
  add(A.B0, sim(Object.assign({}, r.reg.cfg, { fin202: null, occasioniV2: false })));
  for (let k = 1; k <= NS; k++) { const sd = ((r.reg.cfg.seed >>> 0) ^ (k * 2654435761)) >>> 0; add(A.B1x, sim(Object.assign({}, r.reg.cfg, { fin202: null, occasioniV2: true, seed: sd }))); add(A.B0x, sim(Object.assign({}, r.reg.cfg, { fin202: null, occasioniV2: false, seed: sd }))); }
}
console.log('partite', rows.length, '· rigiocate identiche al registrato', uguali);
out('V   vissuta com\'e\'', A.V); out('V0  vissuta senza fin202', A.V0); out('B1  brain da solo (occasioni eroe nel motore)', A.B1); out('B0  brain da solo, senza occasioni eroe', A.B0); out('B1x brain da solo, ' + NS + ' semi per partita', A.B1x); out('B0x senza eroe, ' + NS + ' semi per partita', A.B0x);
