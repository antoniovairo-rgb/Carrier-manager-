#!/usr/bin/env node
/* [giro 128 PO-330 — STUDIO] prova headless del banco autonomo prototipi/folla-128/banco.html: per ogni modo apre la
   pagina, aspetta 8 s e legge fps/ms/triangoli/draw call dal pannello; foto in docs/collaudo-grafico/128/foto/banco-*.png.
   Serve a dimostrare che il banco funziona prima di darlo al telefono: i numeri veri sono quelli del dispositivo. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, __dirname } from './lib/harness.mjs';
const OUT = path.join(__dirname, '..', '..', '..', 'docs', 'collaudo-grafico', '128', 'foto');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const m of (process.env.CPM_MODI || 'oggi,A,Ao,B,C,spenta').split(',')) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 800 } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.goto(`http://localhost:${port}/prototipi/folla-128/banco.html?m=${m}`, { waitUntil: 'load', timeout: 60000 }); await sleep(8000);
  const r = await page.evaluate(() => ({ fps: document.getElementById('fps').textContent, ms: document.getElementById('ms').textContent, p95: document.getElementById('p95').textContent, tri: document.getElementById('tri').textContent, dc: document.getElementById('dc').textContent, info: window.__BANCO && window.__BANCO.info }));
  await page.screenshot({ path: path.join(OUT, `banco-${m}.png`) });
  console.log(m, JSON.stringify(r), errs.join(' ; ')); await ctx.close();
}
await b.close(); srv.close();
