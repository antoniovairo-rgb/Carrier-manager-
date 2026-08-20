#!/usr/bin/env node
/* 7.537 — MISURA DELL'OMBRA (nota PO «l'ombra la farei di un altro colore, per individuarla subito»):
   si conta quanti pixel del fotogramma stanno nella banda AMBRA (R alto, B basso) — cioè il segno che si
   stacca dal verde del prato — nel braccio verde e nel rosso __CPM_NO550 (ombra nera storica). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '/workspace/carrier-manager-/tests/visual/lib/harness.mjs';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function scatta(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO550 = 1; }, rosso ? 1 : null);
  await openMatch(page, port, { skipLoadAll: true, name: rosso ? 'OmbR' : 'OmbV' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 777, policy: 'seeded', tickMs: 300 }));
  await sleep(25000);
  const f = '/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad/omb-' + (rosso ? 'rosso' : 'verde') + '.png';
  await page.screenshot({ path: f }); await page.close();
  const png = PNG.sync.read(fs.readFileSync(f));
  let ambra = 0, erba = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const R = png.data[i], G = png.data[i + 1], B = png.data[i + 2];
    if (G > R && G > B && G > 70) erba++;
    if (R > 140 && B < 90 && R - B > 70 && G > 60 && G < 200) ambra++;
  }
  return { ambra, erba };
}
const v = await scatta(false), r = await scatta(true);
await b.close(); srv.close();
console.log(`VERDE — pixel in banda ambra: ${v.ambra} (erba ${v.erba})`);
console.log(`ROSSO — pixel in banda ambra: ${r.ambra} (erba ${r.erba})`);
console.log(v.ambra > r.ambra * 1.5 + 50 ? '✅ l\'ombra si stacca dal prato (segno ambra assente nel braccio storico)' : '❌ nessuna separazione misurabile');
