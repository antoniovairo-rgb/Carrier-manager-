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
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO511 = 1; }, ROSSO);
await openMatch(page, port);
await sleep(700);
await page.evaluate(() => {
  window.__R1S = [];
  window.__CPM_AUTOPLAY(true, { seed: 424, policy: 'seeded', tickMs: 350 });
  setInterval(() => { try {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    const ph = window.__CPM_PHASE && window.__CPM_PHASE();
    if (s && s.ball) window.__R1S.push({ t: Date.now(), ph, lx: s.ball.x, ly: s.ball.y });
  } catch (e) {} }, 120);
});
await sleep(MIN * 60000);
const S = await page.evaluate(() => window.__R1S || []);
const errs = await page.evaluate(() => window.__CPM_PAGEERR || null).catch(() => null);
await b.close(); srv.close();

const P = S.filter(s => s.ph === 'playing');
let mossi = 0, coppie = 0, still = 0, maxStill = 0;
for (let i = 1; i < P.length; i++) {
  const dt = P[i].t - P[i - 1].t; if (dt > 400) { still = 0; continue; }
  coppie++;
  const d = Math.hypot(P[i].lx - P[i - 1].lx, P[i].ly - P[i - 1].ly);
  if (d > 0.05) { mossi++; still = 0; } else { still += dt; if (still > maxStill) maxStill = still; }
}
const pctMoto = 100 * mossi / Math.max(1, coppie);
console.log(`campioni 'playing': ${P.length} · coppie valide ${coppie}`);
console.log(`palla in moto: ${pctMoto.toFixed(1)}% · striscia massima di fermo: ${(maxStill / 1000).toFixed(1)}s`);

if (coppie < 300) { console.log('❌ SONDA CIECA: coppie insufficienti — «vivo» su cosi\' poco non e\' un risultato'); process.exit(2); }
if (ROSSO) {
  if (maxStill / 1000 > STILL_MAX) { console.log(`✅ prova del rosso riuscita: col motore vecchio il pallone si riferma (striscia ${(maxStill / 1000).toFixed(1)}s > ${STILL_MAX}s)`); process.exit(0); }
  console.log(`❌ PROVA DEL ROSSO FALLITA: striscia ${(maxStill / 1000).toFixed(1)}s anche col motore vecchio — la sonda non discrimina`); process.exit(2);
}
let ko = false;
if (pctMoto < MOTO_MIN) { console.log(`❌ il pallone si e' rifermato: ${pctMoto.toFixed(1)}% < ${MOTO_MIN}%`); ko = true; }
if (maxStill / 1000 > STILL_MAX) { console.log(`❌ striscia di fermo ${(maxStill / 1000).toFixed(1)}s > ${STILL_MAX}s`); ko = true; }
console.log(ko ? '' : '✅ il pallone vive: in moto e senza pause lunghe');
process.exit(ko ? 2 : 0);
