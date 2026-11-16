#!/usr/bin/env node
/* [giro 203 · PO-460] GUARDIANO sigle-203 — «nella barra in alto della partita sigle e nomi tagliati (FF per FFT, WO sotto lo stemma)».
   Sul gioco vero (?cpmtest=1, partita del provino), a 360×640 · 375×667 · 390×844 · 1366×768: col varco __CPM_BARRA203 mette
   sulla barra OGNI club del gioco (a coppie, casa e ospiti) e su ogni nome della barra misura sul DOM:
   - px di testo che ESCONO dalla casella (larghezza vera del testo, Range, contro la casella che lo ritaglia);
   - px di testo SOTTO lo stemma (intersezione fra il testo e il rettangolo dello stemma);
   - che il testo mostrato sia un gradino intero della scala (nome, U19, dizionario, abbreviato, sigla), mai un pezzo.
   Verde: 0 px fuori e 0 px sotto lo stemma su tutte le quattro viste, per tutti i club, e anche a campo invertito (secondo tempo).
   Rosso: CPM_ROSSO203=1 accende window.__CPM_NO_G203 → DEVE uscire 1 (le sigle larghe tornano tagliate).
   «Non giudicato» = rosso (meno di 2 nomi misurati per vista, o meno club del previsto). Foto: CPM_FOTO203=<cartella>.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node sigle-203.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO203 === '1';
const FOTO = process.env.CPM_FOTO203 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const VISTE = [{ width: 360, height: 640 }, { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 1366, height: 768 }]
  .filter(v => !process.env.CPM_VISTE || process.env.CPM_VISTE.split(',').includes(String(v.width)));   // CPM_VISTE=360,375,390 · CPM_VISTE=1366
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errors = [];
/* il TELEFONO si emula col touch (isMobile + hasTouch → pointer:coarse): e' il caso del PO. Col puntatore fine il centro della
   barra e' largo ~126 px a 375, col touch ~211 (aree di tocco da 44 px) — senza touch la sonda misurava una barra che il
   telefono non mostra e trovava le sigle intere. Il PC (1366) gira senza touch. */
