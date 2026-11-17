#!/usr/bin/env node
/* [giro 235 · PO-457/458] SONDA (e libreria del guardiano coerenza-235). Gioco vero (?cpmtest=1), carriera di prova del giro 195
   (fixtures/save-c177-s5w20.json, via apri() di misura-234), a 375 (tocco) e 1366 (mouse). Misura, scheda per scheda:
     T  tasti principali: ogni pulsante visibile con fondo PIENO e «forte» (chiaro, oppure colorato: non i grigi scuri di carta/tasto/
        traccia), fuori dalle barre di menu, dalle linguette e dalle fisarmoniche. Per ognuno la firma: fondo · inchiostro · carattere
        TV (Barlow) · maiuscolo · e se sta dentro un riquadro nel colore del club (data-club106). Si censiscono le 8 schede e le due
        finestre della settimana e della partita (apriSettimana / apriPartita).
     H  testata: per ogni scheda il primo titolo (h1/h2/role heading) e la sua quota rispetto al primo riquadro del contenuto.
     P  Profilo: quante fisarmoniche (data-cpm-fis) e quanti gruppi (data-gruppo235) ci sono; i titoli; le parole inglesi nei titoli.
     C  contratto: in quali schede si legge il contratto per intero (Stipendio + Durata/Scadenza nello stesso riquadro) e in quali c'e'
        un rimando all'Agente (data-rimando235).
     M  menu: firma delle voci della barra fuori carriera (Home) e dentro (carriera): icona sopra la parola? corpo, maiuscolo, altezza.
     F  fiducia e popolarita': forma in Home e in Club (anello conico · barra · gradini).
     G  testo grande: gradini offerti in Opzioni e corpo minimo misurato per ciascuno.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node misura-235.mjs [CPM_FOTO=<cartella>] [CPM_FLAG=__CPM_NO_G235] [CPM_LARG=375,1366]
   Stampa JSON. Non giudica: il giudizio sta in coerenza-235.mjs. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, vai, opzioni, chiudiOpzioni } from './misura-234.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
export const SCHEDE = ['dashboard', 'standings', 'calendar', 'coppe', 'club', 'profile', 'agente', 'ufficio'];

/* T: censimento dei tasti pieni e forti nella pagina (o dentro un contenitore) */
export function CENSO_TASTI(sel) {
  const rgb = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(x => parseFloat(x)); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
  const hsl = ({ r, g, b }) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; const s = mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn)); return { s, l }; };
  const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
  const root = sel ? document.querySelector(sel) : document.body; if (!root) return [];
  const out = [];
  for (const el of root.querySelectorAll('button,[role=button]')) {
    const r = el.getBoundingClientRect(); if (r.width < 60 || r.height < 30) continue;
    const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity < 0.3) continue;
    if (el.closest('.cpm-nav-bar,[role=tablist],[data-cpm-fis],[data-cpm=tabs-v2],header')) continue;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
    const c = rgb(st.backgroundColor); if (!c || c.a < 0.9) continue;
    const { s, l } = hsl(c);
    const lab0 = el.querySelector('span,div') || el; const f0 = getComputedStyle(lab0);
    const tvUp = /Barlow Condensed/.test(f0.fontFamily + st.fontFamily) && (f0.textTransform === 'uppercase' || st.textTransform === 'uppercase') && r.height >= 44;
    const forte = l > 0.6 || (s > 0.3 && l > 0.14) || tvUp; if (!forte) continue;
    const testo = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50); if (!testo) continue;
    const lab = el.querySelector('span,div') && getComputedStyle(el.querySelector('span,div')).fontFamily ? el.querySelector('span,div') : el;
    const fst = getComputedStyle(lab.textContent.trim() ? lab : el);
    const tv = /Barlow Condensed/.test(fst.fontFamily) || /Barlow Condensed/.test(st.fontFamily);
    const up = fst.textTransform === 'uppercase' || st.textTransform === 'uppercase';
    const ink = rgb(fst.color) || rgb(st.color);
    const suClub = !!el.closest('[data-club106]');
    out.push({ testo, fondo: hex(c), ink: ink ? hex(ink) : '?', tv, up, peso: +fst.fontWeight || +st.fontWeight, suClub });
  }
  return out;
}
/* H: il primo titolo della scheda e la sua quota rispetto al primo riquadro del contenuto */
export function TESTATA() {
  const main = document.querySelector('[data-cpm=contenuto235]') || document.querySelector('main') || document.body;
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const tit = [...main.querySelectorAll('h1,h2,[role=heading]')].filter(vis).filter(el => !el.closest('header,.cpm-nav-bar,[role=dialog],.cpm-sr,[data-gruppo235],[data-sezione235]') && !el.classList.contains('cpm-sr') && el.getBoundingClientRect().height > 4);
  const t = tit[0]; const tr = t ? t.getBoundingClientRect() : null;
  const box = [...main.querySelectorAll('section,[data-cpm-fis],div[style*="border-radius"]')].filter(vis).filter(el => el.getBoundingClientRect().height > 40 && !(t && (el.contains(t) || t.contains(el))));
  const primo = box.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
  const occ = t ? (t.parentElement && t.parentElement.querySelector('span') ? t.parentElement.querySelector('span').textContent.trim() : '') : '';
  return { titolo: t ? t.textContent.trim().slice(0, 40) : null, occhiello: occ.slice(0, 40), cpm: t ? ((t.closest('[data-cpm]') || {}).getAttribute ? t.closest('[data-cpm]').getAttribute('data-cpm') : null) : null,
    y: tr ? Math.round(tr.top + scrollY) : null, yPrimo: primo ? Math.round(primo.getBoundingClientRect().top + scrollY) : null, sopra: !!(tr && primo && tr.top <= primo.getBoundingClientRect().top + 2) };
}
/* P: il Profilo */
export function PROFILO() {
  const fis = [...document.querySelectorAll('[data-cpm-fis]')].filter(el => el.getBoundingClientRect().height > 0);
  const gruppi = [...document.querySelectorAll('[data-gruppo235]')].filter(el => el.getBoundingClientRect().height > 0);
  const titoli = fis.map(f => { const b = f.querySelector('button,[role=heading]'); return b ? b.innerText.replace(/\s+/g, ' ').replace(/[›]/g, '').trim() : ''; });
  const tg = gruppi.map(g => g.getAttribute('data-gruppo235'));
  const sezioni = [...document.querySelectorAll('[data-sezione235]')].filter(el => el.getBoundingClientRect().height > 0).map(s => s.getAttribute('data-sezione235'));
  const tutto = [...titoli, ...tg, ...sezioni].join(' | ');
  const ING = /\b(Milestones?|Achievements?|Timeline|Status|MVP|Gallery|Match|Record Book|Awards?|Stats?|Challenge)\b/g;
  return { fisarmoniche: fis.length, gruppi: gruppi.length, titoliGruppi: tg, titoli, sezioni, inglesi: [...new Set(tutto.match(ING) || [])] };
}
/* C: il contratto per intero e il rimando */
export function CONTRATTO() {
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const blocchi = [...document.querySelectorAll('div,section')].filter(vis).filter(el => { const t = el.innerText || ''; return /stipendio/i.test(t) && /(scadenza|scade|durata)/i.test(t) && t.length < 900; });
  const minimi = blocchi.filter(b => !blocchi.some(o => o !== b && b.contains(o)));
  const rimando = [...document.querySelectorAll('[data-rimando235]')].filter(vis).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 80));
  return { pieno: minimi.length, esempio: minimi[0] ? minimi[0].innerText.replace(/\s+/g, ' ').slice(0, 100) : null, rimando };
}
/* M: la barra del menu */
export function MENU() {
  const bar = document.querySelector('.cpm-nav-bar .cpm-nav-tabs'); if (!bar) return null;
  return [...bar.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => {
    const parti = [...b.children].filter(c => c.textContent.trim()); const ult = parti[parti.length - 1] || b; const s = getComputedStyle(ult);
    return { testo: b.innerText.replace(/\s+/g, ' ').trim(), righe: parti.length, corpo: parseFloat(s.fontSize), maiuscolo: s.textTransform === 'uppercase', peso: +s.fontWeight, alt: Math.round(b.getBoundingClientRect().height), minAlt: getComputedStyle(b).minHeight, famiglia: s.fontFamily.split(',')[0], attiva: b.getAttribute('aria-current') || null };
  });
}
/* F: forma di fiducia e popolarita' nella vista corrente */
export function FORMA() {
  const out = {};
  for (const nome of ['Fiducia del mister', 'Popolarit']) {
    const et = [...document.querySelectorAll('span,div')].filter(e => e.children.length === 0 && e.textContent.trim().startsWith(nome) && e.getBoundingClientRect().height > 0)[0];
    if (!et) { out[nome] = null; continue; }
    let box = et; for (let i = 0; i < 4 && box.parentElement; i++) { box = box.parentElement; if (box.getBoundingClientRect().height > 40) break; }
    const conico = [...box.querySelectorAll('*')].some(e => /conic-gradient/.test(getComputedStyle(e).backgroundImage));
    const gradini = et.closest('[data-gradini235]') || box.querySelector('[data-gradini235]');
    const barra = [...box.querySelectorAll('*')].some(e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.height <= 7 && r.width > 60; });
    out[nome] = gradini ? 'gradini' : conico ? 'anello' : barra ? 'barra' : 'altro';
  }
  return out;
}

