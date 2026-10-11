#!/usr/bin/env node
/* GIRO 3 · punto 2: avviso «[CPM-GL] contesto grafico perso» su 5 partite 3D (GLB di default, 375x812).
   Per ogni partita: pagina nuova, salvataggio save-190, autoplay seeded, fino a ceremony.
   Registra: avvisi console [CPM-GL] (con istante), __CPM_GLLOST, __CPM_GLRESTORED, tempo reale, pageerror.
   Non asserisce: registra. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const N = +(process.env.GL_N || 5);
const OUT = process.env.GL_OUT || path.join(process.cwd(), 'gl-out');
fs.mkdirSync(OUT, { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const risultati = [];
for (let k = 1; k <= N; k++) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const t0 = Date.now(); const avvisi = []; const errori = [];
  page.on('console', m => { if (m.text().includes('[CPM-GL]')) avvisi.push({ s: Math.round((Date.now() - t0) / 1000), t: m.type(), x: m.text().slice(0, 120) }); });
  page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(s => { localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  let ph = ''; const tp = Date.now();
  while (Date.now() - tp < 540000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(2000); }
  const cnt = await page.evaluate(() => ({ lost: window.__CPM_GLLOST || 0, restored: window.__CPM_GLRESTORED || 0, score: window.__CPM_SCORE ? window.__CPM_SCORE() : null })).catch(() => ({}));
  const r = { giro: k, fase: ph, secondi: Math.round((Date.now() - t0) / 1000), ...cnt, avvisi: avvisi.length, dettaglio: avvisi, errori };
  risultati.push(r); console.log('GL ' + JSON.stringify(r));
  await page.screenshot({ path: path.join(OUT, `fine-${k}.png`) }).catch(() => {});
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'gl-riepilogo.json'), JSON.stringify(risultati, null, 2));
console.log('FINE');
await b.close(); srv.close();
