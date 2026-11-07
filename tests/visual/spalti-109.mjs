#!/usr/bin/env node
/* [giro 109 PO-312 guardiano — «Nella live 2D i colori dei tifosi / spalti non sono coerenti con i colori dei club», foto PO
   docs/collaudo-po/180-partita2d-spalti-merseyside.jpg (ramo poc/marioprada-character-system) sulla 7.999.180: FC Merseyside (#dc2626)
   contro FC Craven (bianco/nero), tribuna e cartelloni bianco/grigio/blu, il rosso assente].
   Monta il Campo2D VERO (la stessa funzione della partita, coi colori che la partita gli passa: selectMatchKits sulla coppia vera
   casa/ospiti, homeShirt/homeAccent/awayShirt/awayAccent) in una tela delle dimensioni della partita, su sette coppie di club veri
   (rosso, giallo/oro, bianco, azzurro, verde, nero; in casa e in trasferta) e tre formati (360x800, 412x915 tocco · 1440x900 mouse).
   Ogni pixel della tribuna (fuori dall'erba esterna e dai cartelloni) e dei cartelloni si assegna alla famiglia del colore piu' vicino
   (distanza redmean): CASA = colori sociali del club di casa dello stadio (c, c2) e della divisa che indossa; OSPITI = idem per gli
   ospiti; BASE = il fondo scuro dei gradoni (canale piu' alto < 90 e saturazione bassa, o vicino a #26324a); ALTRO = il resto.
   CRITERIO (fissato dopo la misura della 180, vedi docs/sviluppo/RAPPORTO-giro109.md):
     T1 tribuna di casa: quota CASA >= SOGLIA_CASA fra i pixel colorati (non BASE) e CASA >= 2 x OSPITI;
     T2 settore ospiti: quota OSPITI >= SOGLIA_OSP fra i pixel colorati;
     T3 nessun tifoso estraneo: quota ALTRO fra i pixel colorati della tribuna <= SOGLIA_ALTRO;
     T4 cartelloni: quota ALTRO fra i pixel dei cartelloni (esclusa la BASE scura e la riga di luce) <= SOGLIA_CART;
     T5 base scura e neutra: il fondo dei gradoni dichiarato ha luminanza <= 0,06 e saturazione <= 0,45.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_G109 (la 7.999.180) e pretende che il criterio cada almeno sulla coppia del PO.
   CPM_FOTO_109=<cartella> salva le foto (prima/dopo) delle coppie CPM_FOTO_COPPIE (default 0,2,4). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const COPPIE = [['liv', 'ful'], ['ful', 'liv'], ['wol', 'new'], ['napoli', 'sas'], ['wob', 'fra'], ['new', 'lec'], ['tot', 'milan']];
const FORMATI_PV = { t360c: { w: 360, h: 720 }, t412c: { w: 412, h: 830 }, t360: { w: 360, h: 800 }, t412: { w: 412, h: 915 } };
const FORMATI = { t360: { w: 360, h: 800, touch: true, top: 78, bot: 70 }, t412: { w: 412, h: 915, touch: true, top: 86, bot: 74 }, pc: { w: 1440, h: 900, touch: false, top: 90, bot: 60 } };
const SOGLIA_CASA = +(process.env.CPM_S_CASA || 0.55), SOGLIA_OSP = +(process.env.CPM_S_OSP || 0.55), SOGLIA_ALTRO = +(process.env.CPM_S_ALTRO || 0.25), SOGLIA_CART = +(process.env.CPM_S_CART || 0.20);
const SOGLIA_PRIM = +(process.env.CPM_S_PRIM || 0.30);
const ROSSO = !!process.env.CPM_PROVA_ROSSO, SOLO_MISURA = !!process.env.CPM_SOLO_MISURA, FOTO = process.env.CPM_FOTO_109 || '';
const FOTO_COPPIE = (process.env.CPM_FOTO_COPPIE || '0,2,4').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

const MISURA = ({ casaId, ospId, top, bot }) => new Promise(res => {
  const C = CLUBS.find(c => c.id === casaId), O = CLUBS.find(c => c.id === ospId), K = selectMatchKits(C, O);
  let d = document.getElementById('sp109'); if (d) { try { d._root.unmount(); } catch (e) {} d.remove(); }
  d = document.createElement('div'); d.id = 'sp109'; d.style.cssText = `position:fixed;left:0;top:${top}px;width:100vw;height:calc(100vh - ${top + bot}px);z-index:99999;background:#000`;
  document.body.appendChild(d); const root = ReactDOM.createRoot(d); d._root = root;
  root.render(React.createElement(Campo2D, { motore: null, kitCasa: K.homeShirt, kitOspiti: K.awayShirt, eroeLato: 'home', tifoCasa: K.homeShirt, tifoCasa2: K.homeAccent, tifoOsp: K.awayShirt, tifoOsp2: K.awayAccent, clubPrato: C, siglaCasa: C.a, siglaOspiti: O.a }));
  setTimeout(() => {
    const cv = d.querySelector('canvas'); const x = cv.getContext('2d'); const D = x.getImageData(0, 0, cv.width, cv.height).data;
    const dpr = cv.width / cv.clientWidth, W = cv.clientWidth, H = cv.clientHeight, vert = H >= W * 0.92, LUN = 105, LAR = 68;
    const padx = vert ? W * 0.035 : W * 0.02, pady = vert ? H * 0.02 : H * 0.035;
    const s = Math.min((W - padx * 2) / (vert ? LAR : LUN), (H - pady * 2) / (vert ? LUN : LAR)), pw = (vert ? LAR : LUN) * s, ph = (vert ? LUN : LAR) * s, ox = (W - pw) / 2, oy = (H - ph) / 2;
    const PX = (mx, my) => vert ? (ox + my * s) : (ox + mx * s), PY = (mx, my) => vert ? (oy + (LUN - mx) * s) : (oy + my * s);
    const est = _cart297(PX, PY, vert, LUN, LAR, s, W, H), q = _ospRect297(W, H, est.x0, est.y0, est.x1, est.y1, vert), sp = Math.max(3, s * 0.95);
    const rgb = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const dist = (a, b) => { const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
    const SPd = window.__CPM_SP109 && window.__CPM_SP109.base ? window.__CPM_SP109 : null, BASE = rgb(SPd ? SPd.base : '#26324a');
    const refC = [C.c, C.c2, K.homeShirt, K.homeAccent].filter(Boolean).map(rgb), refO = [O.c, O.c2, K.awayShirt, K.awayAccent].filter(Boolean).map(rgb);
    const primC = [rgb(C.c), rgb(K.homeShirt)], primO = [rgb(O.c), rgb(K.awayShirt)];
    const sat = p => { const M = Math.max(...p), m = Math.min(...p); return M ? (M - m) / M : 0; };
    /* un puntino sfumato sul fondo (bordi, luce degli angoli) e' base + a x (colore - base), schiarito o scurito: si «smiscela» */
    const vic = (p, r) => { let best = 1e9; for (const k of [1, 0.9, 0.8]) for (let a = 0.35; a <= 1.001; a += 0.08) { const c = [0, 1, 2].map(i => k * (BASE[i] + a * (r[i] - BASE[i]))); const d0 = dist(p, c); if (d0 < best) best = d0; }
      const hl = r.map(v => v + (255 - v) * 0.22); return Math.min(best, dist(p, hl)); };
    const fam = (p, inOsp) => { const dc = Math.min(...refC.map(r => vic(p, r))), dO = Math.min(...refO.map(r => vic(p, r))), dB = Math.min(dist(p, BASE), dist(p, BASE.map(v => v * 0.8)));
      if (dB <= 28 || (Math.max(...p) < 45 && sat(p) < 0.5)) return 'base';
      const best = Math.min(dc, dO); if (best <= 60) { if (inOsp ? dc + 12 < dO : dc <= dO + 12) { const dp = Math.min(...primC.map(r => vic(p, r))); return dp <= dc + 1 ? 'casaP' : 'casa'; } return 'osp'; }
      return 'altro'; };
    const conta = () => ({ casa: 0, casaP: 0, osp: 0, base: 0, altro: 0 });
    const T = conta(), S = conta(), P = conta(); const den = (r, x, y) => x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];
    const erbaR = [est.x0, est.y0, est.x1 - est.x0, est.y1 - est.y0], cartR = [est.x0 - sp, est.y0 - sp, est.x1 - est.x0 + 2 * sp, est.y1 - est.y0 + 2 * sp];
    for (let py = 1; py < cv.height; py += 2) for (let px = 1; px < cv.width; px += 2) {
      const xx = px / dpr, yy = py / dpr; if (den(erbaR, xx, yy)) continue; const i = (py * cv.width + px) * 4, p = [D[i], D[i + 1], D[i + 2]];
      if (den(cartR, xx, yy)) { /* cartelloni: si scarta la riga di luce in cima a ogni pannello (bianco 22%) misurando solo il nucleo */ P[fam(p)]++; continue; }
      if (den(q, xx, yy)) S[fam(p, true)]++; else T[fam(p, false)]++; }
    const pc = (o) => { o.casa += o.casaP; const col = o.casa + o.osp + o.altro, tot = col + o.base; return { prim: +(o.casaP / Math.max(1, col)).toFixed(3), casa: +(o.casa / Math.max(1, col)).toFixed(3), osp: +(o.osp / Math.max(1, col)).toFixed(3), altro: +(o.altro / Math.max(1, col)).toFixed(3), base: +(o.base / Math.max(1, tot)).toFixed(3), n: tot }; };
    const L = (h) => { const c = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const primScuro = (() => { const lb = L('#' + BASE.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')), lp = L(C.c); return (Math.max(lb, lp) + 0.05) / (Math.min(lb, lp) + 0.05) < 1.6; })();
    res({ primScuro, coppia: `${C.a}(${C.c}/${C.c2}) v ${O.a}(${O.c}/${O.c2})`, kit: [K.homeShirt, K.homeAccent, K.awayShirt, K.awayAccent], tribuna: pc(T), ospiti: pc(S), cartelloni: pc(P), base: SPd ? { lum: +L(SPd.base).toFixed(3), sat: +sat(rgb(SPd.base)).toFixed(2), hex: SPd.base } : null, pal: SPd });
  }, 900);
});

