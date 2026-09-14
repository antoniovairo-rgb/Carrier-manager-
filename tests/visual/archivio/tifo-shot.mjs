/* [7.171.0] SHOT tifo 2.0 — curva piena (override derby): bandiere a disegni variati, striscioni dei gruppi
   ultras con nome, sciarpata, telo. Screenshot su set-piece vicino alla porta (camera bassa = curva in quadro). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await page.setViewportSize({ width: 700, height: 980 });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  window.__CPM_CROWD_OVERRIDE = { tier: 'derby', fill: 0.98, awayFill: 0.98, intensity: 1.0, capacity: 42000, attendance: 41100, derby: true, seed: 7 };
});
await openMatch(page, port);
for (const gi of [81, 13]) {
  await forceSituation(page, gi, { settle: 1400 });
  await page.screenshot({ path: `out/tifo-${gi}.png` });
}
console.log('pageerror:', errors.length ? errors.join(' | ') : 'nessuno');
await browser.close(); srv.close();
process.exit(errors.length ? 1 : 0);
