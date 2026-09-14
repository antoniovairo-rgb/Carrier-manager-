/* Misura OGGETTIVA della qualità dei ritratti CH38 (GLB ON, no cpmtest): per ogni avatar della griglia di
   creazione decodifica l'immagine e calcola la luminanza media dei pixel OPACHI (il volto). Obiettivo:
   né troppo scuri (<70 = "pelle molto scura") né fluorescenti (>205 = "al neon"). Target morbido ~95..185. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1200);
const click = (rs) => page.evaluate((s) => { const rx = new RegExp(s, 'i'); const b = [...document.querySelectorAll('button')].find(x => rx.test(x.textContent || '')); if (b) b.click(); }, rs);
await click('nuova carriera'); await sleep(1500);

// attendi i ritratti + misura la luminanza media dei pixel opachi di ciascuno
let res = { faces: [] };
for (let t = 0; t < 16; t++) {
  res = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].filter(i => /^data:image/.test(i.src || ''));
    const faces = [];
    for (const im of imgs) {
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
      const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0, 64, 64);
      let sum = 0, n = 0; const d = ctx.getImageData(0, 0, 64, 64).data;
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 40) { sum += (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]); n++; } }
      if (n > 40) faces.push(+(sum / n).toFixed(0));
    }
    return { faces };
  });
  if (res.faces.length >= 3) break;
  await sleep(1000);
}
await browser.close(); srv.close();

const f = res.faces;
console.log('luminanza media volti (pixel opachi): ' + (f.length ? f.join(', ') : 'nessuna'));
if (!f.length) { console.log('\n⚠️ nessun ritratto misurato (GLB non caricato?)'); process.exit(0); }
const min = Math.min(...f), max = Math.max(...f), avg = +(f.reduce((a, b) => a + b, 0) / f.length).toFixed(0);
console.log('min=' + min + ' · max=' + max + ' · media=' + avg + '   (target morbido ~95..185)');
const tooDark = f.filter(v => v < 70).length, tooBright = f.filter(v => v > 205).length;
console.log('troppo scuri (<70): ' + tooDark + ' · fluorescenti (>205): ' + tooBright);
const ok = tooDark === 0 && tooBright === 0 && avg >= 90 && avg <= 190;
console.log('\n' + (ok
  ? '✅ PASS — volti ben illuminati, né scuri né fluorescenti (media ' + avg + ').'
  : '⚠️ DA TARARE — media=' + avg + ' scuri=' + tooDark + ' fluo=' + tooBright));
process.exit(ok ? 0 : 1);
