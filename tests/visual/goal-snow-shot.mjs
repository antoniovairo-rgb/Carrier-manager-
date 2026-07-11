/* [7.8.7] verifica visibilità porta con la NEVE (?cpmwx=snow). */
import { startServer, launchBrowser, installCdnRoutes, sleep, canvasShot, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const clickText = async (page, re) => page.evaluate((rs) => { const rx = new RegExp(rs, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => rx.test(e.textContent || '')); if (el) { el.click(); return true; } return false; }, re.source);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=snow`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await clickText(page, /Nuova carriera/); await sleep(600);
await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Snow'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
await clickText(page, /INIZIA I PROVINI/); await sleep(500);
await clickText(page, /Inizia il provino/);
await page.waitForFunction(() => typeof window.__CPM_FORCE_SIT === 'function', { timeout: 20000 });
// resta in PLAYING (camera di gioco reale che guarda giù per il campo → porta lontana in frame, come lo screenshot PO)
await sleep(4500);
for (let i = 0; i < 4; i++) { await sleep(1200); const buf = await canvasShot(page); fs.writeFileSync(path.join(OUT, `goal-snow-${i}.png`), buf); }
console.log('→ out/goal-snow-*.png · pageerr', errs.length ? errs.slice(0, 3) : 0);
await browser.close(); srv.close();
