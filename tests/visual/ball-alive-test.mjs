#!/usr/bin/env node
/* GUARDIANO — IL PALLONE VIVE IN CRONACA (7.511.0, restyling R1).
   Dall'audit del restyling: durante `playing` il pallone era mosso SOLO dall'evento di cronaca, con
   lerp al 25% e banda morta a 0,3 — fermo per la maggior parte del tempo di lettura di ogni riga.
   Baseline misurata (codice 7.510): striscia massima di immobilita' 4,4s. Il rimedio 7.511 (arrivo pieno
   sul dichiarato + possesso in moto seedato) la porta a 0,9s.
   ⚠️ SI GIUDICA LA STRISCIA, NON LA «% in moto»: __CPM_STATE().ball espone posizioni ARROTONDATE
   all'intero, quindi i passi piccoli e continui del possesso spesso non attraversano il confine e
   risultano fermi (misurato: la % SCENDE 49,2→42,3 mentre la striscia crolla 4,4→0,9 — e' lo strumento,
   non il gioco). La % resta stampata come contesto, con un pavimento largo di sola sanita'.

   ⚠️ Il campionatore e' IN-PAGINA a 120ms (lezione 7.460: una sonda che dorme un tempo suo misura il
   proprio cronometro). Si giudica SOLO la fase 'playing': gli highlight hanno la loro macchina.

   PROVA DEL ROSSO: CPM_ROSSO=1 accende __CPM_NO511 (motore vecchio: lerp 25% + banda morta, nessun
   attore) e il guardiano DEVE vedere il pallone rifermarsi sotto la soglia. */
