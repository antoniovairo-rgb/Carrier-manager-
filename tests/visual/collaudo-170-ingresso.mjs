#!/usr/bin/env node
/* COLLAUDO 3D 7.999.170 — SOLO MISURA: ingresso in campo, GLB acceso, foto a istanti di SCENA (non di orologio) via __CPM_WALK245. */
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FOTO = path.join(ROOT, 'docs', 'collaudi', 'foto-release-170-3d');
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const page = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage(); await installCdnRoutes(page);
await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_WALK245 = []; window.__CPM_CAMM245 = {}; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(2000);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
const clk = (t) => page.evaluate((t) => { const e = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === t); if (e) { e.click(); return true; } return false; }, t);
await clk('Vedi le formazioni'); await sleep(2500); await clk('Ingresso in campo');
const marks = [4, 8, 12, 16, 20, 24, 28, 32, 36]; let mi = 0; const t0 = Date.now(); const out = { foto: [] };
while (Date.now() - t0 < 500000) {
  const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'playing' || ph === 'ended') break;
  const r = await page.evaluate(() => { const W = window.__CPM_WALK245 || []; const l = W[W.length - 1]; if (!l) return null; const P = l.p; const kids = P.length; return { t: l.t, n: kids }; });
  if (r && mi < marks.length && r.t >= marks[mi]) { const f = `ingresso-scena-${marks[mi]}s.png`; await page.screenshot({ path: path.join(FOTO, f) }); out.foto.push([f, r.t, r.n]); mi++; }
  await sleep(250);
}
out.mascots = await page.evaluate(() => { const W = window.__CPM_WALK245 || []; const l = W[W.length - 1]; return l ? { n: l.p.length, casa: l.p.filter(q => q[0] === 1).length, osp: l.p.filter(q => q[0] === 0).length } : null; });
console.log(JSON.stringify(out)); await b.close(); srv.close(); process.exit(0);
