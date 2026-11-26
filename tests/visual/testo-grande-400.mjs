#!/usr/bin/env node
/* [giro 400 · PO-575] IL TESTO INGRANDITO. Chi sul telefono ha il carattere di sistema al 130% o al 200% (accessibilita')
   vede il gioco con tutti i corpi moltiplicati: le scritte possono finire tagliate, una sull'altra, fuori dallo schermo, e un
   tasto puo' finire sotto un altro elemento o fuori dal bordo. Questo guardiano lo misura sui RETTANGOLI DEL DOM.

   COME SI INGRANDISCE (dichiarato): Chromium headless con viewport da telefono (`isMobile`) e `text-size-adjust: N%` sulla
   radice — e' il moltiplicatore dei corpi che Chrome per Android applica col «ridimensionamento del testo» e che la WebView usa
   per il carattere di sistema. Moltiplica anche i corpi scritti in px (misurato: 14 px -> 18,2 px a 130%). NON e' un Android
   vero: font di sistema, tocco e barra di sistema restano fuori. A ogni misura la sonda CONTROLLA che l'ingrandimento sia
   davvero in pagina (corpo di un testo campione / corpo a 100% = scala ± 3%): se non lo e', la misura e' «non giudicata».

   LE QUATTRO GRANDEZZE (per ogni nodo di testo visibile e per ogni tasto):
     tagliato     — ellissi attiva (text-overflow + scrollWidth > clientWidth), riga troncata da -webkit-line-clamp, oppure il
                    rettangolo del testo esce di oltre 2 px da un antenato che lo RITAGLIA (overflow hidden/clip). Un antenato
                    che SCORRE (auto/scroll) lo contiene: li' il testo si raggiunge scorrendo, non e' tagliato.
     sovrapposto  — due testi di elementi diversi (nessuno contiene l'altro), nello stesso strato (stesso antenato fisso o
                    entrambi nel flusso), con intersezione >= 30% dell'area del piu' piccolo e >= 12 px².
     fuori        — il testo esce dallo schermo in larghezza senza un antenato che scorre o ritaglia, oppure (in un
                    contenitore fisso) in altezza, oppure oltre la fine del documento.
     tasto        — un tasto (button, [role=button], a[href]) visibile e non disabilitato che, portato al centro dello schermo,
                    al suo centro non riceve il tocco (elementFromPoint finisce su un altro elemento), oppure esce dallo
                    schermo in larghezza.
   Sotto un velo (elemento fisso opaco a tutto schermo, es. Impostazioni sopra la Home) si misura SOLO il velo.

   VERDETTO: verde se TUTTE le misure (schermate x 3 scale x 5 larghezze) sono giudicate e nessun difetto di 130%/200% e'
   fuori dall'elenco dei difetti NOTI (`testo-grande-400-noti.json`, uno per uno con la foto nel rapporto del giro 400).
   Un difetto noto che sparisce e' stampato («guarito»: si toglie dall'elenco), non fa rosso. Soglie fisse, mai abbassate.
   «non giudicato» = rosso (uscita 1).

   ROSSO (prova che il guardiano vede):
     CPM_ROSSO400=fix    accende window.__CPM_NO_G400 (le correzioni del giro 400 tornano indietro) -> deve uscire 1;
     CPM_ROSSO400=banco  alterazione DICHIARATA dal banco: un foglio di stile che vieta l'a-capo nei tasti e ritaglia
                         (`white-space:nowrap; overflow:hidden; text-overflow:ellipsis`) -> deve uscire 1.
     Mai rimettendo un tema (invariante «un tema solo»): nessuna delle due tocca i token.

   Uso:  npm run testo-grande-400        [CPM_SCHERMATE=home,carriera] [CPM_LARG=412] [CPM_FOTO=0] [CPM_ROSSO400=fix|banco]
         CPM_SCRIVI_NOTI=1 riscrive l'elenco dei noti con cio' che misura (solo a mano, dichiarato nel rapporto).
*/
import fs from 'node:fs';
import path from 'node:path';

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';

const { startServer, launchBrowser, installCdnRoutes, sleep, ROOT, openMatch } = await import('./lib/harness.mjs');
import { SAVE, INIT } from './lib/banco-g0.mjs';

