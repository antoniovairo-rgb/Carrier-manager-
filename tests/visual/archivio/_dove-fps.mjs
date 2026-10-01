/* Dove sta il contatore dei fotogrammi (D7 7.907) e se e' leggibile: posizione, testo, colore,
   contrasto col fondo, piu' una foto. Sola lettura, fuori dal ci. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'dove-fps');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer();
const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
let errori = 0; page.on('pageerror', () => { errori++; });
await page.addInitScript(() => { window.__CPM_GLB = true; });
const cdp = await ctx.newCDPSession(page);
let lastFrame = null;
cdp.on('Page.screencastFrame', (e) => { lastFrame = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
await cdp.send('Page.startScreencast', { format: 'png', quality: 92, everyNthFrame: 1 });
await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
await page.evaluate(() => { if (window.__CPM_LOAD_ALL) window.__CPM_LOAD_ALL(); }).catch(() => {});
await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 60000 }); } catch (_e) {}

for (const attesa of [3000, 6000, 10000]) {
  await sleep(attesa === 3000 ? 3000 : 3000);
  const r = await page.evaluate(() => {
    const el = document.querySelector('[data-cpm="fps907"]');
    if (!el) return { presente: false, gancio: typeof window.__CPM_FPS907 === 'function', stato: (window.__CPM_PHASE && window.__CPM_PHASE()) || null };
    const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { presente: true, testo: (el.textContent || '').trim(), x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
      colore: cs.color, fondo: cs.backgroundColor, corpo: cs.fontSize, visibile: b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0',
      gancio: typeof window.__CPM_FPS907 === 'function' ? window.__CPM_FPS907() : null, stato: (window.__CPM_PHASE && window.__CPM_PHASE()) || null };
  });
  console.log(`dopo ${attesa / 1000}s:`, JSON.stringify(r));
}
let prev = null, n = 0;
for (let i = 0; i < 8; i++) { await sleep(700); if (lastFrame && (!prev || !lastFrame.equals(prev))) { prev = lastFrame; n++; if (n >= 2) break; } }
if (prev) { fs.writeFileSync(path.join(OUT, 'contatore.png'), prev); console.log('foto:', path.join(OUT, 'contatore.png')); }
console.log('errori pagina:', errori);
await browser.close(); server.close();
