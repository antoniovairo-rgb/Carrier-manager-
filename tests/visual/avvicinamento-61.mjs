#!/usr/bin/env node
/* [giro 61 — salto di avvicinamento, annotato dal giro 53] GUARDIANO (GLB spento, teatro acceso, pagina nuova per scena). Forza scene
   DIFENSIVE col portatore avversario (gi168 «Tackle duro», gi138, gi33, gi146) e legge il testimone __CPM_AVV61 (src/12, ramo
   «avvicinamento»): velocita' di SCENA massima del pallone mentre raggiunge il portatore in hl_intro/hl_choose. Grandezza in u/s di scena,
   indipendente dagli fps. MISURATO prima: lerp min(1,aDt*10) → a passo >= 0,1 s il pallone copre la distanza intera in un fotogramma.
   Due grandezze: vmax = velocita' di scena nelle fasi IN MOTO (intro/move, fuori dallo stacco nero); gap = distanza pallone→portatore
   all'ultimo fotogramma scritto, cioe' quello che resta a schermo nella lettura FERMA della scelta.
   VERDE: vmax <= 23 u/s (tetto 22) e gap <= 1,5 u su ogni scena. ROSSO (__CPM_NO_AVV61): vmax > 40 u/s o gap > 5 u su almeno una scena.
   CIECO (uscita 2): testimone mai scritto.
   Uso: node avvicinamento-61.mjs */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const GI = (process.env.CPM_GI || '168,138,33,146').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = { verde: [], rosso: [] };
const fase = (page) => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
const attendi = async (page, f, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (f(await fase(page))) return true; await sleep(150); } return false; };
for (const rosso of [false, true]) for (const gi of GI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; if (r) window.__CPM_NO_AVV61 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Avv 61' }); await sleep(1000);
  await page.evaluate(g => { window.__CPM_AVV61 = null; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await attendi(page, f => f === 'hl_choose', 30000); await sleep(2500);
  const w = await page.evaluate(() => window.__CPM_AVV61);
  const r = { gi, n: w ? w.n : 0, nCut: w ? w.nCut : 0, vmax: w ? w.vmax : null, smax: w ? w.smax : null, gap: w ? w.gap : null, fasi: w ? w.ph : null };
  esito[rosso ? 'rosso' : 'verde'].push(r); console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(r)); await page.close();
}
await b.close(); srv.close();
const tutti = esito.verde.concat(esito.rosso);
if (!tutti.some(x => x.n > 0)) { console.log('⚠️ avvicinamento-61 CIECO: testimone mai scritto'); process.exit(2); }
const g = [];
const vv = esito.verde.filter(x => x.n > 0);
if (!vv.length) g.push('verde cieco: nessuna scena col portatore difensivo');
if (!vv.every(x => x.vmax <= 23)) g.push('verde: pallone oltre 23 u/s di scena verso il portatore ' + JSON.stringify(vv));
if (!vv.every(x => x.gap != null && x.gap <= 1.5)) g.push('verde: nella lettura il pallone non e\' ai piedi del portatore ' + JSON.stringify(vv));
if (!esito.rosso.some(x => x.vmax > 40 || x.gap > 5)) g.push('rosso: il difetto non si vede spento ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ avvicinamento-61'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ avvicinamento-61 verde (e il rosso si vede)');
