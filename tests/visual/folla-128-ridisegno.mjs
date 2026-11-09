#!/usr/bin/env node
/* [giro 128 PO-330 — STUDIO] quanto costa UN ridisegno della tela-pubblico (makeCrowdTex.redraw), isolato dal resto:
   tela mobile 1024x512 e desktop 2048x512, riempimento 0,85, intensita' 0,85, a riposo e in esultanza. Conta anche i
   tifosi dipinti per tela. Uso: CPM_CHROME=/opt/pw-browsers/chromium node folla-128-ridisegno.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 360, height: 800 } }); await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true, name: 'Folla128' }); await sleep(500);
const r = await page.evaluate(() => { const out = [];
  const SEC = { team: 0.92, ultras: true, flags: 0.11, scarves: 0.20, banner: true, seated: 0.10, heat: 1.18 };
  for (const mob of [true, false]) for (const rm of [1, 2]) {
    const ct = window.__CPM_makeCrowdTex({ key: 'curvaSud', homeHex: '#c0283a', awayHex: '#e8e8f0', width: 100, isMobile: mob, seedKey: 'b128', fill: 0.85, intensity: 0.85, sector: SEC, rowsMul: rm, passion: 0.75, ultras: true });
    const cv = ct.texFull.image; const t = [];
    for (let i = 0; i < 15; i++) { const t0 = performance.now(); ct.redraw(1000 + i * 110, i > 7 ? 1 : 0, i > 7 ? 0.9 : 0); t.push(performance.now() - t0); }
    const riposo = t.slice(1, 8), gol = t.slice(8); const m = a => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2);
    out.push({ tela: cv.width + 'x' + cv.height, rowsMul: rm, riposoMs: m(riposo), golMs: m(gol), MBperUpload: +(cv.width * cv.height * 4 / 1048576).toFixed(1) });
  } return out; });
console.log(JSON.stringify(r, null, 1)); await b.close(); srv.close();