let _finita = false;
const _err = tipo => e => {
  const msg = `${tipo}: ${String((e && (e.stack || e.message)) || e).split('\n').slice(0, 3).join(' ⏎ ').slice(0, 300)}`;
  if (_finita) { console.log(`⚠️ errore tardivo (non cambia l'esito): ${msg}`); return; }
  console.log(`❌ testo-grande-400 interrotto — ${msg}`); console.log('ESITO testo-grande-400: uscita 3 · MOTIVO errore asincrono'); process.exit(3);
};
process.on('unhandledRejection', _err('promessa rifiutata'));
process.on('uncaughtException', _err('eccezione'));

const SEME = +(process.env.CPM_SEME || 4242);
const FOTO = process.env.CPM_FOTO !== '0';
const ROSSO = process.env.CPM_ROSSO400 || '';
const SCALE = [100, 130, 200];
const TAGLIE_TUTTE = [{ w: 360, h: 800 }, { w: 375, h: 667 }, { w: 390, h: 844 }, { w: 412, h: 915 }, { w: 430, h: 932 }];/* le cinque di griglia-mobile/design-system */
const _fl = (process.env.CPM_LARG || '').split(',').map(x => +x).filter(Boolean);
const TAGLIE = _fl.length ? TAGLIE_TUTTE.filter(t => _fl.includes(t.w)) : TAGLIE_TUTTE;
const SCHERMATE = [
  { id: 'home', nome: 'Home' }, { id: 'impostazioni', nome: 'Impostazioni' }, { id: 'carriera', nome: 'Carriera (dashboard)' },
  { id: 'prepartita', nome: 'Pre-partita' }, { id: 'partita', nome: 'Partita (HUD)' }, { id: 'fine-partita', nome: 'Fine partita' },
];
const _fs = (process.env.CPM_SCHERMATE || '').split(',').map(x => x.trim()).filter(Boolean);
const VOLUTE = _fs.length ? SCHERMATE.filter(s => _fs.includes(s.id)) : SCHERMATE;
const OUT = process.env.CPM_OUT ? path.resolve(process.env.CPM_OUT) : path.join(ROOT, 'docs', 'collaudo-grafico', 'testo-grande-400');
const NOTI_F = path.join(path.dirname(new URL(import.meta.url).pathname), 'testo-grande-400-noti.json');
const NOTI = fs.existsSync(NOTI_F) ? JSON.parse(fs.readFileSync(NOTI_F, 'utf8')) : { noti: [] };

