#!/usr/bin/env node
/* [7.999.45 sonda — taccuino PO SIT #3: «001, eroe >= 43,3 u» e, da noi, 1 giro su 4 con l'eroe che parte da centrocampo]
   Pagina nuova per giro: forza la scena, legge il testimone __CPM_CUT45 (salti del bersaglio dell'eroe: teletrasporto concesso o
   negato, eta' della finestra dello stacco) e la posizione dell'eroe all'ingresso in scelta, contro la zona dichiarata dalla scena.
   CPM_GI (3) · CPM_GIRI (6) · CPM_GLB (1) · CPM_INIT codice da iniettare (bracci). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = +(process.env.CPM_GI || 3), GIRI = +(process.env.CPM_GIRI || 6), GLB = process.env.CPM_GLB !== '0';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let lontani = 0, negati = 0;
for (let g = 0; g < GIRI; g++) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(gl => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_CUT45_REC = 1; if (!gl) window.__CPM_GLB = false; window.__LT = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__LT.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {} }, GLB);
  if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
  await openMatch(page, port, { skipLoadAll: true, name: 'Stacco45' }); await sleep(1500);
  if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const t0 = await page.evaluate(g => { window.__CPM_CUT45 = []; window.__CPM_STACCO45 = null; window.__LT = []; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; return Math.round(performance.now()); }, GI);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(600);
  const r = await page.evaluate(() => { const s = window.__CPM_STATE(); return { hero: s.hero, ball: s.ball, cut: window.__CPM_CUT45 || [], st: window.__CPM_STACCO45 || null, lt: (window.__LT || []).slice() }; });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(1); });
  let hr = null; for (let i = 0; i < 40 && !hr; i++) { await sleep(150); hr = await page.evaluate(() => (window.__CPM_PHASE() === 'hl_result') ? window.__CPM_STATE().hero : null).catch(() => null); }
  const _cl = 1;
  await page.close();
  const h = r.hero || {}, bb = r.ball || {}; const dist = Math.hypot((h.x || 0) - (bb.x || 0), ((h.y || 0) - (bb.y || 0)) * 0.68);
  const neg = r.cut.filter(c => !c.ok && c.salto < 1e8); if (hr && hr.x < 70) lontani++; if (neg.length) negati++;
  const lt = r.lt.filter(x => x[0] >= t0).map(x => x[1]); 
  console.log(`giro ${g + 1}: eroe in scelta (${h.x},${h.y}) · pallone (${bb.x},${bb.y}) · eroe all'esito ${hr ? '(' + hr.x + ',' + hr.y + ')' : '?'} · distanza ${dist.toFixed(1)} · salti del bersaglio ${JSON.stringify(r.cut.slice(0, 4))} · motore ${JSON.stringify(r.st)}`);
}
await b.close(); srv.close();
console.log(`\ngiri ${GIRI} · eroe fuori dalla zona della scena all'esito (x < 70) ${lontani} · giri con teletrasporto negato ${negati}`);
