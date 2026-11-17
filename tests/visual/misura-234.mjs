#!/usr/bin/env node
/* [giro 234 · PO-393/455/459] SONDA (e libreria del guardiano accessibilita-234). Misura, sul gioco vero (?cpmtest=1) con la
   carriera di prova del giro 195 (fixtures/save-c177-s5w20.json), a 360/375/412 con tocco e a 1366 senza:
     Z  zoom con due dita: contenuto del <meta viewport> e un pizzico vero (CDP Input.synthesizePinchGesture ×2) sulla carriera e
        in partita (provino, fase playing): scala di visualViewport dopo il gesto.
     G  testo grande: Classifica e Stagione con l'interruttore «Testo grande» (cpm-testo-grande=1, ×1,3 sui corpi del tema) oppure,
        se l'interruttore non c'e', con i corpi ×1,3 simulati (come il giro 195): colonna PT dentro il riquadro, testi tagliati,
        etichette delle sotto-schede tagliate, scorrimento orizzontale.
     A  cursori audio in Opzioni: lato minore dell'area di tocco (rettangolo ∪ ::before/::after assoluti).
     L  lettori di schermo (albero di accessibilita' di Chromium, CDP): titoli per scheda, finestra (role dialog) delle Opzioni e di
        un Modal, voce di menu attiva (aria-current/aria-selected), i 12 comandi audio delle Opzioni con nome e ruolo.
     V  versione in Opzioni; M manifest (web e TWA) con gli stessi colori e descrizione in italiano; P testo della pausa al tocco;
     C  Coppe: contrasto caso peggiore dei testi su sfumatura (misura G del giro 195); K Club: riquadro d'apertura (righe del nome,
        larghezza della colonna di testo).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node misura-234.mjs [CPM_FOTO=<cartella>] [CPM_FLAG=__CPM_NO_G234] [CPM_LARG=360,375,412,1366]
   Stampa JSON. Non giudica: il giudizio sta in accessibilita-234.mjs. */
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep, matchPhase } from './lib/harness.mjs';
import { MISURA } from './giro195-schermate.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const DUMP = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));

export async function apri(b, port, w, { flags = [], ls = {}, h = 800, touch = w < 900, query = '?cpmtest=1', carriera = true } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await page.addInitScript(([d, fl, extra]) => { window.__CPM_GLB = false; for (const f of fl) window[f] = 1;
    try { if (d) for (const k in d) localStorage.setItem(k, d[k]); for (const k in extra) localStorage.setItem(k, extra[k]); } catch (e) {} }, [carriera ? DUMP : null, flags, ls]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  if (carriera) {
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
    await sleep(1500);
    await page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
    await sleep(500);
  }
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, cdp, errs };
}
export const vai = async (page, t, ms = 900) => { await page.evaluate(x => window.__CPM_CAREER.goTab(x), t); await sleep(ms); };

/* Z: meta + pizzico vero a due dita (CDP Input.dispatchTouchEvent: due punti che si allontanano di 160 px). Misurato sul banco:
   Input.synthesizePinchGesture con sorgente «touch» non ingrandisce mai in headless (scala 1 anche a zoom libero), le due dita si'
   (scala 5 a zoom libero, 1 con user-scalable=no o touch-action:pan-x pan-y). Dopo la misura si riporta la scala a 1 (due dita che
   si avvicinano). */
const dueDita = async (cdp, verso, x = 180, y = 300) => { const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([a, b], i) => ({ x: a, y: b, id: i })) });
  const p = k => verso > 0 ? [[x - 30 - k * 8, y], [x + 30 + k * 8, y]] : [[x - 110 + k * 8, y], [x + 110 - k * 8, y]];
  await T('touchStart', p(0)); for (let k = 1; k <= 10; k++) { await T('touchMove', p(k)); await sleep(30); } await T('touchEnd', []); await sleep(600); };
export async function zoom(page, cdp) {
  const meta = await page.evaluate(() => (document.querySelector('meta[name=viewport]') || {}).content || '');
  const ta = await page.evaluate(() => getComputedStyle(document.documentElement).touchAction);
  await dueDita(cdp, +1);
  const scala = await page.evaluate(() => window.visualViewport ? visualViewport.scale : 1);
  for (let i = 0; i < 4 && (await page.evaluate(() => visualViewport.scale)) > 1.01; i++) await dueDita(cdp, -1);
  return { meta, touchAction: ta, scala: +scala.toFixed(2), dopo: +(await page.evaluate(() => visualViewport.scale)).toFixed(2) };
}