async function apri(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript((rosso) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G203 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Collaudo Sigle' });
  await page.waitForFunction(() => typeof window.__CPM_BARRA203 === 'function' && !!document.querySelector('[data-cpm="barra-nome-182"]'), null, { timeout: 60000 });
  await page.evaluate(() => { window.__CPM_FROZEN = true; });   // il 3D si ferma: si misura la barra, non la scena
  return page;
}
let page = null, touchAperto = null;
const MISURA = () => {
  const out = [];
  for (const el of document.querySelectorAll('[data-cpm="barra-nome-182"]')) {
    const r = el.getBoundingClientRect(); if (r.width < 0.5 && r.height < 0.5) { out.push({ vuoto: 1 }); continue; }
    const rg = document.createRange(); rg.selectNodeContents(el); const t = rg.getBoundingClientRect();
    const fuori = Math.max(0, r.left - t.left) + Math.max(0, t.right - r.right);
    const box = el.parentElement; const st = box.querySelector('svg'); let sotto = 0;
    /* il testo (rettangolo VERO, non ritagliato) che entra nel rettangolo dello stemma: e' il «WO coperto dallo stemma» */
    if (st) { const s = st.getBoundingClientRect(); const ox = Math.min(t.right, s.right) - Math.max(t.left, s.left), oy = Math.min(t.bottom, s.bottom) - Math.max(t.top, s.top);
      sotto = ox > 0 && oy > 0.5 ? ox : 0; }   /* in due dimensioni: con lo stemma sopra il nome (sotto 390 px) la sola x si sovrappone sempre */
    const cand = (el.getAttribute('data-cand182') || '').split('|');
    out.push({ testo: el.textContent, cand, liv: +el.getAttribute('data-nome182'), fuori: +fuori.toFixed(1), sotto: +sotto.toFixed(1),
      larg: +r.width.toFixed(1), testoL: +t.width.toFixed(1), intero: cand.includes(el.textContent), corpo: parseFloat(getComputedStyle(el).fontSize) });
  }
  return out;
};
const sintesi = {};
try {
  page = await apri(VISTE[0], true); touchAperto = true;
  const club = await page.evaluate(() => { const v = new Map(); for (const c of [...CLUBS, ...U18_CLUBS, ...U18_CLUBS_P2, ...TRIAL_OPPONENTS]) v.set(c.id || c.n, c); return [...v.values()].map(c => ({ ...c })); });
  console.log(`club da mettere sulla barra: ${club.length}`);
  ok(club.length >= 250, `censimento: ${club.length} club (attesi almeno 250)`);
  // in testa i casi che il PO ha fotografato e i piu' larghi: sigle con W/M, nomi corti/lunghi
  for (const vp of VISTE) {
    const touch = vp.width < 1000;
    if (touch !== touchAperto) { await page.context().close(); page = await apri(vp, touch); touchAperto = touch; }
    await page.setViewportSize(vp); await sleep(400);
    const tutti = [];
    for (const inv of [false, true]) {
      await page.evaluate(i => { window.__CPM_SWAP203 = i; window.__CPM_BARRA203(null); }, inv); await sleep(150);
      for (let i = 0; i < club.length; i += 2) {
        const h = club[i], a = club[(i + 1) % club.length];
        await page.evaluate(([h, a]) => window.__CPM_BARRA203(h, a), [h, a]);
        await page.waitForFunction(([hn, an]) => { const e = [...document.querySelectorAll('[data-cpm="barra-nome-182"]')].map(x => x.getAttribute('data-intero182')); return e[0] === hn && e[1] === an; }, [h.n, a.n], { timeout: 5000 }).catch(() => {});
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
        const m = await page.evaluate(MISURA);
        m.forEach((x, k) => tutti.push({ ...x, club: (k ? a : h).n, sigla: (k ? a : h).a, inv }));
      }
    }
    await page.evaluate(() => { window.__CPM_SWAP203 = false; window.__CPM_BARRA203(null); }); await sleep(150);
    const mis = tutti.filter(x => !x.vuoto);
    const fuori = mis.filter(x => x.fuori > 0.5), sotto = mis.filter(x => x.sotto > 0.5), pezzi = mis.filter(x => !x.intero);
    const sig = mis.filter(x => x.testo === x.sigla);
    const peggio = [...fuori].sort((a, b) => b.fuori - a.fuori).slice(0, 4).map(x => `${x.club} «${x.testo}» ${x.fuori}px`).join('; ');
    const peggioS = [...sotto].sort((a, b) => b.sotto - a.sotto).slice(0, 4).map(x => `${x.club} «${x.testo}» ${x.sotto}px`).join('; ');
    const piccoli = mis.filter(x => x.corpo < 12 - 0.01), ridotti = mis.filter(x => x.corpo < 12.99);
    sintesi[vp.width] = { ridotti: ridotti.length, corpoMin: Math.min(...mis.map(x => x.corpo)), misurati: mis.length, fuori: fuori.length, maxFuori: Math.max(0, ...mis.map(x => x.fuori)), sotto: sotto.length, maxSotto: Math.max(0, ...mis.map(x => x.sotto)), sigle: sig.length, pezzi: pezzi.length };
    console.log(`vista ${vp.width}×${vp.height} ${touch ? 'touch' : 'mouse'}: corpo ridotto ${ridotti.length} (min ${sintesi[vp.width].corpoMin}px) · ${mis.length} nomi · in sigla ${sig.length} · fuori ${fuori.length} (max ${sintesi[vp.width].maxFuori}px) · sotto lo stemma ${sotto.length} (max ${sintesi[vp.width].maxSotto}px)`);
    ok(mis.length >= club.length * 2 * 0.95, `${vp.width}px: giudicati ${mis.length} nomi su ${club.length * 2} (ogni club una volta a campo normale e una a campo invertito)`);
    ok(fuori.length === 0, `${vp.width}px: nessun testo esce dalla casella (${fuori.length}${peggio ? ': ' + peggio : ''})`);
    ok(sotto.length === 0, `${vp.width}px: nessun testo sotto lo stemma (${sotto.length}${peggioS ? ': ' + peggioS : ''})`);
    ok(piccoli.length === 0, `${vp.width}px: nessun nome sotto 12 px, il minimo della scala FS (${ridotti.length} col corpo ridotto, minimo ${sintesi[vp.width].corpoMin} px)`);
    ok(pezzi.length === 0, `${vp.width}px: il testo mostrato e' sempre un gradino intero (${pezzi.length} pezzi)`);
    if (FOTO) {
      // foto del caso fotografato dal PO (FC Frankfurt «FFT» contro FC Wolfstadt «WOL») e dei due club piu' larghi in sigla
      const fft = club.find(c => c.a === 'FFT'), wol = club.find(c => c.a === 'WOL');
      const el = await page.$('[data-cpm="barra"]');
      if (fft && wol && el) { await page.evaluate(([h, a]) => window.__CPM_BARRA203(h, a), [fft, wol]); await sleep(500);
        await el.screenshot({ path: `${FOTO}/barra-${vp.width}-FFT-WOL-${ROSSO ? 'prima' : 'dopo'}.png` }); }
      const larghe = [...mis].filter(x => x.testo === x.sigla).sort((p, q) => q.testoL - p.testoL).slice(0, 2).map(x => club.find(c => c.n === x.club));
      if (larghe.length === 2 && el) { await page.evaluate(([h, a]) => window.__CPM_BARRA203(h, a), larghe); await sleep(500);
        await el.screenshot({ path: `${FOTO}/barra-${vp.width}-larghe-${ROSSO ? 'prima' : 'dopo'}.png` }); }
    }
  }
  ok(errors.length === 0, `nessun errore di pagina (${errors.length}${errors.length ? ': ' + errors[0] : ''})`);
} catch (e) { ok(false, 'eccezione: ' + String(e.message).slice(0, 300)); }
try { await page.context().close(); } catch (e) {}
await browser.close(); srv.close();
ok(Object.keys(sintesi).length === VISTE.length && VISTE.length > 0, `viste giudicate ${Object.keys(sintesi).length} su ${VISTE.length}`);
console.log('sintesi ' + JSON.stringify(sintesi));
const atteso = ROSSO ? 'rosso' : 'verde';
console.log(`\n${fails.length ? 'ROSSO' : 'VERDE'} sigle-203 (${oks.length} ok · ${fails.length} ko)${ROSSO ? ' — braccio rosso: atteso ROSSO' : ''}`);
// braccio rosso: esce 0 se il difetto SI VEDE (almeno un nome tagliato o sotto lo stemma), 1 se e' cieco — cosi' «verde && rosso» si incatena
if (ROSSO) { const visto = Object.values(sintesi).some(v => v.fuori > 0 || v.sotto > 0); console.log(visto ? 'prova del rosso: il difetto si vede' : 'prova del rosso CIECA: nessun taglio visto'); process.exit(visto ? 0 : 1); }
process.exit(fails.length ? 1 : 0);
