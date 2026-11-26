#!/usr/bin/env node
/* [giro 403 — PO-579] SONDA (non guardiano): quali GLB carica davvero il gioco e quanto pesano, e la FOTO della stessa scena
   con due cartelle di asset diverse (prima/dopo la compressione), GLB ACCESO, ora congelata (notte).
   Uso (da tests/visual):
     CPM_CHROME=/opt/pw-browsers/chromium node misura-403.mjs rete            → elenco GLB richiesti in una partita vera (telefono)
     CPM_ASSET403=<cartella con assets/…> node misura-403.mjs foto <uscita>   → foto di N scene forzate (CPM_SCENE403="3,41,77")
   CPM_ASSET403 sostituisce SOLO i .glb che esistono in quella cartella; gli altri file vengono dal repo. */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';

const MODO = process.argv[2] || 'rete'; const USCITA = process.argv[3] || 'out/misura-403';
const ALT = process.env.CPM_ASSET403 || '';
const VP = process.env.CPM_VP403 === 'pc' ? { width: 1280, height: 720 } : { width: 412, height: 915 };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: VP, serviceWorkers: 'block' }); const page = await ctx.newPage();
await installCdnRoutes(page);
const rete = []; const errs = [];
await ctx.route(/\/assets\/.*\.glb(\?|$)/, async r => {
  const u = decodeURIComponent(new URL(r.request().url()).pathname); const alt = ALT && path.join(ALT, u);
  const fp = alt && fs.existsSync(alt) ? alt : path.join(ROOT, u);
  let body; try { body = fs.readFileSync(fp); } catch (e) { return r.fulfill({ status: 404, body: '' }); }
  rete.push({ u: u.replace('/assets/', ''), b: body.length, alt: fp !== path.join(ROOT, u) });
  return r.fulfill({ status: 200, contentType: 'model/gltf-binary', body });
});
page.on('pageerror', e => errs.push('pageerror ' + e.message));
page.on('console', m => { if (m.type() === 'error' && /GLTF|glb|WebP|texture/i.test(m.text())) errs.push('console ' + m.text().slice(0, 160)); });
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_TOD = 'night'; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; });

if (MODO === 'rete') {
  await openMatch(page, port, { skipLoadAll: true, name: 'Peso 403' });
  const t0 = Date.now(); let ult = -1, scene = 0;
  while (Date.now() - t0 < 150000) {
    const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0 })).catch(() => null);
    if (!s || s.ph === 'ended') break;
    if (s.ph === 'playing' && s.c >= 8 && s.c !== ult) { ult = s.c; await page.evaluate(() => window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE()).catch(() => {}); }
    if (s.ph === 'hl_choose') { scene++; await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {}); if (scene >= 3) break; }
    await sleep(1000);
  }
  const fatti = await page.evaluate(() => Object.keys(window.__CPM_FATTI233 || {}));
  const tot = rete.reduce((a, x) => a + x.b, 0);
  console.log(JSON.stringify({ vp: VP, scene, file: rete.length, MB: +(tot / 1048576).toFixed(2), fatti: fatti.length, errs, rete }, null, 1));
} else {
  fs.mkdirSync(USCITA, { recursive: true });
  const { total } = await openMatch(page, port, { name: 'Peso 403' });
  await page.waitForFunction(() => window.__CPM_CORPI232 && window.__CPM_CORPI232().pronti, null, { timeout: 120000 }).catch(() => errs.push('corpi non pronti in 120 s'));
  const SC = (process.env.CPM_SCENE403 || '3,41,77').split(',').map(Number).filter(x => x < total);
  for (const gi of SC) {
    await page.evaluate(g => window.__CPM_FORCE_SIT(g), gi); await sleep(2500);
    await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(600);
    const el = await page.$('canvas'); await el.screenshot({ path: path.join(USCITA, `gi${gi}.png`) });
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
  }
  console.log(JSON.stringify({ scene: SC, alt: rete.filter(x => x.alt).length, file: rete.length, errs }));
}
await ctx.close(); await b.close(); srv.close();
