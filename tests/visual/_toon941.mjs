/* [7.941] IL CAMPO IN STILE CARTONE: due bracci, stesso seme, stesso minuto di gioco.
   verde = window.__CPM_TOON acceso · rosso = com'e' oggi. Foto + fotogrammi. Sola lettura sul codice. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const server = await startServer(); const port = server.address().port;
const out = {};
for (const b of ['toon', 'oggi']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; page.on('pageerror', () => errori++);
  await page.addInitScript((t) => { window.__CPM_GLB = true; if (t) window.__CPM_TOON = true;
    window.__F = 0; const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (fn) => raf((x) => { window.__F++; return fn(x); });
  }, b === 'toon');
  await openMatch(page, port, { skipLoadAll: true, name: 'Toon' });
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 60000 }); } catch (_e) {}
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 777, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  /* si aspetta il campo 3D vivo, non un velo di scelta */
  await page.waitForFunction(() => window.__CPM_SOSP917 === false, { timeout: 150000 }).catch(() => {});
  /* [v2] la prima stesura aspettava 1,8 s e poi misurava 9 s: quando scattava la foto l'highlight era
     GIA' FINITO e si fotografava il campo 2D. Ora si scatta subito, dentro il 3D, e si misura dopo. */
  await sleep(900);
  await page.screenshot({ path: `/tmp/claude-0/campo-${b}.png` });
  const in3d = await page.evaluate(() => window.__CPM_SOSP917 === false);
  await page.evaluate(() => { window.__F = 0; });
  const t0 = Date.now(); await sleep(4000); const dt = (Date.now() - t0) / 1000;
  const f = await page.evaluate(() => window.__F);
  const n = await page.evaluate(() => window.__CPM_TOON_N | 0);
  const mu = await page.evaluate(() => window.__CPM_TOON_MAT | 0);
  if (!in3d) console.log(`  (${b}: la foto NON e' del 3D — highlight gia' finito)`);
  out[b] = { fps: +(f / dt).toFixed(1), mesh: n, mat: mu, errori };
  await browser.close();
}
console.log('\n=== IL CAMPO IN STILE CARTONE (412x915, stesso seme, 9 s per braccio) ===');
console.log(`  oggi  ${String(out.oggi.fps).padStart(5)} fps · errori ${out.oggi.errori}`);
console.log(`  toon  ${String(out.toon.fps).padStart(5)} fps · ${out.toon.mesh} mesh su ${out.toon.mat} materiali unici · errori ${out.toon.errori}`);
const d = out.toon.fps - out.oggi.fps;
console.log(`  differenza: ${d >= 0 ? '+' : ''}${d.toFixed(1)} fps (${(100*d/Math.max(0.1,out.oggi.fps)).toFixed(0)} %)`);
console.log('  Chromium su questa macchina, non il telefono del PO');
