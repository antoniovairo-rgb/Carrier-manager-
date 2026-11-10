#!/usr/bin/env node
/* [giro 141 PO-341/PO-342 guardiano — foto PO docs/collaudo-po/187-partita2d-colori-folla.jpg (ramo poc/marioprada-character-system),
   SIC (rosa) - PAR (arancio), Primavera 2: «sui cartelloni pubblicitari i colori sono mischiati» e «la densita' dei tifosi nella partita 2D
   deve essere realistica come nella 3D»].
   Monta il Campo2D VERO coi colori che la partita gli passa (selectMatchKits) e col contesto folla della partita (computeCrowdContext con la
   capienza di stadiumConfigFor, cioe' la stessa affluenza della MatchdayCard e dello stadio 3D), su DUE stadi (uno grande di campionato e il
   campo Primavera della foto), IN CASA e IN TRASFERTA (l'eroe e' la squadra di casa o quella ospite: cambia la maglia dei pallini, mai il
   padrone dello stadio), in DUE formati (360x800 tocco, 1440x900 mouse).
   C) CARTELLONI: per ogni pannello (stessa griglia del disegno) si legge il colore al centro e lo si assegna alla famiglia piu' vicina
      (cartelloni di casa / cartelloni ospiti, palette di _spalti109); il padrone atteso e' quello del suo settore secondo la mappa unica
      (_settore141/_padrone141 su settoriFolla141). Criterio: quota di pannelli col colore del padrone >= SOGLIA_CART su ogni misura.
   O) DENSITA': fra i pixel degli spalti (fuori dai cartelloni) di ogni gruppo settore x padrone, quota di TIFOSI fra tifosi + SEDILI vuoti
      (pixel assegnati al piu' vicino fra fondo, sedile e le tre tinte dei tifosi di quel padrone). Criterio: |quota - riempimento del
      settore| <= SOGLIA_OCC (0,06: fissata dopo la misura, verde entro 2 punti) su ogni gruppo con almeno MIN_PX pixel; le due CURVE devono essere
      giudicate su ogni misura («non giudicato» = rosso). Le tribune laterali al telefono sono una striscia piu' stretta di un posto: si
      giudicano solo dove hanno pixel.
      Dichiarato accanto: il conteggio del disegno (testimone __CPM_G141, posti/occupati) e i ms dello sfondo (una volta) e del fotogramma.
   P) PARTITA VERA (salvataggio Primavera del 297): il Campo2D riceve il contesto folla della partita (testimone con fill/capienza).
   [giro 143 PO-345] SECONDO TEMPO: ogni misura si ripete con tempo=2, quando lo stadio e' ruotato di 180 gradi come nel 3D (7.732): il
   settore atteso e' quello del punto simmetrico; S) il settore ospiti dichiarato (lampo del gol) sta dietro la porta giusta; nella partita
   vera il cronometro portato al 52' scambia le curve e lo sfondo si ridisegna UNA volta.
   ROSSO: CPM_PROVA_ROSSO=1 rigira tutto con __CPM_NO_G141 (la 7.999.188) e pretende che C e O cadano; poi con __CPM_NO_G143 (curve fisse)
   e pretende che cada ogni misura del secondo tempo e nessuna del primo. Stampati per ultimi: verde e rossi.
   CPM_FOTO_141=<cartella> salva le foto (prima = rosso, dopo = verde). Non prova dispositivi veri. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const SCENARI = [
  { nome: 'grande', casa: 'liv', osp: 'ful', u18: false },
  { nome: 'primavera', casa: 'pal', osp: 'par', u18: true },
];
const FORMATI = { t360: { w: 360, h: 800, touch: true, top: 78, bot: 70 }, pc: { w: 1440, h: 900, touch: false, top: 90, bot: 60 } };
const SOGLIA_CART = +(process.env.CPM_S_CART141 || 0.95), SOGLIA_OCC = +(process.env.CPM_S_OCC141 || 0.06), MIN_PX = 150;
const ROSSO = !!process.env.CPM_PROVA_ROSSO, FOTO = process.env.CPM_FOTO_141 || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

const MISURA = ({ sc, trasf, top, bot, tempo }) => new Promise(res => {
  const pool = sc.u18 ? U18_CLUBS_P2.concat(U18_CLUBS) : CLUBS;
  const C = pool.find(c => c.id === sc.casa), O = pool.find(c => c.id === sc.osp), K = selectMatchKits(C, O);
  const st = (typeof stadiumConfigFor === 'function') ? stadiumConfigFor(C) : null;
  const folla = computeCrowdContext({ context: 'career', homeClub: C, matchWeight: 5, week: 9, season: 1, capacity: st ? st.capacity : null });
  let d = document.getElementById('sp141'); if (d) { try { d._root.unmount(); } catch (e) {} d.remove(); }
  d = document.createElement('div'); d.id = 'sp141'; d.style.cssText = `position:fixed;left:0;top:${top}px;width:100vw;height:calc(100vh - ${top + bot}px);z-index:99999;background:#000`;
  document.body.appendChild(d); const root = ReactDOM.createRoot(d); d._root = root;
  window.__CPM_G141 = {}; window.__CPM_W297 = {};
  const kE = trasf ? K.awayShirt : K.homeShirt, kA = trasf ? K.homeShirt : K.awayShirt;
  root.render(React.createElement(Campo2D, { folla, motore: null, kitCasa: kE, kitOspiti: kA, eroeLato: 'home', tifoCasa: K.homeShirt, tifoCasa2: K.homeAccent, tifoOsp: K.awayShirt, tifoOsp2: K.awayAccent, clubPrato: C, siglaCasa: C.a, siglaOspiti: O.a, tempo }));
  setTimeout(() => {
    const cv = d.querySelector('canvas'); const x = cv.getContext('2d'); const D = x.getImageData(0, 0, cv.width, cv.height).data;
    const dpr = cv.width / cv.clientWidth, W = cv.clientWidth, H = cv.clientHeight, vert = H >= W * 0.92, LUN = 105, LAR = 68;
    const padx = vert ? W * 0.035 : W * 0.02, pady = vert ? H * 0.02 : H * 0.035;
    const s = Math.min((W - padx * 2) / (vert ? LAR : LUN), (H - pady * 2) / (vert ? LUN : LAR)), pw = (vert ? LAR : LUN) * s, ph = (vert ? LUN : LAR) * s, ox = (W - pw) / 2, oy = (H - ph) / 2;
    const PX = (mx, my) => vert ? (ox + my * s) : (ox + mx * s), PY = (mx, my) => vert ? (oy + (LUN - mx) * s) : (oy + my * s);
    const est = _cart297(PX, PY, vert, LUN, LAR, s, W, H), sp = Math.max(3, s * 0.95), seg = Math.max(18, s * 7.5);
    const MS = _misure141(folla), F = settoriFolla141(folla, MS.sideW, MS.endW);
    /* [giro 143 PO-345] nel secondo tempo lo stadio e' ruotato di 180 gradi come nel 3D: il settore atteso di un punto e' quello del suo
       simmetrico rispetto al centro dell'erba esterna (calcolato qui, non letto dal gioco) */
    const ZZ = (X, Y) => tempo === 2 ? _settore141(est.x0 + est.x1 - X, est.y0 + est.y1 - Y, est, vert) : _settore141(X, Y, est, vert);
    const SP = _spalti109(K.homeShirt, K.homeAccent, K.awayShirt, K.awayAccent);
    const rgb = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const dist = (a, b) => { const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
    const px = (X, Y) => { const i = (Math.round(Y * dpr) * cv.width + Math.round(X * dpr)) * 4; return [D[i], D[i + 1], D[i + 2]]; };
    /* C) cartelloni: la stessa griglia del disegno */
    const pann = []; const add = (X, Y, w, h) => pann.push([X, Y, w, h]);
    for (let X = est.x0; X < est.x1; X += seg) { const w = Math.min(seg - 1, est.x1 - X); add(X, est.y0 - sp, w, sp); add(X, est.y1, w, sp); }
    for (let Y = est.y0 - sp; Y < est.y1 + sp; Y += seg) { const h = Math.min(seg - 1, est.y1 + sp - Y); add(est.x0 - sp, Y, sp, h); add(est.x1, Y, sp, h); }
    const famC = SP.cartC.map(rgb), famO = SP.cartO.map(rgb);
    const lati = {}; let ok = 0, giud = 0;
    for (const [X, Y, w, h] of pann) { if (w < 3 || h < 3) continue; const z = ZZ(X + w / 2, Y + h / 2), own = _padrone141(z, F);
      const p = px(X + w / 2, Y + h * 0.65), dc = Math.min(...famC.map(c => dist(p, c))), dO = Math.min(...famO.map(c => dist(p, c)));
      if (Math.abs(dc - dO) < 8) continue; /* ambiguo: le due palette hanno un tono quasi uguale */
      const vis = dc < dO ? 'casa' : 'osp'; giud++; if (vis === own) ok++;
      const L = (lati[z.k] = lati[z.k] || { casa: 0, osp: 0, attesoCasa: 0, attesoOsp: 0 }); L[vis]++; if (own === 'casa') L.attesoCasa++; else L.attesoOsp++; }
    /* O) densita' per gruppo settore x padrone */
    const seatOf = h => rgb((() => { const a = rgb(h), t = rgb('#3c424e'); return '#' + a.map((v, i) => Math.max(0, Math.min(255, Math.round((v + (t[i] - v) * 0.70) * 0.82))).toString(16).padStart(2, '0')).join(''); })());
    const base = rgb(SP.base), seatC = seatOf(SP.casa[0]), seatO = seatOf(SP.osp[0]);
    const palC = SP.casa.map(rgb), palO = SP.osp.map(rgb);
    const G = {}; const outer = [est.x0 - sp - 1, est.y0 - sp - 1, est.x1 + sp + 1, est.y1 + sp + 1];
    for (let yy = 0.5; yy < H; yy += 0.5) for (let xx = 0.5; xx < W; xx += 0.5) {
      if (xx > outer[0] && xx < outer[2] && yy > outer[1] && yy < outer[3]) continue;
      const z = ZZ(xx, yy), own = _padrone141(z, F), pal = own === 'osp' ? palO : palC, p = px(xx, yy);
      const dF = Math.min(...pal.map(c => dist(p, c))), dS = dist(p, own === 'osp' ? seatO : seatC), dB = dist(p, base);
      const k = z.k + ':' + own, g = (G[k] = G[k] || { fan: 0, seat: 0, base: 0, atteso: +_fill141(z, F).toFixed(3) });
      if (dF <= dS && dF <= dB && dF < 70) g.fan++; else if (dS < dB && dS < 40) g.seat++; else g.base++; }
    const gruppi = Object.entries(G).map(([k, g]) => ({ k, n: g.fan + g.seat, occ: +(g.fan / Math.max(1, g.fan + g.seat)).toFixed(3), atteso: g.atteso }));
    const Wt = window.__CPM_G141 && window.__CPM_G141.T ? window.__CPM_G141.T : null, W297 = window.__CPM_W297 || {};
    /* S) il settore ospiti dichiarato (lo usa il lampo del gol): dietro la porta che difende la squadra in basso nel primo tempo, dietro
       quella che attacca nel secondo. Si legge dal testimone; senza testimone = non giudicato */
    const GW = window.__CPM_G141 || {}, q = GW.ospRect || null;
    const lato = !q ? null : vert ? (q[1] + q[3] <= est.y0 + 3 ? 'alto' : q[1] >= est.y1 - 3 ? 'basso' : 'mezzo') : (q[0] >= est.x1 - 3 ? 'destra' : q[0] + q[2] <= est.x0 + 3 ? 'sinistra' : 'mezzo');
    const latoAtteso = vert ? (tempo === 2 ? 'alto' : 'basso') : (tempo === 2 ? 'destra' : 'sinistra');
    res({ tempo, ospLato: lato, ospAtteso: latoAtteso, rifatti: GW.n143 == null ? null : GW.n143, coppia: `${C.a} v ${O.a}`, trasf, fill: folla.fill, awayFill: folla.awayFill, cap: folla.capacity, att: folla.attendance, F: { curvaCasa: +F.curvaCasa.toFixed(3), curvaOsp: +F.curvaOsp.toFixed(3), tribuna: +F.tribuna.toFixed(3), wedge: F.wedge, wedgeFill: +F.wedgeFill.toFixed(3) },
      cart: { ok, giud, quota: +(ok / Math.max(1, giud)).toFixed(3), lati }, gruppi, disegno: Wt, msSfondo: window.__CPM_G141 && window.__CPM_G141.msSfondo, on: !!(window.__CPM_G141 && window.__CPM_G141.on) });
  }, 1200);
});

