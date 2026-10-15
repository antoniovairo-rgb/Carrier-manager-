#!/usr/bin/env node
/* [collaudo 7.999.169 — PO-238] Crediti nella HOME del gioco (non in carriera) e schermata iniziale, senza salvataggio.
   Misura il testo visibile e fotografa a 412 e 360 px. Non modifica il gioco. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'docs/collaudi/foto-169-carriera');
fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const W of [412, 360]) {
  const ctx = await b.newContext({ viewport: { width: W, height: W === 360 ? 800 : 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(2000);
  const txt = await page.evaluate(() => document.body.innerText || '');
  await page.screenshot({ path: path.join(OUT, `${W}-00-home-gioco.png`) });
  const crediti = /crediti/i.test(txt);
  let apertura = null;
  if (crediti) { await page.getByText(/crediti/i).first().click({ timeout: 5000 }).catch(() => {}); await sleep(900); await page.screenshot({ path: path.join(OUT, `${W}-00b-crediti.png`) }); apertura = (await page.evaluate(() => document.body.innerText || '')).slice(0, 400); }
  const vietati = (txt.match(/\bfps\b|\bundefined\b|\bNaN\b|\[object [A-Za-z]+\]/g) || []);
  esito[W] = { crediti, vietati, anteprima: txt.slice(0, 200).replace(/\n/g, ' | '), apertura };
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(OUT, 'dati-home.json'), JSON.stringify(esito, null, 2));
console.log(JSON.stringify(esito, null, 2));
