#!/usr/bin/env node
/* [giro 40 PO-261] FOTO dell'apertura del primo highlight, GLB acceso, __CPM_PRESENT=1, flusso vero. Scatta al primo campione in
   hl_intro e 800 ms dopo. CPM_ROSSO=__CPM_NO_APERTURA261 per il «prima». Uscita in docs/sviluppo/foto-giro40/. */
import fs from 'fs'; import path from 'path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO || ''; const TAG = ROSSO ? 'prima' : 'dopo';
const DIR = path.join(ROOT, 'docs', 'sviluppo', 'foto-giro40'); fs.mkdirSync(DIR, { recursive: true });
const NOMI = (process.env.CPM_NOMI || 'Cesare Dolfi,Ettore Fanti').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const nome of NOMI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_GLB = true; if (r) window[r] = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  const t0 = Date.now(); while (Date.now() - t0 < 120000) { const p = await page.evaluate(() => window.__CPM_PHASE()); if (p === 'hl_intro') break; await sleep(40); }
  const slug = nome.split(' ')[1].toLowerCase();
  await page.screenshot({ path: path.join(DIR, `apertura-${TAG}-${slug}-a.jpg`), quality: 70, type: 'jpeg' });
  await sleep(800); await page.screenshot({ path: path.join(DIR, `apertura-${TAG}-${slug}-b.jpg`), quality: 70, type: 'jpeg' });
  console.log(`${TAG} ${nome}: foto scattate`); await ctx.close();
}
await b.close(); srv.close();
