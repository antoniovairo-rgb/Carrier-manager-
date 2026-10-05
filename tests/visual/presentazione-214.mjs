#!/usr/bin/env node
/* [7.999.135 PO-214 «la presentazione deve esserci prima della prima partita con il nuovo club e deve essere una conferenza stampa in
   stile intervista post partita»] GUARDIANO sul salvataggio S12: si azzera presentedClub (= appena arrivato) e si preme «Gioca».
   VERDE: si apre la sala stampa dell'intervista con l'etichetta PRESENTAZIONE e la partita NON parte; si risponde (domanda, rilancio),
   la prima pagina si chiude, e solo allora si entra in campo; presentedClub = club attuale nel salvataggio.
   ROSSO (__CPM_NO_PRES214): nessuna presentazione, si va in campo con presentedClub ancora vuoto. Uso: node presentazione-214.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const leggi = (page) => page.evaluate(() => { let p = null; try { const s = JSON.parse(localStorage.getItem('cpm-v3')); p = s.player || s; } catch (e) {} return { pres: p ? (p.presentedClub || '') : null, club: p && p.club ? p.club.id : null, fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null }; });
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_PRES214 = 1; const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.patch({ presentedClub: '' }));
  await sleep(1200);
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch(true));
  await sleep(2000);
  const sala = await page.evaluate(() => ({ etichetta: [...document.querySelectorAll('[data-cpm="risposta24"]')].some(e => /Sono qui per vincere qualcosa/.test(e.innerText)), risposte: document.querySelectorAll('[data-cpm="risposta24"]').length, fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null }));
  let passi = 0;
  if (sala.risposte) {
    for (let k = 0; k < 2; k++) { const r = page.locator('[data-cpm="risposta24"]').first(); try { await r.click({ timeout: 5000 }); passi++; } catch (e) {} await sleep(900); }
    const prima = await page.evaluate(() => !!document.querySelector('[data-cpm="prima-pagina24"]'));
    if (prima) { try { await page.getByRole('button', { name: 'Chiudi', exact: true }).first().click({ timeout: 5000 }); passi++; } catch (e) {} }
    await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  }
  await sleep(2500);
  const dopo = await leggi(page);
  const _e = { playMatch: pm, sala, passi, dopo };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(_e));
  if (!rosso) await page.screenshot({ path: new URL('./out/presentazione-214.png', import.meta.url).pathname }).catch(() => {});
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.sala.etichetta && V.sala.risposte >= 3 && V.sala.fase !== 'playing')) g.push('verde: la sala stampa della presentazione non si apre prima della partita ' + JSON.stringify(V.sala));
if (!(V.passi >= 3)) g.push('verde: domanda, rilancio e prima pagina non percorsi ' + V.passi);
if (!(V.dopo.pres && V.dopo.pres === V.dopo.club)) g.push('verde: presentedClub non registrato ' + JSON.stringify(V.dopo));
if (R.sala.etichetta || (R.dopo.pres && R.dopo.pres === R.dopo.club)) g.push('rosso: la presentazione compare anche spenta ' + JSON.stringify(R));
if (g.length) { console.log('❌ presentazione-214'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ presentazione-214 verde (e il rosso si vede)');
