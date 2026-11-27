#!/usr/bin/env node
/* SONDA giro 436 (PO-627): dove va il tempo della partita del libro mastro sul banco.
   Campiona ogni 2 s fase (__CPM_PHASE) e minuto (__CPM_STATE().clock) e somma i secondi per fase.
   CPM_VEL=1|1.5|2 (preferenza del giocatore cpm-match-speed) · CPM_TETTO ms · CPM_SEED.        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const VEL = process.env.CPM_VEL || '1', TETTO = +(process.env.CPM_TETTO || 240000), SEED = +(process.env.CPM_SEED || 1000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 900, height: 900 } }); await installCdnRoutes(page);
await page.addInitScript(v => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-match-speed', v); } catch (e) {} }, VEL);
await openMatch(page, port, { skipLoadAll: true, name: 'Ledger' + SEED });
await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 350 }), SEED);
const t0 = Date.now(), fasi = {}; let last = t0, ph = null, min = 0;
while (Date.now() - t0 < TETTO) {
  await sleep(2000);
  ph = await matchPhase(page); min = await page.evaluate(() => (window.__CPM_STATE && window.__CPM_STATE() || {}).clock);
  const now = Date.now(); fasi[ph] = (fasi[ph] || 0) + (now - last) / 1000; last = now;
  if (((now - t0) / 1000 | 0) % 20 < 2) console.log(`  ${((now - t0) / 1000).toFixed(0)} s · ${ph} · ${min}'`);
  if (ph === 'ended' || ph === 'ceremony') break;
}
console.log(`VEL ${VEL}: ${((Date.now() - t0) / 1000).toFixed(0)} s · ultima fase ${ph} · minuto ${min} · ` + Object.entries(fasi).map(([k, v]) => k + ' ' + v.toFixed(0) + 's').join(' · '));
await b.close(); srv.close();
