#!/usr/bin/env node
/* [giro 195 — collaudo usabilita'] SOLO MISURA, non guardiano, non tocca il gioco.
   Apre la carriera da professionista (fixtures/save-c177-s5w20.json) a 375x667 e 390x844, passa le schede
   e per ognuna scatta la pagina (a pezzi di schermo) e misura:
     T  bersagli di tocco: elementi con onClick React / button / a / input / select. Lato minore dell'area
        effettiva (rettangolo ∪ ::after assoluto). Soglie 48 (Android), 44, 32 px.
     V  vicinanza: coppie di bersagli non annidati con distanza < 8 px.
     C  testo tagliato: nodi con overflow nascosto e scrollWidth > clientWidth (puntini) o righe tagliate.
     F  barre fisse: quanti px di schermo occupano testata e fondo (position fixed/sticky).
     S  lunghezza: altezza dello scorritore / altezza dello schermo.
     G  contrasto su sfumatura, CASO PEGGIORE: testo il cui fondo e' un gradiente; rapporto contro ogni
        colore opaco del gradiente, si tiene il minimo (la griglia-mobile li esclude).
     A  lettori di schermo: bersagli senza nome accessibile, bersagli che non sono button/a e non hanno role,
        titoli (h1-h6/role=heading), regioni aria-live, immagini/svg senza testo alternativo.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node giro195-schermate.mjs
        [CPM_LARG=375x667,390x844] [CPM_SAVE=save-c177-s5w20.json] [CPM_OUT=cartella] [CPM_FOTO=0] */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const OUT = process.env.CPM_OUT || path.join(ROOT, 'docs', 'collaudo', 'giro195', 'schermate');
fs.mkdirSync(OUT, { recursive: true });
const SAVEF = process.env.CPM_SAVE || 'save-c177-s5w20.json';
const DUMP = JSON.parse(fs.readFileSync(new URL('./fixtures/' + SAVEF, import.meta.url)));
const LS = DUMP['cpm-v3'] ? DUMP : { 'cpm-v3': JSON.stringify(DUMP) };
const LARG = (process.env.CPM_LARG || '375x667,390x844').split(',').map(s => s.split('x').map(Number));
const FOTO = process.env.CPM_FOTO !== '0';
const SCHEDE = (process.env.CPM_SCHEDE || 'dashboard,standings,calendar,coppe,club,profile,nazionale,agente,ufficio').split(',');

