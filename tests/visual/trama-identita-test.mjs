#!/usr/bin/env node
/* GUARDIANO — LA TRAMA HA UN'IDENTITA' DI MODULO (7.531.0).
   Direttiva PO: «ogni squadra deve avere in base a tattica/formazione/mentalita' il suo sviluppo di
   gioco: un 433 e' diverso da un 352». Rimedio: quattro pomelli per modulo (pesi corridoio · cambio
   gioco · passo di sviluppo · scarico) consumando GLI STESSI sorteggi _r511 (invariante 7.511).

   COME GIUDICA — PER ENUMERAZIONE, NON PER STATISTICA. Due stesure precedenti sono state buttate con
   le loro misure: (1) la quota di dwell nel corridoio centrale era cieca per costruzione (corridoio
   PERSISTENTE: ~5 scelte effettive a partita — 31 punti di «separazione» col rimedio SPENTO, puro
   rumore); (2) il testimone per-scelta raccoglieva 5 pick in 2 partite (la trama nasce solo al cambio
   di possesso). La scelta di corridoio e' troppo RARA per qualunque campionamento: la mappa si
   giudica per sweep — il gancio __CPM_IDMAP538 percorre il codice VERO (profilo di modulo + mappa
   pesata condivisa col drift) su una griglia di 200 sorteggi per entrambe le direzioni:
   · VERDE: lo sweep riproduce ESATTAMENTE la mappa pesata attesa dei moduli forzati (4-3-3 casa /
     3-5-2 ospiti), e la zona di divergenza dalla mappa storica 0,34/0,67 e' non-vuota e nel verso
     giusto (352 piu' centrale del 433). In volo: ogni pick del testimone combacia con lo sweep.
   · ROSSO (CPM_ROSSO=1 → __CPM_NO538): lo sweep collassa sulla mappa storica per entrambe le
     direzioni, e i pick in volo la rispettano.
   Lezioni ereditate: mai __CPM_FORCED_MODE; __CPM_FORCE_FORM538 fissa i moduli. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, matchPhase, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const N = 200;
const legacy = u => (u < 0.34 ? 0 : u < 0.67 ? -1 : 1);
const pesata = (u, w) => { const T = w[0] + w[1] + w[2], v = u * T; return v < w[1] ? 0 : v < w[1] + w[0] ? -1 : 1; };
const ATT = { home: '4-3-3', away: '3-5-2' };
const TAB = { '4-3-3': [1.25, 0.70, 1.25], '3-5-2': [0.85, 1.35, 0.85] };

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(a => { window.__CPM_GLB = false; window.__CPM_IDPICK538 = [];
  window.__CPM_FORCE_FORM538 = a.att; if (a.rosso) window.__CPM_NO538 = 1; }, { att: ATT, rosso: ROSSO });
await openMatch(page, port, { skipLoadAll: true, name: 'Ident' });
await sleep(700);

/* 1 · LO SWEEP: la mappa vera, per enumerazione */
const sweep = await page.evaluate(n => {
  const out = { home: [], away: [] };
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n;
    out.home.push(window.__CPM_IDMAP538(1, u)); out.away.push(window.__CPM_IDMAP538(-1, u)); }
  return out;
}, N);

let sbagliati = 0, diverg = { home: 0, away: 0 }, cenH = 0, cenA = 0;
for (let i = 0; i < N; i++) { const u = (i + 0.5) / N;
  const eH = ROSSO ? legacy(u) : pesata(u, TAB[ATT.home]);
  const eA = ROSSO ? legacy(u) : pesata(u, TAB[ATT.away]);
  if (sweep.home[i] !== eH) sbagliati++;
  if (sweep.away[i] !== eA) sbagliati++;
  if (!ROSSO) { if (eH !== legacy(u)) diverg.home++; if (eA !== legacy(u)) diverg.away++; }
  if (sweep.home[i] === 0) cenH++; if (sweep.away[i] === 0) cenA++;
}
console.log(`sweep ${N}×2: fuori mappa ${sbagliati} · centro casa(433) ${(100 * cenH / N).toFixed(1)}% · centro ospiti(352) ${(100 * cenA / N).toFixed(1)}%${ROSSO ? '' : ' · zona divergenza ' + diverg.home + '/' + diverg.away}`);

/* 2 · IL CABLAGGIO: una partita, ogni pick del volo deve combaciare con lo sweep */
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 }));
const t0 = Date.now();
while (Date.now() - t0 < 300000) { const ph = await matchPhase(page); if (ph === 'ended') break; await sleep(5000); }
const picks = await page.evaluate(() => window.__CPM_IDPICK538 || []).catch(() => []);
srv.close(); await b.close();

let voloBad = 0;
for (const p of picks) {
  const att = ROSSO ? legacy(p.u) : pesata(p.u, TAB[p.d > 0 ? ATT.home : ATT.away]);
  if (p.cor !== att) voloBad++;
  if (ROSSO && (p.on !== 0 || p.w != null)) voloBad++;
  if (!ROSSO && p.on !== 1) voloBad++;
}
console.log(`volo: ${picks.length} pick · fuori mappa ${voloBad}`);

if (sbagliati) { console.log('❌ LA MAPPA NON E' + "'" + ' QUELLA DICHIARATA'); process.exit(1); }
if (picks.length < 1) { console.log('❌ SONDA CIECA sul cablaggio: nessun pick in volo'); process.exit(2); }
if (voloBad) { console.log('❌ CABLAGGIO ROTTO: il drift non usa la mappa dello sweep'); process.exit(1); }
if (ROSSO) { console.log('✅ ROSSO ONESTO: identita' + "'" + ' spenta = mappa storica ovunque'); process.exit(0); }
if (!diverg.home || !diverg.away || cenA <= cenH) { console.log('❌ IDENTITA' + "'" + ' TEORICA: i moduli non divergono (o nel verso sbagliato)'); process.exit(1); }
console.log('✅ VERDE: il 3-5-2 palleggia al centro, il 4-3-3 vive sulle ali — per mappa e in volo');
process.exit(0);
