/* Smoke (GLB ON, NO cpmtest): verifica che i ritratti CH38 (renderHeroPhoto) rendano davvero come IMMAGINI
   nitide (non fallback SVG) nella schermata di creazione, e che varino per avatar (pelle/capelli distinti).
   Sotto cpmtest renderHeroPhoto è NO-OP, quindi qui si carica il gioco SENZA cpmtest. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
// vai alla schermata di creazione
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /nuova carriera/i.test(x.textContent || '')); if (b) b.click(); });
await sleep(1200);
// attendi che i ritratti CH38 siano generati (GLB 3.2MB + render) — poll fino a ~18s
let info = { imgCount: 0, svgCount: 0 };
for (let t = 0; t < 18; t++) {
  info = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].filter(i => /^data:image/.test(i.src || ''));
    const svgs = [...document.querySelectorAll('svg')].filter(s => s.querySelector('ellipse,circle')).length;
    return { imgCount: imgs.length, svgCount: svgs, srcs: imgs.slice(0, 6).map(i => i.src.length) };
  });
  if (info.imgCount >= 2) break;
  await sleep(1000);
}
// distinti? (avatar diversi → ritratti diversi)
const distinct = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')].filter(i => /^data:image/.test(i.src || ''));
  const set = new Set(imgs.map(i => i.src));
  return { total: imgs.length, distinct: set.size };
});
await browser.close(); srv.close();

console.log('errori pagina: ' + (errs.length ? errs.join(' | ') : 'nessuno'));
console.log('ritratti CH38 (img data:image): ' + info.imgCount + ' · fallback SVG: ' + info.svgCount);
console.log('ritratti distinti: ' + distinct.distinct + '/' + distinct.total + ' (avatar diversi → foto diverse)');
const ok = errs.length === 0 && info.imgCount >= 2 && distinct.distinct >= 2;
console.log(ok
  ? '\n✅ PASS — i volti CH38 rendono come IMMAGINI nitide (non SVG) e variano per avatar. Nessun errore.'
  : '\n⚠️ CHECK — imgCount=' + info.imgCount + ' distinct=' + distinct.distinct + ' errori=' + errs.length + (info.imgCount < 2 ? ' (potrebbe essere fallback SVG: GLB non caricato?)' : ''));
process.exit(ok ? 0 : 1);
