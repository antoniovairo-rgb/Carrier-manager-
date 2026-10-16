/* [giro 32 PO-228, decisione PO 15/10 «Ritara i passaggi a ~814»] I PASSAGGI DELLA PARTITA VISSUTA, IL RESTO FERMO.
   Banco Node, niente browser: carica il motore da src/14-motore-possesso.jsx e gioca N partite col motore in modo
   «partita vissuta» (brainLive: e' il modo della partita giocata nel gioco, src/15 creaMotorePossesso({brainLive:brain137()})),
   22 decisioni al minuto come simulaPartitaMotore, sugli stessi semi in due bracci:
     verde = motore com'e' · rosso = __CPM_NO_PASSVIVO228 (il motore della 7.999.170).
   Nel modo vissuto il motore si ferma sulle scene dell'eroe (~150 battiti a partita, il 7 %) e quel tempo non e' giro palla:
   la ritaratura del giro 32 vale SOLO li' (la simulazione rapida resta quella tarata dal giro 16, e qui si prova che resta
   IDENTICA al bit). Misure (due squadre insieme):
     VERDE se: passaggi verde/rosso in [+2,5 %, +6,5 %] (giro 35: bersaglio +4,4 %, misurato dal vivo dopo la restrizione della ripresa) · tiri entro ±3 % · xG entro ±3 % · gol entro ±4 % piu' 2,5 errori standard
     della differenza · cross entro ±5 % · dribbling tentati entro ±6 % · occasioni dell'eroe entro ±5 % · possesso della squadra
     dell'eroe entro ±1,5 punti · simulazione rapida (brainLive spento) identica nei due bracci.
   Il rosso si prova con CPM_ROSSO=1: entrambi i bracci col motore di prima -> passaggi +0 % -> esce 1.
   Uso: node passaggi-228.mjs            (N=2000, quattro processi, ~2 minuti)
        CPM_ROSSO=1 node passaggi-228.mjs (deve uscire 1)
        N=4000 SEED0=777 node passaggi-228.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

if (!isMainThread) {
  const SRC = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
  const CODE = SRC.slice(SRC.indexOf('/* CMAV-SRC-HEADER-END */') + 26);
  const W = workerData.rosso ? { __CPM_NO_PASSVIVO228: true } : {};
  const crea = Function('decideExecution', 'window', CODE + '\nreturn creaMotorePossesso;')(undefined, W);
  const P = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
  const Q = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
  const R = i => i === 0 ? 'GK' : i <= 4 ? 'DF' : i <= 7 ? 'MF' : 'AT';
  const S = { n: 0, passaggi: 0, cross: 0, tiri: 0, gol: 0, gol2: 0, xg: 0, poss: 0, drib: 0, occ: 0, firmaRapida: 0 };
  const gioca = (k, brain) => {
    const gio = P.map((p, i) => ({ team: 'home', gk: !!p[2], name: 'H' + (i + 1), rl: R(i), x: p[0], y: p[1] })).concat(Q.map((p, i) => ({ team: 'away', gk: !!p[2], name: 'A' + (i + 1), rl: R(i), x: p[0], y: p[1] })));
    const M = crea({ v2: true, occasioniV2: true, brainLive: brain, seed: ((workerData.seed0 + k * 7919) >>> 0) || 7, stadio: k % 2 ? 'away' : 'home', giocatori: gio,
      eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 70 }, forza: { home: 60 + ((k * 7) % 21), away: 60 + ((k * 13) % 21) }, tattica: null, lato: 'home' });
    let occ = 0; const tk = (o) => { for (const e of (M.tick(o) || [])) if (e.t === 'occasione_eroe') occ++; };
    for (let m = 1; m <= 46; m++) for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 45), dt: 1 / 22, dec: true });
    M.chiedi.riprendi({ centro: true, lato: 'away' });
    for (let m = 46; m <= 93; m++) for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 90), dt: 1 / 22, dec: true });
    return { T: M.tabellino(), occ };
  };
  for (const k of workerData.ks) {
    const { T, occ } = gioca(k, true); S.n++; S.occ += occ;
    let g = 0;
    for (const s of ['home', 'away']) { S.passaggi += T[s].passaggi; S.cross += T[s].cross; S.tiri += T[s].tiri; g += T[s].gol; S.xg += +T[s].xg || 0; S.drib += T[s].dribbling | 0; }
    S.gol += g; S.gol2 += g * g;
    const pt = (T.home.possesso || 0) + (T.away.possesso || 0); S.poss += pt > 0 ? 100 * T.home.possesso / pt : 50;
    if (k % 10 === 0) { const r = gioca(k, false).T; S.firmaRapida += r.home.passaggi * 7 + r.away.passaggi * 13 + r.home.tiri * 101 + r.away.tiri * 103 + (+r.home.xg || 0) * 1009; }/* un campione della simulazione rapida: deve restare identico */
  }
  parentPort.postMessage(S);
} else {
  const ROSSO = process.env.CPM_ROSSO === '1';
  const N = Math.max(40, +(process.env.N || 2000)); const SEED0 = +(process.env.SEED0 || 1000); const PAR = 4;
  const braccio = (rosso) => Promise.all(Array.from({ length: PAR }, (_, w) => new Promise((ok, ko) => {
    const ks = []; for (let k = w; k < N; k += PAR) ks.push(k);
    const wk = new Worker(fileURLToPath(import.meta.url), { workerData: { rosso, ks, seed0: SEED0 } }); wk.on('message', ok); wk.on('error', ko);
  }))).then(parti => { const S = {}; for (const p of parti) for (const [k, v] of Object.entries(p)) S[k] = (S[k] || 0) + v; return S; });
  const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
  const t0 = Date.now();
  const [V, Rr] = await Promise.all([braccio(ROSSO), braccio(true)]);
  const m = (S, k) => S[k] / S.n;
  const riga = (n, S) => console.log(`${n.padEnd(6)} passaggi ${f(m(S, 'passaggi'), 1)} · tiri ${f(m(S, 'tiri'))} · gol ${f(m(S, 'gol'))} · xG ${f(m(S, 'xg'))} · cross ${f(m(S, 'cross'), 1)} · dribbling ${f(m(S, 'drib'), 1)} · occasioni eroe ${f(m(S, 'occ'))} · possesso casa ${f(m(S, 'poss'), 1)} %`);
  console.log(`passaggi-228 · modo partita vissuta · N=${N} per braccio · semi da ${SEED0}${ROSSO ? ' · PROVA DEL ROSSO (entrambi i bracci __CPM_NO_PASSVIVO228)' : ''}`);
  riga('verde', V); riga('rosso', Rr);
  const rel = (k) => m(V, k) / m(Rr, k) - 1;
  const sdG = (S) => Math.sqrt(Math.max(0, S.gol2 / S.n - (S.gol / S.n) ** 2));
  const seG = Math.sqrt(sdG(V) ** 2 / V.n + sdG(Rr) ** 2 / Rr.n) / m(Rr, 'gol');
  const C = [
    ['passaggi verde/rosso in [+2,5 %, +6,5 %]', rel('passaggi'), (x) => x >= 0.025 && x <= 0.065],
    ['tiri entro ±3 %', rel('tiri'), (x) => Math.abs(x) <= 0.03],
    ['xG entro ±3 %', rel('xg'), (x) => Math.abs(x) <= 0.03],
    [`gol entro ±${f(100 * (0.04 + 2.5 * seG), 1)} % (4 % + 2,5 errori standard)`, rel('gol'), (x) => Math.abs(x) <= 0.04 + 2.5 * seG],
    ['cross entro ±5 %', rel('cross'), (x) => Math.abs(x) <= 0.05],
    ['dribbling tentati entro ±6 %', rel('drib'), (x) => Math.abs(x) <= 0.06],
    ['occasioni dell\'eroe entro ±5 %', rel('occ'), (x) => Math.abs(x) <= 0.05],
  ];
  let ok = true;
  for (const [n, x, t] of C) { const p = t(x); ok = ok && p; console.log(`${p ? '✓' : '✗'} ${n}: ${x >= 0 ? '+' : ''}${f(100 * x, 1)} %`); }
  const dP = m(V, 'poss') - m(Rr, 'poss'); const pP = Math.abs(dP) <= 1.5; ok = ok && pP; console.log(`${pP ? '✓' : '✗'} possesso della squadra dell'eroe entro ±1,5 punti: ${dP >= 0 ? '+' : ''}${f(dP, 2)}`);
  const pR = Math.abs(V.firmaRapida - Rr.firmaRapida) < 1e-6; ok = ok && pR; console.log(`${pR ? '✓' : '✗'} simulazione rapida identica nei due bracci (firma ${f(V.firmaRapida, 1)} contro ${f(Rr.firmaRapida, 1)})`);
  console.log(`${ok ? '✅ VERDE' : '❌ ROSSO'} — ${Math.round((Date.now() - t0) / 1000)} s`);
  process.exit(ok ? 0 : 1);
}
