#!/usr/bin/env node
/* [giro 345 PO-376, decisione PO 22/11 «B: riaccendo lo spostamento»] LE SCENE DELL'EROE CHE PARTONO DALLA FASCIA.
   Banco Node, niente browser (come passaggi-228): carica il motore da src/14-motore-possesso.jsx e gioca N partite nel modo
   «partita vissuta» (brainLive, il modo della partita giocata: src/15 creaMotorePossesso({brainLive:brain137()})), 22 decisioni
   al minuto, sugli stessi semi in due bracci:
     verde = motore com'e' · rosso = window.__CPM_NO_G345 (il comportamento prima del giro 345: l'eroe non si allarga).
   LA RICHIESTA DEL LIVE E' EMULATA, e va detto: nel gioco la finestra della scena la apre src/15 (`_finestra879`) e chiede al
   motore un tipo d'occasione a rotazione seminata (T = 8 voci, 2 «fascia»). Qui la finestra si apre al 12' e poi 10 minuti dopo
   l'ultima occasione, il tipo esce dalla STESSA tabella T con un indice seminato (seme della partita + numero della scena), e si
   chiude sull'occasione. Le partite vere si misurano con docs/sviluppo/giro345/misura-345.mjs (browser, lente): questo banco e'
   il guardiano perche' e' ripetibile al bit e gioca migliaia di partite in un paio di minuti.
   BANDA (scritta PRIMA della correzione, vedi docs/sviluppo/RAPPORTO-giro345.md): quota delle occasioni dell'eroe di tipo
   «fascia» nel verde in [8 %, 25 %]. Il tetto e' la quota delle richieste «fascia» (2 su 8): l'eroe e' una punta, la fascia non
   puo' diventare la sua scena piu' frequente. Il pavimento e' un terzo delle richieste esaudite. Valori di progetto, dichiarati.
   VERDE se, tutte insieme:
     1. quota «fascia» del verde in [8 %, 25 %] e quota del rosso sotto il 4 % (il difetto si vede spento);
     2. il resto della partita non si muove: gol entro ±4 % piu' 2,5 errori standard, tiri ±3 %, xG ±3 %, cross ±5 %,
        passaggi ±3 %, occasioni dell'eroe a partita ±5 %, possesso della squadra dell'eroe ±1,5 punti;
     3. la simulazione rapida (brainLive spento) e' IDENTICA nei due bracci (firma su un campione);
     4. il verde e' ripetibile: le stesse partite giocate due volte danno la stessa firma (determinismo);
     5. nessun «non giudicato»: almeno 2 occasioni dell'eroe a partita in media in entrambi i bracci.
   Prova del rosso: CPM_ROSSO=1 (entrambi i bracci col motore di prima) -> quota fuori banda -> esce 1.
   Uso: node fasce-345.mjs            (N=2000 per braccio, quattro processi)
        CPM_ROSSO=1 node fasce-345.mjs (deve uscire 1)
        N=4000 SEED0=777 node fasce-345.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BANDA345 = { min: 0.08, max: 0.25, rossoMax: 0.04 };
const T_TIPI = ['conclusione', 'conclusione', 'fascia', 'fra-le-linee', 'spalle', 'costruzione', 'fascia', 'conclusione'];/* la tabella di src/15 (`tipo7`) */
const mix = (a) => { a = (a ^ 61) ^ (a >>> 16); a = (a + (a << 3)) | 0; a ^= a >>> 4; a = Math.imul(a, 0x27d4eb2d); a ^= a >>> 15; return a >>> 0; };

