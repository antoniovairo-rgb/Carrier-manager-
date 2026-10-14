#!/usr/bin/env node
/* [7.999.165 PO-233 «Che significa 1489 giornata?», foto PO 14/10 (Calendario · Prossime partite: «vs Portogallo · Nazionale ·
   1489ª giornata · sett. 19»)] La voce di calendario della Nazionale nasce con matchday = 1470 + settimana (src/18-career-app.jsx,
   calendario della Nazionale): e' un codice interno, non una giornata. La lista «Prossime partite» lo stampava come giornata.
   VERDE: la riga della Nazionale dice la competizione («Amichevole Internazionale») e in lista non c'e' nessuna «NNNª giornata» >= 990.
   ROSSO (__CPM_NO_GIORN233): ricompare «1489ª giornata» (o 1470 + settimana). Uso: node giornata-233.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; const w = (pl.week | 0) + 1;
  pl.calendar = (pl.calendar || []).concat([{ matchday: 1470 + w, week: w, opponentName: 'Portogallo', isHome: true, played: false, type: 'national', competition: 'Amichevole Internazionale' }]);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_GIORN233 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await sleep(1500);
  const t = await page.evaluate(() => document.body.innerText);
  const riga = (t.split('\n').map((x, i, a) => /Portogallo/.test(x) ? x + ' | ' + (a[i + 1] || '') + ' | ' + (a[i + 2] || '') : null).filter(Boolean)[0]) || '';
  const codici = (t.match(/\b(\d{3,})ª giornata/g) || []).filter(x => parseInt(x) >= 990);
  esito[rosso ? 'rosso' : 'verde'] = { riga, codici, amichevole: /Amichevole Internazionale/.test(riga) };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde']));
  await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!V.riga) g.push('verde: riga della Nazionale non trovata in Prossime partite');
if (V.codici.length || !V.amichevole) g.push('verde: ' + JSON.stringify(V));
if (!R.codici.length) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ giornata-233'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ giornata-233 verde (Nazionale senza «1489ª giornata») e il rosso si vede'); process.exit(0);
