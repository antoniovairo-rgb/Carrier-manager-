#!/usr/bin/env node
/* [7.999.37] esegue provino-passo.html e stampa lo scivolamento del piede appoggiato per velocita', corsa sola contro scatto */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage(); await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/tests/visual/provino-passo.html`, { waitUntil: 'load' });
let r = null; for (let i = 0; i < 120 && !r; i++) { r = await page.evaluate(() => window.__PASSO || null); if (!r) await sleep(500); }
await b.close(); srv.close();
console.log(JSON.stringify({ vJ: r && r.vJ, vS: r && r.vS, err: r && r.err }));
for (const x of (r && r.righe) || []) console.log(`V ${x.V} m/s · corsa sola ${x.jog.mediana} (p75 ${x.jog.p75}) · tetto 3,5 ${x.jog35.mediana} (p75 ${x.jog35.p75}) · scatto k=${x.scatto.k} ${x.scatto.mediana} (p75 ${x.scatto.p75})`);
export default r;
