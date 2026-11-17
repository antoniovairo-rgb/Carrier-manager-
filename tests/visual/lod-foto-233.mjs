#!/usr/bin/env node
/* [giro 233 PO-453] SONDA lod-foto-233 — «i tre livelli di dettaglio servono tutti?». Stessa partita (salvataggio da professionista,
   pilota seedato), telefono 375x667 a densita' 2 (750x1334 pixel veri): una volta col livello pieno forzato (__CPM_DETT233='alto':
   eroe sul file lod0, 34.995 triangoli, immagini 2048 px) e una col livello del dispositivo leggero ('leggero': eroe sul file lod1,
   12.244 triangoli, immagini 1024 px). Ferma il gioco sullo stesso fotogramma (primo highlight in fase di scelta), fotografa e misura:
   altezza apparente dell'eroe e memoria JS (il confronto fra le foto si fa a occhio: vedi la nota di metodo in fondo).
   Solo misura (esce 0). Foto in CPM_FOTO (default docs/sviluppo/giro233). */
import fs from 'node:fs';
import { launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { mkSave } from './misura-205.mjs'; import { serverGzip } from './misura-233.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const FOTO = process.env.CPM_FOTO || '../../docs/sviluppo/giro233'; fs.mkdirSync(FOTO, { recursive: true });
const srv = await serverGzip(); const port = srv.address().port; const browser = await launchBrowser(); const out = {};
for (const liv of ['alto', 'leggero']) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const pg = await ctx.newPage(); await installCdnRoutes(pg);
  await pg.addInitScript(([sv, l]) => { window.__CPM_GLB = true; window.__CPM_T196ON = 1; window.__CPM_DETT233 = l; window.__CPM_TOD = 'day'; if (!sessionStorage.getItem('g233')) { sessionStorage.setItem('g233', '1'); localStorage.setItem('cpm-v3', JSON.stringify(sv)); } }, [mkSave(2, 9090), liv]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break; await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 9090, policy: 'seeded', tickMs: 300 }));
  await pg.waitForFunction(() => { try { const x = window.__CPM_PRONTI196 && window.__CPM_PRONTI196(); return x && x.pronti && window.__CPM_PHASE() === 'playing' && !document.querySelector('[data-cpm="attesa196"]'); } catch (e) { return false; } }, null, { timeout: 180000 });
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)); await sleep(500);
  /* stessa scena forzata e fotogramma fermo: situazione 0 in fase di scelta */
  const tot = await pg.evaluate(() => window.__CPM_LOAD_ALL ? window.__CPM_LOAD_ALL() : 0).catch(() => 0);
  await pg.evaluate(() => window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(0)); await sleep(6000);
  await pg.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(800);
  const m = await pg.evaluate(() => { let a = null; try { a = window.__CPM_CGTRADER_LOD_AUDIT(); } catch (e) {} const f = window.__CPM_FRAME480 || null; return { eroe: a && a.heroLod, livelli: a && a.active, leggero: !!window.__CPM_LEGGERO233, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, quadro: f && (typeof f === 'function' ? f() : f), ph: window.__CPM_PHASE && window.__CPM_PHASE() }; });
  const png = await pg.screenshot({ path: `${FOTO}/lod-${liv}.png` }); out[liv] = { ...m, tot, bytePng: png.length }; console.log(liv, JSON.stringify(out[liv]).slice(0, 400));
  await ctx.close();
}
await browser.close(); srv.close();
/* NOTA DI METODO: le due foto NON sono lo stesso istante (regia e pubblico sono vivi): una differenza pixel per pixel fra le due
   misura la regia, non il livello di dettaglio (provato: 14,6/255 di media, quasi tutto tribuna e inquadratura). Il confronto valido
   e' a occhio sull'eroe, alla sua altezza apparente (frazione dell'altezza dell'immagine, testimone __CPM_FRAME480). */
for (const k of Object.keys(out)) { const q = out[k].quadro || {}; console.log(`${k}: file dell'eroe ${out[k].leggero ? 'lod1 (12.244 triangoli, immagini 1024 px)' : 'lod0 (34.995 triangoli, immagini 2048 px)'} · altezza apparente dell'eroe ${q.min}–${q.max} dell'immagine (= ${Math.round((q.min || 0) * 1334)}–${Math.round((q.max || 0) * 1334)} pixel veri su 1334) · memoria JS ${out[k].heap} MB`); }
process.exit(0);
