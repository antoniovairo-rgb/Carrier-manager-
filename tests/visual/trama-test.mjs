#!/usr/bin/env node
/* GUARDIANO — IL POSSESSO HA UNA TRAMA (7.524.0).
   Collaudo PO su 7.523: «non ci sono schemi, azioni ragionate, e' tutto un po' confusionario».
   Causa: il moto di possesso 7.511 era un random-walk — passo avanti sorteggiato + jitter laterale A OGNI
   TICK, la rotta cambiava di continuo e la cronaca (che dal 7.499 descrive dove sta la palla) raccontava
   quel vagare. Rimedio 7.524: fase letta dalla posizione, corridoio persistente, GIOCATE a waypoint con
   rotta fissa fino all'arrivo (flusso seedato dedicato ballRngRef — mai _rndM, invariante 7.511).

   COME SI RACCOGLIE (tre lezioni pagate in taratura): (a) una partita in autoplay vive ~2-3 minuti — su
   una sola la sonda e' cieca, quindi TRE partite per braccio (nomi diversi = partite diverse, 7.496);
   (b) __CPM_FORCED_MODE inchioda il wizard in hl_result e la cronaca non gira mai — MAI usarlo qui;
   (c) si giudicano i PASSI INTERNI alla giocata (ng=0): la svolta al cambio giocata e alla ripresa dopo
   un inseguimento e' VOLUTA ed e' marcata dal motore — contarla non discrimina (41° vs 53°).
   PROVA DEL ROSSO: CPM_ROSSO=1 → __CPM_NO527 (random-walk 7.511): nel rosso non esistono giocate
   (ng sempre 0, ogni passo e' interno) e la rotta balla per costruzione. */
/* [giro 167 PO-362] LO STRUMENTO ERA CIECO PERCHE' LEGGEVA UN MOTORE CHE NON GIRA PIU'. Il testimone `__CPM_TRAMA527` lo scrive il drift
   del 7.524 (src/15, `tramaRef`), che vive nel ramo `if(!MOTORE870||_inHL77)`: dal 7.870 la partita vera la muove il motore del possesso
   e quel ramo in `playing` non gira, quindi zero passi. Il «possesso ha una trama» oggi vuol dire: chi porta palla segue una ROTTA decisa
   (la conduzione del motore ha un bersaglio, `S.cond`, compiuto a frazioni nei sotto-tick) e non sbanda a ogni battito.
   CRITERIO VECCHIO: deviazione media di rotta <= 25°/passo e svolte >45° <= 16% sui passi INTERNI alla giocata del drift (ng=0), su 5
   partite, minimo 40 coppie; rosso `__CPM_NO527` (random-walk 7.511) >= 38°.
   CRITERIO NUOVO: le STESSE soglie (25° · 16% · rosso >= 38°) e lo stesso minimo (40 coppie) sulle stesse 5 partite, ma sul pallone del
   MOTORE campionato a OGNI battito (minuto e sotto-tick: si avvolge `tick`, lib/cronaca-motore.mjs). Passo interno = due battiti
   consecutivi in `playing` con il pallone in TENUTA dallo STESSO portatore che si e' mosso (0,15-6 unita', come prima); il cambio di
   portatore o di stato e' il «cambio giocata» (ng) ed e' fuori giudizio come prima. I voli NON contano: un passaggio e' una retta per
   costruzione e contarlo gonfierebbe il verde — sarebbe piu' permissivo. Perche' non e' piu' permissivo: soglie, minimo e campione
   identici; si giudica la partita vera intera invece di un ramo spento.
   ROSSO (CPM_ROSSO=1): sabotaggio dal banco «rotta-ballerina» — a ogni battito di tenuta il portatore (e il pallone ai suoi piedi)
   riceve uno scarto casuale: e' il random-walk del 7.511, rimesso dal test sul motore di oggi. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { giocaPartita } from './lib/cronaca-motore.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 5);
const DH_MAX = +(process.env.CPM_DH_MAX || 25), SV45_MAX = +(process.env.CPM_SV45_MAX || 16), DH_RED_MIN = +(process.env.CPM_DH_RED_MIN || 38);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
let segn = 0, dhSum = 0, dh45 = 0, ngN = 0, passi = 0; const fini = [];
for (let m = 0; m < PARTITE; m++) {
  const r = await giocaPartita(b, port, { nome: 'Validator' + m, seed: 424, sabotaggio: ROSSO ? 'rotta-ballerina' : null });
  fini.push(`${r.minMax}'`);
  let prev = null, prevH = null;
  for (const q of r.ticks) {
    if (q.ph !== 'playing' || q.st !== 'tenuta' || q.pad == null) { prev = null; prevH = null; continue; }
    passi++;
    if (prev && prev.pad === q.pad) {
      const dx = q.x - prev.x, dy = q.y - prev.y, d = Math.hypot(dx, dy);
      if (d >= 0.15 && d <= 6) { const h = Math.atan2(dy, dx);
        if (prevH != null) { let dh = Math.abs(h - prevH); if (dh > Math.PI) dh = 2 * Math.PI - dh; segn++; dhSum += dh; if (dh > Math.PI / 4) dh45++; }
        prevH = h; }
    } else { if (prev) ngN++; prevH = null; }
    prev = q;
  }
}
await b.close(); srv.close();
const dhMed = segn ? dhSum / segn * 57.3 : 0, sv45 = segn ? 100 * dh45 / segn : 0;
console.log(`partite ${PARTITE} (minuto finale ${fini.join(' ')}) · battiti di tenuta in 'playing': ${passi} · coppie interne ${segn} · cambi di portatore ${ngN}`);
console.log(`deviazione media di rotta (interna): ${dhMed.toFixed(1)}°/passo · svolte >45°: ${sv45.toFixed(1)}%`);
if (segn < 40) { console.log('❌ SONDA CIECA: coppie insufficienti — la trama non si giudica su briciole'); process.exit(2); }
if (ROSSO) {
  if (dhMed >= DH_RED_MIN) { console.log(`✅ prova del rosso riuscita: con la rotta ballerina la deviazione sale (${dhMed.toFixed(1)}° >= ${DH_RED_MIN}°)`); process.exit(0); }
  console.log(`❌ PROVA DEL ROSSO FALLITA: deviazione ${dhMed.toFixed(1)}° anche con la rotta ballerina — la sonda non discrimina`); process.exit(2);
}
let ko = false;
if (dhMed > DH_MAX) { console.log(`❌ la rotta del possesso balla: ${dhMed.toFixed(1)}° > ${DH_MAX}°`); ko = true; }
if (sv45 > SV45_MAX) { console.log(`❌ troppe svolte secche: ${sv45.toFixed(1)}% > ${SV45_MAX}%`); ko = true; }
console.log(ko ? '' : '✅ il possesso ha una trama: chi porta palla segue la sua rotta');
process.exit(ko ? 2 : 0);
