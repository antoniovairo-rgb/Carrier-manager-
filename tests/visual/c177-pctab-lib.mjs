/* [collaudo PO-292 · 7.999.177] libreria comune dei collaudi PC e tablet. NON modifica il gioco. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
if (!process.env.CPM_CHROME) {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  try { for (const x of fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().reverse()) { const p = path.join(base, x, 'chrome-linux', 'chrome'); if (fs.existsSync(p)) { process.env.CPM_CHROME = p; break; } } } catch (_e) {}
}
export { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
export const FOTO = path.resolve(here, '..', '..', 'docs', 'collaudi', 'foto-pc-tablet-177');
export const OUT = path.resolve(here, '..', '..', 'docs', 'collaudi', 'dati-pc-tablet-177');
export const SHOTS = process.env.C177_SHOTS || path.join(os.tmpdir(), 'c177-pctab-foto');
fs.mkdirSync(FOTO, { recursive: true }); fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
export const FORMATI = {
  pc1366: { nome: 'PC 1366x768', viewport: { width: 1366, height: 768 }, touch: false },
  pc1920: { nome: 'PC 1920x1080', viewport: { width: 1920, height: 1080 }, touch: false },
  tabV: { nome: 'Tablet 768x1024 verticale', viewport: { width: 768, height: 1024 }, touch: true },
  tabO: { nome: 'Tablet 1024x768 orizzontale', viewport: { width: 1024, height: 768 }, touch: true },
};
export function formatiScelti() { const s = (process.env.C177_FMT || 'pc1366,pc1920,tabV,tabO').split(','); return s.map(k => [k, FORMATI[k]]); }
export async function nuovoContesto(b, f, init) {
  const opt = { viewport: f.viewport, deviceScaleFactor: 1, serviceWorkers: 'block' }; /* il SW del gioco farebbe uscire le richieste CDN dal controllo delle rotte: nel banco senza rete la ricarica resterebbe bianca */
  if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/BABEL/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  page.__errs = errs;
  if (init) await page.addInitScript(init.fn, init.arg);
  return { ctx, page, errs };
}
/* azione "premi" adatta al formato: tocco su tablet, click su PC */
export async function premi(page, f, loc, timeout = 6000) {
  if (f.touch) await loc.tap({ timeout }); else await loc.click({ timeout });
}
export async function premiTesto(page, f, rx, timeout = 8000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const h = await page.evaluateHandle(s => { const r = new RegExp(s, 'i'); const els = [...document.querySelectorAll('button,[role=button],[data-cpm],a,summary,[aria-expanded]')]; return els.find(b => { const rc = b.getBoundingClientRect(); return rc.width > 0 && rc.height > 0 && r.test((b.textContent || '').trim()); }) || null; }, rx);
    const el = h.asElement();
    if (el) { try { await el.scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {}); if (f.touch) await el.tap({ timeout: 3000 }); else await el.click({ timeout: 3000 }); return true; } catch (_e) { try { await el.evaluate(b => b.click()); return 'js'; } catch (_e2) {} } }
    await sleep(250);
  }
  return false;
}
/* Misure di layout della schermata attuale. */
export async function misure(page, f) {
  return page.evaluate(({ touch }) => {
    const W = document.documentElement.clientWidth, H = window.innerHeight;
    const de = document.documentElement, bd = document.body;
    const res = { W, H, scrollW: Math.max(de.scrollWidth, bd.scrollWidth), scrollH: Math.max(de.scrollHeight, bd.scrollHeight), hOverflow: 0, fuori: [], piccoli: [], tocco: [], testoMin: 99, testoMax: 0, bianca: false, canvas: [] };
    res.hOverflow = res.scrollW - W;
    const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const clipped = e => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(cs.overflowX)) return true; } return false; };
    const sel = e => (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (e.dataset && e.dataset.cpm ? '[' + e.dataset.cpm + ']' : '')).slice(0, 70);
    const all = [...document.body.querySelectorAll('*')];
    for (const e of all) {
      if (!vis(e)) continue; const r = e.getBoundingClientRect();
      if (r.width > 4 && (r.right > W + 2 || r.left < -2) && !clipped(e) && getComputedStyle(e).position !== 'fixed') res.fuori.push({ s: sel(e), l: Math.round(r.left), r: Math.round(r.right), t: (e.textContent || '').trim().slice(0, 30) });
      const _int = x => x.matches('button,[role=button],a[href],input,select,textarea,summary');
      const _annidato = (() => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) if (_int(p) || getComputedStyle(p).cursor === 'pointer') return true; return false; })();
      if (!_annidato && (e.matches('button,[role=button],a[href],input,select,textarea,summary') || getComputedStyle(e).cursor === 'pointer')) {
        if (e.tagName === 'LABEL' || e.tagName === 'DIV' && !e.matches('[role=button],[data-cpm]') && !e.onclick && e.children.length > 6) continue;
        const inview = r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
        if (inview && (r.width < 40 || r.height < 40) && (e.textContent || e.matches('input')).length !== 0) res.tocco.push({ s: sel(e), w: Math.round(r.width), h: Math.round(r.height), t: (e.textContent || '').trim().slice(0, 24) });
      }
    }
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const seen = new Set();
    while ((n = tw.nextNode())) { const t = (n.nodeValue || '').trim(); if (!t) continue; const p = n.parentElement; if (!p || !vis(p) || p.closest('script,style,canvas')) continue; const fs = parseFloat(getComputedStyle(p).fontSize); const r = p.getBoundingClientRect(); if (r.bottom < 0 || r.top > H) continue;
      res.testoMin = Math.min(res.testoMin, fs); res.testoMax = Math.max(res.testoMax, fs);
      if (fs < 10 && !seen.has(p)) { seen.add(p); res.piccoli.push({ s: sel(p), fs, t: t.slice(0, 28) }); } }
    for (const c of document.querySelectorAll('canvas')) { const r = c.getBoundingClientRect(); if (r.width < 2) continue; res.canvas.push({ w: Math.round(r.width), h: Math.round(r.height), iw: c.width, ih: c.height, ratioCss: +(r.width / r.height).toFixed(3), ratioBuf: +(c.width / c.height).toFixed(3), l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }); }
    res.bianca = (document.body.innerText || '').trim().length < 5 && !res.canvas.length;
    res.fuori = res.fuori.slice(0, 8); res.piccoli = res.piccoli.slice(0, 8); res.tocco = res.tocco.slice(0, 12);
    return res;
  }, { touch: f.touch });
}
export const log = [];
export async function scatta(page, f, sigla, nome, nota) {
  const m = await misure(page, f);
  const file = `${sigla}-${nome}.png`;
  const keep = !!process.env.C177_FOTO_ALL;
  await page.screenshot({ path: path.join(SHOTS, file) }).catch(() => {});
  log.push({ fmt: sigla, nome, nota: nota || '', m, file });
  const flag = [m.hOverflow > 2 ? `H-OVF ${m.hOverflow}` : '', m.fuori.length ? `fuori ${m.fuori.length}` : '', m.piccoli.length ? `piccoli ${m.piccoli.length}(min ${m.testoMin})` : '', f.touch && m.tocco.length ? `tocco<40 ${m.tocco.length}` : '', m.bianca ? 'BIANCA' : ''].filter(Boolean).join(' · ');
  console.log(`[${sigla}] ${nome}: ${flag || 'ok'}`);
  return m;
}
export function salvaLog(nome) { fs.writeFileSync(path.join(OUT, nome + '.json'), JSON.stringify(log, null, 1)); }