async function giro(rosso, rosso143) {
  const righe = [];
  for (const [fk, f] of Object.entries(FORMATI)) {
    const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 2, serviceWorkers: 'block' }; if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
    const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    if (rosso) await page.addInitScript(() => { window.__CPM_NO_G141 = true; });
    if (rosso143) await page.addInitScript(() => { window.__CPM_NO_G143 = true; });
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => typeof Campo2D === 'function' && typeof settoriFolla141 === 'function' && document.querySelector('button'), null, { timeout: 90000 }); await sleep(800);
    for (const tempo of [1, 2]) for (const sc of SCENARI) for (const trasf of [false, true]) {
      const m = await page.evaluate(MISURA, { sc, trasf, top: f.top, bot: f.bot, tempo }); m.formato = fk; m.sc = sc.nome; righe.push(m);
      if (FOTO) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${rosso ? 'rosso141' : rosso143 ? 'prima' : 'dopo'}-${fk}-${sc.nome}-${trasf ? 'trasferta' : 'casa'}-t${tempo}.png` }); }
    }
    if (errs.length) righe.push({ ko: 'pageerror: ' + errs.slice(0, 2).join(' | '), formato: fk });
    await ctx.close();
  }
  return righe;
}
function giudica(m) {
  if (m.ko) return [m.ko];
  const k = [];
  if (!m.ospLato) k.push('S settore ospiti non dichiarato dal testimone (non giudicato)');
  else if (m.ospLato !== m.ospAtteso) k.push(`S settore ospiti ${m.ospLato}, atteso ${m.ospAtteso} (tempo ${m.tempo})`);
  if (m.cart.giud < 8) k.push(`C cartelloni giudicati ${m.cart.giud} < 8 (non giudicato)`);
  else if (m.cart.quota < SOGLIA_CART) k.push(`C cartelloni col colore del padrone ${(m.cart.quota * 100).toFixed(0)}% < ${SOGLIA_CART * 100}%`);
  const gg = m.gruppi.filter(g => g.n >= MIN_PX);
  for (const need of ['curvaCasa:casa', 'curvaOsp:osp']) if (!gg.some(g => g.k === need)) k.push(`O ${need} non giudicato (meno di ${MIN_PX} pixel)`);
  for (const g of gg) if (Math.abs(g.occ - g.atteso) > SOGLIA_OCC) k.push(`O ${g.k} occupati ${(g.occ * 100).toFixed(0)}% vs ${(g.atteso * 100).toFixed(0)}%`);
  return k;
}
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
async function partita(rosso, rosso143) {
  const mis = {}; const opt = { viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, serviceWorkers: 'block', hasTouch: true, isMobile: true };
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_G141 = true; });
  if (rosso143) await page.addInitScript(() => { window.__CPM_NO_G143 = true; });
  await page.addInitScript(s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} window.__CPM_W297 = {}; window.__CPM_G141 = {}; }, SAVE);
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
    await page.waitForFunction(() => window.__CPM_PHASE() === 'playing' && window.__CPM_W297 && window.__CPM_W297.campo, null, { timeout: 60000 }); await sleep(2500);
    mis.g = await page.evaluate(() => { const G = window.__CPM_G141 || {}; return { on: !!G.on, folla: G.folla || null, T: G.T || null, msSfondo: (window.__CPM_W297 || {}).msSfondo }; });
    const ms = []; for (let i = 0; i < 30; i++) { await sleep(100); const v = await page.evaluate(() => (window.__CPM_W297 || {}).ms); if (typeof v === 'number') ms.push(v); }
    ms.sort((a, c) => a - c); mis.ms = { n: ms.length, mediana: ms.length ? ms[ms.length >> 1] : null, p90: ms.length ? ms[Math.floor(ms.length * 0.9)] : null };
    const LATO = () => { const G = window.__CPM_G141 || {}, q = G.ospRect, e = G.erba; if (!q || !e) return null; return G.vert ? (q[1] + q[3] <= e[1] + 3 ? 'alto' : q[1] >= e[3] - 3 ? 'basso' : 'mezzo') : (q[0] >= e[2] - 3 ? 'destra' : q[0] + q[2] <= e[0] + 3 ? 'sinistra' : 'mezzo'); };
    const tag = rosso ? 'rosso141' : rosso143 ? 'prima' : 'dopo';
    if (FOTO) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${tag}-partita-t360-t1.png` }); }
    /* [giro 143] il secondo tempo dalla partita vera: il minuto lo porta il cronometro di LiveMatch (la stessa fonte di half del 3D) */
    mis.t1 = await page.evaluate(LATO); mis.n1 = await page.evaluate(() => (window.__CPM_G141 || {}).n143);
    await page.evaluate(() => window.__CPM_SALTA297(52)); await sleep(800);
    for (let i = 0; i < 60; i++) { if (await page.evaluate(() => window.__CPM_PHASE() === 'playing')) break; await sleep(500); } await sleep(2500);
    mis.fase2 = await page.evaluate(() => window.__CPM_PHASE()); mis.t2 = await page.evaluate(LATO); mis.n2 = await page.evaluate(() => (window.__CPM_G141 || {}).n143);
    await sleep(1500); mis.n2b = await page.evaluate(() => (window.__CPM_G141 || {}).n143);
    if (FOTO) await page.screenshot({ path: `${FOTO}/${tag}-partita-t360-t2.png` });
  } catch (e) { mis.ko = 'eccezione: ' + String(e && e.message || e).slice(0, 160); }
  if (errs.length) mis.ko = (mis.ko || '') + ' pageerror: ' + errs.slice(0, 2).join(' | ');
  await ctx.close(); return mis;
}
const giudicaP = m => { if (m.ko) return [m.ko]; if (!m.g || !m.g.on) return ['P spalti 141 spenti nella partita vera']; const k = [];
  if (!m.g.folla || m.g.folla.fill == null) k.push('P il Campo2D non riceve il contesto folla della partita');
  if (m.t1 !== 'basso') k.push(`P primo tempo: settore ospiti ${m.t1 || 'non giudicato'}, atteso basso`);
  if (m.t2 !== 'alto') k.push(`P secondo tempo (52', fase ${m.fase2}): settore ospiti ${m.t2 || 'non giudicato'}, atteso alto`);
  if (m.n2 == null || m.n1 == null) k.push('P ridisegni dello sfondo non dichiarati (non giudicato)');
  else if (m.n2b !== m.n2 || m.n2 - m.n1 > 1) k.push(`P lo sfondo si ridisegna piu' di una volta al cambio di tempo (${m.n1} -> ${m.n2} -> ${m.n2b})`);
  return k; };
