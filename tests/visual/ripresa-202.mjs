#!/usr/bin/env node
/* [7.999.129 PO-202 «partite troppo sbilanciate, non sono tirate»] GUARDIANO su una partita vera dal salvataggio S12 (autoplay, seme
   fisso, fino a 3 scene dell'eroe con un tiro fuori o parato, massimo 300 s; un braccio senza scene utili si ritenta fino a 3 partite).
   Dopo un tiro dell'eroe finito fuori o parato riparte l'avversario (testimone __CPM_RIP202, scritto nel gioco a ogni ripresa).
   MISURATO prima della correzione (10 partite): 22 tiri fuori su 31 lasciavano la palla alla squadra dell'eroe, spesso in area.
   Verde: tutte le riprese dopo un tiro fuori/parato vanno all'avversario. Rosso (__CPM_NO_RIP202): almeno una resta all'eroe. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const utili = (rip) => rip.filter(x => !x.gol && (x.tiro === 'fuori' || x.tiro === 'saved'));
for (const rosso of [false, true]) { for (let tent = 0; tent < 3; tent++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + String.fromCharCode(65 + tent);/* il seme nasce anche dal NOME */
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_RIP202 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let rip = [];
  while (Date.now() - t0 < 300000) {
    const s = await page.evaluate(() => ({ f: window.__CPM_PHASE(), rip: (window.__CPM_RIP202 || []).slice() }));
    rip = s.rip; if (s.f === 'ended' || s.f === 'ceremony' || utili(rip).length >= 3) break;
    await sleep(500);
  }
  const u = utili(rip);
  const _e = { riprese: rip.length, dopoTiroFuori: u.length, allAvversario: u.filter(x => x.lato === 'away').length, allEroe: u.filter(x => x.lato === 'home').length, tentativi: tent + 1, s: Math.round((Date.now() - t0) / 1000) };
  console.log((rosso ? 'rosso' : 'verde') + ' tentativo ' + (tent + 1) + ' ' + JSON.stringify(_e));
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
  if (rosso ? _e.allEroe >= 1 : _e.dopoTiroFuori >= 1) break; }
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.dopoTiroFuori >= 1 && V.allEroe === 0)) g.push('verde: ' + JSON.stringify(V));
if (!(R.allEroe >= 1)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ ripresa-202'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ripresa-202 verde (e il rosso si vede)');
