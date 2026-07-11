/* [7.8.6] screenshot delle schermate provino ridisegnate (pre + post). */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const clickText = async (page, re) => page.evaluate((rs) => {
  const rx = new RegExp(rs, 'i');
  const els = [...document.querySelectorAll('button,a,[role=button]')];
  const el = els.find(e => rx.test(e.textContent || ''));
  if (el) { el.click(); return true; } return false;
}, re.source || re);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 460, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await clickText(page, /Nuova carriera/); await sleep(600);
await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Hernanes'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
await clickText(page, /INIZIA I PROVINI/); await sleep(700);
await page.screenshot({ path: path.join(OUT, 'trial-pre.png'), fullPage: true });
console.log('pre → out/trial-pre.png');
await clickText(page, /Inizia il provino/); await sleep(2500);
try { await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 3, tickMs: 12 }); }); } catch (e) { }
let reached = false;
for (let i = 0; i < 90 && !reached; i++) { await sleep(1500); reached = await page.evaluate(() => /COMPLETATO/.test(document.body.innerText)); }
if (reached) { await sleep(500); await page.screenshot({ path: path.join(OUT, 'trial-post.png'), fullPage: true }); console.log('post → out/trial-post.png'); }
else console.log('post non raggiunto in tempo');
console.log('pageerror:', errs.length ? errs.slice(0, 3) : 0);
await browser.close(); srv.close();