if (!isMainThread) {
  const SRC = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
  const CODE = SRC.slice(SRC.indexOf('/* CMAV-SRC-HEADER-END */') + 26);
  const W = workerData.rosso ? { __CPM_NO_G345: true } : {};
  const crea = Function('decideExecution', 'window', CODE + '\nreturn creaMotorePossesso;')(undefined, W);
  const P = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
  const Q = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
  const R = i => i === 0 ? 'GK' : i <= 4 ? 'DF' : i <= 7 ? 'MF' : 'AT';
  const S = { n: 0, passaggi: 0, cross: 0, tiri: 0, gol: 0, gol2: 0, xg: 0, poss: 0, occ: 0, firmaRapida: 0, firma: 0, tipi: {}, chiesteF: 0, chieste: 0, fChiesta: 0, largoSomma: 0, conF: 0 };
  const gioca = (k, brain, conta) => {
    const gio = P.map((p, i) => ({ team: 'home', gk: !!p[2], name: 'H' + (i + 1), rl: R(i), x: p[0], y: p[1] })).concat(Q.map((p, i) => ({ team: 'away', gk: !!p[2], name: 'A' + (i + 1), rl: R(i), x: p[0], y: p[1] })));
    const seed = ((workerData.seed0 + k * 7919) >>> 0) || 7;
    const M = crea({ v2: true, occasioniV2: true, brainLive: brain, seed, stadio: k % 2 ? 'away' : 'home', giocatori: gio,
      eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 70 }, forza: { home: 60 + ((k * 7) % 21), away: 60 + ((k * 13) % 21) }, tattica: null, lato: 'home' });
    const occ = []; let idx = 0, ult = -99, aperta = null, firma = 0;
    const tk = (o) => { for (const e of (M.tick(o) || [])) {
      if (e.t === 'occasione_eroe') { occ.push({ tipo: e.tipo, x: e.x, y: e.y, chiesto: aperta }); firma = (Math.imul(firma, 31) + mix((o.min | 0) * 131 + Math.round((+e.x || 0) * 10) * 7 + Math.round((+e.y || 0) * 10))) >>> 0;
        if (brain) { ult = o.min | 0; idx++; M.chiedi.scenaEroe(false); aperta = null; } } } };
    const minuto = (m) => { if (brain && !aperta && m >= 12 && m - ult >= 10) { aperta = T_TIPI[mix(seed + idx * 977) % T_TIPI.length]; M.chiedi.scenaEroe(true, aperta); if (conta) { S.chieste++; if (aperta === 'fascia') S.chiesteF++; } } };
    for (let m = 1; m <= 46; m++) { minuto(Math.min(m, 45)); for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 45), dt: 1 / 22, dec: true }); }
    M.chiedi.riprendi({ centro: true, lato: 'away' });
    for (let m = 46; m <= 93; m++) { minuto(Math.min(m, 90)); for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 90), dt: 1 / 22, dec: true }); }
    return { T: M.tabellino(), occ, firma };
  };
  for (const k of workerData.ks) {
    const { T, occ, firma } = gioca(k, true, true); S.n++; S.occ += occ.length; S.firma = (S.firma + firma) >>> 0;
    if (occ.some(o => o.tipo === 'fascia')) S.conF++;
    for (const o of occ) { S.tipi[o.tipo] = (S.tipi[o.tipo] || 0) + 1; if (o.chiesto === 'fascia' && o.tipo === 'fascia') S.fChiesta++; S.largoSomma += Math.abs((+o.y || 50) - 50); }
    let g = 0;
    for (const s of ['home', 'away']) { S.passaggi += T[s].passaggi; S.cross += T[s].cross; S.tiri += T[s].tiri; g += T[s].gol; S.xg += +T[s].xg || 0; }
    S.gol += g; S.gol2 += g * g;
    const pt = (T.home.possesso || 0) + (T.away.possesso || 0); S.poss += pt > 0 ? 100 * T.home.possesso / pt : 50;
    if (k % 10 === 0) { const r = gioca(k, false).T; S.firmaRapida += r.home.passaggi * 7 + r.away.passaggi * 13 + r.home.tiri * 101 + r.away.tiri * 103 + (+r.home.xg || 0) * 1009; }
    if (workerData.ripeti && k % 20 === 0) { const r2 = gioca(k, true); S.ripFirma = ((S.ripFirma || 0) + r2.firma) >>> 0; S.ripAtteso = ((S.ripAtteso || 0) + firma) >>> 0; }
  }
  parentPort.postMessage(S);
} else if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ROSSO = process.env.CPM_ROSSO === '1';
  const N = Math.max(40, +(process.env.N || 2000)); const SEED0 = +(process.env.SEED0 || 1000); const PAR = 4;
  const braccio = (rosso, ripeti) => Promise.all(Array.from({ length: PAR }, (_, w) => new Promise((ok, ko) => {
    const ks = []; for (let k = w; k < N; k += PAR) ks.push(k);
    const wk = new Worker(fileURLToPath(import.meta.url), { workerData: { rosso, ks, seed0: SEED0, ripeti } }); wk.on('message', ok); wk.on('error', ko);
  }))).then(parti => { const S = { tipi: {} }; for (const p of parti) for (const [k, v] of Object.entries(p)) { if (k === 'tipi') { for (const [t, n] of Object.entries(v)) S.tipi[t] = (S.tipi[t] || 0) + n; } else S[k] = k.startsWith('firma') || k.startsWith('rip') ? ((S[k] || 0) + v) >>> 0 : (S[k] || 0) + v; } return S; });
  const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
  const V = await braccio(ROSSO, true); const Rr = await braccio(true, false);
  const m = (S, k) => S[k] / S.n; const qF = (S) => S.occ ? (S.tipi.fascia || 0) / S.occ : NaN;
  const riga = (n, S) => { console.log(`${n.padEnd(6)} occasioni eroe ${f(m(S, 'occ'))}/partita · FASCIA ${f(100 * qF(S), 1)} % (${S.tipi.fascia || 0} su ${S.occ}) · partite con almeno una scena di fascia ${f(100 * S.conF / S.n, 1)} % · richieste «fascia» ${S.chiesteF} su ${S.chieste} (${f(100 * S.chiesteF / Math.max(1, S.chieste), 1)} %), esaudite ${S.fChiesta} · distanza media dal centro ${f(S.largoSomma / Math.max(1, S.occ), 1)}`);
    console.log(`       tipi: ${Object.entries(S.tipi).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + f(100 * v / S.occ, 1) + ' %').join(' · ')}`);
    console.log(`       gol ${f(m(S, 'gol'))} · tiri ${f(m(S, 'tiri'))} · xG ${f(m(S, 'xg'))} · cross ${f(m(S, 'cross'), 1)} · passaggi ${f(m(S, 'passaggi'), 1)} · possesso casa ${f(m(S, 'poss'), 1)} %`); };
  console.log(`fasce-345 · modo partita vissuta · N=${N} per braccio · semi da ${SEED0}${ROSSO ? ' · PROVA DEL ROSSO (entrambi i bracci __CPM_NO_G345)' : ''}`);
  riga('verde', V); riga('rosso', Rr);
  const rel = (k) => m(V, k) / m(Rr, k) - 1;
  const sdG = (S) => Math.sqrt(Math.max(0, S.gol2 / S.n - (S.gol / S.n) ** 2));
  const seG = Math.sqrt(sdG(V) ** 2 / V.n + sdG(Rr) ** 2 / Rr.n) / m(Rr, 'gol');
  const pc = (x) => (x >= 0 ? '+' : '') + f(100 * x, 1) + ' %';
  const C = [
    [`quota «fascia» del verde in [${100 * BANDA345.min} %, ${100 * BANDA345.max} %]`, f(100 * qF(V), 1) + ' %', qF(V) >= BANDA345.min && qF(V) <= BANDA345.max],
    [`quota «fascia» del rosso sotto ${100 * BANDA345.rossoMax} % (il difetto si vede spento)`, f(100 * qF(Rr), 1) + ' %', qF(Rr) < BANDA345.rossoMax],
    [`gol entro ±${f(100 * (0.04 + 2.5 * seG), 1)} % (4 % + 2,5 errori standard)`, pc(rel('gol')), Math.abs(rel('gol')) <= 0.04 + 2.5 * seG],
    ['tiri entro ±3 %', pc(rel('tiri')), Math.abs(rel('tiri')) <= 0.03],
    ['xG entro ±3 %', pc(rel('xg')), Math.abs(rel('xg')) <= 0.03],
    ['cross entro ±5 %', pc(rel('cross')), Math.abs(rel('cross')) <= 0.05],
    ['passaggi entro ±3 %', pc(rel('passaggi')), Math.abs(rel('passaggi')) <= 0.03],
    ['occasioni dell\'eroe a partita entro ±5 %', pc(rel('occ')), Math.abs(rel('occ')) <= 0.05],
    ['possesso della squadra dell\'eroe entro ±1,5 punti', f(m(V, 'poss') - m(Rr, 'poss'), 2) + ' punti', Math.abs(m(V, 'poss') - m(Rr, 'poss')) <= 1.5],
    ['simulazione rapida identica nei due bracci', V.firmaRapida === Rr.firmaRapida ? 'identica' : 'DIVERSA', V.firmaRapida === Rr.firmaRapida],
    ['verde ripetibile (stesse partite, stessa firma)', V.ripFirma === V.ripAtteso ? 'identica' : 'DIVERSA', V.ripFirma === V.ripAtteso && V.ripAtteso > 0],
    ['giudicato: almeno 2 occasioni dell\'eroe a partita in entrambi i bracci', `${f(m(V, 'occ'))} · ${f(m(Rr, 'occ'))}`, m(V, 'occ') >= 2 && m(Rr, 'occ') >= 2],
  ];
  let ok = true; let motivo = '';
  for (const [n, x, p] of C) { ok = ok && p; if (!p && !motivo) motivo = n + ': ' + x; console.log(`${p ? '✓' : '✗'} ${n}: ${x}`); }
  fs.mkdirSync(path.join(ROOT, 'tests', 'visual', 'out'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'tests', 'visual', 'out', 'fasce-345.json'), JSON.stringify({ N, SEED0, rosso: ROSSO, verde: V, base: Rr, ok }, null, 1));
  console.log(ok ? `fasce-345 ${ROSSO ? 'braccio rosso' : 'braccio verde'}: VERDE` : `fasce-345 ${ROSSO ? 'braccio rosso' : 'braccio verde'}: ROSSO — ${motivo}`);
  process.exit(ok ? 0 : 1);
}
