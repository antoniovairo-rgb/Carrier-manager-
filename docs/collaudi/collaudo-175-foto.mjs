#!/usr/bin/env node
/* COLLAUDO 7.999.175 (carriera) — sonda di fotografia e misura, NON gioco.
   Tre parti, a 412x915 e 360x915:
   A. creazione: «Nuova carriera» → niente griglia degli stili, niente casella Enfant, niente testo «Stile di gioco»;
      foto della schermata intera e dei provini; lettura del calciatore creato (stile, tratto, statistiche).
   B. salvataggi: (1) quello di prova (centravanti 174) e (2) un salvataggio 174 con stile «regista» + tratto Enfant acceso.
      Dopo il caricamento: stile Finalizzatore, Enfant spento, statistiche invariate; foto di ogni scheda e del Profilo
      (in (2) niente riga «Enfant Prodige»).
   C. home 412/360: la card «Prossima partita» e la striscia «Ultime N» — margine in pixel del «1ª» dal bordo.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node docs/collaudi/collaudo-175-foto.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..');
const OUT = path.join(HERE, 'foto-7.999.175-carriera');
const SAVE = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'visual', 'fixtures', 'save-190-s12-ovr93.json'), 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

/* salvataggio 174 con stile «regista» e tratto Enfant acceso (come lo scriveva la 67–174) */
const SAVE174 = JSON.parse(JSON.stringify(SAVE));
SAVE174.player.archetype = { id: 'regista', e: '🎯', name: 'Regista' };
SAVE174.player.tratti = { ...(SAVE174.player.tratti || {}), enfant: true };

const srv = await startServer(ROOT); const port = srv.address().port;
const b = await launchBrowser();
const report = { creazione: {}, salvataggi: {}, home: {} };

async function nuovaPagina(w, save) {
  const ctx = await b.newContext({ viewport: { width: w, height: 915 }, serviceWorkers: 'block' });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(s => {
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
    window.__CPM_GLB = false;
    if (s) localStorage.setItem('cpm-v3', JSON.stringify(s));
  }, save || null);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  return { ctx, page, errs };
}

async function cliccaTesto(page, re) {
  return page.evaluate(src => {
    const r = new RegExp(src);
    const bt = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetParent !== null);
    if (bt) bt.click();
    return !!bt;
  }, re.source);
}

/* A. CREAZIONE ----------------------------------------------------------- */
async function creazione(w) {
  const { ctx, page, errs } = await nuovaPagina(w, null);
  const premuto = await cliccaTesto(page, /Nuova carriera/);
  await sleep(1200);
  const pre = await page.evaluate(() => ({
    griglia: !!document.querySelector('[data-cpm="scelta-stile"]'),
    casellaEnfant: !!document.querySelector('[data-cpm="tratto-enfant"]'),
    testoStile: /Stile di gioco/i.test(document.body.innerText || ''),
    testoEnfant: /Enfant/i.test(document.body.innerText || ''),
    scrollW: document.documentElement.scrollWidth - innerWidth,
  }));
  await page.screenshot({ path: path.join(OUT, `${w}-A01-creazione.png`), fullPage: true });
  await page.locator('input[name="cpm-hero-name"]').fill('Collaudo Carriera').catch(() => {});
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, `${w}-A02-creazione-nome.png`), fullPage: true });
  const avviato = await cliccaTesto(page, /Inizia i provini/);
  await sleep(1500);
  const creato = await page.evaluate(() => { try {
    const t = JSON.parse(localStorage.getItem('cpm-trial-prog') || 'null'); const p = t && t.p;
    if (!p) return null;
    return { stile: (p.archetype && p.archetype.id) || p.archetype, tratto: !!(p.tratti && p.tratti.enfant), stats: p.stats };
  } catch (e) { return { err: String(e).slice(0, 120) }; } });
  await page.screenshot({ path: path.join(OUT, `${w}-A03-provini.png`) });
  report.creazione[w] = { premuto, avviato, pre, creato, scrollOrizzontale: pre.scrollW, errori: errs };
  await ctx.close();
}

