#!/usr/bin/env node
/* CPM — SCREENSHOT per il listing Play Store (roadmap 1.9). Cattura il gioco REALE (dist offline)
   a risoluzione telefono (1080×1920) in `store-assets/screenshots/`. Sono grezzi: il proprietario
   può rifinirli/sostituirli con catture su device. Richiede una dist già buildata (npm run build:web). */
import { startServer, launchBrowser, sleep } from '../tests/visual/lib/harness.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'store-assets', 'screenshots');
mkdirSync(OUT, { recursive: true });

async function clickByText(page, text) {
  const end = Date.now() + 9000;
  while (Date.now() < end) {
    const h = await page.evaluateHandle((t) => { const rx = new RegExp(t, 'i'); return [...document.querySelectorAll('button')].find(b => rx.test((b.textContent || '').trim())) || null; }, text);
    const el = h.asElement(); if (el) { await el.click(); return true; } await sleep(200);
  }
  return false;
}
const shot = (page, name) => page.screenshot({ path: join(OUT, name) });

const srv = await startServer(DIST);
const port = srv.address().port;
const browser = await launchBrowser();
// viewport TELEFONO (CSS px) → layout mobile a colonna singola; deviceScaleFactor alza la risoluzione
// d'uscita a ~1080×2340 (oltre il minimo Play). 412×892 @ 2.62 ≈ 1080×2337.
// NB: 1080×1920 @ DPR1 — config in cui il canvas WebGL (swiftshader headless) rende in modo affidabile
// l'inquadratura 3D del match. Risoluzione valida per il listing Play (lato lungo ≥1080).
const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.route('**', (r) => { const u = r.request().url(); return (/^https?:\/\//.test(u) && !/localhost|127\.0\.0\.1/.test(u)) ? r.abort() : r.continue(); });

console.log('=== SCREENSHOT LISTING (1080×1920, dist offline) ===');
try {
  await page.goto(`http://localhost:${port}/index.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 30000 });
  await sleep(800);
  await shot(page, '01-home.png'); console.log('  ✔ 01-home.png');

  await clickByText(page, 'Nuova carriera'); await sleep(700);
  await shot(page, '02-create.png'); console.log('  ✔ 02-create.png');

  await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Alex'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
  await clickByText(page, 'INIZIA I PROVINI'); await sleep(400);
  await clickByText(page, 'Inizia il provino');
  await page.waitForFunction(() => typeof window.__CPM_FORCE_SIT === 'function', { timeout: 20000 });
  await page.evaluate(() => window.__CPM_LOAD_ALL());
  await sleep(400);
  // forza una situation di tiro per una bella inquadratura 3D
  await page.evaluate(() => { const s = (window.SITUATIONS || []).findIndex(x => /tiro|shot/i.test((x.type || '') + (x.text || ''))); window.__CPM_FORCE_SIT(s >= 0 ? s : 0, false); });
  await sleep(2800);
  await shot(page, '03-match.png'); console.log('  ✔ 03-match.png');

  console.log(`✅ screenshot in store-assets/screenshots/ (grezzi — rifinisci/sostituisci su device se vuoi)`);
} catch (e) {
  console.error('FATAL:', e && e.message); process.exitCode = 1;
} finally {
  await browser.close(); srv.close();
}
