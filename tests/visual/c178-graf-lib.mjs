/* [collaudo grafico 178 · PO-299] Libreria comune delle sonde c178-graf-*.mjs. Solo lettura sul gioco: non tocca src/.
   Rilevatore generico DENTRO la pagina (D): scorrimento orizzontale, elementi fuori schermo, tasti piccoli, testi tagliati,
   testi sovrapposti, immagini rotte, caratteri sostitutivi, figurine, distanze fra riquadri-carta (stesso criterio di spazio-296). */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
export { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT };

export const SCRATCH = process.env.C178_SCRATCH || '/tmp/claude-0/-home-user-Carrier-manager-/bcecd0e7-e3fe-58f3-9b5c-481bfdeae003/scratchpad/c178';
fs.mkdirSync(SCRATCH, { recursive: true });
export const FORMATI = {
  tel:  { k: 'tel',  nome: 'Telefono 412x915',     w: 412,  h: 915,  touch: true },
  tabv: { k: 'tabv', nome: 'Tablet 820x1180 vert', w: 820,  h: 1180, touch: true },
  tabo: { k: 'tabo', nome: 'Tablet 1180x820 orizz', w: 1180, h: 820,  touch: true },
  pc:   { k: 'pc',   nome: 'PC 1440x900',          w: 1440, h: 900,  touch: false },
};
export const scelti = () => (process.env.C178_FORMATI || 'tel,tabv,tabo,pc').split(',').filter(k => FORMATI[k]).map(k => FORMATI[k]);

export const TRIALPROG = { ph: 'offers', slot: 0, res: [{ goals: 2, assists: 1, rating: 7.4 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 3, assists: 1, rating: 8.1 }],
  p: { name: 'Grafica Probe', nation: 'Italia', avatarId: 0, ovr: 58, age: 16, proStatus: 'youth', archetype: 'finalizzatore',
       stats: { 'velocità': 60, tecnica: 58, fisico: 56, 'mentalità': 57, tiro: 62, passaggio: 56, dribbling: 60, posizionamento: 58 } } };