/* G: la Classifica (righe, colonna PT) e le etichette delle sotto-schede di Stagione. simula=true: corpi ×k via script (giro 195). */
export async function classifica(page, { simula = 0 } = {}) {
  if (simula) await page.evaluate((k) => { document.querySelectorAll('body *').forEach(el => { if (el.__fs0 == null) el.__fs0 = parseFloat(getComputedStyle(el).fontSize); }); document.querySelectorAll('body *').forEach(el => { if (el.__fs0) el.style.fontSize = (el.__fs0 * k) + 'px'; }); }, simula);
  await sleep(300);
  const r = await page.evaluate(() => {
    const VW = innerWidth; const de = document.documentElement;
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0.5 && r.height > 0.5 && getComputedStyle(el).visibility !== 'hidden'; };
    const testo = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    /* la colonna PT: l'intestazione «PT» e, nella stessa colonna, le celle numeriche; il riquadro e' il primo antenato con bordo/sfondo
       che contiene l'intestazione */
    const pt = [...document.querySelectorAll('body *')].filter(el => vis(el) && testo(el) && /^\s*PT\s*$/i.test(el.textContent) && el.tagName === 'TH');
    let ptFuori = 0, ptCelle = 0, ptDettaglio = [];
    for (const h of pt) {
      let box = h.parentElement; while (box && box !== document.body) { const s = getComputedStyle(box); if ((s.borderTopWidth !== '0px' && s.borderStyle !== 'none') || (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor))) break; box = box.parentElement; }
      /* il bordo visibile: il piu' stretto fra il riquadro e gli antenati che tagliano (overflow non visibile) */
      let clipR = box.getBoundingClientRect().right; for (let e = h.parentElement; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (s.overflowX !== 'visible') clipR = Math.min(clipR, e.getBoundingClientRect().right); }
      const rb = { right: clipR }; const rh = h.getBoundingClientRect();
      /* celle sotto l'intestazione, centrate nella stessa colonna */
      const celle = [...box.querySelectorAll('*')].filter(el => vis(el) && testo(el) && /^\s*\d{1,3}\s*$/.test(el.textContent) && Math.abs((el.getBoundingClientRect().left + el.getBoundingClientRect().right) / 2 - (rh.left + rh.right) / 2) < rh.width + 12);
      for (const c of [h, ...celle]) { const rc = c.getBoundingClientRect(); ptCelle++; if (rc.right > rb.right + 0.5 || rc.right > VW + 0.5 || c.scrollWidth > c.clientWidth + 1) { ptFuori++; if (ptDettaglio.length < 4) ptDettaglio.push(`«${c.textContent.trim()}» ${Math.round(rc.right)}>${Math.round(Math.min(rb.right, VW))}`); } }
    }
    /* testi tagliati (overflow nascosto/puntini) e sovrapposizioni orizzontali fra testi della stessa riga di classifica */
    const tagliati = [];
    for (const el of document.querySelectorAll('body *')) { if (!vis(el) || !testo(el) || el.closest('.cpm-sr')) continue; const s = getComputedStyle(el);
      if ((s.overflowX === 'hidden' || s.overflow === 'hidden' || s.textOverflow === 'ellipsis' || s.overflow === 'clip') && el.scrollWidth > el.clientWidth + 1) tagliati.push(`${el.textContent.trim().slice(0, 24)} −${el.scrollWidth - el.clientWidth}`); }
    /* le sotto-schede di Stagione (Classifica / Calendario / Coppe …) e le voci della barra in basso */
    const etichette = [...document.querySelectorAll('[role=tab], .cpm-nav-tabs button, button')].filter(el => vis(el) && /^(Classifica|Calendario|Coppe|Statistiche|Storico|Albo|Marcatori|HOME|STAGIONE|CLUB|CARRIERA|UFFICIO|AGENTE|Home|Stagione|Club|Carriera|Ufficio|Agente)\b/.test((el.innerText || '').trim()));
    const etTagliate = etichette.filter(el => el.scrollWidth > el.clientWidth + 1 || [...el.querySelectorAll('*')].some(c => testo(c) && c.scrollWidth > c.clientWidth + 1)).map(el => (el.innerText || '').trim().slice(0, 20));
    return { pt: pt.length, ptCelle, ptFuori, ptDettaglio, tagliati: tagliati.length, tagliatiEs: tagliati.slice(0, 6), etichette: etichette.length, etTagliate, overflow: de.scrollWidth - de.clientWidth, corpoMin: Math.min(...[...document.querySelectorAll('body *')].filter(el => vis(el) && testo(el)).map(el => parseFloat(getComputedStyle(el).fontSize))) };
  });
  if (simula) await page.evaluate(() => document.querySelectorAll('body *').forEach(el => { if (el.__fs0 != null) el.style.fontSize = ''; }));
  return r;
}

