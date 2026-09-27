#!/usr/bin/env node
/* [7.999.38 sonda — collaudo PO «movimenti poco fluidi, si perde il pallone per strada» sulle scene «Cross in area» e «Guadagna una
   punizione»] Il pilota automatico sceglie in 1-2 s; il giocatore resta nella SCELTA diversi secondi. Qui ogni scena si apre su pagina
   nuova, resta 12 s in scelta, poi si sceglie l'azione 0 e si segue l'esito 8 s. Ogni 150 ms: fase, pallone (campo e quota), eroe,
   distanza del pallone dal giocatore piu' vicino e ruolo. Sola lettura. CPM_CASI=gi,gi,... */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const CASI = (process.env.CPM_CASI || '7,39,150').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = {};
for (const gi of CASI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC = 1; window.__CPM_WS38_REC = 1; if (window.name === 'rosso' ) {} });
  if (process.env.CPM_RED === '1') await page.addInitScript(() => { window.__CPM_NO_FALLO38 = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Lenta' + gi }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  const C = []; const t0 = Date.now(); let risolto = false;
  const campione = async () => { const r = await page.evaluate(() => { try { const s = window.__CPM_STATE(); const ph = window.__CPM_PHASE && window.__CPM_PHASE();
    return { t: performance.now(), ph, bx: s.ball.x, by: s.ball.y, bq: s.ball.worldY, d: s.ball.heldBy ? s.ball.heldBy.dist : null, chi: s.ball.heldBy ? s.ball.heldBy.role : null, hx: s.hero ? s.hero.x : null, hy: s.hero ? s.hero.y : null, ons: s.ball.onScreen }; } catch (e) { return null; } }).catch(() => null); if (r) C.push(r); return r; };
  while (Date.now() - t0 < 40000) { const r = await campione(); await sleep(150);
    if (!risolto && r && r.ph === 'hl_choose') { if (!C.tScelta) C.tScelta = Date.now(); if (Date.now() - C.tScelta > 12000) { await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); }); risolto = Date.now(); } }
    if (risolto && Date.now() - risolto > 8000) break; }
  C.ws = await page.evaluate(() => window.__CPM_WS38 || []).catch(() => []); const cad = await page.evaluate(() => (window.__CPM_CADUTA8 && window.__CPM_CADUTA8.seq) || null).catch(() => null); console.log('gi' + gi, 'caduta:', JSON.stringify(cad)); out[gi] = { C, ws: C.ws }; await page.close();
  const perFase = {}; for (const c of C) { const f = (perFase[c.ph] = perFase[c.ph] || { n: 0, dMax: 0, eroePalla: [], fuori: 0 }); f.n++; if (c.d != null) f.dMax = Math.max(f.dMax, c.d); if (c.hx != null) f.eroePalla.push(Math.hypot(c.hx - c.bx, (c.hy - c.by) * 0.68)); if (c.ons === false) f.fuori++; }
  const R = Object.fromEntries(Object.entries(perFase).map(([k, v]) => [k, { n: v.n, dMax: +v.dMax.toFixed(1), eroePallaMed: v.eroePalla.length ? +v.eroePalla.sort((a, b) => a - b)[v.eroePalla.length >> 1].toFixed(1) : null, eroePallaMax: v.eroePalla.length ? +Math.max(...v.eroePalla).toFixed(1) : null, palloneFuoriQuadro: v.fuori }]));
  console.log('gi' + gi, JSON.stringify(R));
}
await b.close(); srv.close();
if (process.env.CPM_DUMP) fs.writeFileSync(process.env.CPM_DUMP, JSON.stringify(out));