const pc = v => (v * 100).toFixed(0).padStart(3) + '%';
const stampa = (r, tag) => { for (const m of r) { if (m.ko) { console.log(tag, m.formato, m.ko); continue; }
  const gr = m.gruppi.filter(g => g.n >= MIN_PX).map(g => `${g.k} ${pc(g.occ)}/${pc(g.atteso)}`).join(' · ');
  const dis = m.disegno ? Object.entries(m.disegno).map(([k, v]) => `${k} ${v.casa.occ}/${v.casa.posti}` + (v.osp.posti ? `+osp ${v.osp.occ}/${v.osp.posti}` : '')).join(' ') : '—';
  console.log(`${tag} ${m.formato.padEnd(4)} ${m.sc.padEnd(9)} ${m.trasf ? 'trasf' : 'casa '} ${m.coppia} fill ${m.fill} aw ${m.awayFill} cap ${m.cap} att ${m.att} | cart ${m.cart.ok}/${m.cart.giud} ${JSON.stringify(m.cart.lati)} | occ ${gr} | disegno ${dis} | sfondo ${m.msSfondo}ms | ${giudica(m).join(' · ') || 'OK'}`); } };
let esito = 0;
const linP = (tag, p) => console.log(tag + ' partita', JSON.stringify(p.g && { on: p.g.on, folla: p.g.folla, msSfondo: p.g.msSfondo }), 'ms fotogramma', JSON.stringify(p.ms), `ospiti 1T ${p.t1} 2T ${p.t2} ridisegni ${p.n1}->${p.n2}->${p.n2b}`, giudicaP(p).join(' · ') || 'OK');
const verde = await giro(false, false); const pv = await partita(false, false);
let rosso = null, pr = null, r3 = null, pr3 = null;
if (ROSSO) { rosso = await giro(true, false); pr = await partita(true, false); r3 = await giro(false, true); pr3 = await partita(false, true); }
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true }); fs.writeFileSync(new URL('./out/partita2d-141.json', import.meta.url), JSON.stringify({ verde, pv, rosso, pr, r3, pr3 }, null, 1));
/* verde e rossi stampati per ultimi */
stampa(verde, 'VERDE'); linP('VERDE', pv);
if (ROSSO) { stampa(rosso, 'ROSSO141'); linP('ROSSO141', pr); stampa(r3, 'ROSSO143'); linP('ROSSO143', pr3); }
const kv = verde.filter(m => giudica(m).length); const kp = giudicaP(pv);
if (kv.length || kp.length || verde.length < 16) { console.log(`❌ verde: ${kv.length}/${verde.length} misure fuori criterio${kp.length ? ' · ' + kp.join(' · ') : ''}`); esito = 1; }
else console.log(`✅ verde: ${verde.length} misure nel criterio (cartelloni per settore >= ${SOGLIA_CART * 100}%, occupati entro ${SOGLIA_OCC * 100} punti dal settore) + partita vera col contesto folla`);
if (ROSSO) { const cc = rosso.filter(m => m.cart && m.cart.quota < SOGLIA_CART).length, oo = rosso.filter(m => giudica(m).some(t => t.startsWith('O'))).length;
  if (!cc || !oo) { console.log(`❌ rosso: con __CPM_NO_G141 cartelloni cadono su ${cc} e densita' su ${oo} misure — il guardiano non vede la 7.999.188`); esito = 1; }
  else console.log(`✅ rosso: __CPM_NO_G141 cade sui cartelloni in ${cc}/${rosso.length} misure e sulla densita' in ${oo}/${rosso.length}`);
  /* [giro 143] __CPM_NO_G143: deve cadere su OGNI misura del secondo tempo e sulla partita vera, e restare verde sul primo tempo */
  const t2 = r3.filter(m => m.tempo === 2), t1 = r3.filter(m => m.tempo === 1), c2 = t2.filter(m => giudica(m).length).length, c1 = t1.filter(m => giudica(m).length).length, cp = giudicaP(pr3).some(t => t.startsWith('P secondo tempo'));
  if (c2 !== t2.length || !t2.length || c1 || !cp) { console.log(`❌ rosso143: con __CPM_NO_G143 cadono ${c2}/${t2.length} misure del secondo tempo, ${c1}/${t1.length} del primo, partita vera ${cp ? 'cade' : 'NON cade'} — il guardiano non vede lo scambio`); esito = 1; }
  else console.log(`✅ rosso143: __CPM_NO_G143 cade su ${c2}/${t2.length} misure del secondo tempo e sulla partita vera; primo tempo verde ${t1.length - c1}/${t1.length}`); }
srv.close(); await b.close(); process.exit(esito);
