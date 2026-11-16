#!/usr/bin/env node
/* [giro 206] DIAGNOSI (non guardiano): nelle foto dell'ingresso compare una figura enorme davanti alla camera. Chi e'? C'era gia' prima
   (braccio rosso __CPM_NO_G206)? Per fotogramma: corpi (radici con uno scheletro) e figure a meno di CPM_D unita' dalla camera, in quadro. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro206'); const D = +(process.env.CPM_D || 9);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const rosso of (process.env.CPM_BRACCI || 'rosso,verde').split(',').map(x => x === 'rosso')) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block', isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_GLB = true; window.__CPM_TOD = 'night'; window.__CPM_TIPO206 = 'big'; window.__CPM_WALK245 = []; if (o.r) window.__CPM_NO_G206 = true; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate((D) => { window.__GIG = { n: 0, visti: {}, primo: null };
    const f = () => { try { if (window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout' && !window.__CPM_WALKHOLD74 && window.__CPM3D) { const { scene, camera } = window.__CPM3D; const G = window.__GIG; G.n++;
      const K = window.__CPM_WALK245 || []; const s = K.length ? K[K.length - 1].s : null; const V = new camera.position.constructor();
      scene.traverse(o => { if (!o.visible || !(o.isSkinnedMesh || (o.userData && (o.userData.proc196 || o.userData.cg196)))) return; let a = o, vis = true, top = o; while (a) { if (a.visible === false) vis = false; if (a.parent && a.parent !== scene && a.parent.type !== 'Scene') top = a.parent; a = a.parent; } if (!vis) return;
        o.getWorldPosition(V); const d = V.distanceTo(camera.position); if (d > D) return; const P = V.clone().project(camera); if (!(P.z < 1 && Math.abs(P.x) < 1.2 && Math.abs(P.y) < 1.6)) return;
        let nome = ''; a = o; while (a && a !== scene) { nome = (a.name || a.type) + '/' + nome; a = a.parent; } nome = nome.slice(0, 120);
        const k = nome; const e = G.visti[k] = G.visti[k] || { n: 0, dmin: 99, s0: s, pos: null, scala: null }; e.n++; if (d < e.dmin) { e.dmin = +d.toFixed(2); e.pos = [+V.x.toFixed(1), +V.y.toFixed(1), +V.z.toFixed(1)]; const sc = new camera.position.constructor(); o.getWorldScale(sc); e.scala = +sc.y.toFixed(3); e.cam = [+camera.position.x.toFixed(1), +camera.position.y.toFixed(1), +camera.position.z.toFixed(1)]; e.s = s; }
        if (!G.primo) G.primo = s; }); } } catch (_) {} requestAnimationFrame(f); }; requestAnimationFrame(f); }, D);
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  for (let k = 0; k < 70; k++) { if (await ph() === 'walkout') break; await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
  let visto = false; const t0 = Date.now(); const TEMPI = [3.6, 4.2, 4.8, 5.6, 6.4, 7.4, 8.6]; let k = 0; fs.mkdirSync(process.env.CPM_OUT, { recursive: true });
  while (Date.now() - t0 < 400000) { const p = await ph(); if (p === 'walkout') visto = true; else if (visto) break;
    const s = await page.evaluate(() => { const K = window.__CPM_WALK245 || []; return (!window.__CPM_WALKHOLD74 && K.length) ? K[K.length - 1].s : -1; }).catch(() => -1);
    if (k < TEMPI.length && s >= TEMPI[k]) { await page.screenshot({ path: path.join(process.env.CPM_OUT, `gig-${rosso ? 'rosso' : 'verde'}-${TEMPI[k]}.png`) }); k++; }
    await sleep(120); }
  const G = await page.evaluate(() => window.__GIG); console.log((rosso ? 'ROSSO ' : 'VERDE ') + 'fotogrammi ' + G.n); await ctx.close(); }
await b.close(); srv.close();