async function giro(rosso) {
  const righe = [];
  for (const [fk, f] of Object.entries(FORMATI)) {
    const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 2, serviceWorkers: 'block' }; if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
    const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    if (rosso) await page.addInitScript(() => { window.__CPM_NO_G109 = true; });
    await page.addInitScript(() => { window.__CPM_SP109 = {}; });
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => typeof Campo2D === 'function' && typeof selectMatchKits === 'function' && document.querySelector('button'), null, { timeout: 90000 }); await sleep(800);
    for (let i = 0; i < COPPIE.length; i++) {
      const [casaId, ospId] = COPPIE[i]; const m = await page.evaluate(MISURA, { casaId, ospId, top: f.top, bot: f.bot }); m.formato = fk; m.i = i; righe.push(m);
      if (FOTO && FOTO_COPPIE.includes(i) && fk !== 't412') { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-${fk}-${casaId}-${ospId}.png` }); }
    }
    if (errs.length) righe.push({ ko: 'pageerror: ' + errs.slice(0, 2).join(' | '), formato: fk });
    await ctx.close();
  }
  return righe;
}
/* PARTITA VERA (dal salvataggio del 297, stessa strada di partita2d-297): la sigla sopra la porta resta sotto la barra
   Statistiche/Pagelle (E1) e il testimone dei nomi dice quante volte portatore ed eroe erano vicini (dichiarato, non giudicato:
   dipende da dove sono i giocatori). */
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
async function partita(rosso, fk) {
  const f = FORMATI_PV[fk], mis = { formato: fk }; const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 2, serviceWorkers: 'block', hasTouch: true, isMobile: true };
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_G109 = true; window.__CPM_NO_G109_ETI = true; window.__CPM_NO_G109_NOMI = true; });
  await page.addInitScript(s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} window.__CPM_W297 = {}; window.__CPM_SP109 = {}; window.__CPM_ETI109 = {}; window.__CPM_NOMI109 = {}; }, SAVE);
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
    await page.keyboard.press('Enter'); await sleep(1500); await page.keyboard.press('Enter');
    for (let i = 0; i < 40; i++) { await sleep(500); const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; }
    await page.waitForFunction(() => window.__CPM_PHASE() === 'playing' && window.__CPM_W297 && window.__CPM_W297.campo, null, { timeout: 60000 });
    await page.evaluate(() => { const x = document.querySelector('[data-cpm="linguette918"] button[aria-label="Nascondi"]'); if (x) x.click(); }); await sleep(2500);
    mis.eti = await page.evaluate(() => { const cv = window.__CPM_CAMPO2D_CV && window.__CPM_CAMPO2D_CV(); if (!cv) return null; const rc = cv.getBoundingClientRect(), k = rc.height / cv.clientHeight;
      const vis = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r : null; };
      const sopra = [vis(document.querySelector('[data-cpm="striscia918"]')), vis(document.querySelector('[data-cpm="linguette918"]'))].filter(Boolean).filter(r => r.top < rc.top + rc.height * 0.5).map(r => r.bottom);
      const sotto = [vis(document.querySelector('[data-cpm="linguette918"]'))].filter(Boolean).filter(r => r.top >= rc.top + rc.height * 0.5).map(r => r.top);
      return Object.entries(window.__CPM_ETI109 || {}).map(([sig, q]) => ({ sig, top: Math.round(rc.top + q.y0 * k), bot: Math.round(rc.top + q.y1 * k), barraSopra: sopra.length ? Math.round(Math.max(...sopra)) : null, barraSotto: sotto.length ? Math.round(Math.min(...sotto)) : null })); });
    mis.nomi = await page.evaluate(() => window.__CPM_NOMI109);
    mis.spalti = await page.evaluate(() => window.__CPM_W297 && window.__CPM_W297.spalti);
    if (FOTO) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-partita-${fk}.png` }); }
  } catch (e) { mis.ko = 'eccezione: ' + String(e && e.message || e).slice(0, 160); }
  if (errs.length) mis.ko = (mis.ko || '') + ' pageerror: ' + errs.slice(0, 2).join(' | ');
  await ctx.close(); return mis;
}
const giudicaE = m => { if (m.ko) return [m.ko]; if (!m.eti || !m.eti.length) return ['E1 sigle sopra le porte non misurate'];
  const k = []; for (const e of m.eti) { if (e.barraSopra != null && e.top < e.barraSopra - 1 && e.bot > e.barraSopra - 40) k.push(`E1 «${e.sig}» sporge ${e.barraSopra - e.top}px sotto la barra in alto`); if (e.barraSotto != null && e.bot > e.barraSotto + 1 && e.top < e.barraSotto + 40) k.push(`E1 «${e.sig}» sporge ${e.bot - e.barraSotto}px sotto le linguette in basso`); }
  return k; };
