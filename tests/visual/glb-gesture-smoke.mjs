/* Smoke test GLB-ON dei gesti eroe (5.46.6). Non è un gate: verifica che il path GLB
   carichi gli 8 asset senza errori e che i gesti (kick/penalty/header/tackle/volley)
   si attivino. Cattura screenshot al picco del gesto per il collaudo dal vivo del PO. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, canvasShot, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(ROOT, 'tests/visual/out/glb-gestures');
fs.mkdirSync(OUT, { recursive: true });

const srv = await startServer();
const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
const consoleMsgs = [];
page.on('console', m => consoleMsgs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', e => consoleMsgs.push(`PAGEERROR: ${e.message}`));

await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; }); // FLAG ON: calciatori GLB + gesti

const { total } = await openMatch(page, port);
console.log(`situations: ${total}`);
await sleep(3500); // attendi mount GLB (8 asset)

// quanti avatar GLB montati? (procedurali nascosti → se 0, il path GLB non è partito)
const glbErr = consoleMsgs.filter(m => /CPM-GLB|GLTF|gltf|skinning|clipAction|Cannot read/.test(m));
console.log('console GLB/err:', glbErr.length ? glbErr.slice(0, 8) : '(nessuno)');

// campiona situations, etichetta per hlType via timeline, screenshot al picco del gesto
const wanted = { kick: 0, penalty: 0, header: 0, tackle: 0, volley: 0 };
const shots = [];
for (let gi = 0; gi < total && shots.length < 30; gi += 3) {
  await page.evaluate(([i]) => window.__CPM_FORCE_SIT(i, true), [gi]);
  await sleep(420);
  await page.evaluate(() => { try { window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET(); } catch (e) {} });
  await page.evaluate(() => window.__CPM_RESOLVE(0));
  await sleep(260); // ~picco del gesto one-shot
  const tl = await page.evaluate(() => (typeof window.__CPM_TIMELINE === 'function' ? window.__CPM_TIMELINE() : []));
  const ar = (tl || []).filter(e => e.type === 'ActionResolved').pop();
  const ht = ar ? ar.hlType : null, hv = ar ? ar.hlVariant : null;
  let g = null;
  if (ht === 'shot') g = hv === 'shot_volley' ? 'volley' : 'kick';
  else if (ht === 'penalty') g = 'penalty';
  else if (ht === 'header') g = 'header';
  else if (ht === 'tackle') g = 'tackle';
  if (g && wanted[g] < 2) {
    wanted[g]++;
    const f = path.join(OUT, `${g}-gi${gi}.png`);
    const buf = await canvasShot(page);
    fs.writeFileSync(f, buf); shots.push(f); console.log(`shot ${g} gi=${gi} → ${path.basename(f)}`);
  }
  await sleep(120);
}
console.log('coverage gesti:', JSON.stringify(wanted));
console.log('screenshots:', shots.length);
await browser.close();
srv.close();
