/* [STRUMENTO — R6, collaudo da spettatore] LA PARTITA, FOTOGRAFATA SCENA PER SCENA.
   Le sonde numeriche misurano il campo, non il fotogramma (lezione 7.695: quattro release di numeri
   buoni con porta e area fuori inquadratura). Qui: una partita in autoplay, e a ogni APERTURA di piano
   (pg diventa vivo) si scattano 8 fotogrammi a 400ms — la costruzione, l'arrivo, l'esito. Il contact
   sheet va guardato con gli occhi prima di ogni spedizione; i difetti di regia si vedono solo cosi'. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const dir = 'out/filmstrip'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const GLB = process.env.CPM_GLB !== '0';/* [direttiva PO 01/09] «i test li devi fare con GLB ON»: acceso di default, si spegne SOLO dichiarandolo nel comando */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((o) => { window.__CPM_GLB = o.glb; window.__CPM_REC = true; }, { glb: GLB });
await openMatch(page, port, { skipLoadAll: true, name: 'Fs' });
const SEME = +(process.env.CPM_SEME || 7300);/* [v2] parametrizzato: un mondo nuovo a ogni giro di guardia */
await page.evaluate((sm) => window.__CPM_AUTOPLAY(true, { seed: sm, policy: 'seeded', tickMs: 300 }), SEME);
let scene = 0, pgPrev = false;
for (let k = 0; k < 900 && scene < 6; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const h = window.__CPM_HOLD && window.__CPM_HOLD();
    const st = window.__CPM_STATE && window.__CPM_STATE();
    return { pg: !!(h && h.pg), c: st ? st.clock : null };
  } catch (_e) { return null; } });
  if (!r) continue;
  if (r.pg && !pgPrev) { scene++;
    for (let f = 0; f < 8; f++) { await page.screenshot({ path: `${dir}/scena${scene}-min${r.c}-f${f}.png` }); await sleep(400); }
  }
  pgPrev = r.pg;
  if (r.c != null && r.c >= 89) break;
}
await b.close(); srv.close();
console.log(`\n=== FILMSTRIP R6 ===  scene fotografate: ${scene} · scatti in ${dir}\n`);
