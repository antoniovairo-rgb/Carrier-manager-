#!/usr/bin/env node
/* SONDA giro 381 (PO-663) — non giudica: stampa. Profilo delle clip (testimone __CPM_VOLA366 {clip}) in altezze-corpo:
   alza = suola sopra la posa ferma; corpo = punto piu' basso del CORPO INTERO sopra la suola della posa ferma. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const FLAG = process.env.CPM_FLAG || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 1062, height: 549 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
await page.addInitScript((flag) => { window.__CPM_GLB = true; window.__CPM_TOD = 'day'; if (flag) flag.split(',').forEach(f => { window[f] = 1; }); }, FLAG);
await openMatch(page, port, { name: 'Scivola381' });
await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => console.log('(clip non arrivate)'));
await sleep(1500);
const p = await page.evaluate(() => window.__CPM_VOLA366 && window.__CPM_VOLA366({ clip: '*' }));
for (const [k, v] of Object.entries(p || {})) if (!process.env.CPM_RE || new RegExp(process.env.CPM_RE).test(k)) console.log(k.padEnd(34), JSON.stringify(v));
console.log('T381', JSON.stringify(await page.evaluate(() => window.__CPM_T381 || null)));
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(0), 200);