/* Opzioni: apre dalla testata (tasto «Opzioni»), misura cursori/interruttori, nomi, finestra, versione */
export async function opzioni(page, cdp) {
  const aperta = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label') === 'Opzioni' || x.title === 'Impostazioni'); if (!b) return false; b.click(); return true; });
  if (!aperta) return { aperta: false };
  await sleep(900);
  const dom = await page.evaluate(() => {
    const area = el => { const r = el.getBoundingClientRect(); let l = r.left, t = r.top, ri = r.right, b = r.bottom;
      for (const ps of ['::before', '::after']) { try { const a = getComputedStyle(el, ps); if (a && a.content && a.content !== 'none' && a.position === 'absolute') { const n = v => parseFloat(v) || 0; l = Math.min(l, r.left + n(a.left)); t = Math.min(t, r.top + n(a.top)); ri = Math.max(ri, r.right - n(a.right)); b = Math.max(b, r.bottom - n(a.bottom)); } } catch (e) {} }
      return { w: Math.round(ri - l), h: Math.round(b - t) }; };
    const ranges = [...document.querySelectorAll('input[type=range]')].filter(el => el.getBoundingClientRect().width > 0);
    const cursori = ranges.map(el => ({ ...area(el), nome: el.getAttribute('aria-label') || '' }));
    const testo = document.body.innerText; const ver = (testo.match(/Versione\s+v?\s*(\d+\.\d+\.\d+)/i) || [])[1] || null;
    const pannello = [...document.querySelectorAll('[role=dialog]')].map(d => ({ nome: d.getAttribute('aria-label') || (d.getAttribute('aria-labelledby') && (document.getElementById(d.getAttribute('aria-labelledby')) || {}).textContent) || '', modale: d.getAttribute('aria-modal') }));
    return { cursori, versione: ver, finestre: pannello };
  });
  /* albero di accessibilita': i comandi della scheda Audio (slider, switch, checkbox, button) dentro le Opzioni */
  const ax = await cdp.send('Accessibility.getFullAXTree');
  const nodi = ax.nodes.filter(n => !n.ignored);
  const comandi = nodi.filter(n => ['slider', 'switch', 'checkbox'].includes(n.role && n.role.value)).map(n => ({ ruolo: n.role.value, nome: (n.name && n.name.value || '').trim() }));
  const bottoniSenzaNome = nodi.filter(n => n.role && n.role.value === 'button' && !((n.name && n.name.value || '').trim())).length;
  const dialoghi = nodi.filter(n => n.role && ['dialog', 'alertdialog'].includes(n.role.value)).map(n => (n.name && n.name.value) || '');
  return { aperta: true, ...dom, comandi, comandiConNome: comandi.filter(c => c.nome).length, bottoniSenzaNome, dialoghi };
}
export async function chiudiOpzioni(page) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label') === 'Chiudi'); if (b) b.click(); }); await sleep(500); }

/* L: titoli e voce attiva per scheda (albero vero) */
export async function lettore(page, cdp, schede) {
  const out = {};
  for (const t of schede) { await vai(page, t, 800);
    const ax = await cdp.send('Accessibility.getFullAXTree'); const nodi = ax.nodes.filter(n => !n.ignored);
    const titoli = nodi.filter(n => n.role && n.role.value === 'heading').map(n => (n.name && n.name.value || '').trim()).filter(Boolean);
    const attiva = await page.evaluate(() => [...document.querySelectorAll('[aria-current="page"],[aria-current="true"],[aria-selected="true"]')].filter(el => el.getBoundingClientRect().width > 0).map(el => (el.getAttribute('aria-label') || el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 20)));
    out[t] = { titoli, attiva };
  }
  return out;
}

