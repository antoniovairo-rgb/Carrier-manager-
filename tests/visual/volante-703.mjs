/* [STRUMENTO] DOV'E' IL VOLANTE DEL BLOCCO? Il termine-pallone dello schieramento (0,62) e' cosmetico:
   +37% non ha mosso la distanza baricentro-pallone di UN'unita' su 37. Qui si misura quanto vale davvero:
   quante assegnazioni fa quel ramo e quanto e' grande in media |_av553| — se e' piccolo o raro, ecco
   perche' girarlo non serve, e il controllo del blocco sta nella base di formazione o nel passo k. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Vo' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
for (let k = 0; k < 250; k++) { await sleep(300);
  const c = await page.evaluate(() => { const st = window.__CPM_STATE && window.__CPM_STATE(); return st ? st.clock : null; });
  if (c != null && c >= 89) break; }
const w = await page.evaluate(() => window.__CPM_SCH703 || null);
await b.close(); srv.close();
console.log('\n=== IL TERMINE-PALLONE DELLO SCHIERAMENTO ===\n');
if (!w) console.log('  testimone vuoto');
else console.log(`  assegnazioni del ramo-pallone: ${w.ball} · |av| medio ${(w.avSum / Math.max(1, w.avN)).toFixed(1)}u → spinta media ${(0.62 * w.avSum / Math.max(1, w.avN)).toFixed(1)}u sugli slot\n`);
