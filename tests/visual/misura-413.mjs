#!/usr/bin/env node
/* [giro 413] sonda: altezza del pre-provino 1 (G184-02) da PC e telefono, bracci verde / __CPM_NO_G401. Uso: CPM_FOTO=<dir> node misura-413.mjs */
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
import { ALTEZZA } from './c184-lib.mjs';
const FOTO = process.env.CPM_FOTO || null;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const FMT = [{ k: 'pc', w: 1440, h: 900 }, { k: 'pc1280', w: 1280, h: 900 }, { k: 's412', w: 412, h: 915, touch: true }];
const BR = (process.env.CPM_BRACCI || 'verde,NO_G401').split(',');
const FMTS = process.env.CPM_FMT ? FMT.filter(f => process.env.CPM_FMT.split(',').includes(f.k)) : FMT;
for (const no401 of BR) for (const f of FMTS) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(n => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-dark', '0'); } catch (_e) {} if (n !== 'verde') window['__CPM_' + n] = true; }, no401);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  try { await page.waitForFunction(() => /Nuova carriera/i.test(document.body.innerText || ''), null, { timeout: 90000, polling: 200 }); } catch (e) { console.log('HOME?', (await page.evaluate(() => document.body.innerText)).slice(0, 300)); throw e; }
  await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Nuova carriera/i.test(x.textContent)).click());
  await page.waitForSelector('input[name="cpm-hero-name"]'); await page.locator('input[name="cpm-hero-name"]').fill('Mario Rossi');
  await page.locator('[data-cpm="crea-avanti-v2"]').click();
  await page.waitForFunction(() => /IL PROVINO · PASSO 1|PROVINO 1 DI 3/.test(document.body.innerText || ''), null, { timeout: 20000 }); await sleep(800);
  const a = await page.evaluate(ALTEZZA);
  const sc = await page.evaluate(() => { const e = document.querySelector('.cpm-scroll'); const p = document.querySelector('[data-cpm="provino-pre"]'); const r = p.getBoundingClientRect(); return { pb: e && getComputedStyle(e).paddingBottom, ch: e && e.clientHeight, sh: e && e.scrollHeight, pre: Math.round(r.top) + '-' + Math.round(r.bottom) }; });
  const btn = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => /Inizia il provino/i.test(y.textContent)); const r = x.getBoundingClientRect(); return Math.round(r.top) + '-' + Math.round(r.bottom) + ' / ' + innerHeight; });
  console.log(`${no401} ${f.k}: vuoto ${a.vuoto}px=${a.pct}% scorre=${a.scorre} ultimo «${a.ultimo}» · tasto ${btn} · scroll ${JSON.stringify(sc)}`);
  if (FOTO) await page.screenshot({ path: path.join(FOTO, `pre1-${f.k}-${no401}.png`) });
  await ctx.close();
}
await b.close(); srv.close();
