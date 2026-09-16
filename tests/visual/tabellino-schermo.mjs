/* [7.914] Il TABELLINO DELLA GARA si vede davvero a fine partita? Gioca una partita col motore fino al
   fischio finale, poi fotografa il post-partita e legge le righe del tabellino dal DOM. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'tabellino');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
let errori = 0; const messaggi = [];
page.on('pageerror', (e) => { errori++; if (messaggi.length < 5) messaggi.push(String(e).slice(0, 180)); });
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 60 }); }).catch(() => {});
/* si aspetta il fischio finale: la fase diventa `ended` */
let fase = null;
for (let i = 0; i < 240; i++) {
  fase = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } }).catch(() => null);
  if (fase === 'ended') break;
  await sleep(500);
}
await sleep(2500);
const r = await page.evaluate(() => {
  const testo = document.body.innerText || '';
  const i = testo.indexOf('TABELLINO DELLA GARA');
  const blocco = i >= 0 ? testo.slice(i, i + 700) : null;
  let tab = null; try { tab = window.__CPM_TABELLINO914 ? window.__CPM_TABELLINO914() : null; } catch (_e) {}
  return { presente: i >= 0, blocco, tab, fase: (window.__CPM_PHASE && window.__CPM_PHASE()) || null };
});
/* si fotografa scorrendo fino al tabellino */
try {
  await page.evaluate(() => { const els = [...document.querySelectorAll('div')].filter((d) => (d.textContent || '').trim().startsWith('TABELLINO DELLA GARA')); if (els.length) els[els.length - 1].scrollIntoView({ block: 'center' }); });
  await sleep(900);
} catch (_e) {}
const foto = path.join(OUT, 'post-partita.png');
await page.screenshot({ path: foto }).catch(() => {});
console.log(`fase finale: ${r.fase} · tabellino a schermo: ${r.presente ? 'SÌ' : 'NO'} · errori di pagina: ${errori}${messaggi.length ? ' → ' + messaggi[0] : ''}`);
if (r.blocco) console.log('\n--- quello che si legge ---\n' + r.blocco.split('\n').slice(0, 30).join('\n'));
console.log('\nfoto:', foto);
await browser.close(); server.close();
process.exit(r.presente && errori === 0 ? 0 : 1);
