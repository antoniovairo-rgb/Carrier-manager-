#!/usr/bin/env node
/* [7.278.0 collaudo PO «live match leggermente più luminoso, soprattutto di notte»] SONDA di LUMINOSITÀ.
   Non è un gate: misura la luminanza media del fotogramma di partita (e della sola fascia del prato)
   per rendere confrontabile un prima/dopo sull'illuminazione, invece di giudicare a occhio.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node night-luma-probe.mjs [etichetta] */
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const tag = process.argv[2] || 'run';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 700, height: 800 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_TOD = 'night'; });// i provini sono sempre diurni: forzo la notte, che è il caso segnalato
await openMatch(page, port, {});
await sleep(2500);

const luma = (buf, frac) => {
  const p = PNG.sync.read(buf);
  const y0 = Math.floor(p.height * frac[0]), y1 = Math.floor(p.height * frac[1]);
  let s = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < p.width; x += 2) {
    const i = (p.width * y + x) << 2;
    s += 0.2126 * p.data[i] + 0.7152 * p.data[i + 1] + 0.0722 * p.data[i + 2]; n++;
  }
  return s / n;
};
const shot = await page.screenshot();
console.log(`[${tag}] luminanza media fotogramma: ${luma(shot, [0, 1]).toFixed(2)} · fascia prato (40-85%): ${luma(shot, [0.40, 0.85]).toFixed(2)} · fascia tribune (5-35%): ${luma(shot, [0.05, 0.35]).toFixed(2)}`);
await browser.close(); srv.close();
