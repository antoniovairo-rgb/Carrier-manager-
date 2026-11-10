#!/usr/bin/env node
/* [giro 144] FOTO del saluto (GLB acceso): per ogni beat, a meta' saluto (t144 >= 2,2 s di scena) e dopo il ritorno in fila (t144 >= 5,5).
   Uso: VW=360 VH=800 node saluto-144-foto.mjs <etichetta> [beat,...] (CPM_ROSSO=1 → __CPM_NO_G144S). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { apriCarriera } from './saluto-144-misura.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g144', { recursive: true });
const tag = process.argv[2] || 'foto', VW = +(process.env.VW || 360), VH = +(process.env.VH || 800);
const srv = await startServer(); const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: VW, height: VH } }); await installCdnRoutes(page);
await apriCarriera(page, srv.address().port, !!process.env.CPM_ROSSO);
for (const b of (process.argv[3] || '3,7').split(',')) {
  await page.evaluate(x => window.__CPM_CAREER.apriPresentazione(x), +b);
  await page.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 });
  await page.waitForFunction(() => (window.__CPM_PRES142.t144 || 0) < 1, null, { timeout: 30000 }).catch(() => {});
  for (const [soglia, nome] of [[2.2, 'saluto'], [5.5, 'fila']]) {
    await page.waitForFunction(s => (window.__CPM_PRES142.t144 || 0) >= s, soglia, { timeout: 90000 }).catch(() => {});
    if (process.env.CPM_ROSSO && nome === 'saluto') await sleep(7000);
    await page.screenshot({ path: `out/g144/${tag}-${VW}x${VH}-beat${b}-${nome}.png` });
  }
}
console.log('foto in out/g144'); await browser.close(); srv.close();
