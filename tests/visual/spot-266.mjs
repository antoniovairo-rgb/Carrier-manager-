#!/usr/bin/env node
/* [giro 43 PO-266 «ci sono A, B, C ma dice che gliela passa D»] GUARDIANO (GLB spento, teatro acceso, una pagina): forza un ANGOLO (gi6,
   il battitore viene piazzato alla bandierina) e subito dopo una scena col pallone all'EROE (gi126 e gi64). MISURATO prima (seme 147 al 71',
   3 su 4): il battitore dell'angolo restava «battitore» col punto della bandierina e la colla del renderer (7.405) lo teneva li' per tutta
   la lettura della scena dopo — nominato dal testo a 53 u dall'eroe. Misura: compagni (non portieri) entro 3 u da una bandierina in scelta
   azione della seconda scena, campionati per 900 ms. VERDE: 0 su entrambe. ROSSO (__CPM_NO_SPOT266): almeno 1 su almeno una.
   Uso: node spot-266.mjs */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const DOPO = [126, 64]; const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = { verde: [], rosso: [] };
const fase = (page) => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
const attendi = async (page, f, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (f(await fase(page))) return true; await sleep(150); } return false; };
for (const rosso of [false, true]) for (const gi of DOPO) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; window.__CPM_REC = 1; if (r) window.__CPM_NO_SPOT266 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Spot 266' }); await sleep(1200);
  await page.evaluate(() => { window.__CPM_FORCE_SIT(6, false); window.__CPM_FROZEN = false; });
  await attendi(page, f => f === 'hl_choose', 30000); await sleep(600);
  let bat = 0; for (let k = 0; k < 6; k++) { bat = Math.max(bat, await page.evaluate(() => { const st = window.__CPM_STATE(); return (st.players || []).filter(p => p.team === 'home' && !p.gk && Math.hypot(p.x - 97, Math.min(Math.abs(p.y - 2.5), Math.abs(p.y - 97.5))) < 6).length; })); await sleep(150); }
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await attendi(page, f => f === 'hl_result', 15000); await sleep(1500);
  await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await attendi(page, f => f === 'hl_choose', 30000);
  let max = 0; for (let k = 0; k < 6; k++) { const n = await page.evaluate(() => { const st = window.__CPM_STATE(); return (st.players || []).filter(p => p.team === 'home' && !p.gk && Math.hypot(p.x - 97, Math.min(Math.abs(p.y - 2.5), Math.abs(p.y - 97.5))) < 3).length; }); max = Math.max(max, n); await sleep(150); }
  const r = { gi, battitoreAllAngolo: bat, incollatiDopo: max }; esito[rosso ? 'rosso' : 'verde'].push(r); console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(r)); await page.close();
}
await b.close(); srv.close();
const g = [];
if (!esito.verde.concat(esito.rosso).some(x => x.battitoreAllAngolo >= 1)) g.push('cieco: nessun battitore alla bandierina nella scena d\'angolo ' + JSON.stringify(esito.verde));
if (!esito.verde.every(x => x.incollatiDopo === 0)) g.push('verde: compagno incollato alla bandierina nella scena dopo ' + JSON.stringify(esito.verde));
if (!esito.rosso.some(x => x.incollatiDopo >= 1)) g.push('rosso: il difetto non si vede spento ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ spot-266'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ spot-266 verde (e il rosso si vede)');