/* ---------- pilota: gioca una partita con INPUT REALI (mouse+tastiera su PC, tocco su tablet) ---------- */
const HEAD_BTN = /^(⏸|▶|\d([,.]\d)?×|⚠️|Statistiche|Pagelle|▴|▾)/;
export async function bottoniVisibili(page) {
  return page.evaluate(() => [...document.querySelectorAll('button,[role=button]')].map(b => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { t: (b.textContent || '').trim().slice(0, 60), x: r.left, y: r.top, w: r.width, h: r.height, vis: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && cs.visibility !== 'hidden' && +cs.opacity > 0.1 && cs.display !== 'none' }; }).filter(b => b.vis));
}
export async function tocca(page, f, x, y) { if (f.touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); }
export async function testoPagina(page, n = 600) { return page.evaluate(n => document.body.innerText.replace(/\n+/g, ' | ').slice(0, n), n); }
export async function fase(page) { return page.evaluate(() => (window.__CPM_PHASE ? window.__CPM_PHASE() : null)).catch(() => null); }
/* congela il frame (dt=0) mentre si fotografa/misura: scattare in WebGL software dura secondi e la partita non deve scappare */
export async function fotoFerma(page, f, sigla, nome, nota) {
  await page.evaluate(() => { window.__CPM_FROZEN = true; }).catch(() => {}); await sleep(150);
  const m = await scatta(page, f, sigla, nome, nota);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }).catch(() => {});
  return m;
}
/* Gioca finche' until(ph) non e' vero. */
export async function pilota(page, f, sigla, tag, { maxMs = 900000, until = null, hlFoto = 4, onTick = null, tastiera = true, velocita = true } = {}) {
  const t0 = Date.now(); let last = null, hlN = 0; const visti = new Set(); const hlInfo = []; let velOk = false; let cur = null;
  const info = { fasi: [], hl: hlInfo, durataMs: 0, fineFase: null, velocita: null };
  const sec = () => Math.round((Date.now() - t0) / 1000);
  let fermoDa = Date.now(), fermoPh = null, sblocchi = 0; info.blocchi = [];
  while (Date.now() - t0 < maxMs) {
    const ph = await fase(page);
    if (until && await until(ph)) break;
    if (ph !== fermoPh) { fermoPh = ph; fermoDa = Date.now(); }
    else if (ph && ph !== 'playing' && Date.now() - fermoDa > (/walkout|ceremony|formations|matchday|ended/.test(ph) ? 90000 : 25000)) {
      /* WATCHDOG: la stessa fase da oltre 25 s (fuori da 'playing'): lo si registra con prove e si prova a sbloccare */
      const bb = (await bottoniVisibili(page)).map(b => `${b.t.slice(0, 22)}@${Math.round(b.w)}x${Math.round(b.h)}`);
      const fotoNome = `${tag}-BLOCCO${sblocchi + 1}-${ph}`; await scatta(page, f, sigla, fotoNome);
      info.blocchi.push({ t: sec(), ph, bottoni: bb, testo: await testoPagina(page, 300), foto: `${sigla}-${fotoNome}.png`, hl: hlN });
      console.log('  !! BLOCCO', ph, 'da 25 s a', sec(), 's; bottoni:', bb.join(' / ').slice(0, 300));
      sblocchi++; fermoDa = Date.now();
      if (sblocchi > 6) { info.abbandonato = true; break; }
      await page.keyboard.press('Enter'); await sleep(300); await page.keyboard.press('Space'); await sleep(300);
      const opt = (await bottoniVisibili(page)).filter(b => !HEAD_BTN.test(b.t))[0]; if (opt) await tocca(page, f, opt.x + opt.w / 2, opt.y + opt.h / 2);
      continue;
    }
    if (ph !== last) { info.fasi.push({ ph, t: sec() }); last = ph; if (ph && !/^hl_/.test(ph) && !visti.has(ph)) { visti.add(ph); await sleep(450); await fotoFerma(page, f, sigla, `${tag}-${ph}`); continue; } }
    const bt = await bottoniVisibili(page);
    const az = bt.filter(b => !HEAD_BTN.test(b.t));
    if (ph === 'playing' && velocita && !velOk) {
      velOk = true; const rx = /^\d([,.]\d)?×$/; const v0 = bt.find(b => rx.test(b.t));
      if (v0) { info.velocita = { w: Math.round(v0.w), h: Math.round(v0.h), t0: v0.t }; for (let i = 0; i < 3; i++) { const bb = (await bottoniVisibili(page)).find(b => rx.test(b.t)); if (!bb) break; await tocca(page, f, bb.x + bb.w / 2, bb.y + bb.h / 2); await sleep(300); const nt = (await bottoniVisibili(page)).find(b => rx.test(b.t)); if (nt) info.velocita['dopo' + i] = nt.t; if (nt && /^2×$/.test(nt.t)) break; } }
    }
    if (ph === 'hl_intro') {
      if (!cur || cur.chiuso) { cur = { n: ++hlN, t: sec() }; hlInfo.push(cur); if (hlN <= hlFoto) await fotoFerma(page, f, sigla, `${tag}-hl${hlN}-intro`); }
      if (f.touch) await tocca(page, f, f.viewport.width * 0.3, f.viewport.height * 0.35); else if (tastiera) await page.keyboard.press('Space'); else await tocca(page, f, 300, 300); cur.introVia = f.touch ? 'tocco' : 'Spazio'; await sleep(700); }
    else if (ph === 'hl_move') {
      if (!cur) { cur = { n: ++hlN, t: sec() }; hlInfo.push(cur); }
      if (!cur.move) { cur.move = az.map(b => b.t.slice(0, 20) + '@' + Math.round(b.w) + 'x' + Math.round(b.h)); if (hlN <= hlFoto) await fotoFerma(page, f, sigla, `${tag}-hl${hlN}-move`); continue; }
      const fr = az.find(b => /^▶/.test(b.t)); if (fr && !cur.stepped) { cur.stepped = 1; await tocca(page, f, fr.x + fr.w / 2, fr.y + fr.h / 2); await sleep(800); if (hlN <= hlFoto) await fotoFerma(page, f, sigla, `${tag}-hl${hlN}-move2`); continue; }
      const ok = az.find(b => /Pronto/i.test(b.t)); if (ok) { if (f.touch || !tastiera) await tocca(page, f, ok.x + ok.w / 2, ok.y + ok.h / 2); else await page.keyboard.press('0'); cur.prontoVia = f.touch ? 'tocco' : 'tasto 0'; } await sleep(700); }
    else if (ph === 'hl_choose') {
      if (!cur || cur.chiuso) { cur = { n: ++hlN, t: sec() }; hlInfo.push(cur); }
      let opts = az.filter(b => /^\d/.test(b.t)); if (!opts.length) opts = az.filter(b => b.w > 250 && b.h > 30 && b.h < 120);
      if (!cur.choose) { cur.choose = opts.map(b => b.t.slice(0, 26) + '@' + Math.round(b.w) + 'x' + Math.round(b.h)); if (hlN <= hlFoto) await fotoFerma(page, f, sigla, `${tag}-hl${hlN}-scelta`); continue; }
      if (!f.touch && tastiera && hlN === 3 && !cur.tabTest && opts.length > 1) { /* prova Tab+Invio: dove va il fuoco e cosa sceglie l'Invio */
        cur.tabTest = 1; const att0 = await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ':' + (a.textContent || '').trim().slice(0, 24) : null; });
        await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await sleep(200);
        const att = await page.evaluate(() => { const a = document.activeElement; if (!a) return null; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { tag: a.tagName, t: (a.textContent || '').trim().slice(0, 30), outline: cs.outlineStyle + ' ' + cs.outlineWidth, ombra: cs.boxShadow.slice(0, 40), vis: r.width > 0 && r.bottom > 0 && r.top < innerHeight }; });
        await fotoFerma(page, f, sigla, `${tag}-hl${hlN}-tab`); cur.tabEnter = { prima: att0, dopo2Tab: att, opzioni: opts.map(b => b.t.slice(0, 24)) };
        await page.keyboard.press('Enter'); await sleep(1500); cur.tabEnter.faseDopo = await fase(page); continue; }
      if (opts.length) { const k = (hlN - 1) % Math.min(3, opts.length); const o = opts[k]; const viaTasto = !f.touch && tastiera && hlN % 2 === 1; if (viaTasto) await page.keyboard.press(String(k + 1)); else await tocca(page, f, o.x + o.w / 2, o.y + o.h / 2); cur.sceltaVia = viaTasto ? 'tasto ' + (k + 1) : (f.touch ? 'tocco' : 'clic'); await sleep(1500);
        if (await fase(page) === 'hl_choose') { if (viaTasto) { cur.tastoInutile = (cur.tastoInutile || 0) + 1; info.tastoInutile = (info.tastoInutile || []).concat([{ hl: hlN, t: sec(), tasto: k + 1, opzioni: opts.map(b => b.t.slice(0, 20)) }]); await tocca(page, f, o.x + o.w / 2, o.y + o.h / 2); } else { cur.rifiuto = (cur.rifiuto || 0) + 1; } } } await sleep(700); }
    else if (ph === 'hl_result') {
      if (!cur) { cur = { n: ++hlN, t: sec() }; hlInfo.push(cur); }
      if (!cur.res) { cur.res = 1; await sleep(2200); cur.testo = await testoPagina(page, 260); cur.btn = (await bottoniVisibili(page)).filter(b => !HEAD_BTN.test(b.t)).map(b => b.t.slice(0, 20) + '@' + Math.round(b.w) + 'x' + Math.round(b.h)); if (hlN <= hlFoto) await fotoFerma(page, f, sigla, `${tag}-hl${hlN}-esito`); continue; }
      await sleep(600); const az2 = (await bottoniVisibili(page)).filter(b => !HEAD_BTN.test(b.t)); const c = az2.find(b => /continua|avanti|prosegui|^ok|tocca/i.test(b.t));
      if (c) { await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2); cur.contVia = 'pulsante ' + c.t.slice(0, 14); } else if (f.touch) { await tocca(page, f, f.viewport.width * 0.5, f.viewport.height * 0.8); cur.contVia = 'tocco'; } else { await page.keyboard.press('Enter'); cur.contVia = 'Invio'; }
      await sleep(900); if (await fase(page) !== 'hl_result') cur.chiuso = true; }
    else if (ph === 'playing') { await sleep(500); }
    else { /* matchday, formations, walkout, ceremony, ended, ...: avanti con Invio (PC) o tocco sul pulsante principale (tablet) */
      await sleep(900); if (onTick) { const r = await onTick(ph, az, bt); if (r === 'fatto') continue; }
      const PREF = { matchday: /formazioni/i, formations: /ingresso in campo/i, walkout: /salta ingresso/i, ceremony: /salta festeggiamenti/i }[ph];
      const c = PREF ? az.find(b => PREF.test(b.t)) : az.find(b => /continua|avanti|prosegui|inizia|entra|vai|chiudi|torna|fine/i.test(b.t));
      if (!f.touch && tastiera && /matchday|formations|ceremony|ended/.test(ph)) { await page.keyboard.press('Enter'); }
      else if (c) await tocca(page, f, c.x + c.w / 2, c.y + c.h / 2);
      else if (f.touch) await tocca(page, f, f.viewport.width / 2, f.viewport.height * 0.6); else await page.keyboard.press('Enter');
      await sleep(900); }
    await sleep(120);
  }
  info.durataMs = Date.now() - t0; info.fineFase = await fase(page); return info;
}
