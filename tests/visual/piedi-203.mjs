#!/usr/bin/env node
/* [7.999.140 PO-203 «l'eroe affonda nell'erba» nella festa e nella premiazione] GUARDIANO GLB-ON sul salvataggio S12: si gioca una
   partita intera in autoplay (seme 7: le scene trascinano giu' la quota a terra, misurato 0,124 → 0,094) e si legge il piede piu'
   basso dell'eroe durante la cerimonia (__CPM_FOOT77). VERDE: il piede resta almeno al 90% del piede da fermo (misurato: verde 0,115 su 0,124, rosso 0,093) misurato al calcio
   d'inizio (nessun affondamento). ROSSO (__CPM_NO_PIEDI203): il piede scende sotto quella soglia. Uso: node piedi-203.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_REC = true; if (s.r) window.__CPM_NO_PIEDI203 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '', fs0 = null;
  while (Date.now() - t0 < 560000) { const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), f: window.__CPM_FOOT77 ? window.__CPM_FOOT77() : null })); ph = s.ph; if (s.f && s.f.fs != null && fs0 == null) fs0 = s.f.fs; if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
  const piedi = []; let f0 = null;
  for (let k = 0; k < 16; k++) { const f = await page.evaluate(() => window.__CPM_FOOT77 ? window.__CPM_FOOT77() : null); if (f && f.ct != null && f.ct > 0.5) { piedi.push(f.foot); f0 = f.f0; } await sleep(600); }
  if (!rosso) await page.screenshot({ path: new URL('./out/piedi-203.png', import.meta.url).pathname }).catch(() => {});
  const min = piedi.length ? Math.min(...piedi) : null;
  esito[rosso ? 'rosso' : 'verde'] = { fase: ph, fermo: fs0, quotaMinPartita: f0, piedeMinFesta: min, campioni: piedi.length };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
const ok = e => e.fermo != null && e.piedeMinFesta != null && e.piedeMinFesta >= 0.90 * e.fermo;
if (!(V.campioni >= 5 && ok(V))) g.push('verde: il piede affonda in festa ' + JSON.stringify(V));
if (!(R.campioni >= 5 && !ok(R))) g.push('rosso: nessun affondamento anche spento (la partita non ha abbassato la quota?) ' + JSON.stringify(R));
if (g.length) { console.log('❌ piedi-203'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ piedi-203 verde (e il rosso si vede)');
