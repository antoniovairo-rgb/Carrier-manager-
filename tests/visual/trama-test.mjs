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
import { startServer, launchBrowser, installCdnRoutes, openMatch, matchPhase, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 3);
/* TARATURA a copertura piena (3 partite per braccio, 96/100 coppie interne):
   VERDE 11,0°/passo · svolte>45° 7,3% · inversioni 5,2% · corridoio mediano 25 tick
   ROSSO 56,0°/passo · svolte>45° 46,0% · inversioni 18,0% · corridoio 13 tick
   Le soglie stanno fra i regimi, con margine ~2x dal verde. */
const DH_MAX = +(process.env.CPM_DH_MAX || 20);        /* ° per passo interno, braccio verde (misurato 11,0) */
const SV45_MAX = +(process.env.CPM_SV45_MAX || 16);    /* % passi interni con svolta >45°, verde (misurato 7,3) */
const DH_RED_MIN = +(process.env.CPM_DH_RED_MIN || 38);/* il rosso deve stare SOPRA (misurato 56,0) */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const T = [];
for (let m = 0; m < PARTITE; m++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_TRAMA527 = []; if (r) window.__CPM_NO527 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Validator' + m });
  await sleep(700);
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 }));
  const t0 = Date.now();
  while (Date.now() - t0 < 300000) { const ph = await matchPhase(page); if (ph === 'ended') break; await sleep(5000); }
  const t = await page.evaluate(() => window.__CPM_TRAMA527 || []).catch(() => []);
  T.push(...t);
  await page.close();
}
await b.close(); srv.close();

const P = T.filter(s => s.ph === 'playing');
let segn = 0, prevH = null, dhSum = 0, dh45 = 0, ngN = 0;
for (let i = 1; i < P.length; i++) {
  const dx = P[i].x - P[i - 1].x, dy = P[i].y - P[i - 1].y;
  const d = Math.hypot(dx, dy); if (d < 0.15 || d > 6) { prevH = null; continue; }
  const h = Math.atan2(dy, dx);
  if (P[i].ng) { ngN++; prevH = h; continue; }/* cambio giocata / ripresa: svolta voluta, fuori giudizio */
  if (prevH != null) { let dh = Math.abs(h - prevH); if (dh > Math.PI) dh = 2 * Math.PI - dh; segn++; dhSum += dh; if (dh > Math.PI / 4) dh45++; }
  prevH = h;
}
const dhMed = segn ? dhSum / segn * 57.3 : 0, sv45 = segn ? 100 * dh45 / segn : 0;
console.log(`passi drift 'playing': ${P.length} · coppie interne ${segn} · cambi giocata/riprese ${ngN}`);
console.log(`deviazione media di rotta (interna): ${dhMed.toFixed(1)}°/passo · svolte >45°: ${sv45.toFixed(1)}%`);
if (segn < 40) { console.log('❌ SONDA CIECA: coppie insufficienti — la trama non si giudica su briciole'); process.exit(2); }
if (ROSSO) {
  if (dhMed >= DH_RED_MIN) { console.log(`✅ prova del rosso riuscita: col random-walk la rotta balla (${dhMed.toFixed(1)}° >= ${DH_RED_MIN}°)`); process.exit(0); }
  console.log(`❌ PROVA DEL ROSSO FALLITA: deviazione ${dhMed.toFixed(1)}° anche col motore vecchio — la sonda non discrimina`); process.exit(2);
}
let ko = false;
if (dhMed > DH_MAX) { console.log(`❌ la rotta del possesso balla ancora: ${dhMed.toFixed(1)}° > ${DH_MAX}°`); ko = true; }
if (sv45 > SV45_MAX) { console.log(`❌ troppe svolte secche: ${sv45.toFixed(1)}% > ${SV45_MAX}%`); ko = true; }
console.log(ko ? '' : '✅ il possesso ha una trama: rotta stabile fra le giocate');
process.exit(ko ? 2 : 0);
