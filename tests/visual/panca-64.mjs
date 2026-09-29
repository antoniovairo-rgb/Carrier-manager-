#!/usr/bin/env node
/* [7.999.64 guardiano — collaudo PO «scattano le interazioni anche se sono in panchina e la grafica che dice che sono in panchina/a
   disposizione si accavalla»] Due misure a 412x915 con la panchina d'attesa forzata (__CPM_FORCE_BENCH):
   (1) il riquadro «A disposizione» non si sovrappone alla striscia delle statistiche;
   (2) facendo scorrere la partita fino al 50', nessuna scheda d'interazione dell'eroe (__CPM_NARR669().fatte).
   VERDE → sovrapposizione 0 px e 0 schede; ROSSO (__CPM_NO_PANCA64) → sovrapposizione > 0 e almeno una scheda.
   Uso: node panca-64.mjs   ·   CPM_ROSSO=1 per il solo braccio rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_BENCH_MIN = 70; if (r) window.__CPM_NO_PANCA64 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Panca64' });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_FROZEN = true; window.__CPM_FORCE_BENCH(false); }); await sleep(1200);
  const sov = await page.evaluate(() => { const a = document.querySelector('[data-cpm="panca64"]'), s = document.querySelector('[data-cpm="striscia918"]'); if (!a || !s) return null; const A = a.getBoundingClientRect(), S = s.getBoundingClientRect(); return Math.max(0, Math.min(A.bottom, S.bottom) - Math.max(A.top, S.top)) | 0; });
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const t0 = Date.now(); let min = 0;
  while (Date.now() - t0 < 150000) { await sleep(1500); min = await page.evaluate(() => (window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0) | 0); if (min >= 50) break; }
  const schede = await page.evaluate(() => { try { return ((window.__CPM_NARR669() || {}).fatte || []).length; } catch (e) { return null; } });
  await page.close(); return { sov, schede, min };
}
let ok = true;
if (!process.env.CPM_ROSSO) {
  const v = await braccio(false); console.log(`VERDE: sovrapposizione ${v.sov} px · schede d'interazione in panchina ${v.schede} (fino al ${v.min}')`);
  if (v.sov !== 0 || v.schede !== 0 || v.min < 40) { ok = false; console.log('✗ verde fallito'); }
}
const r = await braccio(true); console.log(`ROSSO (__CPM_NO_PANCA64): sovrapposizione ${r.sov} px · schede ${r.schede} (fino al ${r.min}')`);
if (!(r.sov > 0) || !(r.schede > 0)) { ok = false; console.log('✗ il rosso non mostra il difetto: il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ panca-64 verde (e il rosso si vede)' : '❌ panca-64 ROSSO'); process.exit(ok ? 0 : 1);
