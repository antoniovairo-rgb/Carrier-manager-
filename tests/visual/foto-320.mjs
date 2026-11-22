#!/usr/bin/env node
/* [giro 320 PO-619] foto dell'intro col nome di fantasia: didascalia «Gabriel Ferreyro. Numero 9.» e «GOOOL DI FERREYRO!»
   a 360x800 (tocco) e 1440x900, deviceScaleFactor 2. Controlla anche che il testo stia nella vista (nessun taglio).
   CPM_PROVA_ROSSO=1 → __CPM_NO_G320 (testi della 7.999.201). Uscita: docs/sviluppo/giro320/. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, DIR = new URL('../../docs/sviluppo/giro320/', import.meta.url).pathname; fs.mkdirSync(DIR, { recursive: true });
const NOME = ROSSO ? 'Giovanni Pisano' : 'Gabriel Ferreyro', COG = ROSSO ? 'PISANO' : 'FERREYRO';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const ko = [];
for (const f of [{ n: 's360', w: 360, h: 800, t: 1 }, { n: 'pc', w: 1440, h: 900, t: 0 }]) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 2, serviceWorkers: 'block' }; if (f.t) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { try { localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-dark', '0'); } catch (e) {} if (r) window.__CPM_NO_G320 = true; }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.querySelector('button[title="Rivedi l\'intro"]'), null, { timeout: 90000 });
  const ph = await page.$eval('input[name="cpm-hero-name"]', e => e.placeholder).catch(() => null);
  await page.click('button[title="Rivedi l\'intro"]');
  for (const [k, re, at] of [['didascalia', NOME + '. Numero 9', 4.3], ['gol', 'GOOOL DI ' + COG, 9.9]]) {
    await page.waitForFunction(a => ((window.__CPM_INTRO115 || {}).el || 0) >= a, at, { timeout: 120000 }).catch(() => {});
    await sleep(500);
    const v = await page.evaluate(t => { for (const e of document.querySelectorAll('div,span')) { if (e.children.length) continue; if ((e.innerText || '').includes(t)) { const r = e.getBoundingClientRect(); return { x0: r.left, x1: r.right, sw: e.scrollWidth, cw: e.clientWidth, W: innerWidth }; } } return null; }, re);
    await page.screenshot({ path: `${DIR}${ROSSO ? 'rosso-' : ''}${f.n}-${k}.png` });
    const ok = v && v.x0 >= 0 && v.x1 <= v.W && v.sw <= v.cw + 1;
    console.log(`${f.n} ${k}: «${re}» ${v ? `x ${Math.round(v.x0)}..${Math.round(v.x1)} su ${v.W}, scroll ${v.sw}/${v.cw}` : 'NON TROVATO'} → ${ok ? 'ok' : 'KO'}`);
    if (!ok) ko.push(`${f.n} ${k}`);
  }
  if (f.n === 's360') console.log(`placeholder del campo Nome: ${ph}`);
  await ctx.close();
}
await b.close(); srv.close();
console.log(ko.length ? `foto-320 ROSSO: ${ko.join(', ')}` : `foto-320 VERDE: nome «${NOME}» in vista, senza tagli`);
process.exit(ko.length ? 1 : 0);
