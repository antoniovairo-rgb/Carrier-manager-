#!/usr/bin/env node
/* [7.999.12] GUARDIANO — IL PRATO 2D TORNA DOPO IL BACKGROUND (collaudo PO: «mettendo 15 secondi in background l'app si rompe la
   grafica»: campo sparito, sfondo nero, giocatori visibili). La perdita della tela in background non si riproduce in headless: qui si
   SIMULA il danno (la tela di servizio dello sfondo viene svuotata, come fa il telefono) e poi il ritorno in primo piano
   (visibilitychange → visible). Verde: il prato torna verde. CPM_ROSSO=1 → __CPM_NO_SFONDO12: resta nero. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_SFONDO12 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Sfondo12' });
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 12, policy: 'seeded', tickMs: 300 }));
for (let k = 0; k < 40; k++) { await sleep(500); if ((await matchPhase(page)) === 'playing') break; }
await sleep(2000);
/* il colore del prato su un quadratino della tela del campo 2D (media, per non cadere su un pallino) */
const verde = () => page.evaluate(() => { const cv = window.__CPM_CAMPO2D_CV && window.__CPM_CAMPO2D_CV(); if (!cv) return null; const g = cv.getContext('2d');
  const x0 = Math.round(cv.width * 0.18), y0 = Math.round(cv.height * 0.55); const d = g.getImageData(x0, y0, 12, 12).data; let r = 0, gg = 0, bb = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; n++; } return { r: Math.round(r / n), g: Math.round(gg / n), b: Math.round(bb / n) }; });
const prima = await verde();
/* il danno che fa il telefono: la tela di servizio dello sfondo viene svuotata */
await page.evaluate(() => window.__CPM_DANNO12 && window.__CPM_DANNO12());
await sleep(800);
const rotto = await verde();
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
await sleep(1200);
const dopo = await verde(); const rifatto = await page.evaluate(() => window.__CPM_SFONDO12 | 0);
await b.close(); srv.close();
const isVerde = c => c && c.g > c.r + 15 && c.g > c.b + 15;
console.log(`prato prima ${JSON.stringify(prima)} · dopo il danno ${JSON.stringify(rotto)} · dopo il ritorno ${JSON.stringify(dopo)} · ridisegni ${rifatto}`);
const fails = [];
if (!isVerde(prima)) fails.push('sonda cieca: il prato non era verde nemmeno prima');
if (isVerde(rotto)) fails.push('sonda cieca: il danno simulato non ha tolto il prato');
if (!isVerde(dopo)) fails.push('dopo il ritorno in primo piano il prato resta nero');
if (errs.length) fails.push('errori di pagina: ' + errs.slice(0, 2).join(' | '));
if (ROSSO) { const ok = fails.length === 1 && fails[0].startsWith('dopo il ritorno'); console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.12 il prato resta nero' : '❌ il rosso non riproduce il difetto\n  ' + fails.join('\n  ')); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL sfondo-ritorno\n  ' + fails.join('\n  ') : '✅ PASS sfondo-ritorno'); process.exit(fails.length ? 1 : 0);
