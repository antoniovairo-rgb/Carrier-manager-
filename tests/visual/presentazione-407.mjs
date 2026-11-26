#!/usr/bin/env node
/* [giro 407 · PO-673 «C'è il rischio che si perda la presentazione alla nuova squadra. Troppo nascosta»] GUARDIANO sul salvataggio di
   prova S12 (fixture) con presentedClub azzerato = appena firmato col club. Due settimane (W3 senza partita · W38 con la partita) a
   412x915 e una a 1280x900.
   VERDE: la card [data-cpm="presentazione407"] e' la PRIMA voce di «Da decidere», card e tasto «Vai in sala stampa» stanno nella vista
   senza scorrere e sopra le statistiche (figurina con forma/morale); il tasto principale dice «Vai in sala stampa» e premuto apre la
   sala stampa della presentazione (non la settimana, non la partita); risposto e chiuso, presentedClub = club e la card sparisce.
   ROSSO (__CPM_NO_G407): la card torna sotto le statistiche, fuori dalla vista, e il tasto principale non porta in sala stampa.
   «Non giudicato» (card o tasto non trovati) = rosso. Uso: node presentazione-407.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = { verde: [], rosso: [] };
const CASI = [[412, 915, 3], [412, 915, 38], [1280, 900, 3]];
for (const rosso of [false, true]) for (const [w, h, week] of CASI) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; if (s.r) window.__CPM_NO_G407 = 1; const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate((wk) => window.__CPM_CAREER.patch({ presentedClub: '', week: wk }), week);
  await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('*').forEach(e => { if (e.scrollTop > 0) e.scrollTop = 0; }); }); await sleep(600);
  const m = await page.evaluate(() => {
    const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bot: Math.round(r.bottom), dentro: r.height > 0 && r.top >= 0 && r.bottom <= innerHeight }; };
    const tasto = [...document.querySelectorAll('button')].find(x => /Vai in sala stampa/i.test(x.innerText) && x.getAttribute('data-cpm') !== 'avanza23');
    let card = document.querySelector('[data-cpm="presentazione407"]');
    if (!card && tasto) { card = tasto; while (card && !/PRESENTAZIONE ·|Presentazione ·/i.test(card.innerText || '')) card = card.parentElement; }
    const dec = document.querySelector('[data-cpm="scelte199"]'); const prima = dec ? dec.querySelector('[data-cpm^="scelta199-"]:not([data-cpm="scelta199-segno"])') : null;
    const cta = document.querySelector('[data-cpm="avanza23"]');
    return { vh: innerHeight, card: R(card), tasto: R(tasto), stats: R(document.querySelector('[data-cpm="eroe-v2"]')), primaVoce: prima ? prima.getAttribute('data-cpm') : null, cta: cta ? cta.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) : null };
  });
  let sala = null, dopo = null;
  if (w === 412) {
    try { await page.locator('[data-cpm="avanza23"]').first().click({ timeout: 5000 }); } catch (e) {}
    await sleep(1800);
    sala = await page.evaluate(() => ({ pres: [...document.querySelectorAll('[data-cpm="risposta24"]')].some(e => /Sono qui per vincere qualcosa/.test(e.innerText)), risposte: document.querySelectorAll('[data-cpm="risposta24"]').length, fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null, settimana: !!document.querySelector('[data-cpm^="settimana"],[data-cpm="week-live"]') }));
    if (sala.pres) {
      for (let k = 0; k < 2; k++) { try { await page.locator('[data-cpm="risposta24"]').first().click({ timeout: 5000 }); } catch (e) {} await sleep(900); }
      if (await page.evaluate(() => !!document.querySelector('[data-cpm="prima-pagina24"]'))) { try { await page.getByRole('button', { name: 'Chiudi', exact: true }).first().click({ timeout: 5000 }); } catch (e) {} }
      await sleep(1500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(2500);
      dopo = await page.evaluate(() => { let p = null; try { const s = JSON.parse(localStorage.getItem('cpm-v3')); p = s.player || s; } catch (e) {} const cta = document.querySelector('[data-cpm="avanza23"]');
        return { pres: p ? p.presentedClub : null, club: p && p.club ? p.club.id : null, card: !!document.querySelector('[data-cpm="presentazione407"]'), cta: cta ? cta.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) : null }; });
    }
  }
  const r = { w, h, week, ...m, sala, dopo }; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(r));
  if (!rosso && w === 412 && week === 3) await page.screenshot({ path: new URL('./out/presentazione-407.png', import.meta.url).pathname }).catch(() => {});
  esito[rosso ? 'rosso' : 'verde'].push(r); await ctx.close();
}
await b.close(); srv.close();
const g = [];
for (const r of esito.verde) {
  const k = `verde ${r.w}x${r.h} W${r.week}`;
  if (!r.card || !r.tasto) { g.push(k + ': non giudicato, card o tasto non trovati'); continue; }
  if (r.primaVoce !== 'scelta199-presentazione') g.push(k + ': la presentazione non e\' la prima voce di «Da decidere» (' + r.primaVoce + ')');
  if (!r.tasto.dentro) g.push(k + ': tasto «Vai in sala stampa» fuori dalla vista ' + JSON.stringify(r.tasto) + ' vh ' + r.vh);
  if (r.w === 412 && !r.card.dentro) g.push(k + ': card fuori dalla vista ' + JSON.stringify(r.card));
  if (!r.stats || !(r.card.bot <= r.stats.top)) g.push(k + ': card non sopra le statistiche ' + JSON.stringify({ card: r.card, stats: r.stats }));
  if (!/sala stampa/i.test(r.cta || '')) g.push(k + ': il tasto principale non porta in sala stampa «' + r.cta + '»');
  if (r.w === 412) {
    if (!r.sala || !r.sala.pres || r.sala.risposte < 3 || r.sala.fase === 'playing') g.push(k + ': il tasto principale non apre la sala stampa della presentazione ' + JSON.stringify(r.sala));
    else if (!r.dopo || r.dopo.pres !== r.dopo.club || r.dopo.card || /sala stampa/i.test(r.dopo.cta || '')) g.push(k + ': dopo la presentazione stato/home non tornati ' + JSON.stringify(r.dopo));
  }
}
const R412 = esito.rosso.filter(r => r.w === 412);
for (const r of R412) {
  const k = `rosso 412 W${r.week}`;
  if (!r.card || !r.stats) { g.push(k + ': non giudicato, card o statistiche non trovate'); continue; }
  if (r.card.dentro || r.card.top < r.stats.top) g.push(k + ': col rosso la card dovrebbe tornare sotto le statistiche, fuori vista ' + JSON.stringify({ card: r.card, stats: r.stats }));
  if (/sala stampa/i.test(r.cta || '') || (r.sala && r.sala.pres)) g.push(k + ': col rosso il tasto principale porta comunque in sala stampa');
}
if (g.length) { console.log('❌ presentazione-407'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ presentazione-407 verde (e il rosso si vede)');