function giudica(m) {
  const k = []; if (m.ko) return [m.ko];
  if (m.tribuna.casa < SOGLIA_CASA) k.push(`T1 casa ${(m.tribuna.casa * 100).toFixed(0)}% < ${SOGLIA_CASA * 100}%`);
  if (m.tribuna.casa < 2 * m.tribuna.osp) k.push(`T1 casa ${(m.tribuna.casa * 100).toFixed(0)}% < 2x ospiti ${(m.tribuna.osp * 100).toFixed(0)}%`);
  if (!m.primScuro && m.tribuna.prim < SOGLIA_PRIM) k.push(`T1 colore principale di casa ${(m.tribuna.prim * 100).toFixed(0)}% < ${SOGLIA_PRIM * 100}%`);
  if (m.ospiti.n > 400 && m.ospiti.osp < SOGLIA_OSP) k.push(`T2 ospiti ${(m.ospiti.osp * 100).toFixed(0)}% < ${SOGLIA_OSP * 100}%`);
  if (m.tribuna.altro > SOGLIA_ALTRO) k.push(`T3 tifosi estranei ${(m.tribuna.altro * 100).toFixed(0)}% > ${SOGLIA_ALTRO * 100}%`);
  if (m.cartelloni.altro > SOGLIA_CART) k.push(`T4 cartelloni estranei ${(m.cartelloni.altro * 100).toFixed(0)}% > ${SOGLIA_CART * 100}%`);
  if (!m.base) k.push('T5 testimone __CPM_SP109 assente'); else if (m.base.lum > 0.06 || m.base.sat > 0.45) k.push(`T5 base ${m.base.hex} lum ${m.base.lum} sat ${m.base.sat}`);
  return k;
}
const stampa = (r, tag) => { for (const m of r) { if (m.ko) { console.log(tag, m.formato, m.ko); continue; } const t = m.tribuna, o = m.ospiti, c = m.cartelloni;
  console.log(`${tag} ${m.formato.padEnd(4)} ${m.coppia.padEnd(42)} trib casa ${(t.casa * 100).toFixed(0).padStart(3)}% (prim ${(t.prim * 100).toFixed(0).padStart(3)}%) osp ${(t.osp * 100).toFixed(0).padStart(3)}% altro ${(t.altro * 100).toFixed(0).padStart(3)}% base ${(t.base * 100).toFixed(0)}% | sett.osp osp ${(o.osp * 100).toFixed(0).padStart(3)}% casa ${(o.casa * 100).toFixed(0).padStart(3)}% altro ${(o.altro * 100).toFixed(0).padStart(3)}% | cart casa ${(c.casa * 100).toFixed(0).padStart(3)}% osp ${(c.osp * 100).toFixed(0).padStart(3)}% altro ${(c.altro * 100).toFixed(0).padStart(3)}% | ${giudica(m).join(' · ') || 'OK'}`); } };
