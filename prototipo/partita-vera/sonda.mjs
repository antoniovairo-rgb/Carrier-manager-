/* Fase 2 «partita vera» — SONDA DELLA VISTA 3D (browser headless, grafica software: gli FPS qui NON valgono per il telefono).
   Controlla: console senza errori, Three r128, corpi caricati, etichette leggibili e non sovrapposte, scelta dell'eroe,
   compenetrazioni, e alla fine l'impronta della partita guardata = simulazione rapida con le stesse scelte.
   Uso (dalla radice): node prototipo/partita-vera/sonda.mjs [seme] */
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const S = process.env.SCRATCH || '/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/';
const seme = process.argv[2] || '20260924';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const out = {}; const fails = []; const F = (c, m) => { if (!c) fails.push(m); };
for (const [nome, vp] of [['telefono', { width: 390, height: 844 }], ['desktop', { width: 1280, height: 800 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await page.goto(`http://localhost:${port}/prototipo/partita-vera/index.html?seed=${seme}&da=15`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__PV && window.__PV.caricamentoMs != null, { timeout: 90000 });
  const o = out[nome] = {}; o.caricamentoMs = await page.evaluate(() => window.__PV.caricamentoMs); o.three = await page.evaluate(() => window.__PV.three);
  await sleep(2500); await page.screenshot({ path: S + `pv-${nome}-1.png` });
  o.etichette = await page.evaluate(() => window.__PV.etichette);
  /* velocita' x8 e scelte: la prima la faccio io (diversa dal consiglio, se possibile), le altre automatiche */
  await page.evaluate(() => window.__PV.comandi.vel(8));
  let scelta = null; for (let k = 0; k < 90 && !scelta; k++) { await sleep(500); scelta = await page.evaluate(() => window.__PV.fase === 'scelta'); }
  o.sceltaArrivata = !!scelta;
  if (scelta) { await page.screenshot({ path: S + `pv-${nome}-scelta.png` }); await page.evaluate(() => window.__PV.comandi.scegli('tiro')); }
  await sleep(3000); await page.screenshot({ path: S + `pv-${nome}-2.png` });
  o.fotogramma = await page.evaluate(() => window.__PV.fotogramma); o.fps = await page.evaluate(() => [window.__PV.fps, window.__PV.fpsMin1]);
  await page.evaluate(() => { window.__PV.comandi.auto(); window.__PV.comandi.vaiAlFischio(); });
  await page.waitForFunction(() => window.__PV.impronta, { timeout: 60000 }).catch(() => {});
  o.impronta = await page.evaluate(() => window.__PV.impronta); o.compenetrazioni = await page.evaluate(() => window.__PV.compenetrazioni);
  await page.screenshot({ path: S + `pv-${nome}-fine.png` }); o.errori = errs;
  F(o.three === '128', `${nome}: Three non r128 (${o.three})`); F(errs.length === 0, `${nome}: errori in console ${JSON.stringify(errs.slice(0, 3))}`);
  F(o.impronta && o.impronta.identiche, `${nome}: impronte diverse ${JSON.stringify(o.impronta)}`); F(o.sceltaArrivata, `${nome}: nessuna scelta dell'eroe`);
  F((o.etichette || []).length >= 1 && o.etichette.every(e => e.h >= 14), `${nome}: etichette assenti o troppo piccole ${JSON.stringify(o.etichette)}`);
  await page.close();
}
console.log(JSON.stringify(out, null, 1)); await browser.close(); srv.close();
console.log(fails.length ? '❌ FAIL sonda partita vera\n  ' + fails.join('\n  ') : '✅ PASS sonda partita vera'); process.exit(fails.length ? 1 : 0);
