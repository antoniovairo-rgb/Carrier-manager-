#!/usr/bin/env node
/* COLLAUDO 3D 7.999.173 — partite intere GLB acceso, 412x915, foto a ogni fase degli highlight. SOLA MISURA.
   Uso: SEMI=1234,2021,777 FOTO=cartella OUT=file.json node collaudo-173-partite.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI = (process.env.SEMI || '1234,2021,777').split(',').map(Number);
const FOTO = process.env.FOTO || 'out/coll173'; fs.mkdirSync(FOTO, { recursive: true });
const CAP = +(process.env.CAP || 540) * 1000;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function partita(sd, idx) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
  await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', '2'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 120000 }).catch(() => {});
  await page.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const log = []; let last = '', scene = 0, ph = '', nShot = 0; const t0 = Date.now(); const seen = {};
  while (Date.now() - t0 < CAP) {
    ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (ph !== last) {
      if (ph === 'hl_intro') scene++;
      const key = ph + scene;
      if (['hl_intro', 'hl_choose', 'hl_result', 'ended', 'ceremony'].includes(ph) && !seen[key] && nShot < 60) {
        seen[key] = 1; await sleep(ph === 'hl_result' ? 1500 : 600);
        const f = `p${idx}-s${String(scene).padStart(2, '0')}-${ph}.png`; await page.screenshot({ path: path.join(FOTO, f) }).catch(() => {}); nShot++;
        const txt = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 420)).catch(() => '');
        log.push({ scene, ph, foto: f, min: await page.evaluate(() => (window.__CPM_SCORE && JSON.stringify(window.__CPM_SCORE())) || null).catch(() => null), txt });
      }
      last = ph;
    }
    if (ph === 'ended' || ph === 'ceremony') { await sleep(2500); break; }
    await sleep(500);
  }
  const R = await page.evaluate(() => ({ res: window.__CPM_RES218 || [], score: window.__CPM_SCORE ? window.__CPM_SCORE() : null, ev: (window.__CPM_EV || []).slice(-400) })).catch(() => ({}));
  const rec = { sd, fine: ph, secondi: Math.round((Date.now() - t0) / 1000), scene, errs: errs.slice(0, 5), log, R };
  await ctx.close(); return rec;
}
const out = await Promise.all(SEMI.map((s, i) => partita(s, i + 1)));
fs.writeFileSync(process.env.OUT || path.join(FOTO, 'partite.json'), JSON.stringify(out, null, 1));
for (const o of out) console.log('seme', o.sd, 'fine', o.fine, 'sec', o.secondi, 'scene', o.scene, 'RES218', (o.R.res || []).length, 'score', JSON.stringify(o.R.score), 'errori', o.errs.length);
await b.close(); srv.close();