export async function misuraTutto(b, port, w, { flags = [], foto = null, ls = {} } = {}) {
  const a = await apri(b, port, w, { flags: [...flags, '__CPM_FIS_APERTE'], ls, h: w < 900 ? 667 : 800 });
  const R = { w, schede: {}, finestre: {} };
  try {
    R.club = await a.page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return p.club ? { n: p.club.n, c: p.club.c, c2: p.club.c2 } : null; });
    for (const t of SCHEDE) {
      await vai(a.page, t, 1100);
      const s = { tasti: await a.page.evaluate(CENSO_TASTI, null), testata: await a.page.evaluate(TESTATA), contratto: await a.page.evaluate(CONTRATTO) };
      if (t === 'profile') s.profilo = await a.page.evaluate(PROFILO);
      if (t === 'dashboard' || t === 'club') s.forma = await a.page.evaluate(FORMA);
      if (t === 'dashboard') s.menu = await a.page.evaluate(MENU);
      R.schede[t] = s;
      if (foto) { await a.page.evaluate(() => scrollTo(0, 0)); await a.page.screenshot({ path: path.join(foto, `${w}-${t}.png`) }); }
    }
    for (const k of ['apriSettimana', 'apriPartita']) {
      await vai(a.page, 'dashboard', 600);
      const e = await a.page.evaluate(k => { try { return String(window.__CPM_CAREER[k]()); } catch (x) { return 'errore ' + x.message; } }, k); await sleep(1200);
      R.finestre[k] = { esito: e.slice(0, 30), tasti: await a.page.evaluate(CENSO_TASTI, '[role=dialog]') };
      if (foto) await a.page.screenshot({ path: path.join(foto, `${w}-${k}.png`) });
      await a.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} try { window.__CPM_CAREER.chiudi163(); } catch (e) {} }); await a.page.keyboard.press('Escape').catch(() => {}); await sleep(600);
    }
    /* G: le scelte di Opzioni › Lettura */
    await vai(a.page, 'dashboard', 600);
    const o = await opzioni(a.page, a.cdp);
    R.lettura = await a.page.evaluate(() => { const c = document.querySelector('[data-cpm=lettura234]'); if (!c) return null;
      const g = c.querySelector('[role=radiogroup]'); const sw = [...c.querySelectorAll('[role=switch]')].map(x => x.getAttribute('aria-label'));
      return { gruppo: g ? g.getAttribute('aria-label') : null, scelte: g ? [...g.querySelectorAll('[role=radio]')].map(x => ({ t: x.innerText.trim(), on: x.getAttribute('aria-checked') })) : [], interruttori: sw }; });
    if (foto && o.aperta) await a.page.screenshot({ path: path.join(foto, `${w}-opzioni.png`) });
    if (o.aperta) await chiudiOpzioni(a.page);
    R.errori = a.errs.slice(0, 3);
  } finally { await a.ctx.close(); }
  if (foto) { /* il Profilo per intero come lo vede il giocatore (gruppi/fisarmoniche nello stato di partenza) */
    const q = await apri(b, port, w, { flags, ls, h: w < 900 ? 667 : 800 });
    try { await vai(q.page, 'profile', 1200); await q.page.screenshot({ path: path.join(foto, `${w}-profile-intero.png`), fullPage: true }); } finally { await q.ctx.close(); } }
  /* fuori carriera: la barra del menu della Home */
  const h = await apri(b, port, w, { flags, ls, carriera: false, h: w < 900 ? 667 : 800 });
  try { await sleep(800); R.menuFuori = await h.page.evaluate(MENU); R.tastiFuori = await h.page.evaluate(CENSO_TASTI, null); if (foto) await h.page.screenshot({ path: path.join(foto, `${w}-menu-fuori.png`) }); }
  finally { await h.ctx.close(); }
  return R;
}
/* G: corpo minimo della pagina per un valore di cpm-testo-grande */
export async function corpo(b, port, w, val, flags = []) {
  const a = await apri(b, port, w, { flags, ls: val == null ? {} : { 'cpm-testo-grande': val } });
  try { await vai(a.page, 'standings', 900);
    return await a.page.evaluate(() => { const fs = [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.getBoundingClientRect().height > 0).map(e => parseFloat(getComputedStyle(e).fontSize)); fs.sort((x, y) => x - y); return { min: fs[0], mediana: fs[Math.floor(fs.length / 2)] }; });
  } finally { await a.ctx.close(); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const foto = process.env.CPM_FOTO || null; if (foto) fs.mkdirSync(foto, { recursive: true });
  const flags = process.env.CPM_FLAG ? process.env.CPM_FLAG.split(',') : [];
  const larg = (process.env.CPM_LARG || '375,1366').split(',').map(Number);
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const out = {};
  try {
    for (const w of larg) out[w] = await misuraTutto(b, port, w, { flags, foto });
    out.corpo = {}; for (const v of [null, '15', '1', '30']) out.corpo[String(v)] = await corpo(b, port, 375, v, flags);
  } finally { await b.close(); srv.close(); }
  console.log(JSON.stringify(out, null, 1));
}