/* [giro 167 PO-362] LO STRUMENTO MISURAVA UN PALLONE CHE NESSUNO VEDE PIU'. MISURATO (sonda-cronaca-167, partita intera a motore acceso):
   il pallone 3D di `__CPM_STATE().ball` in `playing` e' fermo per 57 s (0,0% di campioni in moto) mentre quello del motore si muove nel
   62% dei campioni con striscia massima 2,3 s. Causa: dal 7.917 in gioco fluido il 3D e' SOSPESO e sopra c'e' il campo dall'alto
   (Campo2D), che disegna il pallone del motore. I 10,8-14,5 s dei giri 151-162 erano il 3D congelato, non il gioco.
   CRITERIO VECCHIO: striscia massima di fermo <= 2,0 s e % in moto >= 25 sul pallone 3D campionato a 120 ms per 4 minuti reali, grazia
   dichiarata (fermo/out/piazzato 6 s, kickoff 10 s) da `__CPM_HOLD`; rosso `__CPM_NO511` (ritirato dal 7.532: non discriminava).
   CRITERIO NUOVO: le STESSE soglie (2,0 s · 25%) e le STESSE grazie con gli stessi tetti, ma sul pallone che il giocatore VEDE
   (testimone `__CPM_B2D167` nel Campo2D, un campione per FOTOGRAMMA disegnato, quindi non dipende dallo scheduler della sonda), con la
   grazia letta dallo stato VERO del motore a ogni battito (fermo/rete 6 s, kickoff 10 s) e su DUE PARTITE INTERE fino al fischio invece
   di 4 minuti. Perche' non e' piu' permissivo: soglie e tetti identici; la scena dichiarata dal motore NON e' graziata; il campione
   copre 90' per due volte invece di ~140 s di gioco; la prova del rosso torna (il vecchio braccio era ritirato).
   ROSSO (CPM_ROSSO=1): sabotaggio dal banco «pallone-visto-fermo» (lib/cronaca-motore.mjs) — la simulazione gira intatta, ma il pallone
   che il motore consegna alla vista resta dove la squadra ha preso il possesso finche' il possesso non cambia lato. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { giocaPartita } from './lib/cronaca-motore.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 2);
const MOTO_MIN = +(process.env.CPM_MOTO_MIN || 25);      /* pavimento di sanita' (invariato) */
const STILL_MAX = +(process.env.CPM_STILL_MAX || 2.0);   /* striscia massima di fermo, s (invariata) */
const MIN_COPPIE = 300;                                  /* invariato */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
let coppie = 0, mossi = 0, maxStill = 0, graziaFTot = 0, graziaKTot = 0, peggiore = null, errs = [], minimi = [];
for (let i = 0; i < PARTITE; i++) {
  const r = await giocaPartita(b, port, { nome: 'Vivo' + i, seed: 424 + i * 41, sabotaggio: ROSSO ? 'pallone-visto-fermo' : null });
  errs.push(...r.errs); minimi.push(`${r.minMax}' (${r.fine})`);
  const B = r.b2d, T = r.ticks; let j = 0;
  const statoA = (t) => { while (j + 1 < T.length && T[j + 1].t <= t) j++; return T[j] || {}; };
  let still = 0, gF = 0, gK = 0, da = 0;
  for (let k = 1; k < B.length; k++) {
    const dt = B[k].t - B[k - 1].t; if (dt > 400) { still = 0; continue; }   /* fra due fotogrammi c'e' stato un highlight: il campo 2D non c'era */
    coppie++; const s = statoA(B[k].t);
    const hold = s.st === 'fermo' || s.st === 'rete', ko = s.st === 'kickoff';
    if (hold && gF < 6000) { gF += dt; graziaFTot += dt; still = 0; continue; } if (!hold) gF = 0;
    if (ko && gK < 10000) { gK += dt; graziaKTot += dt; still = 0; continue; } if (!ko) gK = 0;
    const d = Math.hypot(B[k].x - B[k - 1].x, B[k].y - B[k - 1].y);
    if (d > 0.05) { mossi++; still = 0; da = k; } else { still += dt; if (still > maxStill) { maxStill = still; peggiore = { p: r.nome, x: B[da].x, y: B[da].y, st: s.st, sc: s.sc }; } }
  }
}
await b.close(); srv.close();
const pctMoto = 100 * mossi / Math.max(1, coppie);
console.log(`\n=== IL PALLONE VIVE IN GIOCO FLUIDO (campo 2D, motore acceso)${ROSSO ? ' · PROVA DEL ROSSO (pallone-visto-fermo)' : ''} ===`);
console.log(`  partite ${PARTITE}: minuto finale ${minimi.join(' · ')} · coppie di fotogrammi ${coppie} (minimo ${MIN_COPPIE})`);
if (peggiore) console.log(`  il fermo piu' lungo: ${peggiore.p} a (${peggiore.x},${peggiore.y}) · stato del motore ${peggiore.st}${peggiore.sc ? ' + scena' : ''}`);
console.log(`  palla in moto: ${pctMoto.toFixed(1)}% · striscia massima di fermo: ${(maxStill / 1000).toFixed(2)}s · graziati kickoff ${(graziaKTot / 1000).toFixed(1)}s · interruzioni ${(graziaFTot / 1000).toFixed(1)}s`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (coppie < MIN_COPPIE) { console.log('\n❌ SONDA CIECA: coppie insufficienti — «vivo» su cosi\' poco non e\' un risultato'); process.exit(2); }
const ko = pctMoto < MOTO_MIN || maxStill / 1000 > STILL_MAX;
if (ROSSO) {
  if (ko) { console.log(`\n✅ prova del rosso riuscita: col pallone visto fermo la striscia sale a ${(maxStill / 1000).toFixed(1)}s`); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: striscia ${(maxStill / 1000).toFixed(1)}s anche col pallone visto fermo — lo strumento non vede`); process.exit(2);
}
if (pctMoto < MOTO_MIN) console.log(`❌ il pallone si e' rifermato: ${pctMoto.toFixed(1)}% < ${MOTO_MIN}%`);
if (maxStill / 1000 > STILL_MAX) console.log(`❌ striscia di fermo ${(maxStill / 1000).toFixed(1)}s > ${STILL_MAX}s`);
console.log(ko ? '' : '\n✅ il pallone vive: in moto e senza pause lunghe');
process.exit(ko ? 2 : 0);
