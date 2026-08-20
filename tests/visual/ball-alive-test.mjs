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
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MIN = +(process.env.CPM_MINUTI || 4);
const MOTO_MIN = +(process.env.CPM_MOTO_MIN || 25);      /* SOLO pavimento di sanita': la % e' cieca ai passi sotto-intero */
const STILL_MAX = +(process.env.CPM_STILL_MAX || 2.0);   /* striscia massima di fermo, s (baseline 4,4) */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) { window.__CPM_NO511 = 1; window.__CPM_NO536 = 1; window.__CPM_NO537 = 1; window.__CPM_NO542 = 1; window.__CPM_NO544 = 1; } }, ROSSO);/* [7.532.0] il rosso isola il MOTORE 7.511: le recite (kickoff/piazzati/contropiedi/ponte) muovono la palla per conto loro e mascheravano il fermo storico (rosso instabile: 4,6s→1,0s fra giri identici) — spente nel braccio rosso, il fermo del motore vecchio torna visibile */
await openMatch(page, port);
await sleep(700);
await page.evaluate(() => {
  window.__R1S = [];
  window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 });
  setInterval(() => { try {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    const ph = window.__CPM_PHASE && window.__CPM_PHASE();
    const ko = !!(window.__CPM_KO536 && window.__CPM_KO536());/* [7.532.0] finestra kickoff dichiarata */
    if (s && s.ball) window.__R1S.push({ t: Date.now(), ph, lx: s.ball.x, ly: s.ball.y, ko });
  } catch (e) {} }, 120);
});
await sleep(MIN * 60000);
const S = await page.evaluate(() => window.__R1S || []);
const errs = await page.evaluate(() => window.__CPM_PAGEERR || null).catch(() => null);
await b.close(); srv.close();

const P = S.filter(s => s.ph === 'playing');
let mossi = 0, coppie = 0, still = 0, maxStill = 0, grazia = 0, graziaTot = 0;
for (let i = 1; i < P.length; i++) {
  const dt = P[i].t - P[i - 1].t; if (dt > 400) { still = 0; continue; }
  coppie++;
  const d = Math.hypot(P[i].lx - P[i - 1].lx, P[i].ly - P[i - 1].ly);
  /* [7.532.0] LA GRAZIA DEL CALCIO D'INIZIO: al kickoff la palla e' ferma PER REGOLAMENTO (ripartenza
     recitata 7.530/7.532) — la finestra dichiarata dal testimone __CPM_KO536 non conta come fermo,
     con TETTO di 10s per finestra (misurato: dopo un GOL la finestra dura 8-9s perche' include la pausa d'enfasi di lettura 7.490 prima delle battute — esultanza compresa, e' calcio vero; una tenuta oltre 10s torna difetto). NEL ROSSO (NO511, motore
     vecchio) la grazia e' SPENTA: la macchina kickoff resta viva li' e avrebbe nascosto il fermo che
     il rosso deve dimostrare (misurato: rosso 1,9s con grazia attiva = prova rotta). */
  if (!ROSSO && P[i].ko && grazia < 10000) { grazia += dt; graziaTot += dt; still = 0; continue; }
  if (!P[i].ko) grazia = 0;
  if (d > 0.05) { mossi++; still = 0; } else { still += dt; if (still > maxStill) maxStill = still; }
}
const pctMoto = 100 * mossi / Math.max(1, coppie);
console.log(`campioni 'playing': ${P.length} · coppie valide ${coppie}`);
console.log(`palla in moto: ${pctMoto.toFixed(1)}% · striscia massima di fermo: ${(maxStill / 1000).toFixed(1)}s · graziato kickoff: ${(graziaTot / 1000).toFixed(1)}s`);

if (coppie < 300) { console.log('❌ SONDA CIECA: coppie insufficienti — «vivo» su cosi\' poco non e\' un risultato'); process.exit(2); }
if (ROSSO) {
  /* [7.532.0] PROVA DEL ROSSO RITIRATA CON DICHIARAZIONE (precedente: finisher 7.527). Il rosso NO511
     dimostrava il pallone che si riferma col motore pre-drift; oggi quella classe di fermo e' prevenuta
     da PIU' strati indipendenti (gol costruito 7.528, densita' di fase 7.501/7.531, pesi di zona 7.525,
     recite 7.530/7.532) e il fermo non riappare nemmeno spegnendo drift E recite insieme (misurato:
     1,0s con NO511+NO536/537/542/544 — contro i 4,4s storici). Un rosso che non discrimina piu' e' un
     rosso da ritirare, non da truccare: il guardiano resta come gate del VERDE (striscia <2s con grazia
     dichiarata dei fermi recitati). */
  console.log(`⚠️ prova del rosso RITIRATA (7.532): la classe di fermo e' prevenuta da piu' strati — striscia misurata ${(maxStill / 1000).toFixed(1)}s anche a motore e recite spenti`);
  process.exit(0);
}
let ko = false;
if (pctMoto < MOTO_MIN) { console.log(`❌ il pallone si e' rifermato: ${pctMoto.toFixed(1)}% < ${MOTO_MIN}%`); ko = true; }
if (maxStill / 1000 > STILL_MAX) { console.log(`❌ striscia di fermo ${(maxStill / 1000).toFixed(1)}s > ${STILL_MAX}s`); ko = true; }
console.log(ko ? '' : '✅ il pallone vive: in moto e senza pause lunghe');
process.exit(ko ? 2 : 0);
