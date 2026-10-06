#!/usr/bin/env node
/* [7.999.142 PO-068 P1-b, decisione PO 05/10 «1, 2 e 3»] GUARDIANO GLB-ON sul salvataggio S12 (autoplay seme 7, partita intera):
   i gesti che il brain chiede durante le SCENE ai corpi che non sono l'eroe (portiere pronto/tuffo, difensore in pressione,
   intercetto, murato) devono vedersi sul corpo 3D. Testimone __CPM_SCENA23 (attesi/visti). Misurato: rosso 9 su 22 (41%),
   verde 25 su 26; secondo giro verde 12/13 (0,92), rosso 9/17 (0,53). VERDE: almeno il 60% dei gesti attesi visti (quattro giri: 0,75-1,0) e richieste del brain in scena. ROSSO (__CPM_NO_P1B): zero richieste. Uso: node gesti-scena-p1b.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_BRAIN_REC = true; if (s.r) window.__CPM_NO_P1B = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '', foto = 0, ultimo = -1;
  while (Date.now() - t0 < 560000) {
    const s = await page.evaluate(() => { const A = window.__CPM_SCENA23 || { attesi: [] }; return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), v: A.attesi.filter(a => a.idx !== 21 && a.visto && /pronto|tuffo|pressione/.test(a.ev)).length }; });
    ph = s.ph; if (ph === 'ended' || ph === 'ceremony') break;
    if (!rosso && foto < 3 && s.v > ultimo && /^hl_/.test(ph || '')) { ultimo = s.v; await page.screenshot({ path: new URL('./out/gesti-scena-p1b-' + foto + '.png', import.meta.url).pathname }).catch(() => {}); foto++; }
    await sleep(700);
  }
  const r = await page.evaluate(() => { const A = window.__CPM_SCENA23 || { attesi: [] }; const N = A.attesi.filter(a => a.idx !== 21); const per = {}; for (const a of N) { per[a.ev] = per[a.ev] || [0, 0]; per[a.ev][0]++; if (a.visto) per[a.ev][1]++; } return { attesi: N.length, visti: N.filter(a => a.visto).length, per, richieste: ((window.__CPM_BRAIN23 || {}).richieste | 0) }; });
  esito[rosso ? 'rosso' : 'verde'] = { fase: ph, ...r, quota: r.attesi ? +(r.visti / r.attesi).toFixed(2) : null };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
/* [7.999.143] il confronto fra le due quote dipendeva dalla partita (catena: rosso 0,68, perche' i canali propri della scena montano
   comunque molti gesti). Il segno strutturale di P1-b e' un altro: le RICHIESTE di gesto che la tabella del brain fa ai corpi durante
   le scene — col rosso sono zero per costruzione (tutti gli eventi scartati), col verde no. */
if (!(V.attesi >= 8 && V.quota >= 0.6 && V.richieste >= 5)) g.push('verde: gesti di scena dei corpi non visti o nessuna richiesta del brain ' + JSON.stringify(V));
if (!(R.richieste === 0)) g.push('rosso: la tabella del brain chiede gesti anche spenta ' + JSON.stringify(R));
if (g.length) { console.log('❌ gesti-scena-p1b'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ gesti-scena-p1b verde (e il rosso si vede)');
