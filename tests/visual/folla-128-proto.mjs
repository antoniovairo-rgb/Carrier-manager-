#!/usr/bin/env node
/* [giro 128 PO-330 — strumento di STUDIO, NON guardiano, NON tocca il gioco] PROTOTIPI di folla «umanizzata».
   Stessa scena, stesso stadio, stesso contesto e stesse camere di folla-128.mjs; dopo la costruzione della scena
   inietta prototipi/folla-128/folla-proto.js, che sostituisce la folla dipinta con il prototipo scelto, e misura
   gli stessi numeri. Bracci: A (impostori, densita' vera) · Ao (impostori alla densita' di oggi) · B (figure low-poly, densita' di oggi) · C (prime 4 file
   in 3D + impostori). Foto con tifo a riposo e con tifo acceso (__FOLLA128_EX=0.9, «gol»).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium CPM_MODI=A,B,C CPM_VP=360x800 node folla-128-proto.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
import { CROWD, CAMS, initProbe, sample, setCam, shoot } from './folla-128.mjs';
const MODI = (process.env.CPM_MODI || 'A,B,C').split(',');
const GIRI = +(process.env.CPM_GIRI || 1);
const VPS = (process.env.CPM_VP || '360x800').split(',').map(s => s.split('x').map(Number));
const OUT = path.join(__dirname, '..', '..', '..', 'docs', 'collaudo-grafico', '128', 'foto'); fs.mkdirSync(OUT, { recursive: true });
const PROTO = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'prototipi', 'folla-128', 'folla-proto.js'), 'utf8');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = [];
for (const [w, h] of VPS) for (let g = 0; g < GIRI; g++) for (const modo of MODI) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); page.on('console', m => { if (m.type() === 'error' || /THREE/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(initProbe, { crowd: CROWD });
  await openMatch(page, port, { skipLoadAll: true, name: 'Folla128' }); await sleep(800);
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true)); await sleep(3500);
  await page.addScriptTag({ content: PROTO });
  const st = await page.evaluate(m => { window.__CPM_CROWD_MS = 1e12; const P = window.__P128; const t0 = performance.now();
    const r = window.__FOLLA128(m[0], { THREE: window.THREE, scene: P.scene, fill: 0.85, homeHex: '#c0283a', awayHex: '#e8e8f0', rows3D: 4, density: m.length > 1 ? 'oggi' : undefined });
    r.buildMs = +(performance.now() - t0).toFixed(1); return r; }, modo);
  const r = { vp: `${w}x${h}`, giro: g, modo, st, viste: {}, errs };
  for (const [nome, cam] of Object.entries(CAMS)) {
    await setCam(page, cam); await sleep(cam ? 2500 : 300);
    r.viste[nome] = await sample(page, 5000);
    if (g === 0) { await shoot(page, path.join(OUT, `proto${modo}-${nome}-${w}x${h}.png`));
      if (nome !== 'tv') { await page.evaluate(() => { window.__FOLLA128_EX = 0.9; }); await sleep(2500); await shoot(page, path.join(OUT, `proto${modo}-${nome}-${w}x${h}-tifo.png`)); await page.evaluate(() => { window.__FOLLA128_EX = 0; }); } }
  }
  r.errs = errs.slice(0, 4);
  console.log(JSON.stringify(r)); ris.push(r); await ctx.close();
}
fs.writeFileSync(path.join(OUT, '..', `misure-proto-${MODI.join('')}-${VPS.map(v => v.join('x')).join('_')}.json`), JSON.stringify(ris, null, 1));
await b.close(); srv.close();
