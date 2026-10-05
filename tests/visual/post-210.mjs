#!/usr/bin/env node
/* [7.999.139 PO-210 «schermata post partita più standard», decisione PO 05/10 «come le schede carriera»]
   GUARDIANO sul salvataggio S12: si gioca una partita intera in autoplay (salta la premiazione se c'è) e si conta la schermata finale.
   VERDE: almeno 3 sezioni in fisarmonica della carriera ([data-cpm="sez210"]: il tuo tabellino, tabellino della gara, numeri).
   ROSSO (__CPM_NO_POST210): nessuna sezione, i titoli scritti a mano di prima. Uso: node post-210.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_POST210 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 360000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
  if (ph === 'ceremony') { try { await page.getByText('Salta premiazione', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {} await sleep(3000); }
  await sleep(2500);
  const n = await page.evaluate(() => document.querySelectorAll('[data-cpm="sez210"]').length);
  if (!rosso) await page.screenshot({ path: new URL('./out/post-210.png', import.meta.url).pathname, fullPage: true }).catch(() => {});
  esito[rosso ? 'rosso' : 'verde'] = { fase: ph, sezioni: n }; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const g = [];
if (!(esito.verde.sezioni >= 3)) g.push('verde: meno di 3 sezioni come le schede carriera ' + JSON.stringify(esito.verde));
if (!(esito.rosso.sezioni === 0)) g.push('rosso: sezioni presenti anche spente ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ post-210'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ post-210 verde (e il rosso si vede)');