const verde = process.env.CPM_SOLO_PARTITA ? [] : await giro(ROSSO && SOLO_MISURA); stampa(verde, ROSSO && SOLO_MISURA ? 'ROSSO' : 'VERDE');
let esito = 0;
const PV = []; for (const fk of Object.keys(FORMATI_PV)) { const m = await partita(ROSSO && SOLO_MISURA, fk); PV.push(m); console.log(`${ROSSO && SOLO_MISURA ? 'ROSSO' : 'VERDE'} partita ${fk} sigle ${JSON.stringify(m.eti)} nomi ${JSON.stringify(m.nomi)} | ${giudicaE(m).join(' · ') || 'OK'}`); }
if (!SOLO_MISURA) { const ke = PV.filter(m => giudicaE(m).length); if (ke.length) { console.log(`❌ verde partita: ${ke.length} formati con la sigla sotto la barra`); esito = 1; } else console.log('✅ verde partita: sigle nello spazio libero su 360x720 · 412x830 · 360x800 · 412x915');
  if (ROSSO) { const PR = []; for (const fk of Object.keys(FORMATI_PV)) { const m = await partita(true, fk); PR.push(m); console.log(`ROSSO partita ${fk} sigle ${JSON.stringify(m.eti)} | ${giudicaE(m).join(' · ') || 'OK'}`); }
    if (!PR.some(m => giudicaE(m).length)) { console.log('❌ rosso partita: con __CPM_NO_G109_ETI nessuna sigla sporge — la sonda non vede il rilievo'); esito = 1; } else console.log('✅ rosso partita: __CPM_NO_G109_ETI fa sporgere la sigla sotto la barra'); } }
if (!SOLO_MISURA) {
  const kv = verde.filter(m => giudica(m).length); if (kv.length) { console.log(`❌ verde: ${kv.length} misure fuori criterio`); esito = 1; } else console.log(`✅ verde: ${verde.length} misure nel criterio`);
  if (ROSSO) { const r = await giro(true); stampa(r, 'ROSSO'); const po = r.filter(m => m.i === 0 && giudica(m).length); const kr = r.filter(m => giudica(m).length);
    if (!po.length) { console.log('❌ rosso: con __CPM_NO_G109 la coppia del PO (MER v CRA) passa il criterio — il guardiano non vede la 180'); esito = 1; } else console.log(`✅ rosso: __CPM_NO_G109 cade su ${kr.length}/${r.length} misure, coppia del PO compresa`); }
}
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true }); fs.writeFileSync(new URL('./out/spalti-109.json', import.meta.url), JSON.stringify(verde, null, 1));
srv.close(); await b.close(); process.exit(esito);
