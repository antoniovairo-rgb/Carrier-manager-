#!/usr/bin/env node
/* [giro 94 D2] SONDA (non guardiano): partite dal vivo del salvataggio fixtures/save-190-s12-ovr93.json con autoplay seedato;
   registra i rigori del motore (__CPM_PEN94: rigore/battuta pen/tiro penalty/gol dell'eroe/occasione_eroe rigore), i gol di scena
   dell'eroe su piazzato e i «Momenti chiave». Uso: K=12,13 [CPM_ROSSO=D2] node sonda-rigore-94.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const KS = (process.env.K || '12').split(',').map(Number); const ROSSO = process.env.CPM_ROSSO || '';
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`; const b = await launchBrowser();
for (const k of KS) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' Q190-' + k;
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (r) window['__CPM_NO_C3' + r] = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, ROSSO]);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
  const tp = Date.now(); let ph = '';
  while (Date.now() - tp < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
  const R = await page.evaluate(() => ({ pen: window.__CPM_PEN94 || [], score: window.__CPM_SCORE ? window.__CPM_SCORE() : null,
    mom: [...document.querySelectorAll('div')].filter(d => d.textContent === 'MOMENTI CHIAVE').map(d => d.parentElement && d.parentElement.innerText).slice(0, 1) }));
  console.log(JSON.stringify({ k, fine: ph, errs: errs.length, ...R }));
  await ctx.close();
}
await b.close(); srv.close();
