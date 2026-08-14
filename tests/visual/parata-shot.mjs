#!/usr/bin/env node
/* PROVINI DELLA PARATA — «il pullman cammina a marcia indietro, migliora anche la grafica».

   PERCHE' UNA SONDA DEDICATA. La parata vive dentro `SeasonEndScreen` dietro un titolo vinto: per
   guardarla servirebbe giocare una carriera fino allo scudetto. Il componente e' esposto come
   `__CPM_PARATA` (test-only) e qui viene montato da solo, cosi' la scena si puo' fotografare a
   comando — e «migliora la grafica» smette di essere un giudizio a occhio chiuso.

   COSA PRODUCE: N fotogrammi a distanza di qualche secondo, cosi' si vedono i tre tagli di regia
   (tre-quarti frontale · laterale dalla folla · alta da dietro) e si puo' verificare la DIREZIONE DI
   MARCIA: il pullman ha muso e fari a +z, quindi la via deve scorrere verso -z.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node parata-shot.mjs                                    */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const OUT = 'out/parata';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.CPM_TAG || 'dopo';
const TS = (process.env.CPM_TS || '1.5,5,9,13').split(',').map(Number);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 820 }, deviceScaleFactor: 2 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForFunction(() => typeof window.__CPM_PARATA_C === 'function', null, { timeout: 60000 });

await page.evaluate(() => {
  document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
  const club = { id: 'sal', n: 'FC Salento', a: 'SAL', p: 72, c: '#f4c20d', c2: '#c0392b', nat: '🇮🇹', lg: 'Lega B' };
  const el = React.createElement(window.__CPM_PARATA_C, { club, euroWin: false, avatarId: 0, heroNum: 9 });
  ReactDOM.createRoot(document.getElementById('parata')).render(el);
});

let prev = 0;
for (const t of TS) {
  await sleep(Math.max(0, (t - prev) * 1000)); prev = t;
  const f = `${OUT}/parata-${TAG}-t${String(t).replace('.', 'p')}.png`;
  await page.screenshot({ path: f });
  console.log(`  t=${t}s → ${f}`);
}
for (const e of errs.slice(0, 4)) console.log('⚠ pageerror: ' + e);
await b.close(); srv.close();
console.log(`\n${TS.length} provini in ${OUT}/ (tag «${TAG}»).`);
