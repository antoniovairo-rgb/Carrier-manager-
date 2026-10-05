#!/usr/bin/env node
/* [7.999.131 PO-202, decisione PO 04/10 «il motore gioca anche nel minuto della scena»] GUARDIANO su una partita vera dal salvataggio
   S12 (autoplay, seme fisso, fino a 3 scene dell'eroe chiuse, massimo 300 s). Nel minuto di ogni scena il motore non riceveva passi:
   ora li recupera dopo la scena, uno in piu' per sotto-tick (testimone __CPM_MIN202 = passi recuperati). MISURATO: 6 partite per braccio,
   tiri avversari 7,3 -> 9,0, ~110 passi recuperati a partita. Verde (7.999.137, scene decise dal motore anche a pochi minuti l'una
   dall'altra): almeno 22 passi pagati e debito aperto coperto da pagati + residuo (testimoni __CPM_DEB202T aperto, __CPM_DEB202 residuo; al
   piu' una scena oltre il tetto di 66). Rosso (__CPM_NO_MIN202): zero passi recuperati. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const utili = (rip) => rip;
for (const rosso of [false, true]) { for (let tent = 0; tent < 3; tent++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + String.fromCharCode(65 + tent);/* il seme nasce anche dal NOME */
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_MIN202 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let rip = [], rec = 0;
  while (Date.now() - t0 < 300000) {
    const s = await page.evaluate(() => ({ f: window.__CPM_PHASE(), rip: (window.__CPM_RIP202 || []).slice(), rec: window.__CPM_MIN202 | 0 }));
    rec = s.rec;
    rip = s.rip; if (s.f === 'ended' || s.f === 'ceremony' || utili(rip).length >= 3) break;
    await sleep(500);
  }
  const u = utili(rip);
  await sleep(4000); const _d = await page.evaluate(() => ({ rec: window.__CPM_MIN202 | 0, res: window.__CPM_DEB202 | 0, ap: window.__CPM_DEB202T | 0 })); rec = _d.rec; var _res = _d.res, _ap = _d.ap;
  const _e = { scene: rip.length, recuperati: rec, residuo: _res, aperto: _ap, tentativi: tent + 1, s: Math.round((Date.now() - t0) / 1000) };
  console.log((rosso ? 'rosso' : 'verde') + ' tentativo ' + (tent + 1) + ' ' + JSON.stringify(_e));
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
  if (_e.scene >= 2) break; }
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.scene >= 2 && V.aperto >= 22 && V.recuperati >= 22 && V.recuperati + V.residuo >= V.aperto - 22)) g.push('verde: ' + JSON.stringify(V));
if (!(R.scene >= 2 && R.recuperati === 0)) g.push('rosso: ' + JSON.stringify(R));
if (g.length) { console.log('❌ minuti-202'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ minuti-202 verde (e il rosso si vede)');
