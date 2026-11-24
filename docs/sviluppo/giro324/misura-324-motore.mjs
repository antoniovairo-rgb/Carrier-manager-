#!/usr/bin/env node
/* [giro 324 PO-376] STRUMENTO in node (nessun browser). Dove riceve palla l'eroe nel motore vero? 24 configurazioni vere della
   vissuta S12 (fixtures/cfg-202-s12.json) x CPM_SEMI semi. Per ogni RICEZIONE dell'eroe oltre la meta' campo (adv >= 52, la soglia
   da cui il motore puo' aprire una scena) si calcola il tipo d'occasione che il motore le darebbe (stessa regola di src/14:
   area/limite -> conclusione o spalle, trequarti con |y-50| >= 22 -> fascia, trequarti centrale -> fra le linee, altrimenti
   costruzione), piu' l'istogramma di |y-50| delle ricezioni sulla trequarti. Per eseguirlo: copiarlo in tests/visual/ (non sta li'
   perche' un file che nessuna riga della mappa copre fa girare il treno completo). Uso: node misura-324-motore.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
const SEMI = +(process.env.CPM_SEMI || 5);
const zonaDi = (adv, y) => (adv >= 84 && Math.abs(y - 50) <= 22) ? 'area' : adv >= 70 ? 'limite' : adv >= 56 ? 'trequarti' : adv >= 34 ? 'centro' : 'dietro';
const tipo = (z, y) => (z === 'area' || z === 'limite') ? 'area-limite' : z === 'trequarti' ? (Math.abs(y - 50) >= 22 ? 'fascia' : 'fra-le-linee') : 'costruzione';
function braccio(nome, W, chiesto) {
  const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W); const N = CFG.length * SEMI;
  const T = {}; let n = 0, largo = 0, occ = {}, nOcc = 0; const H = new Array(8).fill(0); let nT = 0;
  for (let s = 0; s < N; s++) { const c0 = CFG[s % CFG.length]; const lato = c0.lato || 'home';
    const M = crea(Object.assign({}, c0, { brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    const conta = (E) => { for (const e of E) {
      if (e.t === 'ricezione' && e.chi && e.chi.eroe) { const adv = e.chi.team === 'away' ? 100 - e.chi.x : e.chi.x; if (adv < 52) continue; const t = tipo(zonaDi(adv, e.chi.y), e.chi.y); T[t] = (T[t] || 0) + 1; n++; if (adv >= 56 && adv < 70) { H[Math.min(7, Math.floor(Math.abs(e.chi.y - 50) / 5))]++; nT++; } if (Math.abs(e.chi.y - 50) >= 22) largo++; }
      if (e.t === 'occasione_eroe' && e.tipo) { occ[e.tipo] = (occ[e.tipo] || 0) + 1; nOcc++; if (chiesto) M.chiedi.scenaEroe(true, chiesto); } } };
    const B = 22; if (chiesto) M.chiedi.scenaEroe(true, chiesto);
    for (let m = 1; m <= 46; m++) for (let b = 0; b < B; b++) conta(M.tick({ min: Math.min(m, 45), dt: 1 / B, dec: true }));
    M.chiedi.riprendi({ centro: true, lato: 'away' }); if (chiesto) M.chiedi.scenaEroe(true, chiesto);
    for (let m = 46; m <= 93; m++) for (let b = 0; b < B; b++) conta(M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true })); }
  const pc = (v, d) => d ? (100 * v / d).toFixed(1) + '%' : '-';
  console.log(`${nome.padEnd(34)} partite ${N} · ricezioni dell'eroe oltre meta' campo ${(n / N).toFixed(1)}/partita · tipo fascia ${pc(T.fascia || 0, n)} · fra le linee ${pc(T['fra-le-linee'] || 0, n)} · area/limite ${pc(T['area-limite'] || 0, n)} · costruzione ${pc(T.costruzione || 0, n)} · eroe largo (|y-50|>=22) ${pc(largo, n)}`);
  if (nOcc) console.log(`${''.padEnd(34)} occasioni dell'eroe emesse ${(nOcc / N).toFixed(1)}/partita: ${Object.entries(occ).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + pc(v, nOcc)).join(' · ')}`);
  console.log(`${''.padEnd(34)} trequarti (adv 56-70), ${nT} ricezioni, |y-50| a passi di 5: ${H.map((v, i) => (i * 5) + '-' + (i === 7 ? 50 : i * 5 + 5) + ' ' + pc(v, nT)).join(' · ')}`);
  return { n, N, T, largo, occ, nOcc, H, nT };
}
/* I due bracci con la richiesta aperta («fascia», e «fascia» + __CPM_NO_EROEGIOCO) sono stati provati e TOLTI: in node nessuno gioca
   la scena, il motore emette l'occasione a ogni passo (1.200 a partita) e le ricezioni crollano da 53,6 a 6,6: non e' una misura. */
const out = { chiusa: braccio('richiesta chiusa', {}, null) };
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/misura-324-motore.json', JSON.stringify(out, null, 1));