export async function apriPagina(b, port, f, init, query, errs) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs && errs.push(`${f.k} · ${String(e.message).slice(0, 140)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [], ...(init || {}) });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query || ''}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return { ctx, page };
}
export const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const x = [...document.querySelectorAll('button')].find(y => r.test((y.textContent || '').trim())); if (x) { x.click(); return true; } return false; }, rx);
export async function ferma(page, maxMs = 6000) { let prev = null, uguali = 0; const t0 = Date.now(); await sleep(450);
  while (Date.now() - t0 < maxMs) { let t = null; try { t = await page.evaluate(() => (document.body.textContent || '').replace(/\d{1,2}:\d{2}/g, '·').length + '|' + ROOT.querySelectorAll('*').length); } catch (e) {}
    if (t != null && t === prev) { if (++uguali >= 2) return; } else { uguali = 0; prev = t; } await sleep(250); } }
export async function congela(page) {
  await page.evaluate(() => { if (!document.getElementById('__c178')) { const st = document.createElement('style'); st.id = '__c178'; st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(st); } });
  await sleep(150);
}
export async function entraInCarriera(page, errs) {
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { errs && errs.push('Continua non trovato'); return false; }
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) return false;
  await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(400);
  return true;
}

/* gira DENTRO la pagina: ritorna un oggetto con tutte le misure della schermata corrente */
export function D(touch) {
  const de = document.documentElement, W = de.clientWidth, H = de.clientHeight;
  const cs = e => getComputedStyle(e);
  const vis = e => { const c = cs(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.1) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const alfa = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return 0; const p = m[1].split(',').map(Number); return p.length > 3 ? p[3] : 1; };
  const sel = e => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; const dc = e.getAttribute('data-cpm'); if (dc) s += '[' + dc + ']'; const cl = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.'); if (cl) s += '.' + cl;
    const t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26); return s + (t ? '«' + t + '»' : ''); };
  const txt = e => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
  const clipAnc = (e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const c = cs(a); if (/(hidden|auto|scroll|clip)/.test(c.overflowX)) { const r = a.getBoundingClientRect(); if (r.width > 0) return a; } } return null; };
  /* se c'e' una finestra/schermata sovrapposta a tutto campo (position:fixed, >=50% dello schermo, z piu' alto) si misura SOLO quella */
  let ROOT = document.body, ovl = null;
  for (const e of document.body.querySelectorAll('*')) { const c = cs(e); if (c.position !== 'fixed' || c.display === 'none' || +c.opacity < 0.1) continue; const r = e.getBoundingClientRect(); if (r.width * r.height < 0.5 * W * H) continue; const z = parseInt(c.zIndex) || 0; if (z >= 50 && (!ovl || z >= ovl.z)) ovl = { e, z }; }
  if (ovl) ROOT = ovl.e;
  const out = { overlay: !!ovl, W, H, hs: Math.max(de.scrollWidth, document.body.scrollWidth) - W, altezza: Math.max(de.scrollHeight, document.body.scrollHeight) };
  /* 1) fuori schermo (non contenuti da un antenato che ritaglia/scorre) */
  const fuori = [];
  for (const e of ROOT.querySelectorAll('*')) {
    if (!vis(e)) continue; const r = e.getBoundingClientRect(); const c = cs(e);
    if (c.position === 'fixed' && (r.right > W + 1 || r.left < -1)) { fuori.push({ s: sel(e), px: Math.round(Math.max(r.right - W, -r.left)), fixed: 1 }); continue; }
    if (r.right > W + 1.5 || r.left < -1.5) { if (clipAnc(e)) continue; fuori.push({ s: sel(e), px: Math.round(Math.max(r.right - W, -r.left)) }); }
  }
  out.fuori = fuori.sort((a, b) => b.px - a.px).slice(0, 6); out.nFuori = fuori.length;
  /* 2) tasti piccoli */
  const piccoli = [], tutti = [];
  for (const e of ROOT.querySelectorAll('button,[role=button],a[href],input:not([type=hidden]),select,textarea,[data-cpm-tab],[onclick]')) {
    if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > 20000) continue;
    /* un controllo dentro un altro controllo non e' un tasto a se' */
    tutti.push(e);
    const m = Math.min(r.width, r.height);
    if (m < 40) piccoli.push({ s: sel(e), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY) });
  }
  out.nTasti = tutti.length; out.piccoli = piccoli.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).slice(0, 8); out.nPiccoli = piccoli.length;
  out.nPiccoli30 = piccoli.filter(x => Math.min(x.w, x.h) < 30).length;
  /* 3) testi tagliati: contenitore che ritaglia con testo che non ci sta */
  const tagliati = [];
  for (const e of ROOT.querySelectorAll('*')) {
    if (!vis(e)) continue; const c = cs(e);
    const ox = /(hidden|clip)/.test(c.overflowX), oy = /(hidden|clip)/.test(c.overflowY);
    if (!(ox || oy)) continue;
    if (!(e.childNodes && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || e.children.length === 0 || true)) continue;
    const t = (e.textContent || '').trim(); if (!t) continue;
    const eli = c.textOverflow === 'ellipsis';
    if (ox && e.scrollWidth > e.clientWidth + 2 && !eli && e.clientWidth > 8 && c.position !== 'absolute') tagliati.push({ s: sel(e), k: 'x', sw: e.scrollWidth, cw: e.clientWidth });
    else if (ox && eli && e.scrollWidth > e.clientWidth + 2 && t.length > 0) tagliati.push({ s: sel(e), k: 'ellissi', sw: e.scrollWidth, cw: e.clientWidth, ellissi: 1 });
    if (oy && e.scrollHeight > e.clientHeight + 3 && e.clientHeight > 8 && !/-webkit-box/.test(c.display) && c.position !== 'absolute' && !eli) tagliati.push({ s: sel(e), k: 'y', sh: e.scrollHeight, ch: e.clientHeight });
  }
  out.tagliati = tagliati.filter(x => !x.ellissi).slice(0, 8); out.nTagliati = tagliati.filter(x => !x.ellissi).length; out.nEllissi = tagliati.filter(x => x.ellissi).length;
  out.ellissi = tagliati.filter(x => x.ellissi).slice(0, 5);
  /* 4) testi sovrapposti: foglie di testo con rettangoli che si intersecano (>35% del piu' piccolo), non in relazione antenato */
  const foglie = [];
  const tw = document.createTreeWalker(ROOT, NodeFilter.SHOW_TEXT);
  let n; while ((n = tw.nextNode())) { const t = n.textContent.trim(); if (t.length < 2) continue; const p = n.parentElement; if (!p || !vis(p)) continue; const pc = cs(p); if (pc.position === 'fixed' && false) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (r.width < 6 || r.height < 6) continue; foglie.push({ p, r, t: t.slice(0, 24) }); if (foglie.length > 2500) break; }
  const sov = [];
  for (let i = 0; i < foglie.length && sov.length < 12; i++) for (let j = i + 1; j < foglie.length; j++) { const a = foglie[i], b = foglie[j];
    if (a.p === b.p || a.p.contains(b.p) || b.p.contains(a.p)) continue;
    const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (ox <= 2 || oy <= 2) continue; const ar = ox * oy, mn = Math.min(a.r.width * a.r.height, b.r.width * b.r.height); if (ar / mn < 0.35) continue;
    sov.push({ a: a.t, b: b.t, sa: sel(a.p), sb: sel(b.p), ox: Math.round(ox), oy: Math.round(oy) }); if (sov.length >= 12) break; }
  out.sovTesti = sov;
  /* 5) immagini rotte, caratteri sostitutivi, testo minuscolo */
  out.imgRotte = [...ROOT.querySelectorAll('img')].filter(i => vis(i) && i.complete && i.naturalWidth === 0).slice(0, 5).map(sel);
  out.imgSenzaCarico = [...ROOT.querySelectorAll('img')].filter(i => vis(i) && !i.complete).length;
  const bt = document.body.innerText || ''; out.sostitutivi = (bt.match(/[�□▯]/g) || []).length; out.undefinedNaN = (bt.match(/\b(undefined|NaN|\[object Object\]|null)\b/g) || []).length;
  let minFs = 99, nMin = 0; for (const f of foglie) { const fs_ = parseFloat(cs(f.p).fontSize); if (fs_ < minFs) minFs = fs_; if (fs_ < 10) nMin++; } out.minFs = minFs; out.nSotto10 = nMin;
  /* 6) figurine */
  const figs = [];
  for (const e of ROOT.querySelectorAll('[data-cpm-figurina]')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); const c = cs(e);
    const imgs = [...e.querySelectorAll('img')]; const rot = imgs.filter(i => i.complete && i.naturalWidth === 0).length;
    const figli = []; for (const k of e.querySelectorAll('*')) { if (!vis(k)) continue; const kr = k.getBoundingClientRect(); if (kr.right > r.right + 1.5 || kr.left < r.left - 1.5 || kr.bottom > r.bottom + 1.5 || kr.top < r.top - 1.5) { if ((k.textContent || '').trim()) figli.push(sel(k)); } }
    const tx = []; for (const k of e.querySelectorAll('*')) { if (!vis(k)) continue; const kc = cs(k); if (/(hidden|clip)/.test(kc.overflowX) && k.scrollWidth > k.clientWidth + 2 && (k.textContent || '').trim() && kc.textOverflow !== 'ellipsis') tx.push(sel(k)); }
    figs.push({ tipo: e.getAttribute('data-cpm-figurina'), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, ratio: Math.round(r.width / r.height * 1000) / 1000, raggio: c.borderTopLeftRadius, bordo: c.borderTopWidth + ' ' + c.borderTopColor,
      overflow: c.overflow, volto: e.getAttribute('data-cpm-volto') || '', img: imgs.length, imgRotte: rot, fuoriTesto: figli.slice(0, 3), tagliatoTesto: tx.slice(0, 3), x: Math.round(r.left), y: Math.round(r.top + scrollY),
      nat: imgs[0] ? imgs[0].naturalWidth + 'x' + imgs[0].naturalHeight : '', fit: imgs[0] ? cs(imgs[0]).objectFit : '', sfocata: imgs[0] ? (imgs[0].naturalWidth > 0 && imgs[0].naturalWidth < r.width * 0.9) : false });
  }
  out.figurine = figs;
  /* 7) spazio fra riquadri-carta (criterio spazio-296) */
  const deco = e => { const c = cs(e); if (Math.max(parseFloat(c.borderTopLeftRadius), parseFloat(c.borderBottomLeftRadius), parseFloat(c.borderTopRightRadius), parseFloat(c.borderBottomRightRadius)) < 6) return false;
    const bordo = parseFloat(c.borderTopWidth) > 0 && c.borderTopStyle !== 'none' && alfa(c.borderTopColor) > 0.05; const bordoB = parseFloat(c.borderBottomWidth) > 0 && c.borderBottomStyle !== 'none' && alfa(c.borderBottomColor) > 0.05;
    return bordo || bordoB || (c.boxShadow && c.boxShadow !== 'none') || alfa(c.backgroundColor) > 0.5 || (c.backgroundImage && c.backgroundImage !== 'none'); };
  const estensione = (c) => { if (!vis(c)) return null; const st = cs(c); if (st.position === 'fixed' || st.position === 'absolute') return null;
    if (deco(c)) { const r = c.getBoundingClientRect(); return r.width > 0 ? { l: r.left, t: r.top, r: r.right, b: r.bottom, el: c } : null; }
    let u = null; const giu = (n, prof) => { if (prof > 6) return; for (const k of n.children) { if (!vis(k)) continue; const ks = cs(k); if (ks.position === 'fixed' || ks.position === 'absolute') continue;
        if (deco(k)) { const r = k.getBoundingClientRect(); u = u ? { l: Math.min(u.l, r.left), t: Math.min(u.t, r.top), r: Math.max(u.r, r.right), b: Math.max(u.b, r.bottom) } : { l: r.left, t: r.top, r: r.right, b: r.bottom }; } else giu(k, prof + 1); } };
    giu(c, 0); if (!u) return null; const r = c.getBoundingClientRect(); if (Math.abs(r.top - u.t) > 3 || Math.abs(r.bottom - u.b) > 3) return null; return { l: r.left, r: r.right, t: u.t, b: u.b, el: c }; };
  const gaps = [], sovr = [];
  for (const P of ROOT.querySelectorAll('*')) {
    if (!vis(P) || P.children.length < 2) continue; const V = []; let rotto = true;
    for (const c of P.children) { if (!vis(c)) continue; const st = cs(c); if (st.position === 'fixed' || st.position === 'absolute') continue; const x = estensione(c); if (!x) { rotto = true; continue; } x.rotto = rotto; rotto = false; V.push(x); }
    if (V.length < 2) continue;
    for (let i = 0; i + 1 < V.length; i++) { const a = V[i], b = V[i + 1]; if (b.rotto) continue;
      const wA = a.r - a.l, hA = a.b - a.t, wB = b.r - b.l, hB = b.b - b.t;
      const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (ox > 1 && oy > 1) { sovr.push({ a: sel(a.el), b: sel(b.el), ox: Math.round(ox), oy: Math.round(oy) }); continue; }
      let k = null, g = 0; if (ox >= 0.5 * Math.min(wA, wB) && b.t >= a.b - 1) { k = 'v'; g = b.t - a.b; } else if (oy >= 0.5 * Math.min(hA, hB) && b.l >= a.r - 1) { k = 'h'; g = b.l - a.r; } else continue;
      const carta = hA >= 28 && hB >= 28 && wA >= 100 && wB >= 100;
      gaps.push({ k, g: Math.round(g * 10) / 10, carta, a: sel(a.el), b: sel(b.el), p: sel(P), top: Math.round(a.t + scrollY), sa: (a.el.getAttribute('style') || '').slice(0, 120) }); }
  }
  out.gaps = gaps; out.sovr = sovr.slice(0, 10);
  out.testoLen = bt.length;
  return out;
}

/* sintetizza i gap */
export const mediana = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export function sintesiGap(m) {
  const v = m.gaps.filter(x => x.k === 'v' && x.carta && x.g >= 0), h = m.gaps.filter(x => x.k === 'h' && x.carta && x.g >= 0);
  const vv = v.map(x => x.g), hh = h.map(x => x.g);
  return { nV: v.length, medV: mediana(vv), minV: vv.length ? Math.min(...vv) : null, maxV: vv.length ? Math.max(...vv) : null, nH: h.length, medH: mediana(hh), maxH: hh.length ? Math.max(...hh) : null,
    largo: v.filter(x => x.g > 10).slice(0, 4).map(x => ({ g: x.g, a: x.a, b: x.b, p: x.p, sa: x.sa })), largoH: h.filter(x => x.g > 10).slice(0, 3).map(x => ({ g: x.g, a: x.a, b: x.b })),
    nLargoV: v.filter(x => x.g > 10).length, nLargoH: h.filter(x => x.g > 10).length, nStretto: v.filter(x => x.g < 4).length, stretto: v.filter(x => x.g < 4).slice(0, 3).map(x => ({ g: x.g, a: x.a, b: x.b })) };
}

const innerHeightOf = f => f.h;
export async function scatta(page, f, id, { full } = {}) {
  const dir = path.join(SCRATCH, 'foto', f.k); fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, id + '.jpg');
  try { await page.screenshot({ path: p, type: 'jpeg', quality: 62, animations: 'disabled', timeout: 45000 }); } catch (e) { return null; }
  if (full) {
    /* foto LUNGA: il gioco scorre in un contenitore interno, quindi fullPage non basta; si alza il viewport fino alla lunghezza del contenuto */
    const sh = await page.evaluate(() => { let best = 0; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (!/(auto|scroll)/.test(c.overflowY)) continue; if (e.scrollHeight - e.clientHeight > 60) best = Math.max(best, e.scrollHeight - e.clientHeight + innerHeight); } return best; }).catch(() => 0);
    if (sh > innerHeightOf(f) + 80) { try { await page.setViewportSize({ width: f.w, height: Math.min(Math.round(sh), 5400) }); await sleep(450);
        await page.screenshot({ path: p.replace(/\.jpg$/, '-lungo.jpg'), type: 'jpeg', quality: 55, animations: 'disabled', timeout: 60000 }); } catch (e) {} finally { await page.setViewportSize({ width: f.w, height: f.h }); await sleep(250); } }
    return { p, lunghezza: sh };
  }
  return p;
}
export async function misura(page, f, id, R, opt = {}) {
  await ferma(page); await congela(page);
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(120);
  const m = await page.evaluate(D, f.touch);
  const _sc = await scatta(page, f, id, { full: opt.full }); if (_sc && _sc.p) { m.foto = _sc.p; m.scrollH = _sc.lunghezza; } else m.foto = _sc;
  m.gap = sintesiGap(m); delete m.gaps;
  (R[f.k] = R[f.k] || {})[id] = m;
  const flag = [m.hs > 0 ? 'HS' + m.hs : '', m.nFuori ? 'fuori' + m.nFuori : '', m.nTagliati ? 'tagl' + m.nTagliati : '', m.sovTesti.length ? 'sovT' + m.sovTesti.length : '', m.sovr.length ? 'sovR' + m.sovr.length : '', m.imgRotte.length ? 'img' : '', m.sostitutivi ? 'sost' : '', m.undefinedNaN ? 'NaN' : ''].filter(Boolean).join(' ');
  process.stdout.write(`  ${f.k.padEnd(4)} ${id.padEnd(26)} h${String(m.altezza).padStart(5)} tasti<40:${String(m.nPiccoli).padStart(2)}/${String(m.nTasti).padStart(3)} gapV med ${String(m.gap.medV).padStart(5)} >10:${m.gap.nLargoV} fig ${m.figurine.length} ${flag}\n`);
  return m;
}
export function salva(nome, obj) { fs.writeFileSync(path.join(SCRATCH, nome), JSON.stringify(obj)); }
