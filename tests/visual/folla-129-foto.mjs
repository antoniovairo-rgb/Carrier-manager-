#!/usr/bin/env node
/* [giro 129 PO-330 — strumento di COLLAUDO, non guardiano] Foto prima/dopo della folla a sagome e costo per fotogramma.
   «prima» = rosso __CPM_NO_FOLLA129 (la folla dipinta), «dopo» = il gioco. Stesso build, stadio moderno_it 50k, contesto
   folla 0,85 (quello del giro 128), scena gi13, ora congelata.
   CPM_MODO=foto  → GLB ACCESO (direttiva PO 29/07), camere ingresso/gioco/vicino (+ vicino col tifo da gol nel «dopo»),
                    360x800 e 1440x900, giorno e notte → docs/collaudo-grafico/129/foto/*.jpg
   CPM_MODO=misura → GLB spento come il giro 128 (confronto coi suoi numeri), viste gioco/tv/vicino, CPM_GIRI pagine nuove
                    per braccio → docs/collaudo-grafico/129/misure-<vp>.json. Headless = software: vale il confronto fra bracci. */
import fs from 'node:fs'; import path from 'node:path';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } = await import('./lib/harness.mjs');
const { CROWD, CAMS, initProbe, sample, setCam, crowdParts } = await import('./folla-128.mjs');
const MODO = process.env.CPM_MODO || 'foto';
const VPS = (process.env.CPM_VP || '360x800,1440x900').split(',').map(s => s.split('x').map(Number));
const TODS = (process.env.CPM_TODS || 'day,night').split(',');
const GIRI = +(process.env.CPM_GIRI || 2);
const BASE = path.join(__dirname, '..', '..', '..', 'docs', 'collaudo-grafico', '129'); const OUT = path.join(BASE, 'foto'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const shot = async (page, f) => { await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }).catch(() => {}); await page.screenshot({ path: f, type: 'jpeg', quality: 78 }); };
async function apri(w, h, braccio, tod, glb) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(initProbe, { crowd: CROWD });
  await page.addInitScript(o => { window.__CPM_TOD = o.tod; if (o.rosso) window.__CPM_NO_FOLLA129 = 1; window.__CPM_FOLLA129_ANIM = 1;
    if (o.glb) Object.defineProperty(window, '__CPM_GLB', { get() { return true; }, set() {}, configurable: true }); }, { tod, rosso: braccio === 'prima', glb });
  await openMatch(page, port, { skipLoadAll: true, name: 'Folla129' }); await sleep(800);
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true)); await sleep(glb ? 6000 : 3500);
  return { ctx, page, errs };
}
const ris = [];
for (const [w, h] of VPS) {
  if (MODO === 'foto') for (const tod of TODS) for (const braccio of ['prima', 'dopo']) {
    const { ctx, page, errs } = await apri(w, h, braccio, tod, true);
    for (const nome of ['ingresso', 'gioco', 'vicino']) { await setCam(page, CAMS[nome]); await sleep(CAMS[nome] ? 2500 : 400); await shot(page, path.join(OUT, `${braccio}-${nome}-${w}x${h}-${tod}.jpg`)); }
    if (braccio === 'dopo') { await page.evaluate(() => { window.__CPM_FOLLA129_EX = 0.9; window.__CPM_FOLLA129_GS = 1; }); await setCam(page, CAMS.vicino); await sleep(1500);
      await shot(page, path.join(OUT, `dopo-vicino-gol-${w}x${h}-${tod}.jpg`)); }
    console.log(`foto ${w}x${h} ${tod} ${braccio}${errs.length ? ' errori: ' + errs.join(' | ') : ''}`); await ctx.close();
  }
  else for (let g = 0; g < GIRI; g++) for (const braccio of ['prima', 'dopo']) {
    const { ctx, page, errs } = await apri(w, h, braccio, 'day', false);
    const r = { vp: `${w}x${h}`, giro: g, braccio, parti: await crowdParts(page, false), folla129: await page.evaluate(() => window.__CPM_FOLLA129 ? (({ n, tri, gpuMB, buildMs, atlas }) => ({ n, tri, gpuMB, buildMs, atlas }))(window.__CPM_FOLLA129) : null), viste: {}, errs };
    for (const nome of ['gioco', 'tv', 'vicino']) { await setCam(page, CAMS[nome]); await sleep(CAMS[nome] ? 2500 : 300); r.viste[nome] = await sample(page, 5000); }
    console.log(JSON.stringify(r)); ris.push(r); await ctx.close();
  }
}
if (MODO === 'misura') fs.writeFileSync(path.join(BASE, `misure-${VPS.map(v => v.join('x')).join('_')}.json`), JSON.stringify(ris, null, 1));
await b.close(); srv.close();
