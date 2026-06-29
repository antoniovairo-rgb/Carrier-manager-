/* Sonda rapida del check motion: campiona alive/21 sugli stessi gi del gate, GLB OFF (come il gate). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sampleMotion, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
const idx = [0, 2, 30, 60, 79, 120];
const W = Number(process.env.WIN || 1000), S = Number(process.env.SET || 500);
const out = [];
for (const gi of idx) { const s = await sampleMotion(page, gi, { settle: S, pollMs: 100, windowMs: W }); out.push(`gi${gi}: alive ${s.alive}/${s.players} avgDisp ${s.avgDisp}`); await sleep(120); }
console.log(`settle ${S} window ${W} (ALIVE_MIN 13):`);
out.forEach(o => console.log(' ', o));
await browser.close(); srv.close();