/* ── la misura (dentro la pagina) ─────────────────────────────────────────────────────────── */
function MISURA400() {
  const W = innerWidth, H = innerHeight, de = document.documentElement;
  const R = { nTesti: 0, nTasti: 0, difetti: [], campione: null };
  const cs = el => getComputedStyle(el);
  const opaco = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return false; const p = m[1].split(',').map(x => +x); return p.length < 4 || p[3] > 0.9; };
  /* visibile: niente display/visibility/opacita' spenti, e niente testo «solo lettore di schermo» (riquadro <= 2 px che ritaglia,
     come .cpm-sr): non si vede per costruzione, non puo' essere tagliato ne' sovrapposto agli occhi */
  const visibile = el => { for (let e = el; e && e !== de; e = e.parentElement) { const s = cs(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.1) return false;
    if (/hidden|clip/.test(s.overflowX + s.overflowY) || s.clip !== 'auto') { const r = e.getBoundingClientRect(); if (r.width <= 2 || r.height <= 2) return false; } } return true; };
  /* velo: l'ultimo elemento fisso opaco che copre tutto lo schermo */
  let radice = document.body;
  for (const el of document.body.querySelectorAll('*')) {
    const s = cs(el); if (s.position !== 'fixed') continue;
    const r = el.getBoundingClientRect(); if (r.width < W * 0.98 || r.height < H * 0.98 || r.left > 1 || r.top > 1) continue;
    if (!opaco(s.backgroundColor) || !visibile(el)) continue;
    if (el.querySelector('canvas')) continue;/* la scena 3D della partita non e' un velo: l'HUD le sta sopra */
    radice = el;
  }
  const sig = el => { let d = el.closest('[data-cpm]'); const c = (el.className && typeof el.className === 'string') ? el.className.split(/\s+/)[0] : '';
    return `${el.tagName.toLowerCase()}${c ? '.' + c : ''}${d ? '@' + d.getAttribute('data-cpm') : ''}`; };
  const norm = t => (t || '').replace(/\s+/g, ' ').trim().replace(/\d+/g, '#').slice(0, 32);
  const visti = new Set();
  const add = (tipo, el, testo, extra) => { const k = `${tipo}|${sig(el)}|${norm(testo)}`; if (visti.has(k)) return; visti.add(k); R.difetti.push({ k, tipo, extra }); };
  const strato = el => { for (let e = el; e && e !== de; e = e.parentElement) { const p = cs(e).position; if (p === 'fixed' || p === 'sticky') return e; } return null; };
  const unione = rr => { let l = 1e9, t = 1e9, r = -1e9, b = -1e9; for (const x of rr) { if (x.width < 0.5 || x.height < 0.5) continue; l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); b = Math.max(b, x.bottom); } return r > l ? { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t } : null; };
  /* per le sovrapposizioni conta solo la parte VISIBILE di un testo: quella dentro tutti gli antenati che ritagliano o scorrono */
  const ritaglia = (el, rr) => { let out = rr.map(x => ({ left: x.left, top: x.top, right: x.right, bottom: x.bottom }));
    for (let e = el; e && e !== de && out.length; e = e.parentElement) { const s = cs(e); const cx = s.overflowX !== 'visible', cy = s.overflowY !== 'visible';
      if (cx || cy) { const r = e.getBoundingClientRect(); out = out.map(x => ({ left: cx ? Math.max(x.left, r.left) : x.left, right: cx ? Math.min(x.right, r.right) : x.right, top: cy ? Math.max(x.top, r.top) : x.top, bottom: cy ? Math.min(x.bottom, r.bottom) : x.bottom })).filter(x => x.right - x.left >= 0.5 && x.bottom - x.top >= 0.5); }
      if (s.position === 'fixed') break; }
    return out.map(x => ({ ...x, width: x.right - x.left, height: x.bottom - x.top })); };
  window.scrollTo(0, 0);
  const sy = 0;
  const testi = [];
  const tw = document.createTreeWalker(radice, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const t = n.nodeValue; if (!t || !t.trim()) continue;
    const el = n.parentElement; if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/.test(el.tagName)) continue;
    if (!visibile(el)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const u = unione([...rg.getClientRects()]); if (!u) continue;
    R.nTesti++; testi.push({ el, t, u, rr: ritaglia(el, [...rg.getClientRects()].filter(x => x.width >= 0.5 && x.height >= 0.5)), st: strato(el) });
    if (!R.campione && /\p{L}{3}/u.test(t)) R.campione = { fs: parseFloat(cs(el).fontSize), k: sig(el) + '|' + norm(t) };
    /* tagliato / fuori: si risale dagli antenati */
    let xLib = true, yLib = true, fisso = false;
    for (let e = el; e && e !== de && e !== document.body; e = e.parentElement) {
      const s = cs(e);
      if (e === el || e.contains(el)) {
        if (s.textOverflow === 'ellipsis' && /hidden|clip/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1) { add('tagliato', el, t, 'ellissi'); xLib = false; }
        const lc = s.webkitLineClamp || s.getPropertyValue('-webkit-line-clamp'); if (lc && lc !== 'none' && e.scrollHeight > e.clientHeight + 1) add('tagliato', el, t, 'line-clamp');
      }
      const r = e.getBoundingClientRect();
      if (xLib) {
        if (/hidden|clip/.test(s.overflowX)) { if (u.left < r.left - 2 || u.right > r.right + 2) add('tagliato', el, t, `x ${Math.round(Math.max(r.left - u.left, u.right - r.right))}px`); xLib = false; }
        else if (/auto|scroll/.test(s.overflowX)) xLib = false;
      }
      if (yLib) {
        if (/hidden|clip/.test(s.overflowY)) { if (u.top < r.top - 2 || u.bottom > r.bottom + 2) add('tagliato', el, t, `y ${Math.round(Math.max(r.top - u.top, u.bottom - r.bottom))}px`); yLib = false; }
        else if (/auto|scroll/.test(s.overflowY)) yLib = false;
      }
      if (s.position === 'fixed') { fisso = true; break; }
    }
    /* esce dal suo tasto: il testo sborda dal riquadro del tasto (o della linguetta) che lo contiene e invade i vicini — e' la
       sovrapposizione che le coppie testo-testo non vedono quando le parole si toccano appena (barra di navigazione a 200%) */
    const tb = el.closest('button,[role=button],[role=tab],a[href]');
    if (tb && radice.contains(tb)) { const r = tb.getBoundingClientRect(); const vis = ritaglia(el, [...rg.getClientRects()]); const vu = unione(vis);
      if (vu && (vu.left < r.left - 2 || vu.right > r.right + 2)) add('sovrapposto', el, t, `esce dal tasto di ${Math.round(Math.max(r.left - vu.left, vu.right - r.right))}px`); }
    if (xLib && (u.right > W + 1 || u.left < -1)) add('fuori', el, t, `x ${Math.round(Math.max(u.right - W, -u.left))}px`);
    if (yLib && fisso && (u.bottom > H + 1 || u.top < -1)) add('fuori', el, t, `y ${Math.round(Math.max(u.bottom - H, -u.top))}px`);
    if (yLib && !fisso && u.bottom + sy > de.scrollHeight + 1) add('fuori', el, t, 'oltre il documento');
  }
  /* sovrapposti: coppie nello stesso strato */
  for (let i = 0; i < testi.length; i++) for (let j = i + 1; j < testi.length; j++) {
    const a = testi[i], b = testi[j]; if (a.el === b.el || a.st !== b.st || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const ix0 = Math.min(a.u.right, b.u.right) - Math.max(a.u.left, b.u.left), iy0 = Math.min(a.u.bottom, b.u.bottom) - Math.max(a.u.top, b.u.top);
    if (ix0 <= 0 || iy0 <= 0) continue;
    /* riga per riga: il rettangolo unione di un testo su due righe copre i vicini in linea senza toccarli */
    let peggio = 0;
    for (const p of a.rr) for (const q of b.rr) { const ix = Math.min(p.right, q.right) - Math.max(p.left, q.left), iy = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
      if (ix <= 0 || iy <= 0) continue; const ar = ix * iy, min = Math.min(p.width * p.height, q.width * q.height); if (ar >= 12 && ar >= 0.3 * min) peggio = Math.max(peggio, ar / min); }
    if (peggio) add('sovrapposto', a.el, a.t + ' ⟷ ' + b.t, `${Math.round(100 * peggio)}%`);
  }
  /* tasti: portati al centro, il tocco al centro deve arrivare a loro */
  /* tutti gli scorrimenti si riportano dov'erano (anche quelli a 0 che scrollIntoView sposta): la misura dopo deve trovare la stessa pagina */
  const salvati = []; for (const e of document.querySelectorAll('*')) if (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth) salvati.push([e, e.scrollTop, e.scrollLeft]);
  const tasti = [...radice.querySelectorAll('button,[role=button],a[href]')].filter(b => !b.disabled && b.getAttribute('aria-disabled') !== 'true' && visibile(b));
  for (const b of tasti) {
    let r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
    R.nTasti++; const testo = (b.textContent || b.getAttribute('aria-label') || '').trim() || '(senza testo)';
    try { b.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); } catch (_e) { b.scrollIntoView(); }
    r = b.getBoundingClientRect();
    let xOk = true; for (let e = b.parentElement; e && e !== de; e = e.parentElement) { if (/auto|scroll|hidden|clip/.test(cs(e).overflowX)) { xOk = false; break; } }
    if (xOk && (r.right > W + 1 || r.left < -1)) { add('tasto', b, testo, `fuori x ${Math.round(Math.max(r.right - W, -r.left))}px`); continue; }
    const cx = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    if (cs(b).pointerEvents === 'none') continue;
    const h = document.elementFromPoint(cx, cy);
    if (!h) { add('tasto', b, testo, 'nessun elemento al centro'); continue; }
    if (h === b || b.contains(h) || h.contains(b)) continue;
    add('tasto', b, testo, `coperto da ${sig(h)}`);
  }
  window.scrollTo(0, 0); for (const [e, t, l] of salvati) { e.scrollTop = t; e.scrollLeft = l; }
  R.radice = radice === document.body ? 'body' : sig(radice);
  return R;
}

