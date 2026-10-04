#!/usr/bin/env node
/* [7.999.132 PO-202, decisione PO 04/10 «piu' un recupero breve»] GUARDIANO su una partita vera intera dal salvataggio S12 (autoplay,
   seme fisso, fino al fischio, massimo 420 s). La partita finiva al 90' senza recupero; ora il fischio arriva al 93' come nella
   simulazione rapida (testimone __CPM_FINE202 = minuto vero del fischio). MISURATO su 12 partite per braccio: 7 tiri fra il 90' e il 92'
   nel verde, 0 nel rosso. Verde: fischio a 93 o oltre. Rosso (__CPM_NO_REC202): fischio a 90. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const utili = (rip) => rip;
for (const rosso of [false, true]) { for (let tent = 0; tent < 3; tent++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + String.fromCharCode(65 + tent);/* il seme nasce anche dal NOME */
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_REC202 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let rip = [], rec = 0;
  while (Date.now() - t0 < 420000) {
    const s = await page.evaluate(() => ({ f: window.__CPM_PHASE(), rip: [], rec: window.__CPM_FINE202 | 0 }));
    rec = s.rec;
    if (s.f === 'ended' || s.f === 'ceremony' || rec) break;
    await sleep(500);
  }
  const u = utili(rip);
  rec = await page.evaluate(() => window.__CPM_FINE202 | 0);
  const _e = { fischio: rec, tentativi: tent + 1, s: Math.round((Date.now() - t0) / 1000) };
  console.log((rosso ? 'rosso' : 'verde') + ' tentativo ' + (tent + 1) + ' ' + JSON.stringify(_e));
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
  if (_e.fischio) break; }
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.fischio >= 93)) g.push('verde: ' + JSON.stringify(V));
if (!(R.fischio === 90)) g.push('rosso: ' + JSON.stringify(R));
if (g.length) { console.log('❌ recupero-202'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ recupero-202 verde (e il rosso si vede)');