export function MISURA() {
  const VW = window.innerWidth, VH = window.innerHeight;
  const cs = el => getComputedStyle(el);
  const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const s = cs(el); if (s.visibility === 'hidden' || s.display === 'none') return false; let o = 1, e = el; while (e && e.nodeType === 1) { o *= parseFloat(cs(e).opacity || '1'); e = e.parentElement; } return o > 0.1; };
  const rk = el => Object.keys(el).find(k => k.startsWith('__reactProps$'));
  const hasClick = el => { const k = rk(el); return !!(k && el[k] && typeof el[k].onClick === 'function'); };
  const txt = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const sel = el => { let s = el.tagName.toLowerCase(); const d = el.getAttribute('data-cpm'); if (d) s += `[data-cpm=${d}]`; return s; };
  /* velo: se c'e' un fixed a tutto schermo opaco, si misura solo quello */
  let radice = document.body;
  for (const el of document.querySelectorAll('body *')) { const s = cs(el); if (s.position === 'fixed') { const r = el.getBoundingClientRect(); if (r.width >= VW - 2 && r.height >= VH - 2 && vis(el) && parseInt(s.zIndex || '0') >= 10) radice = el; } }
  const tutti = [...radice.querySelectorAll('*')].filter(vis);
  /* T */
  const NAT = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);
  let bers = tutti.filter(el => (NAT.has(el.tagName) || hasClick(el) || el.getAttribute('role') === 'button') && !el.disabled);
  /* tiene solo il piu' interno quando un bersaglio contiene un solo altro bersaglio identico per area? no: si tengono tutti, ma si marca l'annidamento */
  const area = el => { const r = el.getBoundingClientRect(); let l = r.left, t = r.top, ri = r.right, b = r.bottom; try { const a = getComputedStyle(el, '::after'); if (a && a.content && a.content !== 'none' && a.position === 'absolute') { const n = v => parseFloat(v) || 0; if (n(a.left) < 0) l += n(a.left); if (n(a.top) < 0) t += n(a.top); if (n(a.right) < 0) ri -= n(a.right); if (n(a.bottom) < 0) b -= n(a.bottom); } } catch (e) {} return { l, t, r: ri, b, w: ri - l, h: b - t }; };
  const inFisso = el => { let e = el; while (e && e.nodeType === 1) { const p = cs(e).position; if (p === 'fixed' || p === 'sticky') return true; e = e.parentElement; } return false; };
  const B = bers.map(el => ({ el, a: area(el), fx: inFisso(el), nome: (el.getAttribute('aria-label') || el.getAttribute('title') || txt(el)), tag: sel(el) }));
  const piccoli = B.filter(x => Math.min(x.a.w, x.a.h) < 48).map(x => ({ tag: x.tag, w: Math.round(x.a.w), h: Math.round(x.a.h), nome: x.nome.slice(0, 40) }));
  const T = { n: B.length, sotto48: piccoli.length, sotto44: piccoli.filter(p => Math.min(p.w, p.h) < 44).length, sotto32: piccoli.filter(p => Math.min(p.w, p.h) < 32).length, elenco: piccoli.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).slice(0, 25) };
  /* V */
  const vicini = [];
  for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) { const p = B[i], q = B[j]; if (p.el.contains(q.el) || q.el.contains(p.el)) continue; if (p.fx !== q.fx) continue; const dx = Math.max(0, Math.max(p.a.l, q.a.l) - Math.min(p.a.r, q.a.r)), dy = Math.max(0, Math.max(p.a.t, q.a.t) - Math.min(p.a.b, q.a.b)); const d = Math.hypot(dx, dy); if (d < 8) vicini.push({ a: p.nome.slice(0, 28), b: q.nome.slice(0, 28), d: Math.round(d * 10) / 10 }); }
  /* C */
  const tagliati = [];
  for (const el of tutti) { if (!el.childNodes.length) continue; const s = cs(el); const haTesto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!haTesto) continue; if ((s.overflowX === 'hidden' || s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1) tagliati.push({ tipo: 'largo', tag: sel(el), testo: txt(el), mancano: el.scrollWidth - el.clientWidth }); else if ((s.overflowY === 'hidden' || s.overflow === 'hidden') && el.scrollHeight > el.clientHeight + 2 && s.webkitLineClamp && s.webkitLineClamp !== 'none') tagliati.push({ tipo: 'righe', tag: sel(el), testo: txt(el), mancano: el.scrollHeight - el.clientHeight }); }
  /* F */
  let alto = 0, basso = VH; const fissi = [];
  for (const el of tutti) { const s = cs(el); if (s.position !== 'fixed' && s.position !== 'sticky') continue; const r = el.getBoundingClientRect(); if (r.width < VW * 0.8 || r.height > VH * 0.5 || r.height < 8) continue; if (r.top <= 2) { alto = Math.max(alto, r.bottom); fissi.push({ dove: 'alto', h: Math.round(r.height), tag: sel(el) }); } else if (r.bottom >= VH - 2) { basso = Math.min(basso, r.top); fissi.push({ dove: 'basso', h: Math.round(r.height), tag: sel(el) }); } }
  const F = { alto: Math.round(alto), basso: Math.round(VH - basso), libero: Math.round(basso - alto), quotaLibera: Math.round((basso - alto) / VH * 100), fissi };
  /* S */
  let sc = document.scrollingElement, sh = sc.scrollHeight;
  for (const el of tutti) { const s = cs(el); if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.clientHeight >= VH * 0.5 && el.scrollHeight > sh) { sc = el; sh = el.scrollHeight; } }
  const S = { altezza: sh, schermi: Math.round(sh / VH * 100) / 100 };
  /* G */
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const pc = s => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const sfum = [];
  for (const el of tutti) { const haTesto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!haTesto) continue; const s = cs(el); const col = pc(s.color); if (!col) continue; let e = el, grad = null; while (e && e.nodeType === 1) { const b = cs(e); if (b.backgroundImage && b.backgroundImage.includes('gradient')) { grad = b.backgroundImage; break; } const bc = pc(b.backgroundColor); if (bc && bc[3] > 0.9) break; e = e.parentElement; } if (!grad) continue; const stops = [...grad.matchAll(/rgba?\([^)]+\)/g)].map(m => pc(m[0])).filter(c => c && c[3] > 0.9); if (!stops.length) continue; const fs = parseFloat(s.fontSize), grosso = fs >= 18 || (fs >= 14 && parseInt(s.fontWeight) >= 700); const soglia = grosso ? 3 : 4.5; const peggio = Math.min(...stops.map(c => cr(col, c))); if (peggio < soglia) sfum.push({ testo: txt(el).slice(0, 36), fs, rapporto: Math.round(peggio * 100) / 100, soglia, col: s.color }); }
  /* A */
  const senzaNome = B.filter(x => !x.nome.replace(/[\u{1F000}-\u{1FFFF}☀-➿️\s›‹×✕+\-]/gu, '').length).map(x => ({ tag: x.tag, w: Math.round(x.a.w), h: Math.round(x.a.h), grezzo: x.nome.slice(0, 12), aria: x.el.getAttribute('aria-label') }));
  const nonSemantici = B.filter(x => !NAT.has(x.el.tagName) && !x.el.getAttribute('role')).length;
  const nonFocus = B.filter(x => !NAT.has(x.el.tagName) && x.el.tabIndex < 0).length;
  const A = { bersagli: B.length, senzaNome: senzaNome.length, senzaNomeElenco: senzaNome.slice(0, 12), conAria: B.filter(x => x.el.getAttribute('aria-label')).length, nonSemantici, nonFocus, titoli: radice.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]').length, live: radice.querySelectorAll('[aria-live],[role=status],[role=alert]').length, dialog: radice.querySelectorAll('[role=dialog],dialog').length, nav: radice.querySelectorAll('nav,[role=navigation],[role=tablist]').length, svgSenzaNome: [...radice.querySelectorAll('svg')].filter(s => vis(s) && !s.getAttribute('aria-label') && !s.getAttribute('aria-hidden') && !s.querySelector('title')).length, imgSenzaAlt: [...radice.querySelectorAll('img')].filter(i => vis(i) && !i.getAttribute('alt')).length };
  /* corpi di testo */
  const corpi = {}; let nT = 0;
  for (const el of tutti) { const haTesto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!haTesto) continue; nT++; const f = Math.round(parseFloat(cs(el).fontSize) * 10) / 10; corpi[f] = (corpi[f] || 0) + 1; }
  return { VW, VH, radice: sel(radice), T, V: { n: vicini.length, elenco: vicini.slice(0, 20) }, C: { n: tagliati.length, elenco: tagliati.slice(0, 20) }, F, S, G: { n: sfum.length, elenco: sfum.sort((a, b) => a.rapporto - b.rapporto).slice(0, 15) }, A, corpi, nTesto: nT };
}

