#!/usr/bin/env node
/* [giro 388 PO-642, decisione PO «Giro per la scheda»] LA SCHEDA DEL MISTER «TI INDICA DI ALLARGARTI» SPOSTA DAVVERO L'EROE.
   Difetto misurato (RAPPORTO-giro388): la scheda eroe_marcato viveva solo nel sistema 226 (spento dal 259) e, anche li', la scelta
   «Seguo le indicazioni» toccava solo la voglia di tirare (+0,25): nessun canale verso la posizione dell'eroe ne' verso la richiesta
   d'occasione della partita. Correzione (src/14): fatto e scheda nel 259, chiedi.scelta259({largo}) → richieste.l388 (l'eroe tiene la
   corsia larga per 10 minuti dal suo lato) e la richiesta d'occasione aperta, o la prossima, diventa «fascia».
   PARTE A — banco Node (come fasce-345: motore da src/14, partita vissuta brainLive, 22 decisioni al minuto, richiesta del live
   emulata con la tabella `tipo7` di src/15). Sugli STESSI semi, al minuto CH (28'-40' col seme) si applica la scheda con
   INT259.applica, cioe' lo stesso codice che chiama la partita (scegli681): bracci «seguo» (0), «testa mia» (1), «mi abbasso» (2) e
   «rosso» (= seguo con window.__CPM_NO_G388, il comportamento di prima).
   PARTE B — partita vera nel browser (salvo CPM_SOLO_A=1): __CPM_FORZA388 apre la scheda al 25', si sceglie «Seguo le indicazioni»;
   verde: scheda uscita, eroe largo nel motore nei 10' dopo, prossima richiesta «fascia»; rosso (__CPM_NO_G388): la scheda non esce.
   VERDE se, tutte insieme (soglie di progetto, scritte prima della misura):
     A1. nei 10' dopo la scelta la distanza media dell'eroe dal centro (|y-50|, campionata a ogni minuto) col «seguo» e' >= 20 e supera
         di almeno 10 quella del braccio «testa mia» (stessi semi);
     A2. la prima richiesta d'occasione dopo la scelta (quella aperta, o la prossima) e' «fascia» in >= 95 % delle partite col «seguo»;
     A3. il rosso si vede: col «seguo» spento la distanza resta entro 3 dal «testa mia» e la richiesta «fascia» scende sotto il 50 %;
     A4. il «testa mia» non si allarga (entro 3 dal braccio «mi abbasso») e la sua richiesta segue la rotazione (< 50 % «fascia»);
     A5. ripetibile: lo stesso braccio giocato due volte da' la stessa firma;
     A6. nessun «non giudicato»: la scelta applicata in tutte le partite, e almeno una richiesta dopo la scelta in >= 90 %.
     B.  verde e rosso della partita vera come sopra.
   Uso: node scheda-388.mjs   ·   CPM_ROSSO=1 node scheda-388.mjs (tutti i bracci col rosso: deve uscire 1)   ·   N=400 */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const T_TIPI = ['conclusione', 'conclusione', 'fascia', 'fra-le-linee', 'spalle', 'costruzione', 'fascia', 'conclusione'];
const mix = (a) => { a = (a ^ 61) ^ (a >>> 16); a = (a + (a << 3)) | 0; a ^= a >>> 4; a = Math.imul(a, 0x27d4eb2d); a ^= a >>> 15; return a >>> 0; };

