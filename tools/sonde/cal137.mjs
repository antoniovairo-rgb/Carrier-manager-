import fs from 'node:fs';
const src = fs.readFileSync('/home/user/cm-poc/src/14-motore-possesso.jsx', 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + 25);
const rows = ['a', 'b'].flatMap(k => JSON.parse(fs.readFileSync('rec136-' + k + '.json'))).filter(r => r.reg && r.reg.cfg);
const sim = (W, cfg) => { const M = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W)(cfg); const B = 22;
  for (let m = 1; m <= 46; m++) for (let b = 0; b < B; b++) M.tick({ min: Math.min(m, 45), dt: 1 / B, dec: true });
  M.chiedi.riprendi({ centro: true, lato: 'away' });
  for (let m = 46; m <= 93; m++) for (let b = 0; b < B; b++) M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true }); return M; };
const NS = +(process.env.NS || 10);
for (const K of (process.argv[2] || '0,1,1.5,2,2.5').split(',').map(Number)) {
  const W = { __CPM_NO_TETTO202: true, __CPM_TAL202_K: K }; const a = { n: 0, gf: 0, gs: 0, e: 0, W: 0, D: 0, L: 0, quota: 0 };
  for (const r of rows) for (let k = 1; k <= NS; k++) { const sd = ((r.reg.cfg.seed >>> 0) ^ (k * 2654435761)) >>> 0;
    const M = sim(W, Object.assign({}, r.reg.cfg, { fin202: null, occasioniV2: true, seed: sd })); const t = M.tabellino();
    const e = (M.pagelle() || []).find(x => x.eroe || x.i === M.HERO); const eg = e ? (e.gol | 0) : 0;
    a.n++; a.gf += t.home.gol; a.gs += t.away.gol; a.e += eg; if (t.home.gol > t.away.gol) a.W++; else if (t.home.gol < t.away.gol) a.L++; else a.D++; }
  const f = x => (x / a.n).toFixed(2); const pc = x => Math.round(100 * x / a.n) + '%';
  console.log(`K ${K}: gol ${f(a.gf)}-${f(a.gs)} · eroe ${f(a.e)} (${Math.round(100 * a.e / Math.max(1, a.gf))}% dei gol) · V/N/P ${pc(a.W)}/${pc(a.D)}/${pc(a.L)}`);
}
