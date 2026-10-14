/* [7.999.161 PO-228 guardiano] PASSAGGI E CROSS VERSO IL REALE, IL RESTO FERMO (decisione PO 12/10, docs/governo/DECISIONI.md;
   seconda decisione PO «adotta e correggi i gol eroe»: obiettivo ~814 passaggi, gol dell'eroe come prima).
   Banco Node, niente browser: carica il motore da src/14-motore-possesso.jsx e gioca N partite con la procedura di
   simulaPartitaMotore (22 decisioni al minuto, ripresa dal centro, occasioni dell'eroe risolte dal motore), sugli stessi semi
   in due bracci: verde = motore com'e' · rosso = __CPM_NO_PASS228 (il motore di prima, che fa da base per le tolleranze).
   VERDE se: passaggi a partita (due squadre) in 800-950 · cross in 20-30 · tiri entro ±5 % della base · gol entro ±8 % ·
   xG entro ±6 % · possesso della squadra dell'eroe entro ±5 % · tiri dell'eroe entro ±8 % · gol dell'eroe entro ±10 % piu'
   2,5 errori standard della differenza (calcolati sulle partite stesse).
   [giro 16, «stabile, non al limite»] MISURATO il rumore: a N=1000 l'errore standard della differenza relativa e' ±12,9 % sui
   gol dell'eroe e ±10,1 % sul suo xG (sd per partita 0,34 e 0,27 su una media di 0,13): la vecchia soglia fissa ±10 % a N=1000
   era una moneta — sullo stesso motore 1000 partite davano -9,9 % · -14,0 % · -12,3 % · +23,2 % secondo la serie di semi, e a
   N=4000 ancora -0,6 % · +0,4 % · +16,4 %. Media delle tre serie da 4000 (12.000 partite): gol dell'eroe 0,125 -> 0,132 (+5 %),
   tiri dell'eroe 0,48 -> 0,49. Ora N=4000 di default (~3 minuti), i tiri dell'eroe (molto meno rumorosi) con soglia stretta e
   i gol dell'eroe con la soglia statistica: a N=4000 l'errore e' ~6,5 %, la tolleranza ~26 %, che cattura un crollo come quello
   del primo taglio (0,12 -> 0,09) al limite, ma i tiri dell'eroe, che allora scendevano da 0,51 a 0,41 (-20 %), lo catturano
   con margine. Prova: CPM_NOEROE=1 spegne nel braccio verde la sola regola _eroeDavanti228 (__CPM_NO_EROE228) e deve dare ROSSO.
   Quattro processi in parallelo (worker_threads); semi fissi, quindi l'esito e' deterministico finche' il motore non cambia.
   MISURATO alla consegna (N=3000, 7.999.161): passaggi 429,5 -> 804,9 · cross 42,7 -> 28,8 · tiri +2,6 % · gol +2,8 % · xG +1,5 % ·
   possesso eroe -3,3 % · gol dell'eroe 0,123 -> 0,126 (+2,7 %).
   Uso: node statistiche-228.mjs              (N=4000, ~3 minuti)
        CPM_ROSSO=1 node statistiche-228.mjs  (solo il braccio rosso: deve dare passaggi sotto 500, ed esce 0 se e' cosi')
        N=1500 SEED0=777 node statistiche-228.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

if (!isMainThread) {
  const SRC = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
  const CODE = SRC.slice(SRC.indexOf('/* CMAV-SRC-HEADER-END */') + 26);
  const W = workerData.rosso ? { __CPM_NO_PASS228: true } : (process.env.CPM_NOEROE === '1' ? { __CPM_NO_EROE228: true } : {});
  const crea = Function('decideExecution', 'window', CODE + '\nreturn creaMotorePossesso;')(undefined, W);
  const P = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
  const Q = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
  const R = i => i === 0 ? 'GK' : i <= 4 ? 'DF' : i <= 7 ? 'MF' : 'AT';
  const S = { n: 0, passaggi: 0, cross: 0, tiri: 0, gol: 0, xg: 0, poss: 0, golEroe: 0, tiriEroe: 0, xgEroe: 0, golEroe2: 0, xgEroe2: 0, tiriEroe2: 0 };
  for (const k of workerData.ks) {/* stessa procedura di simulaPartitaMotore (src/14), piu' le pagelle per i gol dell'eroe */
    const gio = P.map((p, i) => ({ team: 'home', gk: !!p[2], name: 'H' + (i + 1), rl: R(i), x: p[0], y: p[1] })).concat(Q.map((p, i) => ({ team: 'away', gk: !!p[2], name: 'A' + (i + 1), rl: R(i), x: p[0], y: p[1] })));
    const xgPrima = S.xgEroe;
    const M = crea({ v2: true, occasioniV2: true, seed: ((workerData.seed0 + k * 7919) >>> 0) || 7, stadio: k % 2 ? 'away' : 'home', giocatori: gio,
      eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 70 }, forza: { home: 60 + ((k * 7) % 21), away: 60 + ((k * 13) % 21) }, tattica: null, lato: 'home' });
    const tk = (o) => { const es = M.tick(o) || []; for (const e of es) if (e.t === 'tiro' && e.chi && e.chi.eroe) S.xgEroe += +e.xg || 0; };
    for (let m = 1; m <= 46; m++) for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 45), dt: 1 / 22, dec: true });
    M.chiedi.riprendi({ centro: true, lato: 'away' });
    for (let m = 46; m <= 93; m++) for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 90), dt: 1 / 22, dec: true });
    const T = M.tabellino(); S.n++;
    for (const s of ['home', 'away']) { S.passaggi += T[s].passaggi; S.cross += T[s].cross; S.tiri += T[s].tiri; S.gol += T[s].gol; S.xg += +T[s].xg || 0; }
    const pt = (T.home.possesso || 0) + (T.away.possesso || 0); S.poss += pt > 0 ? 100 * T.home.possesso / pt : 50;
    const xg0 = S.xgEroe - xgPrima; S.xgEroe2 += xg0 * xg0;
    const E = (M.pagelle() || []).find(p => p.eroe); if (E) { S.golEroe += E.gol | 0; S.golEroe2 += (E.gol | 0) ** 2; S.tiriEroe += E.tiri | 0; S.tiriEroe2 += (E.tiri | 0) ** 2; }
  }
  parentPort.postMessage(S);
} else {
  const ROSSO = process.env.CPM_ROSSO === '1';
  const N = Math.max(20, +(process.env.N || 4000)); const SEED0 = +(process.env.SEED0 || 1000); const PAR = 4;
  const braccio = (rosso) => Promise.all(Array.from({ length: PAR }, (_, w) => new Promise((ok, ko) => {
    const ks = []; for (let k = w; k < N; k += PAR) ks.push(k);
    const wk = new Worker(fileURLToPath(import.meta.url), { workerData: { rosso, ks, seed0: SEED0 } }); wk.on('message', ok); wk.on('error', ko);
  }))).then(parti => { const S = {}; for (const p of parti) for (const [k, v] of Object.entries(p)) S[k] = (S[k] || 0) + v; for (const k in S) if (k !== 'n') S[k] /= S.n; return S; });
  const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
  const riga = (n, S) => console.log(`${n.padEnd(6)} passaggi ${f(S.passaggi, 1)} · cross ${f(S.cross, 1)} · tiri ${f(S.tiri)} · gol ${f(S.gol)} · xG ${f(S.xg)} · possesso eroe ${f(S.poss, 1)} % · gol eroe ${f(S.golEroe, 3)} (tiri ${f(S.tiriEroe)} · xG ${f(S.xgEroe, 3)})`);
  const t0 = Date.now();
  const R = await braccio(true); riga('rosso', R);
  if (ROSSO) {
    const ok = R.passaggi < 500;
    console.log(ok ? `✅ ROSSO come atteso: senza PO-228 i passaggi tornano a ${f(R.passaggi, 1)} (< 500) · ${N} partite in ${((Date.now() - t0) / 1000).toFixed(0)} s`
      : `❌ il rosso non riproduce il motore di prima: passaggi ${f(R.passaggi, 1)} (atteso < 500)`);
    process.exit(ok ? 0 : 1);
  }
  const V = await braccio(false); riga('verde', V);
  const se = (S, k) => Math.sqrt(Math.max(0, S[k + '2'] - S[k] ** 2) / N);
  console.log(`  dispersione per partita: gol eroe sd ${f(Math.sqrt(R.golEroe2 - R.golEroe ** 2), 3)} · xG eroe sd ${f(Math.sqrt(R.xgEroe2 - R.xgEroe ** 2), 3)} · errore della differenza relativa: gol eroe ±${f(100 * Math.hypot(se(V, 'golEroe') / V.golEroe, se(R, 'golEroe') / R.golEroe), 1)} %, xG eroe ±${f(100 * Math.hypot(se(V, 'xgEroe') / V.xgEroe, se(R, 'xgEroe') / R.xgEroe), 1)} %`);
  const fails = []; const d = (a, b) => 100 * (a - b) / b;
  if (V.passaggi < 800 || V.passaggi > 950) fails.push(`passaggi ${f(V.passaggi, 1)} fuori da 800-950`);
  if (V.cross < 20 || V.cross > 30) fails.push(`cross ${f(V.cross, 1)} fuori da 20-30`);
  for (const [k, tol] of [['tiri', 5], ['gol', 8], ['xg', 6], ['poss', 5], ['tiriEroe', 8]]) { const x = d(V[k], R[k]); console.log(`  ${k.padEnd(7)} ${x >= 0 ? '+' : ''}${f(x, 1)} % (tolleranza ±${tol} %)`); if (Math.abs(x) > tol) fails.push(`${k} ${f(x, 1)} % oltre ±${tol} %`); }
  {/* [giro 16] i gol dell'eroe: tolleranza 10 % PIU' 2,5 errori standard della differenza, misurati sulle partite stesse */
    const sd = 100 * Math.hypot(se(V, 'golEroe') / V.golEroe, se(R, 'golEroe') / R.golEroe), x = d(V.golEroe, R.golEroe), tol = 10 + 2.5 * sd;
    console.log(`  golEroe ${x >= 0 ? '+' : ''}${f(x, 1)} % (tolleranza ±10 % + 2,5 x ${f(sd, 1)} = ±${f(tol, 1)} %)`); if (Math.abs(x) > tol) fails.push(`golEroe ${f(x, 1)} % oltre ±${f(tol, 1)} %`); }
  console.log(`${N} partite per braccio in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  console.log(fails.length ? '❌ FAIL statistiche-228\n  ' + fails.join('\n  ') : '✅ PASS statistiche-228'); process.exit(fails.length ? 1 : 0);
}
