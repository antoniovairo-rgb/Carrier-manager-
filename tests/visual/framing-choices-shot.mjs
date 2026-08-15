#!/usr/bin/env node
/* PROVINI DELL'INQUADRATURA — la stessa conclusione a quattro distanze di camera, col numero accanto.

   PERCHE'. Il censimento del 7.480 (`npm run hero-framing`) ha misurato che l'eroe occupa il 5,7%
   dell'altezza schermo (mediana su 191 scene), che il 99% delle scene sta sotto la soglia oltre cui un
   gesto di arti non e' distinguibile, e che su 42 scene l'eroe esce proprio dal quadro. Il numero c'e';
   la DECISIONE no — e non e' una correzione, e' regia: tocca al PO dire quanto stringere, e su quali
   famiglie. Una decisione di regia si prende guardando, non leggendo una mediana.

   COSA PRODUCE. Per ogni scena scelta, il fotogramma della CONCLUSIONE a quattro distanze di camera
   (manopola test-only `__CPM_ZOOM480`: avvicina la camera al punto che guarda, direzione invariata),
   con stampata accanto l'altezza apparente MISURATA a quella distanza. Cosi' la scelta e' «voglio la
   riga da 0,18», non «piu' stretto».

   ⚠️ GLB-ON (direttiva PO 2026-07-29): si decide guardando cio' che vede il giocatore, e sotto il CH38
   le pose procedurali sono invisibili. ⚠️ Il tempo di scena headless scorre a un decimo: le distanze
   sono giudicabili, i TEMPI no.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node framing-choices-shot.mjs                            */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const SCENE = (process.env.CPM_SITS || '0,7,94,30').split(',').map(v => +v.trim());
const ZOOM = (process.env.CPM_ZOOMS || '1,0.6,0.42,0.3').split(',').map(Number);
const OUT = 'out/framing/provini';
fs.mkdirSync(OUT, { recursive: true });

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
/* 2x di pixel: la decisione riguarda la leggibilita' di un gesto, e a scala 1 si giudica il proprio monitor */
const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; });
await openMatch(page, port);
await sleep(1200);

const righe = [];
for (const gi of SCENE) {
  for (const k of ZOOM) {
    const ok = await forceSituation(page, gi, { settle: 450, choose: true }).then(() => true).catch(() => false);
    if (!ok) continue;
    const azione = await page.evaluate(() => { const a = (window.__CPM_ACTS && window.__CPM_ACTS()) || []; return (a[0] && a[0].label) || null; }).catch(() => null);
    await page.evaluate(z => { window.__CPM_ZOOM480 = z; window.__CPM_FRAME480 = null; window.__CPM_FORCE_OUTCOME = 'success'; }, k);
    await page.evaluate(() => { try { window.__CPM_RESOLVE(0); } catch (e) {} });
    await sleep(2400);
    const f = await page.evaluate(() => window.__CPM_FRAME480 || null);
    const file = `${OUT}/gi${String(gi).padStart(3, '0')}_z${String(k).replace('.', 'p')}.png`;
    await page.screenshot({ path: file });
    righe.push({ gi, k, azione, alt: f ? f.max : null, fuori: f ? f.fuori : null, file });
    console.log(`  gi${String(gi).padStart(3)} · camera ${String(k).padEnd(5)} → altezza eroe ${f && f.max != null ? f.max.toFixed(3) : ' — '} ${f && f.fuori ? `(fuori quadro ${f.fuori} fr)` : ''}`);
  }
}
await page.evaluate(() => { window.__CPM_ZOOM480 = null; }).catch(() => {});
await b.close(); srv.close();

console.log(`\n=== provini in ${OUT}/ ===`);
for (const gi of SCENE) {
  const r = righe.filter(x => x.gi === gi);
  if (!r.length) continue;
  console.log(`\ngi${gi} «${r[0].azione || '—'}»`);
  for (const x of r) console.log(`   camera ${String(x.k).padEnd(5)} · altezza ${x.alt != null ? x.alt.toFixed(3) : '—'}${x.fuori ? ' · ESCE DAL QUADRO' : ''} → ${x.file.split('/').pop()}`);
}
console.log('\nriferimento: piano americano da regia sportiva 0,35-0,60 · sotto 0,15 il gesto non si distingue · attuale mediana 0,057');
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
