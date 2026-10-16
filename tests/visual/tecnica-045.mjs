#!/usr/bin/env node
/* [giro 45 PO-022/PO-068] GUARDIANO: la tecnica nominata dall'opzione dell'eroe arriva al 3D anche su CROSS e DRIBBLING (il 7.222 lo
   faceva gia' per il tiro). Prima `decideExecution` sostituiva la variante dell'etichetta: «Cross a rientrare» diventava un cross sul
   primo palo, il doppio passo non arrivava mai. Si forzano le schede del catalogo con opzioni cross/dribbling (GLB spento: e' logica),
   si risolve ciascuna opzione e si legge il testimone __CPM_TEC045 (variante dell'etichetta → variante passata al 3D).
   VERDE: almeno 10 opzioni con tecnica nominata e nessuna cambiata (misurato: 0/21; rosso 21/24). Il doppio passo nel catalogo e'
   solo preparazione di cross/tiro (hl.pre), non una variante di dribbling: e' stampato, non giudicato.
   ROSSO (__CPM_NO_TEC045): almeno una opzione con tecnica nominata cambiata. Uso: node tecnica-045.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const b = await launchBrowser();
const giro = async (rosso) => {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_TEC045 = 1; }, rosso);
  await openMatch(page, srv.address().port, { name: 'Tecnica 045' }); await sleep(800);
  const casi = await page.evaluate(() => { const out = []; for (let gi = 0; gi < SITUATIONS.length; gi++) { const A = SITUATIONS[gi].actions || []; for (let k = 0; k < A.length; k++) { let hl = null; try { hl = deriveHL(SITUATIONS[gi], A[k]); } catch (e) {} if (hl && (hl.type === 'cross' || hl.type === 'dribble')) out.push({ gi, k }); } } return out; });
  for (const c of casi) {
    await page.evaluate(gi => { window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, c.gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, c.k);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_result', null, { timeout: 15000 }).catch(() => {});
    await sleep(+(process.env.CPM_PASSO || 300));
  }
  const W = await page.evaluate(() => Object.values(window.__CPM_TEC045 || {})); await page.close(); if (process.env.CPM_DBG) console.log(JSON.stringify(W));
  const nom = W.filter(x => x.nominata), cambiate = nom.filter(x => x.etichetta !== x.finale);
  return { casi: casi.length, righe: W.length, nominate: nom.length, cambiate, doppio: W.some(x => x.finale === 'double_step') };
};
const V = await giro(false), R = process.env.CPM_DBG ? V : await giro(true);
await b.close(); srv.close();
const fmt = x => `opzioni ${x.casi} · varianti viste ${x.righe} · tecnica nominata ${x.nominate} · cambiate dal motore ${x.cambiate.length} · double_step al 3D ${x.doppio ? 'si' : 'no'}`;
console.log('verde ' + fmt(V)); console.log('rosso ' + fmt(R));
R.cambiate.slice(0, 8).forEach(x => console.log('  rosso: «' + x.lbl + '» ' + x.etichetta + ' → ' + x.finale));
const g = [];
if (V.nominate < 10) g.push('verde: solo ' + V.nominate + ' opzioni con tecnica nominata');
if (V.cambiate.length) g.push('verde: cambiate ' + V.cambiate.map(x => x.lbl + ' ' + x.etichetta + '→' + x.finale).join(', '));
if (!R.cambiate.length) g.push('rosso: nessuna tecnica cambiata (il rosso non si vede)');
if (g.length) { console.log('❌ tecnica-045'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ tecnica-045 verde (e il rosso si vede)');
