/* Pre-genera i 12 ritratti CH38 come PNG statici in assets/avatar-<id>.png.
   Elimina la necessità del renderer WebGL a runtime (che contende il contesto alla partita → campo nero). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1200);
const click = (rs) => page.evaluate((s) => { const rx = new RegExp(s, 'i'); const b = [...document.querySelectorAll('button')].find(x => rx.test(x.textContent || '')); if (b) { b.click(); return true; } return false; }, rs);
await click('nuova carriera'); await sleep(1500);

const collected = {};
async function collectPage(base) {
  for (let t = 0; t < 16; t++) {
    const got = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button[title]')].filter(b => /Carnagione/i.test(b.title || ''));
      return btns.map(b => { const im = b.querySelector('img'); return im && /^data:image\/png/.test(im.src) ? im.src : null; });
    });
    if (got.length && got.every(Boolean)) { got.forEach((src, i) => { collected[base + i] = src; }); return got.length; }
    await sleep(1000);
  }
  return 0;
}
const n0 = await collectPage(0);
// pagina 2 (avatar 6-11): clicca "→"
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === '→'); if (b) b.click(); });
await sleep(1200);
const n1 = await collectPage(6);
await browser.close(); srv.close();

const ids = Object.keys(collected).map(Number).sort((a, b) => a - b);
console.log('ritratti raccolti: ' + ids.length + ' (' + ids.join(',') + ')');
if (ids.length < 12) { console.log('⚠️ mancano ritratti (attesi 12) — non salvo nulla'); process.exit(1); }
for (const id of ids) {
  const b64 = collected[id].replace(/^data:image\/png;base64,/, '');
  const buf = Buffer.from(b64, 'base64');
  writeFileSync(path.join(ROOT, 'assets', `avatar-${id}.png`), buf);
  console.log('  salvato assets/avatar-' + id + '.png (' + buf.length + ' byte)');
}
console.log('\n✅ 12 ritratti CH38 salvati come PNG statici.');