/* ── attese e pagina ──────────────────────────────────────────────────────────────────────── */
const testoNorm = p => p.evaluate(() => ((document.body.textContent || '').replace(/\d{1,2}:\d{2}/g, '·').replace(/\s+/g, ' ') + '|' + document.body.querySelectorAll('*').length));
async function attendiFermo(page, { min = 350, max = 5000, passo = 250 } = {}) {
  await sleep(min); let prev = null, ug = 0; const t0 = Date.now();
  while (Date.now() - t0 < max) { let t = null; try { t = await testoNorm(page); } catch (_e) {} if (t != null && t === prev) { if (++ug >= 2) return true; } else { ug = 0; prev = t; } await sleep(passo); }
  return false;
}
async function scala(page, pc) {
  await page.evaluate(({ pc, banco }) => {
    let st = document.getElementById('__g400'); if (!st) { st = document.createElement('style'); st.id = '__g400'; document.head.appendChild(st); }
    st.textContent = `html{-webkit-text-size-adjust:${pc}%!important;text-size-adjust:${pc}%!important;scroll-behavior:auto!important}*,*::before,*::after{transition:none!important}`
      + (banco ? 'button{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}' : '');
    (document.getAnimations ? document.getAnimations() : []).forEach(a => { try { const t = a.effect.getComputedTiming(); if (t.iterations === Infinity || t.duration === Infinity) { a.currentTime = 0; a.pause(); } else a.finish(); } catch (_e) {} });
  }, { pc, banco: ROSSO === 'banco' });
}
const DATI = {}; const nonGiudicate = []; const errori = [];
const dirFoto = path.join(OUT, 'foto');
async function misuraTutte(page, sc, { fermo = true } = {}) {
  for (const t of TAGLIE) {
    await page.setViewportSize({ width: t.w, height: t.h });
    let base = null;
    for (const pc of SCALE) {
      await scala(page, pc); await sleep(200);
      if (fermo) await attendiFermo(page); else await sleep(600);
      let m; try { m = await page.evaluate(MISURA400); } catch (e) { nonGiudicate.push(`${sc.id}@${t.w}/${pc}%: ${String(e.message).slice(0, 80)}`); continue; }
      if (pc === 100) base = m.campione;
      /* l'ingrandimento e' davvero in pagina? stesso testo campione, corpo in scala */
      if (pc !== 100) {
        const c = m.campione; const rap = base && c && c.k === base.k ? c.fs / base.fs : null;
        m.rapporto = rap;
        if (rap == null) nonGiudicate.push(`${sc.id}@${t.w}/${pc}%: testo campione cambiato fra 100% e ${pc}% — scala non verificabile`);
        else if (Math.abs(rap - pc / 100) > 0.03 * pc / 100) nonGiudicate.push(`${sc.id}@${t.w}/${pc}%: testo campione a ${rap.toFixed(2)}x invece di ${pc / 100}x — l'ingrandimento non e' in pagina`);
      }
      ((DATI[sc.id] = DATI[sc.id] || {})[t.w] = DATI[sc.id][t.w] || {})[pc] = m;
      if (FOTO && t.w === 412) { fs.mkdirSync(dirFoto, { recursive: true }); try { await page.screenshot({ path: path.join(dirFoto, `${sc.id}-${pc}.png`), animations: 'disabled', caret: 'hide', timeout: 30000 }); } catch (_e) {} }
      const c = {}; m.difetti.forEach(d => { c[d.tipo] = (c[d.tipo] || 0) + 1; });
      console.log(`  ${String(t.w).padStart(3)}px ${String(pc).padStart(3)}% ${sc.id.padEnd(13)} testi ${String(m.nTesti).padStart(4)} · tasti ${String(m.nTasti).padStart(3)} · tagliati ${c.tagliato || 0} · sovrapposti ${c.sovrapposto || 0} · fuori ${c.fuori || 0} · tasti irr. ${c.tasto || 0}${m.rapporto ? ` · scala ${m.rapporto.toFixed(2)}x` : ''}`);
    }
    await scala(page, 100);
  }
}
async function apri(browser, port, initArg, query) {
  const page = await browser.newPage({ viewport: { width: TAGLIE[0].w, height: TAGLIE[0].h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errori.push(String(e.message).slice(0, 120)));
  await installCdnRoutes(page);
  await page.addInitScript(INIT, initArg);
  await page.addInitScript(r => { try { localStorage.setItem('cpm-match-speed', '2'); } catch (_e) {} if (r === 'fix') window.__CPM_NO_G400 = true; }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return page;
}
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const b = [...document.querySelectorAll('button')].find(x => r.test((x.textContent || '').trim() || x.getAttribute('aria-label') || '')); if (b) { b.click(); return true; } return null; }, rx);
const vuole = id => VOLUTE.some(s => s.id === id);
const SC = id => SCHERMATE.find(s => s.id === id);

/* ── corsa ─────────────────────────────────────────────────────────────────────────────────── */
const HTML = path.join(ROOT, 'CARRIER-MANAGER-AV.html');
const VER = (() => { const m = /const GAME_VERSION\s*=\s*["']([^"']+)/.exec(fs.readFileSync(HTML, 'utf8')); return m ? m[1] : '?'; })();
console.log(`testo-grande-400 · build ${VER} · scale ${SCALE.join('/')}% · larghezze ${TAGLIE.map(t => t.w).join('/')} · ${ROSSO ? 'BRACCIO ROSSO ' + ROSSO : 'braccio verde'}`);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const T0 = Date.now();

if (vuole('home') || vuole('impostazioni')) {
  const page = await apri(browser, port, { seme: SEME, tema: 'chiaro', rossi: [] }, '?cpmtest=1');
  if (vuole('home')) await misuraTutte(page, SC('home'));
  if (vuole('impostazioni')) { if (await premi(page, 'Opzioni')) await misuraTutte(page, SC('impostazioni')); else nonGiudicate.push('impostazioni: tasto Opzioni non trovato'); }
  await page.close();
}
if (vuole('carriera') || vuole('prepartita')) {
  const page = await apri(browser, port, { seme: SEME, tema: 'chiaro', rossi: [], save: SAVE }, '?cpmtest=1');
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) nonGiudicate.push('carriera: __CPM_CAREER mai comparso');
  else {
    await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(400);
    if (vuole('carriera')) { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(300); await misuraTutte(page, SC('carriera')); }
    if (vuole('prepartita')) {
      /* stessa via di griglia-mobile (giro 138/145): il salvataggio di prova non ha una gara di lega alla settimana corrente,
         se ne inietta una contro un club della classifica e si apre la pre-partita con la via del giocatore */
      let pm = await page.evaluate(() => window.__CPM_CAREER.playMatch()).catch(e => 'errore ' + e.message);
      if (pm === 'nomatch') {
        const st = await page.evaluate(() => { try { const g = window.__CPM_CAREER.get(); return { week: g.week, club: g.club, standings: g.standings }; } catch (e) { return null; } }).catch(() => null);
        const visti = {}; ((SAVE.player && SAVE.player.matchHistory) || []).forEach(h => { visti[h.opponent] = (visti[h.opponent] || 0) + 1; });
        const avv = st && (st.standings || []).find(r => r.id && r.id !== st.club && (visti[r.n] || 0) < 2);
        if (avv) { await page.evaluate(v => window.__CPM_CAREER.patch({ calendar: [v], weekLived: false }), { matchday: 99, week: st.week, opponentId: avv.id, opponentName: avv.n, isHome: true, played: false, result: null }); await sleep(400);
          pm = await page.evaluate(() => window.__CPM_CAREER.playMatch()).catch(e => 'errore ' + e.message); }
      }
      if (pm === true && await page.waitForFunction(() => /VS|OSPITE|CASA/.test(document.body.innerText || ''), null, { timeout: 40000 }).then(() => true).catch(() => false)) await misuraTutte(page, SC('prepartita'));
      else nonGiudicate.push('prepartita: non aperta (playMatch → ' + pm + ')');
    }
  }
  await page.close();
}
if (vuole('partita') || vuole('fine-partita')) {
  const page = await browser.newPage({ viewport: { width: TAGLIE[0].w, height: TAGLIE[0].h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errori.push('partita · ' + String(e.message).slice(0, 120)));
  await installCdnRoutes(page);
  await page.addInitScript(INIT, { seme: SEME, tema: 'chiaro', rossi: [] });
  await page.addInitScript(r => { try { localStorage.setItem('cpm-match-speed', '2'); } catch (_e) {} if (r === 'fix') window.__CPM_NO_G400 = true; }, ROSSO);
  let ok = false;
  try { await openMatch(page, port, { skipLoadAll: true, name: 'Grafica Probe' }); ok = true; } catch (e) { nonGiudicate.push('partita: apertura fallita — ' + String(e.message).slice(0, 80)); }
  if (ok) {
    try { await page.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEME); } catch (_e) {}
    if (vuole('partita')) {
      const minOk = await page.waitForFunction(() => { try { return (window.__CPM_CLOCK() | 0) >= 8 && window.__CPM_PHASE() === 'playing'; } catch (e) { return false; } }, null, { timeout: 240000 }).then(() => true).catch(() => false);
      if (minOk) { try { await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)); } catch (_e) {}
        /* l'HUD si misura con la partita VIVA (la pausa apre un suo riquadro e non e' piu' l'HUD): il testo della cronaca cambia,
           quindi sulla partita la chiave di un difetto non porta il testo (vedi chiaveSenzaTesto) */
        await misuraTutte(page, SC('partita'), { fermo: false });
        try { await page.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEME); } catch (_e) {}
      } else nonGiudicate.push("partita: minuto 8 in gioco fluido non arrivato entro 240 s");
    }
    if (vuole('fine-partita')) {
      let fine = false;
      for (let s = 0; s < 400 && !fine; s += 5) { const ph = await page.evaluate(() => { try { return window.__CPM_PHASE(); } catch (e) { return null; } }).catch(() => null); if (ph === 'ended' || ph === 'ceremony') fine = true; else await sleep(5000); }
      if (fine) { await sleep(1200); await misuraTutte(page, SC('fine-partita')); }
      else nonGiudicate.push('fine-partita: niente fischio entro 400 s');
    }
  }
  await page.close();
}
_finita = true;
try { await Promise.race([browser.close(), sleep(10000)]); } catch (_e) {}
try { if (srv.closeAllConnections) srv.closeAllConnections(); srv.close(); } catch (_e) {}

/* ── verdetto ──────────────────────────────────────────────────────────────────────────────── */
for (const sc of VOLUTE) for (const t of TAGLIE) for (const pc of SCALE) if (!(DATI[sc.id] && DATI[sc.id][t.w] && DATI[sc.id][t.w][pc])) nonGiudicate.push(`${sc.id}@${t.w}/${pc}%: non misurata`);
/* sulla partita viva il testo cambia a ogni minuto (cronaca, orologio, punteggio): la chiave e' tipo + elemento, senza testo */
const chiaveSenzaTesto = (sid, d) => sid === 'partita' ? d.k.split('|').slice(0, 2).join('|') : d.k;
const notiSet = new Map(NOTI.noti.map(n => [`${n.schermata}|${n.k}`, n]));
const trovati = new Map();/* chiave -> {schermata,k,tipo,extra,dove:[]} */
for (const [sid, perW] of Object.entries(DATI)) for (const [w, perPc] of Object.entries(perW)) for (const [pc, m] of Object.entries(perPc)) for (const d of m.difetti) {
  const k = chiaveSenzaTesto(sid, d); const kk = `${sid}|${k}`; const x = trovati.get(kk) || { schermata: sid, k, tipo: d.tipo, extra: d.extra, dove: [] }; x.dove.push(`${w}/${pc}`); trovati.set(kk, x);
}
const daIngrandire = [...trovati.values()].filter(x => x.dove.some(d => !d.endsWith('/100') && !x.dove.includes(d.split('/')[0] + '/100')));
const nuovi = daIngrandire.filter(x => !notiSet.has(`${x.schermata}|${x.k}`));
const guariti = NOTI.noti.filter(n => VOLUTE.some(s => s.id === n.schermata) && !trovati.has(`${n.schermata}|${n.k}`));
const solo100 = [...trovati.values()].filter(x => !daIngrandire.includes(x));
const tot = {}; for (const x of daIngrandire) tot[x.tipo] = (tot[x.tipo] || 0) + 1;
fs.mkdirSync(OUT, { recursive: true });
const compatto = {}; for (const [sid, perW] of Object.entries(DATI)) { compatto[sid] = {}; for (const [w, perPc] of Object.entries(perW)) { compatto[sid][w] = {}; for (const [pc, m] of Object.entries(perPc)) { const c = {}; m.difetti.forEach(d => { c[d.tipo] = (c[d.tipo] || 0) + 1; }); compatto[sid][w][pc] = { testi: m.nTesti, tasti: m.nTasti, radice: m.radice, scala: m.rapporto || null, ...c }; } } }
if (!process.env.CPM_OUT || process.env.CPM_DATI === '1') fs.writeFileSync(path.join(OUT, ROSSO ? `dati-rosso-${ROSSO}.json` : 'dati.json'), JSON.stringify({ build: VER, scale: SCALE, larghezze: TAGLIE.map(t => t.w), conteggi: compatto, difetti: [...trovati.values()] }, null, 1));
if (process.env.CPM_SCRIVI_NOTI === '1') { fs.writeFileSync(NOTI_F, JSON.stringify({ nota: 'giro 400 · difetti del testo ingrandito NOTI (130%/200%), uno per uno nel rapporto docs/sviluppo/RAPPORTO-giro400.md. Chi ne corregge uno lo toglie da qui.', noti: daIngrandire.map(x => ({ schermata: x.schermata, k: x.k, tipo: x.tipo, dove: x.dove.join(' ') })) }, null, 1) + '\n'); console.log(`(scritto l'elenco dei noti: ${daIngrandire.length})`); }

console.log('');
console.log(`difetti nati con l'ingrandimento (130/200%): ${daIngrandire.length} — tagliati ${tot.tagliato || 0} · sovrapposti ${tot.sovrapposto || 0} · fuori ${tot.fuori || 0} · tasti irraggiungibili ${tot.tasto || 0} · gia' a 100%: ${solo100.length} (informativi)`);
for (const x of nuovi.slice(0, 25)) console.log(`  NUOVO ${x.schermata} · ${x.tipo} · ${x.k} · ${x.extra || ''} · ${x.dove.slice(0, 6).join(' ')}`);
for (const n of guariti.slice(0, 15)) console.log(`  guarito (togliere dall'elenco dei noti): ${n.schermata} · ${n.k}`);
for (const g of nonGiudicate.slice(0, 15)) console.log(`  NON GIUDICATA ${g}`);
if (errori.length) console.log(`  errori di pagina: ${errori.length} (${errori.slice(0, 2).join(' · ')})`);
console.log(`tempo ${Math.round((Date.now() - T0) / 1000)} s`);
const rosso = nonGiudicate.length > 0 || nuovi.length > 0;
const motivo = nonGiudicate.length ? `${nonGiudicate.length} misure non giudicate` : nuovi.length ? `${nuovi.length} difetti nuovi fuori dall'elenco dei noti` : `tutte le ${VOLUTE.length * TAGLIE.length * SCALE.length} misure giudicate, nessun difetto nuovo (${daIngrandire.length} noti, ${guariti.length} guariti)`;
console.log(`ESITO testo-grande-400: ${rosso ? 'ROSSO uscita 1' : 'VERDE uscita 0'}${ROSSO ? ` · braccio rosso ${ROSSO}` : ''} · MOTIVO ${motivo}`);
process.exit(rosso ? 1 : 0);