if (!isMainThread) {
  const SRC = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
  const CODE = SRC.slice(SRC.indexOf('/* CMAV-SRC-HEADER-END */') + 26);
  const W = workerData.rosso ? { __CPM_NO_G388: true } : {};
  const { crea, INT } = Function('decideExecution', 'window', CODE + '\nreturn {crea:creaMotorePossesso,INT:INT259};')(undefined, W);
  const P = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
  const Q = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
  const R = i => i === 0 ? 'GK' : i <= 4 ? 'DF' : i <= 7 ? 'MF' : 'AT';
  const out = [];
  for (const k of workerData.ks) {
    const gio = P.map((p, i) => ({ team: 'home', gk: !!p[2], name: 'H' + (i + 1), rl: R(i), x: p[0], y: p[1] })).concat(Q.map((p, i) => ({ team: 'away', gk: !!p[2], name: 'A' + (i + 1), rl: R(i), x: p[0], y: p[1] })));
    const seed = ((workerData.seed0 + k * 7919) >>> 0) || 7;
    const M = crea({ v2: true, occasioniV2: true, brainLive: true, seed, stadio: k % 2 ? 'away' : 'home', giocatori: gio,
      eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 70 }, forza: { home: 60 + ((k * 7) % 21), away: 60 + ((k * 13) % 21) }, tattica: null, lato: 'home' });
    const CH = 28 + (mix(seed ^ 0x388) % 13);
    let idx = 0, ult = -99, aperta = null, firma = 0, applicata = false, rich = null, t0 = null, t1 = null; const larg = {};
    const tk = (o) => { for (const e of (M.tick(o) || [])) { if (e.t === 'occasione_eroe') { firma = (Math.imul(firma, 31) + mix((o.min | 0) * 131 + Math.round((+e.y || 0) * 10))) >>> 0; ult = o.min | 0; idx++; M.chiedi.scenaEroe(false); aperta = null; } } };
    const minuto = (m) => {
      if (!applicata && m === CH) { applicata = !!INT.applica(M, 'eroe_marcato', workerData.idx, m); const t = M.tabellino(); t0 = [t.home.tiri | 0, t.away.tiri | 0, +t.home.xg || 0, +t.away.xg || 0];
        if (aperta && M._S.richieste.scenaEroe) rich = { min: m, tipo: M._S.richieste.scenaTipo, aperta: true }; }
      if (!aperta && m >= 12 && m - ult >= 10) { aperta = T_TIPI[mix(seed + idx * 977) % T_TIPI.length]; M.chiedi.scenaEroe(true, aperta);
        if (applicata && !rich) rich = { min: m, tipo: M._S.richieste.scenaTipo }; } };
    const campiona = (m) => { if (m === CH + 10 && t0) { const t = M.tabellino(); t1 = [(t.home.tiri | 0) - t0[0], (t.away.tiri | 0) - t0[1], (+t.home.xg || 0) - t0[2], (+t.away.xg || 0) - t0[3]]; } const H = M._g[M.HERO]; larg[m] = Math.abs(H.y - 50); firma = (Math.imul(firma, 7) + Math.round(H.y * 10)) >>> 0; };
    for (let m = 1; m <= 46; m++) { minuto(Math.min(m, 45)); for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 45), dt: 1 / 22, dec: true }); if (m <= 45) campiona(m); }
    M.chiedi.riprendi({ centro: true, lato: 'away' });
    for (let m = 46; m <= 93; m++) { minuto(Math.min(m, 90)); for (let b = 0; b < 22; b++) tk({ min: Math.min(m, 90), dt: 1 / 22, dec: true }); if (m <= 90) campiona(m); }
    let s = 0, n = 0; for (let m = CH + 1; m <= CH + 10; m++) if (larg[m] != null) { s += larg[m]; n++; }
    out.push({ k, CH, applicata, largo: n ? s / n : null, rich, firma, w388: M._S.w388 || null, d10: t1, prof: Array.from({ length: 16 }, (_, j) => larg[CH + j]) });
  }
  parentPort.postMessage(out);
} else if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ROSSO = process.env.CPM_ROSSO === '1';
  const N = Math.max(40, +(process.env.N || 400)); const SEED0 = +(process.env.SEED0 || 3880); const PAR = 4;
  const braccio = (idx, rosso) => Promise.all(Array.from({ length: PAR }, (_, w) => new Promise((ok, ko) => {
    const ks = []; for (let k = w; k < N; k += PAR) ks.push(k);
    const wk = new Worker(fileURLToPath(import.meta.url), { workerData: { idx, rosso, ks, seed0: SEED0 } }); wk.on('message', ok); wk.on('error', ko);
  }))).then(p => p.flat().sort((a, b) => a.k - b.k));
  const f = (x, d = 1) => (x == null || Number.isNaN(x)) ? 'n.d.' : x.toFixed(d).replace('.', ',');
  const sint = (L) => { const v = L.filter(r => r.largo != null); const con = L.filter(r => r.rich); return { n: L.length, app: L.filter(r => r.applicata).length,
    largo: v.reduce((a, r) => a + r.largo, 0) / Math.max(1, v.length), conRich: con.length, fascia: con.filter(r => r.rich.tipo === 'fascia').length / Math.max(1, con.length),
    firma: L.reduce((a, r) => (Math.imul(a, 31) + r.firma) >>> 0, 0), d10: [0, 1, 2, 3].map(j => L.reduce((a, r) => a + (r.d10 ? r.d10[j] : 0), 0) / Math.max(1, L.length)) }; };
  const t0 = Date.now();
  const [S0, S1, S2, SR, S0b] = (await Promise.all([braccio(0, ROSSO), braccio(1, ROSSO), braccio(2, ROSSO), braccio(0, true), braccio(0, ROSSO)])).map(sint);
  const riga = (n, S) => console.log(`${n.padEnd(12)} scelta applicata ${S.app}/${S.n} · eroe dal centro nei 10' dopo ${f(S.largo)} · richieste dopo la scelta ${S.conRich}/${S.n}, «fascia» ${f(100 * S.fascia)} % · nei 10' dopo tiri noi ${f(S.d10[0], 2)} loro ${f(S.d10[1], 2)}, xG noi ${f(S.d10[2], 3)} loro ${f(S.d10[3], 3)} (informativo)`);
  console.log(`scheda-388 parte A — ${N} partite per braccio, semi da ${SEED0}${ROSSO ? ' — PROVA DEL ROSSO (tutti i bracci con __CPM_NO_G388)' : ''}`);
  riga('seguo (0)', S0); riga('testa mia(1)', S1); riga('mi abbasso(2)', S2); riga('rosso', SR);
  const esiti = [];
  const giud = (ok, t) => { esiti.push(ok); console.log(`${ok ? '✅' : '❌'} ${t}`); };
  giud(S0.largo >= 20 && S0.largo - S1.largo >= 10, `A1 eroe largo col «seguo»: ${f(S0.largo)} (>= 20) contro ${f(S1.largo)} del «testa mia» (scarto >= 10)`);
  giud(S0.fascia >= 0.95, `A2 prima richiesta dopo il «seguo» = «fascia»: ${f(100 * S0.fascia)} % (>= 95 %)`);
  giud(Math.abs(SR.largo - S1.largo) <= 3 && SR.fascia < 0.5, `A3 il rosso si vede: ${f(SR.largo)} contro ${f(S1.largo)} (entro 3), «fascia» ${f(100 * SR.fascia)} % (< 50 %)`);
  giud(Math.abs(S1.largo - S2.largo) <= 3 && S1.fascia < 0.5, `A4 «testa mia» non si allarga: ${f(S1.largo)} contro ${f(S2.largo)} (entro 3), «fascia» ${f(100 * S1.fascia)} % (< 50 %)`);
  giud(S0.firma === S0b.firma, `A5 ripetibile: firma ${S0.firma} = ${S0b.firma}`);
  giud([S0, S1, S2, SR].every(S => S.app === S.n && S.conRich >= 0.9 * S.n), `A6 giudicato: scelta applicata ovunque, richieste dopo la scelta ${S0.conRich}/${S1.conRich}/${S2.conRich}/${SR.conRich} su ${N} (>= 90 %)`);
  console.log(`(parte A in ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  if (process.env.CPM_SOLO_A !== '1') {
    const { startServer, launchBrowser } = await import('./lib/harness.mjs');
    const { partita388, largo388 } = await import('./misura-388.mjs');
    const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
    const vera = async (rosso) => { const p = await partita388(b, port, 3, { idx: 0, forza: 1, rossi: rosso ? '__CPM_NO_G388' : '', fino: 45 });
      const sc = ((p.s259 && p.s259.scelte) || []).find(s => s.fatto === 'eroe_marcato'); const w = p.w388;
      return { p, sc, w, largo: sc ? largo388(p, sc.min + 1, sc.min + 10) : null, prima: sc ? largo388(p, sc.min - 10, sc.min - 1) : null }; };
    const [V, Rr] = await Promise.all([vera(ROSSO), vera(true)]);
    await b.close(); srv.close();
    const d = (x) => x.sc ? `scheda al ${x.sc.min}', eroe dal centro ${f(x.prima)} → ${f(x.largo)}, richiesta dopo: ${x.w && x.w.richiesta ? x.w.richiesta.min + "' " + x.w.richiesta.tipo : 'nessuna'}` : `scheda NON uscita (minuto raggiunto ${Math.max(0, ...Object.keys(x.p.pos || {}).map(Number))}')${x.p.errore ? ' ERRORE ' + x.p.errore : ''}`;
    console.log(`partita vera verde: ${d(V)}`); console.log(`partita vera rosso: ${d(Rr)}`);
    giud(!!V.sc && V.largo != null && V.largo >= 20 && !!(V.w && V.w.richiesta && V.w.richiesta.tipo === 'fascia') && !(V.p.errori || []).length, 'B verde: la scheda esce, l\'eroe si allarga (>= 20) e la richiesta dopo e\' «fascia»');
    giud(!Rr.sc && Math.max(0, ...Object.keys(Rr.p.pos || {}).map(Number)) >= 30, 'B rosso: col __CPM_NO_G388 la scheda non esce (partita giudicata oltre il 30\')');
  }
  const ok = esiti.every(Boolean);
  console.log(ok ? '✅ SCHEDA-388 VERDE' : '❌ SCHEDA-388 ROSSO');
  process.exit(ok ? 0 : 1);
}