/* B. SALVATAGGI ---------------------------------------------------------- */
async function salvataggio(w, nome, save, statsPrima) {
  const { ctx, page, errs } = await nuovaPagina(w, save);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 });
  await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(800);
  const dopo = await page.evaluate(() => { try { const p = window.__CPM_CAREER.snapshot(); return { stile: (p.archetype && p.archetype.id) || p.archetype, tratto: !!(p.tratti && p.tratti.enfant), stats: p.stats, stilePrima75: p.stilePrima75 ?? null, enfantPrima75: p.enfantPrima75 ?? null }; } catch (e) { return { err: String(e).slice(0, 120) }; } });
  const labels = await page.evaluate(() => {
    const nav = document.querySelector('.cpm-nav-tabs');
    return nav ? [...nav.querySelectorAll('button')].filter(x => x.offsetParent !== null && x.querySelector('div')).map(x => x.querySelector('div').textContent) : [];
  });
  await page.screenshot({ path: path.join(OUT, `${w}-B-${nome}-00-avvio.png`) });
  const visti = [];
  for (let i = 0; i < labels.length; i++) {
    const lab = labels[i];
    try {
      await page.evaluate(idx => {
        const nav = document.querySelector('.cpm-nav-tabs');
        const bt = [...nav.querySelectorAll('button')].filter(x => x.offsetParent !== null && x.querySelector('div'))[idx];
        bt.click();
      }, i);
      await sleep(900);
      const slug = lab.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await page.screenshot({ path: path.join(OUT, `${w}-B-${nome}-${String(i + 1).padStart(2, '0')}-${slug}.png`) });
      visti.push(lab);
      if (/Carriera/.test(lab)) {
        /* sotto-scheda Profilo: il pill «Profilo» della Carriera */
        const ok = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /^\s*(👤\s*)?Profilo\s*$/.test(x.textContent || '') && x.offsetParent !== null); if (bt) bt.click(); return !!bt; });
        await sleep(900);
        const prof = await page.evaluate(() => ({ riga: !!document.querySelector('[data-cpm="tratto-enfant-profilo"]'), testoEnfant: /Enfant/i.test(document.body.innerText || ''), testoStile: (document.body.innerText.match(/Stile di gioco:[^\n]*/) || [''])[0] }));
        await page.screenshot({ path: path.join(OUT, `${w}-B-${nome}-profilo.png`), fullPage: true });
        report.salvataggi[`${w}-${nome}`] = report.salvataggi[`${w}-${nome}`] || {};
        report.salvataggi[`${w}-${nome}`].profilo = prof;
      }
    } catch (e) { visti.push(`${lab} (non cliccabile: ${String(e.message).slice(0, 80)})`); }
  }
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const k = `${w}-${nome}`;
  report.salvataggi[k] = Object.assign(report.salvataggi[k] || {}, { schede: visti, dopo, statsPrima, statsUguali: JSON.stringify(dopo.stats) === JSON.stringify(statsPrima), scrollOrizzontale: scroll, errori: errs });
  await ctx.close();
}

/* C. HOME: «Prossima partita» e «Ultime N» ------------------------------- */
async function home(w) {
  const { ctx, page, errs } = await nuovaPagina(w, SAVE);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 });
  await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(1000);
  const m = await page.evaluate(() => {
    const lab = [...document.querySelectorAll('div')].find(d => d.textContent === 'Prossima partita' && d.children.length === 0);
    if (!lab) return { trovato: false };
    let card = lab; while (card && !/Ultime/.test(card.innerText || '')) card = card.parentElement;
    if (!card) return { trovato: true, ultime: false };
    const cs = getComputedStyle(card); const cr = card.getBoundingClientRect();
    const spans = [...card.querySelectorAll('span')].filter(s => /^\d+ª$/.test((s.textContent || '').trim()));
    const badges = [...card.querySelectorAll('span')].filter(s => /^[VNP]$/.test((s.textContent || '').trim()));
    const sp = spans[0] || null; const last = badges[badges.length - 1] || null; const first = badges[0] || null;
    const r = sp ? sp.getBoundingClientRect() : null;
    const rb = last ? last.getBoundingClientRect() : null;
    const row = sp ? sp.parentElement.getBoundingClientRect() : null;
    return {
      trovato: true, ultime: true, cardLarghezza: +cr.width.toFixed(1), padDx: parseFloat(cs.paddingRight), bordoDx: parseFloat(cs.borderRightWidth),
      badgeN: badges.length, primoBadge: first ? first.textContent : null,
      primo1ª: sp ? sp.textContent : null,
      rigaDestra: row ? +row.right.toFixed(1) : null,
      primoDestraCardPx: r ? +(cr.right - r.right).toFixed(1) : null,
      primoDaPaddingPx: r ? +((cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth)) - r.right).toFixed(1) : null,
      ultimoBadgeDaPrimoPx: (rb && r) ? +(r.left - rb.right).toFixed(1) : null,
      testoRiga: (sp && sp.parentElement) ? sp.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 80) : null,
      scrollRiga: sp && sp.parentElement ? sp.parentElement.scrollWidth - sp.parentElement.clientWidth : null,
      cardX: r ? +r.right.toFixed(1) : null,
      viewport: innerWidth,
    };
  });
  await page.screenshot({ path: path.join(OUT, `${w}-C01-home.png`), fullPage: false });
  const cardEl = await page.evaluateHandle(() => { const lab = [...document.querySelectorAll('div')].find(d => d.textContent === 'Prossima partita' && d.children.length === 0); let c = lab; while (c && !/Ultime/.test(c.innerText || '')) c = c.parentElement; return c; });
  try { const el = cardEl.asElement(); if (el) await el.screenshot({ path: path.join(OUT, `${w}-C02-prossima-partita.png`) }); } catch (e) {}
  report.home[w] = Object.assign(m, { scrollOrizzontale: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), errori: errs });
  await ctx.close();
}

for (const w of [412, 360]) {
  await creazione(w);
  await salvataggio(w, 'prova', SAVE, SAVE.player.stats);
  await salvataggio(w, 'enfant174', SAVE174, SAVE174.player.stats);
  await home(w);
}
await b.close(); srv.close();
console.log(JSON.stringify(report, null, 1));
