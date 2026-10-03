#!/usr/bin/env node
/* [7.999.126 PO-204 collaudo PO 03/10 22:49 «Prenditi più spazio verticale per il disegno delle formazioni»] GUARDIANO sul percorso
   vero (salvataggio di prova → partita → «Vedi le formazioni»): lo spazio libero sotto la schermata va alle linee dei campetti.
   Verde: su 412x915 respiro per linea >= 20 px e pagina senza scorrimento; su 360x740 pagina senza scorrimento. Rosso
   (__CPM_NO_FORMAZ204): respiro 0 su 412x915 (la schermata compatta della 7.999.24). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const [W, H, R] of [[412, 915, 0], [412, 915, 1], [360, 740, 0]]) {
  const page = await b.newPage({ viewport: { width: W, height: H } }); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; if (s.r) window.__CPM_NO_FORMAZ204 = 1; const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: R });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch()); await sleep(2500);
  for (let k = 0; k < 4; k++) { if (await page.evaluate(() => !!document.querySelector('[data-cpm="formazioni23"]'))) break;
    try { await page.getByRole('button', { name: /Vedi le formazioni/i }).first().click({ timeout: 3000 }); } catch (e) {} await sleep(1500); }
  await sleep(1200);
  esito[W + 'x' + H + (R ? '-rosso' : '')] = await page.evaluate(() => { const e = document.querySelector('[data-cpm="formazioni23"]'); return e ? { gap: +e.getAttribute('data-gap204'), scorre: document.scrollingElement.scrollHeight > innerHeight + 1 } : null; });
  await page.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(esito));
const V = esito['412x915'], R = esito['412x915-rosso'], P = esito['360x740'], g = [];
if (!V || V.gap < 20 || V.scorre) g.push('verde 412x915: ' + JSON.stringify(V));
if (!P || P.scorre) g.push('verde 360x740: la pagina scorre ' + JSON.stringify(P));
if (!R || R.gap !== 0) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ formazioni-204'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ formazioni-204 verde (e il rosso si vede)');