/* un Modal qualsiasi del gioco: si apre la finestra della settimana se c'e', altrimenti un pop-up di prova via ModalPannello (Crediti) */
export async function finestra(page, cdp) {
  const nodi = async () => (await cdp.send('Accessibility.getFullAXTree')).nodes.filter(n => !n.ignored && n.role && ['dialog', 'alertdialog'].includes(n.role.value)).map(n => ({ nome: (n.name && n.name.value) || '', modale: (n.properties || []).some(p => p.name === 'modal' && p.value && p.value.value) }));
  /* la finestra «Rivedi la tua storia»/qualunque Modal: si usa l'aggancio di prova se esiste */
  const out = {};
  for (const k of ['apriSettimana', 'apriPartita']) {
    const ok = await page.evaluate((k) => { try { return String(window.__CPM_CAREER[k]()); } catch (e) { return 'errore ' + e.message; } }, k);
    await sleep(900); out[k] = { esito: ok.slice(0, 40), dialoghi: await nodi() };
    await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} try { window.__CPM_CAREER.chiudi163(); } catch (e) {} }); await page.keyboard.press('Escape').catch(() => {}); await sleep(500);
  }
  return out;
}

/* C: contrasto caso peggiore dei testi il cui fondo e' una sfumatura (stessa regola del giro 195: rapporto contro ogni colore
   opaco della sfumatura, si tiene il minimo) */
export function SFUM() {
  const cs = el => getComputedStyle(el);
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const pc = s => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const elenco = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || cs(el).visibility === 'hidden') continue;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const col = pc(cs(el).color); if (!col) continue;
    let e = el, grad = null, eb = null; while (e && e.nodeType === 1) { const b = cs(e); if (b.backgroundImage && b.backgroundImage.includes('gradient')) { grad = b.backgroundImage; break; } const bc = pc(b.backgroundColor); if (bc && bc[3] > 0.9) break; e = e.parentElement; }
    if (!grad) continue;
    const stops = [...grad.matchAll(/rgba?\([^)]+\)/g)].map(m => pc(m[0])).filter(c => c && c[3] > 0.9); if (!stops.length) continue;
    const mix = (c, s) => c[3] >= 1 ? c : [c[0] * c[3] + s[0] * (1 - c[3]), c[1] * c[3] + s[1] * (1 - c[3]), c[2] * c[3] + s[2] * (1 - c[3])];
    const rapporto = Math.min(...stops.map(s => cr(mix(col, s), s)));
    elenco.push({ testo: el.textContent.trim().slice(0, 30), rapporto: +rapporto.toFixed(2), corpo: parseFloat(cs(el).fontSize), peso: cs(el).fontWeight });
  }
  elenco.sort((a, b) => a.rapporto - b.rapporto);
  return { n: elenco.length, elenco };
}
/* C e K */
export async function coppeClub(page) {
  await vai(page, 'coppe'); const mC = { G: await page.evaluate(SFUM) };
  await vai(page, 'club');
  const k = await page.evaluate(() => {
    const el = [...document.querySelectorAll('body *')].find(e => /PRESTIGIO/i.test([...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('')));
    if (!el) return null;
    let card = el; for (let i = 0; i < 6 && card.parentElement; i++) { card = card.parentElement; if (card.getBoundingClientRect().width > innerWidth * 0.8) break; }
    const rc = card.getBoundingClientRect();
    /* la colonna di testo piu' stretta che contiene almeno 12 caratteri, nel riquadro */
    const testi = [...card.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length >= 12) && e.getBoundingClientRect().width > 0);
    const larg = testi.map(e => Math.round(e.getBoundingClientRect().width));
    const nome = [...card.querySelectorAll('span')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 3) && parseFloat(getComputedStyle(e).fontSize) >= 17)[0];
    const lh = nome ? parseFloat(getComputedStyle(nome).lineHeight) || parseFloat(getComputedStyle(nome).fontSize) * 1.2 : 0;
    return { card: Math.round(rc.width), colonnaMin: larg.length ? Math.min(...larg) : null, nomeRighe: nome ? Math.round(nome.getBoundingClientRect().height / lh) : null, nome: nome ? nome.textContent.trim().slice(0, 30) : null };
  });
  return { coppe: { sfum: mC.G.n, peggiori: mC.G.elenco.slice(0, 6) }, club: k };
}

