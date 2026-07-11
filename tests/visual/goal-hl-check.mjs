/* [7.8.11] verifica che depthTest:false sui pali NON rovini gli highlight ravvicinati (palla in porta / GK). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, canvasShot, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
import { PNG } from 'pngjs';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 760 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true });
// trova un gi con hlType shot su porta avversaria
const shotGi = await page.evaluate(() => {
  const S = window.__CPM_SITS || []; for (let i = 0; i < S.length; i++) { const s = S[i]; if (s && (s.intent === 'shot' || /tiro|conclusione|destro|sinistro/i.test(s.text || ''))) return i; } return 0;
});
console.log('shot gi:', shotGi);
await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [shotGi, true]);
await sleep(900);
// frame hl_choose (come lo screenshot del tester: camera ravvicinata sulla porta, prima di risolvere)
{ const buf = await canvasShot(page); fs.writeFileSync(path.join(OUT, `goal-hl-choose.png`), buf);
  const png = PNG.sync.read(buf); const x0 = Math.floor(png.width*0.28), x1 = Math.floor(png.width*0.72), y0 = Math.floor(png.height*0.30), y1 = Math.floor(png.height*0.55), sc = 3;
  const w = x1-x0, h = y1-y0; const out = new PNG({ width: w*sc, height: h*sc });
  for (let y=0;y<h*sc;y++) for (let x=0;x<w*sc;x++){ const sx=x0+Math.floor(x/sc),sy=y0+Math.floor(y/sc),s=(png.width*sy+sx)<<2,d=(out.width*y+x)<<2; out.data[d]=png.data[s];out.data[d+1]=png.data[s+1];out.data[d+2]=png.data[s+2];out.data[d+3]=255; }
  fs.writeFileSync(path.join(OUT, `goal-hl-choose-zoom.png`), PNG.sync.write(out)); }
await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_RESOLVE && window.__CPM_RESOLVE(0); });
for (let i = 0; i < 5; i++) { await sleep(500); const buf = await canvasShot(page); fs.writeFileSync(path.join(OUT, `goal-hl-${i}.png`), buf); }
console.log('→ out/goal-hl-*.png · pageerr', errs.length ? errs.slice(0, 3) : 0);
await browser.close(); srv.close();
