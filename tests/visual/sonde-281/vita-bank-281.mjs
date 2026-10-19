#!/usr/bin/env node
/* [PO-281 · giro 59, sola misura] Gli eventi di vita «auto dei sogni» e «prima casa» (src/03 :899-900) leggono p.bank e scrivono
 * p.bank: il conto del gioco e' bankBalance. Qui si valuta la cond VERA con un eroe ricchissimo (bankBalance 5M, bank assente). */
import { startServer, launchBrowser, installCdnRoutes } from '../lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const pg = await browser.newPage(); await installCdnRoutes(pg); await pg.addInitScript(() => { window.__CPM_GLB = false; });
await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await pg.waitForFunction(() => typeof VITA_EVENTS !== 'undefined', null, { timeout: 90000 });
const r = await pg.evaluate(() => ['vita_auto', 'vita_casa'].map(id => { const e = VITA_EVENTS.find(x => x.id === id);
  return { id, ricco_bankBalance5M: !!e.cond({ bankBalance: 5000000, season: 3, week: 5 }), conCampoBank: !!e.cond({ bank: 5000000 }), ef: e.ef }; }));
console.log(JSON.stringify(r)); await browser.close(); srv.close();