/* P + Z in partita: provino (pagina pulita) fino a playing, poi pausa */
export async function partita(b, port, w, flags = [], foto = null) {
  const { ctx, page, cdp, errs } = await apri(b, port, w, { flags: ['__CPM_SKIP_INTRO', ...flags], carriera: false, h: 800 });
  try {
    const { openMatch } = await import('./lib/harness.mjs');
    await openMatch(page, port, { skipLoadAll: true });
    const t0 = Date.now(); while (Date.now() - t0 < 60000) { const f = await matchPhase(page).catch(() => null); if (f && f !== 'matchday' && f !== 'formations' && f !== 'walkout') break; await sleep(500); }
    const fase = await matchPhase(page).catch(() => null);
    const z = await zoom(page, cdp);
    /* pausa: il tasto ⏸ */
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /pausa/i.test(x.getAttribute('aria-label') || x.title || '') || (x.innerText || '').trim() === '⏸'); if (b) b.click(); else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true })); });
    await sleep(500);
    const pausa = await page.evaluate(() => { const t = document.body.innerText; const m = t.match(/[^\n]*per riprendere[^\n]*/i); return m ? m[0].trim() : null; });
    if (foto) await page.screenshot({ path: foto });
    return { fase, zoom: z, pausa, errori: errs.length };
  } finally { await ctx.close(); }
}

export function manifest() {
  const web = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  const twa = JSON.parse(fs.readFileSync(path.join(ROOT, 'twa', 'manifest-twa.webmanifest'), 'utf8'));
  const tj = JSON.parse(fs.readFileSync(path.join(ROOT, 'twa', 'twa-manifest.json'), 'utf8'));
  const head = fs.readFileSync(path.join(ROOT, 'src', '00-head.html'), 'utf8');
  const meta = (head.match(/<meta name="theme-color" content="([^"]+)"/) || [])[1];
  return { web: { tema: web.theme_color, fondo: web.background_color, descr: web.description }, twa: { tema: twa.theme_color, fondo: twa.background_color, descr: twa.description }, twaJson: { tema: tj.themeColor, fondo: tj.backgroundColor, nav: tj.navigationColor }, metaTema: meta };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const FOTO = process.env.CPM_FOTO || null; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
  const flags = (process.env.CPM_FLAG || '').split(',').filter(Boolean);
  const LARG = (process.env.CPM_LARG || '360,375,412,1366').split(',').map(Number);
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const R = { manifest: manifest(), larg: {} };
  try {
    for (const w of LARG) {
      const { ctx, page, cdp, errs } = await apri(b, port, w, { flags });
      const r = {};
      r.zoomCarriera = await zoom(page, cdp);
      await vai(page, 'standings'); r.classifica = await classifica(page);
      if (FOTO) await page.screenshot({ path: path.join(FOTO, `classifica-${w}.png`) });
      r.classifica13sim = await classifica(page, { simula: 1.3 });
      if (FOTO) { await page.evaluate((k) => { document.querySelectorAll('body *').forEach(el => { if (el.__fs0 == null) el.__fs0 = parseFloat(getComputedStyle(el).fontSize); el.style.fontSize = (el.__fs0 * k) + 'px'; }); }, 1.3); await sleep(300); await page.screenshot({ path: path.join(FOTO, `classifica-x13sim-${w}.png`) }); await page.evaluate(() => document.querySelectorAll('body *').forEach(el => { if (el.__fs0 != null) el.style.fontSize = ''; })); }
      r.lettore = await lettore(page, cdp, ['dashboard', 'standings', 'calendar', 'coppe', 'club', 'profile', 'agente', 'ufficio']);
      const cc = await coppeClub(page); r.coppe = cc.coppe; r.club = cc.club;
      if (FOTO) { await page.screenshot({ path: path.join(FOTO, `club-${w}.png`) }); await vai(page, 'coppe'); await page.screenshot({ path: path.join(FOTO, `coppe-${w}.png`) }); }
      await vai(page, 'dashboard');
      r.opzioni = await opzioni(page, cdp);
      if (FOTO) await page.screenshot({ path: path.join(FOTO, `opzioni-${w}.png`) });
      await chiudiOpzioni(page);
      r.finestra = await finestra(page, cdp);
      r.errori = errs.slice(0, 3);
      await ctx.close();
      /* testo grande vero (interruttore), se il gioco lo legge */
      const g = await apri(b, port, w, { flags, ls: { 'cpm-testo-grande': '1' } });
      await vai(g.page, 'standings'); r.classificaTG = await classifica(g.page);
      if (FOTO) await g.page.screenshot({ path: path.join(FOTO, `classifica-testogrande-${w}.png`) });
      await g.ctx.close();
      if (w < 900) r.partita = await partita(b, port, w, flags, FOTO ? path.join(FOTO, `pausa-${w}.png`) : null);
      R.larg[w] = r; console.error(w, JSON.stringify(r).slice(0, 400));
    }
  } finally { await b.close(); srv.close(); }
  console.log(JSON.stringify(R, null, 1));
}
