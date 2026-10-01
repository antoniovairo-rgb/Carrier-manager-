#!/usr/bin/env node
/* [7.999.39 sonda — taccuino PO su 7.999.34: «SALTO del pallone» #64 21,1u (inseguitore), #152 29,7u, #81 37,3u (scena)] Forza la
   scena, risolve l'azione e registra lo scrittore del pallone a ogni fotogramma (__CPM_WS38). Il detector del taccuino vuole
   intervalli <= 50 ms, che in headless non ci sono: qui un salto e' uno spostamento oltre 60 u/s * dt + 3 u (nessun pallone del
   motore supera ~60 u/s, commento del detector in src/10), fuori dai primi 750 ms dopo la risoluzione. Sola lettura.
   Uso: CPM_GI=64,81 CPM_AI=0,1,2 CPM_ESITI=success,fail node salti-pallone-sonda.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GIS = (process.env.CPM_GI || '64,81,152,38,176,25,92').split(',').map(Number);
const AIS = (process.env.CPM_AI || '0,1,2').split(',').map(Number);
const ESITI = (process.env.CPM_ESITI || 'success,fail').split(',');
const GLB = process.env.CPM_GLB !== '0';
const WS = ["—","scena","arco","inseguitore","portatore","addosso","palo","respinta","ricevente-cross","ricevente-pass","consegna","buildup-aereo","buildup-fine","buildup-volo","testa"];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const righe = [];
for (const gi of GIS) for (const ai of AIS) for (const es of ESITI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(g => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (!g) window.__CPM_GLB = false; }, GLB);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Salti' + gi }); await sleep(1200);
    if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(1200);
    const nAz = await page.evaluate(() => { try { const q = window.__CPM_CURSIT && window.__CPM_CURSIT(); return q && q.actions ? q.actions.length : 3; } catch (e) { return 3; } });
    if (ai >= nAz) { await page.close(); continue; }
    const t0 = await page.evaluate(([a, e]) => { window.__CPM_WS38 = []; window.__CPM_WS38_REC = 1; window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(a); return performance.now(); }, [ai, es]);
    const tS = Date.now(); while (Date.now() - tS < 12000) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (ph && !/^hl/.test(ph)) break; await sleep(300); }
    const W = await page.evaluate(() => window.__CPM_WS38 || []);
    let peggio = null, n = 0;
    for (let i = 1; i < W.length; i++) { const [t, c, x, z] = W[i], [tp, cp, xp, zp] = W[i - 1]; if (t - t0 < 750) continue; n++;
      const dt = Math.max(1, t - tp) / 1000, d = Math.hypot(x - xp, z - zp), ecc = d - (60 * dt + 3);
      if (ecc > 0 && (!peggio || ecc > peggio.ecc)) peggio = { ecc: +ecc.toFixed(1), d: +d.toFixed(1), ms: Math.round(dt * 1000), a: +((t - t0) / 1000).toFixed(2), prima: WS[cp] || cp, dopo: WS[c] || c }; }
    const r = { gi, ai, es, campioni: n, fine: W.length ? +((W[W.length - 1][0] - t0) / 1000).toFixed(1) : 0, salto: peggio };
    righe.push(r); console.log(JSON.stringify(r));
  } catch (e) { console.log(JSON.stringify({ gi, ai, es, errore: String(e.message || e).slice(0, 120) })); }
  await page.close();
}
await b.close(); srv.close();
const conSalto = righe.filter(r => r.salto);
console.log(`\nSALTI: ${conSalto.length}/${righe.length} risoluzioni con un salto del pallone`);
