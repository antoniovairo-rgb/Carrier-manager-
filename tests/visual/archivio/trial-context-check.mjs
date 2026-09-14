/* Verifica (GLB ON, no cpmtest): (1) i volti nella creazione sono le IMMAGINI STATICHE CH38 (assets/avatar-*.png)
   e caricano; (2) dopo aver avviato il provino, il contesto WebGL del campo NON è perso (isContextLost=false).
   Il "nero" headless è un artefatto software-render; il segnale reale è il contesto non perso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1200);
const click = (rs) => page.evaluate((s) => { const rx = new RegExp(s, 'i'); const b = [...document.querySelectorAll('button')].find(x => rx.test(x.textContent || '')); if (b) { b.click(); return true; } return false; }, rs);
await click('nuova carriera'); await sleep(1600);

const faces = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')].filter(i => /assets\/avatar-\d+\.png/.test(i.src || ''));
  return { count: imgs.length, loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length, anyData: [...document.querySelectorAll('img')].some(i => /^data:image/.test(i.src || '')) };
});
// numero di canvas (contesti WebGL) sulla schermata di creazione
const createCanvases = await page.evaluate(() => document.querySelectorAll('canvas').length);

await page.evaluate(() => { const inp = document.querySelector('input[type="text"],input:not([type])'); if (inp) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(inp, 'Test'); inp.dispatchEvent(new Event('input', { bubbles: true })); } });
await sleep(400); await click('inizia i provini'); await sleep(900); await click('inizia il provino');
await sleep(6000);
const matchCtx = await page.evaluate(() => {
  const c = document.querySelector('canvas'); if (!c) return { noCanvas: true };
  const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
  return { hasCanvas: true, lost: gl ? gl.isContextLost() : 'no-gl', w: c.width, h: c.height };
});
await browser.close(); srv.close();

console.log('— CREAZIONE —');
console.log('volti statici CH38 (assets/avatar-*.png): ' + faces.count + ' · caricati: ' + faces.loaded + ' · canvas WebGL sulla schermata: ' + createCanvases + ' · imgs data: ' + faces.anyData);
console.log('— PROVINO —');
console.log('match canvas: ' + (matchCtx.noCanvas ? 'ASSENTE' : matchCtx.w + 'x' + matchCtx.h) + ' · contesto perso: ' + matchCtx.lost);
console.log('pageerror: ' + (errs.length ? errs.join(' | ') : 'nessuno'));

const ok = faces.count >= 6 && faces.loaded === faces.count && createCanvases === 0 && !faces.anyData && matchCtx.hasCanvas && matchCtx.lost === false && errs.length === 0;
console.log('\n' + (ok
  ? '✅ PASS — volti CH38 statici caricati, ZERO canvas WebGL nella creazione, contesto della partita SANO (non perso).'
  : '⚠️ CHECK — faces=' + faces.count + '/' + faces.loaded + ' createCanvas=' + createCanvases + ' lost=' + matchCtx.lost + ' err=' + errs.length));
process.exit(ok ? 0 : 1);