export async function apri(b, w, h, { ls = LS, query = '?cpmtest=1', init = null, touch = true } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; if (o) for (const k in o) localStorage.setItem(k, o[k]); }, ls);
  if (init) await page.addInitScript(init);
  return { ctx, page, errs };
}
export async function entraCarriera(page, port, query = '?cpmtest=1') {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
  await sleep(2000);
}
export async function fotoPagina(page, base, maxPezzi = 5) {
  /* scatta a pezzi di schermo scorrendo lo scorritore principale */
  const info = await page.evaluate(() => { const VH = innerHeight; let sc = document.scrollingElement, sh = sc.scrollHeight; for (const el of document.querySelectorAll('body *')) { const s = getComputedStyle(el); if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.clientHeight >= VH * 0.5 && el.scrollHeight > sh) { sc = el; sh = el.scrollHeight; } } window.__g195sc = sc; sc.scrollTop = 0; return { sh, ch: sc === document.scrollingElement ? VH : sc.clientHeight }; });
  const n = Math.min(maxPezzi, Math.max(1, Math.ceil((info.sh - 4) / info.ch)));
  const fatti = [];
  for (let i = 0; i < n; i++) { await page.evaluate((y) => { window.__g195sc.scrollTop = y; }, i * Math.round(info.ch * 0.8)); await sleep(350); const f = `${base}-${i + 1}.png`; await page.screenshot({ path: f }); fatti.push(path.basename(f)); const fine = await page.evaluate(() => { const s = window.__g195sc; return s.scrollTop + s.clientHeight >= s.scrollHeight - 4; }); if (fine) break; }
  await page.evaluate(() => { window.__g195sc.scrollTop = 0; });
  return fatti;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const DATI = {};
  for (const [w, h] of LARG) {
    const { ctx, page, errs } = await apri(b, w, h);
    await entraCarriera(page, port);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss && window.__CPM_CAREER.dismiss()); } catch (e) {}
    const dir = path.join(OUT, String(w)); fs.mkdirSync(dir, { recursive: true });
    for (const t of SCHEDE) {
      const r = await page.evaluate(x => window.__CPM_CAREER ? window.__CPM_CAREER.goTab(x) : 'no-career', t);
      await sleep(900);
      const m = await page.evaluate(MISURA); m.goTab = r;
      if (FOTO) m.foto = await fotoPagina(page, path.join(dir, t));
      (DATI[t] = DATI[t] || {})[w] = m;
      console.log(`${w} ${t}: bersagli ${m.T.n} · <48:${m.T.sotto48} <44:${m.T.sotto44} <32:${m.T.sotto32} · vicini ${m.V.n} · tagliati ${m.C.n} · libero ${m.F.libero}px (${m.F.quotaLibera}%) · ${m.S.schermi} schermi · sfum ${m.G.n} · senzaNome ${m.A.senzaNome} · nonSem ${m.A.nonSemantici}/${m.A.bersagli}`);
    }
    if (errs.length) console.log('pageerror:', errs.slice(0, 3));
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'misure.json'), JSON.stringify(DATI, null, 1));
  await b.close(); srv.close();
  console.log('ESITO giro195-schermate: scritto', path.join(OUT, 'misure.json'));
}
