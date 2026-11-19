#!/usr/bin/env node
/* [giro 289 · PO-548, decisioni PO 19/11 «Censimento PC di tutte» e «Riquadro compatto»] LE SCHERMATE DA PC.
   Da PC (1366x768 e 1920x1080, mouse e tastiera) le schermate pensate per il telefono si allargavano male: riquadri che si allungano fino in
   fondo allo schermo col contenuto su una riga a meta' altezza (Offerte ricevute, foto del PO), righe di testo lunghissime, pulsanti gemelli
   con due stili. Questa sonda MISURA dal DOM, schermata per schermata:
     V  riquadri con vuoto verticale grande: riquadro decorato (fondo, bordo o ombra) alto piu' di 2 volte il suo contenuto e con piu' di
        120 px di vuoto; si conta il piu' INTERNO (un contenitore che ha dentro un riquadro gia' segnato non si conta due volte);
     L  righe di testo oltre 100 caratteri: per ogni riga resa (rettangoli del Range) i caratteri stimati con la larghezza media dei caratteri
        di quel nodo; si sommano i pezzi della stessa riga dello stesso blocco;
     P  pulsanti con la stessa scritta e stili diversi nella stessa schermata (fondo, colore, maiuscolo, peso, bordo);
     C  colonna non centrata: margini sinistro/destro del contenuto (unione dei riquadri dentro lo scorrimento) nell'area libera dalla barra
        laterale, scarto oltre 40 px;
     S  scorrimento senza motivo: la pagina scorre e il vuoto dei riquadri segnati basterebbe a non farla scorrere.
   MODI
     CPM_CENSIMENTO=1  tutte le schermate raggiungibili senza giocare (piu' la rassegna dopo partita con CPM_PARTITA=1), foto JPEG in
                       docs/sviluppo/giro289/foto/<larghezza>/, tabella in docs/sviluppo/giro289/CENSIMENTO-PC.md e dati in censimento.json.
                       Con CPM_ROSSO=1 lo stesso col rosso acceso (la foto «prima»: foto-prima/).
     (default)         GUARDIANO sulle schermate corrette dal giro 289: verde = zero V/L/P/C a 1366 e 1920; rosso (__CPM_NO_G289) = almeno
                       un difetto sulle Offerte, altrimenti la sonda e' cieca; TELEFONO 360 e 412: impronta dei rettangoli di tutti gli
                       elementi visibili identica fra verde e rosso (la regola vale solo da 1024 px in su).
   DICHIARATO: Chromium headless, non un PC vero; la stima dei caratteri per riga usa la larghezza media del nodo (errore di qualche
   carattere); «non giudicato» (schermata che non si apre) = rosso. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CENS = process.env.CPM_CENSIMENTO === '1', ROSSO_C = process.env.CPM_ROSSO === '1', PARTITA = process.env.CPM_PARTITA === '1';
const OUTD = path.join(ROOT, 'docs', 'sviluppo', 'giro289');
const PC = [{ w: 1366, h: 768 }, { w: 1920, h: 1080 }], TEL = [{ w: 360, h: 800 }, { w: 412, h: 915 }];
const SEME = 4242;
/* le schermate corrette dal giro 289 (il guardiano giudica queste) */
const CORRETTE = (process.env.CPM_289_SOLO || 'offerte,provini,stagione-coppe,stagione-calendario,stagione-classifica,carriera-profilo,carriera-nazionale,agente,fine-stagione').split(',');
const TRIAL = (ph, res) => ({ ph, slot: 0, res, p: { name: 'Grafica Probe', nation: 'Italia', avatarId: 0, ovr: 58, age: 16, proStatus: 'youth', archetype: 'finalizzatore',
  stats: { 'velocità': 60, tecnica: 58, fisico: 56, 'mentalità': 57, tiro: 62, passaggio: 56, dribbling: 60, posizionamento: 58 } } });
const RES3 = [{ goals: 1, assists: 0, rating: 6.6 }, { goals: 1, assists: 1, rating: 7.0 }, { goals: 0, assists: 0, rating: 6.8 }];/* 2 gol, voto 6,8: la riga della foto del PO */

function MISURA() {
  const W = document.documentElement.clientWidth, H = innerHeight;
  const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.left < W; };
  const trasp = c => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);
  const deco = (e, cs) => (!trasp(cs.backgroundColor) || (cs.backgroundImage && cs.backgroundImage !== 'none')) || (parseFloat(cs.borderTopWidth) > 0 && !trasp(cs.borderTopColor) && parseFloat(cs.borderBottomWidth) > 0) || cs.boxShadow !== 'none';
  const desc = e => { const t = (e.getAttribute('data-cpm') || '') || (e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : ''); return (e.tagName.toLowerCase() + (t ? '.' + t : '') + ' «' + (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) + '»'); };
  /* contenuto di un riquadro: unione dei rettangoli dei testi e dei media visibili dentro */
  const contenuto = (e, r) => { let t = Infinity, b = -Infinity; const add = (q) => { if (q.width <= 0 || q.height <= 0) return; const a = Math.max(q.top, r.top), z = Math.min(q.bottom, r.bottom); if (z <= a) return; t = Math.min(t, a); b = Math.max(b, z); };
    const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.nodeValue.trim()) continue; const p = n.parentElement; if (!p || !vis(p)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) add(q); }
    for (const m of e.querySelectorAll('img,svg,canvas,input,select,textarea,video')) { if (m.closest('svg') && m.tagName.toLowerCase() !== 'svg') continue; if (vis(m)) add(m.getBoundingClientRect()); }
    return b > t ? b - t : 0; };
  /* radice: lo strato fisso in primo piano che copre lo schermo (finestra col velo, Opzioni), altrimenti la pagina */
  let RAD = document.body; { const veli = [...document.body.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed' || !vis(e)) return false; const r = e.getBoundingClientRect(); return r.width >= W * 0.95 && r.height >= H * 0.9 && e.querySelector('button,p,h1,h2,h3'); });
    if (veli.length) RAD = veli[veli.length - 1]; }
  const inFisso = e => { for (let a = e; a && a !== RAD && a !== document.body; a = a.parentElement) if (getComputedStyle(a).position === 'fixed') return true; return false; };
  const nav = [...document.querySelectorAll('.cpm-nav-bar')].find(x => vis(x) && getComputedStyle(x).position === 'fixed' && x.getBoundingClientRect().width < W * 0.4 && x.getBoundingClientRect().height > H * 0.6);
  const navR = nav ? Math.round(nav.getBoundingClientRect().right) : 0;
  /* V */
  const segn = [];
  for (const e of RAD.querySelectorAll('div,section,article,main,aside,button,li')) {
    if (e.closest('svg')) continue; const r = e.getBoundingClientRect(); if (r.width < 160 || r.height < 90) continue; if (r.width >= W * 0.97 && r.height >= H * 0.85) continue; if (!vis(e)) continue;
    if (e.closest('[aria-hidden="true"]')) continue;/* strati decorativi (bagliori, trame): non sono riquadri */
    const cs = getComputedStyle(e); if (!deco(e, cs)) continue; if (cs.position === 'absolute' && cs.pointerEvents === 'none') continue;/* velini di luce */ if (cs.position === 'fixed' && r.width >= W * 0.97) continue;/* veli a tutto schermo */ if (RAD === document.body && inFisso(e)) continue;
    const c = contenuto(e, r), vuoto = r.height - c; if (r.height > 2 * Math.max(c, 1) && vuoto > 120) segn.push({ e, h: Math.round(r.height), c: Math.round(c), vuoto: Math.round(vuoto), d: desc(e) });
  }
  const V = segn.filter(s => !segn.some(o => o !== s && s.e.contains(o.e))).map(({ e, ...x }) => x).sort((a, b) => b.vuoto - a.vuoto);
  /* L */
  const righe = new Map(); const blocco = el => { let b = el; while (b && b !== document.body && /^inline/.test(getComputedStyle(b).display)) b = b.parentElement; return b; };
  const ids = new Map(); let nid = 0; const idDi = el => { if (!ids.has(el)) ids.set(el, ++nid); return ids.get(el); };
  { const tw = document.createTreeWalker(RAD, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const s = n.nodeValue; if (!s.trim()) continue; const p = n.parentElement; if (!p || p.closest('script,style,svg') || !vis(p)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const qs = [...rg.getClientRects()].filter(q => q.width > 0 && q.bottom > 0 && q.top < H * 3); if (!qs.length) continue; const tot = qs.reduce((a, q) => a + q.width, 0); const cw = tot / Math.max(1, s.replace(/\s+/g, ' ').length);
    const bl = blocco(p); for (const q of qs) { const k = idDi(bl) + ':' + Math.round(q.top / 4); const o = righe.get(k) || { ch: 0, d: desc(bl) }; o.ch += q.width / Math.max(0.5, cw); righe.set(k, o); } } }
  const lunghe = [...righe.values()].filter(o => o.ch > 100).map(o => ({ ch: Math.round(o.ch), d: o.d })).sort((a, b) => b.ch - a.ch);
  const maxCh = Math.round(Math.max(0, ...[...righe.values()].map(o => o.ch)));
  /* P */
  const gruppi = {}; for (const b of RAD.querySelectorAll('button,[role=button]')) { if (!vis(b)) continue; const k = (b.innerText || '').toLowerCase().replace(/[^a-zàèéìòù]+/g, ' ').trim(); if (k.length < 3) continue; const cs = getComputedStyle(b);
    const sig = [cs.backgroundColor, cs.color, cs.textTransform, cs.fontWeight, cs.borderTopColor].join('|'); (gruppi[k] = gruppi[k] || new Set()).add(sig); }
  const P = Object.entries(gruppi).filter(([, s]) => s.size > 1).map(([k, s]) => ({ t: k, stili: s.size }));
  /* A — azione staccata: un tasto largo (>= 300 px) lontano piu' di 160 px dall'ultimo testo sopra di lui */
  const fondi = []; { const tw = document.createTreeWalker(RAD, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.nodeValue.trim()) continue; const p = n.parentElement; if (!p || p.closest('script,style') || !vis(p) || inFisso(p) && RAD === document.body) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 0) fondi.push(q); } }
  for (const m of RAD.querySelectorAll('img,svg')) if (!m.closest('svg') || m.tagName.toLowerCase() === 'svg') { if (vis(m)) fondi.push(m.getBoundingClientRect()); }
  const A = []; for (const b of RAD.querySelectorAll('button')) { if (!vis(b) || (RAD === document.body && inFisso(b))) continue; const r = b.getBoundingClientRect(); if (r.width < 300 || r.top >= H || r.top < 0) continue; const su = fondi.filter(q => q.bottom <= r.top + 1 && q.right > r.left && q.left < r.right).map(q => q.bottom); for (let an = b.parentElement; an && an !== RAD; an = an.parentElement) { const ca = getComputedStyle(an); if (deco(an, ca)) { su.push(an.getBoundingClientRect().top); break; } }/* il riquadro che lo contiene vale come bordo superiore */ if (!su.length) continue; const g = r.top - Math.max(...su); if (g > 160) A.push({ t: (b.innerText || '').trim().slice(0, 30), gap: Math.round(g) }); }
  /* C */
  const sc = RAD === document.body ? [...document.querySelectorAll('.cpm-scroll')].find(vis) : null;
  const CR = sc || RAD, navC = RAD === document.body ? navR : 0;
  let C = null; { let l = Infinity, rr = -Infinity; for (const e of CR.querySelectorAll('div,section,button,p,h1,h2,h3')) { const r = e.getBoundingClientRect(); if (r.width < 120 || r.height < 30 || r.width >= W * 0.97 || !vis(e)) continue; if (inFisso(e) || getComputedStyle(e).position === 'fixed') continue; const cs = getComputedStyle(e); if (!deco(e, cs) && !/^(P|H1|H2|H3)$/.test(e.tagName)) continue; l = Math.min(l, r.left); rr = Math.max(rr, r.right); }
    if (rr > l) { const Wc = sc ? sc.getBoundingClientRect().right - (sc.offsetWidth - sc.clientWidth) : W; C = { sx: Math.round(l - navC), dx: Math.round(Wc - rr), larg: Math.round(rr - l) }; C.scarto = Math.abs(C.sx - C.dx); } }
  /* S */
  let ecc = sc ? Math.max(0, sc.scrollHeight - sc.clientHeight) : 0; if (!sc) { for (const e of RAD.querySelectorAll('*')) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.clientHeight > H * 0.4) ecc = Math.max(ecc, e.scrollHeight - e.clientHeight); } }
  const S = ecc > 20 && V.reduce((a, v) => a + v.vuoto, 0) >= ecc;
  return { W, H, navR, rad: RAD === document.body ? 'pagina' : 'strato', V, nV: V.length, L: lunghe.slice(0, 4), nL: lunghe.length, maxCh, P, nP: P.length, A, nA: A.length, C, nC: C && C.scarto > 40 ? 1 : 0, ecc: Math.round(ecc), S };
}
/* impronta dei rettangoli (telefono): tutti gli elementi visibili, arrotondati */
function IMPRONTA() { const out = []; for (const e of document.body.querySelectorAll('*')) { if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue; const r = e.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) continue; out.push(e.tagName[0] + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + ',' + Math.round(r.height)); }
  let h = 2166136261; const s = out.join(';'); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return { n: out.length, h: (h >>> 0).toString(16) }; }

const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const errori = [], saltate = [];
async function attendiFermo(page) { await sleep(450); let prev = null, u = 0; const t0 = Date.now(); while (Date.now() - t0 < 7000) { let t = null; try { t = await page.evaluate(() => (document.body.textContent || '').replace(/\d{1,2}:\d{2}/g, '·').length + '|' + document.body.querySelectorAll('*').length); } catch (_e) {} if (t && t === prev) { if (++u >= 2) return; } else { u = 0; prev = t; } await sleep(250); } }
async function congela(page) { await page.evaluate(() => { if (!document.getElementById('__g289f')) { const st = document.createElement('style'); st.id = '__g289f'; st.textContent = '*,*::before,*::after{transition:none!important}'; document.head.appendChild(st); }
  (document.getAnimations ? document.getAnimations() : []).forEach(a => { try { const t = a.effect.getComputedTiming(); if (t.iterations === Infinity || t.duration === Infinity) { a.currentTime = 0; a.pause(); } else a.finish(); } catch (_e) {} });
  for (const s of document.querySelectorAll('.cpm-scroll')) s.scrollTop = 0; window.scrollTo(0, 0); }); await sleep(160); }
async function apri(taglia, initArg, query, tel) {
  const page = await browser.newPage({ viewport: { width: taglia.w, height: taglia.h }, deviceScaleFactor: 1, isMobile: !!tel, hasTouch: !!tel });
  page.on('pageerror', e => errori.push(`${taglia.w}px · ${String(e.message).slice(0, 120)}`));
  await installCdnRoutes(page); await page.addInitScript(INIT, initArg);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return page;
}
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const b = [...document.querySelectorAll('button')].find(x => r.test((x.textContent || '').trim() || x.getAttribute('aria-label') || '') || r.test(x.getAttribute('aria-label') || '')); if (b) { b.click(); return true; } return false; }, rx);

/* LE SCHERMATE: ogni contesto e' una funzione che apre la pagina e chiama `mis(id, nome)` sulla schermata a vista */
const ELENCO = [];
async function contesti(taglie, rossi, tel, mis) {
  const base = { seme: SEME, tema: 'scuro', rossi };
  const T0 = taglie[0];
  { const page = await apri(T0, base, '?cpmtest=1', tel); await mis(page, 'home', 'Home fuori carriera');
    if (await premi(page, 'Opzioni')) { await sleep(500); await mis(page, 'impostazioni', 'Opzioni'); await premi(page, '^✕$'); await sleep(500); } else saltate.push('impostazioni: tasto Opzioni non trovato');
    if (await premi(page, 'Nuova carriera')) { await sleep(600); await mis(page, 'creazione', 'Creazione'); } else saltate.push('creazione: tasto Nuova carriera non trovato');
    await page.close(); }
  { const page = await apri(T0, { ...base, trial: TRIAL('trial', []) }, '', tel);
    const ok = await page.waitForFunction(() => /Provino|provino/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
    if (ok) await mis(page, 'provini', 'Provini · prima del provino'); else saltate.push("provini: la schermata non si e' aperta"); await page.close(); }
  { const page = await apri(T0, { ...base, trial: TRIAL('offers', RES3) }, '', tel);
    const ok = await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
    if (ok) await mis(page, 'offerte', 'Offerte ricevute'); else saltate.push("offerte: la schermata non si e' aperta"); await page.close(); }
  { const page = await apri(T0, { ...base, save: SAVE }, '?cpmtest=1', tel); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) { saltate.push('carriera: Continua non trovato'); }
    const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
    if (!vivo) saltate.push('carriera: __CPM_CAREER mai comparso');
    else { await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(400);
      for (const [id, tab, nome] of [['dashboard', 'dashboard', 'Home di carriera'], ['stagione-classifica', 'standings', 'Stagione · Classifica'], ['stagione-calendario', 'calendar', 'Stagione · Calendario'],
        ['stagione-coppe', 'coppe', 'Stagione · Coppe'], ['club', 'club', 'Club · rosa'], ['carriera-profilo', 'profile', 'Carriera · Profilo'], ['carriera-nazionale', 'nazionale', 'Carriera · Nazionale'],
        ['agente', 'agente', 'Agente'], ['ufficio', 'ufficio', 'Ufficio']]) {
        const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); if (r !== true) { saltate.push(`${id}: goTab → ${r}`); continue; } await sleep(350); await mis(page, id, nome); }
      await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(300);
      const modali = [['offerta-trasferimento', 'Finestra · offerta di trasferimento', () => window.__CPM_CAREER.forceOffer(), () => window.__CPM_CAREER.dismiss()],
        ['mister', 'Finestra · il mister ti cerca', () => window.__CPM_CAREER.misterCerca249(), null],
        ['festa-trofeo', 'Cerimonia 2D · festa del trofeo', () => window.__CPM_CAREER.festa251('nation'), null],
        ['fine-stagione', 'Fine stagione', () => window.__CPM_CAREER.apriFine302('stagione'), null]];
      for (const [id, nome, apriF] of modali) { if (!CENS && !CORRETTE.includes(id)) continue; let r = null; try { r = await page.evaluate(apriF); } catch (e) { r = 'error:' + e.message; }
        if (r !== true) { saltate.push(`${id}: apertura → ${r}`); continue; } await sleep(900); await mis(page, id, nome);
        /* chiusura: si ricarica la carriera dal salvataggio (piu' sicuro di indovinare il tasto di chiusura di ogni finestra) */
        await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1000);
        try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
        await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => {}); await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(300); }
    }
    await page.close(); }
}

const nomeDi = {};
async function misuraSu(page, taglie, id, cb) {
  for (const t of taglie) { await page.setViewportSize({ width: t.w, height: t.h }); await sleep(250); await attendiFermo(page); await congela(page); await cb(page, t); }
}

if (CENS) {
  const cartella = ROSSO_C ? 'foto-prima' : 'foto'; const DATI = {};
  await contesti(PC, ROSSO_C ? ['__CPM_NO_G289'] : [], false, async (page, id, nome) => { nomeDi[id] = nome; if (!ELENCO.includes(id)) ELENCO.push(id);
    await misuraSu(page, PC, id, async (pg, t) => { const m = await pg.evaluate(MISURA); (DATI[id] = DATI[id] || {})[t.w] = m;
      const d = path.join(OUTD, cartella, String(t.w)); fs.mkdirSync(d, { recursive: true });
      try { await pg.screenshot({ path: path.join(d, id + '.jpg'), type: 'jpeg', quality: 62, timeout: 40000 }); } catch (e) { saltate.push(`foto ${id}@${t.w}`); }
      console.log(`  ${t.w} ${id.padEnd(24)} V ${m.nV} · L ${m.nL} (max ${m.maxCh}) · P ${m.nP} · A ${m.nA} · C ${m.C ? m.C.sx + '/' + m.C.dx : '-'} · scorre ${m.ecc}${m.S ? ' SENZA MOTIVO' : ''}`); }); });
  fs.mkdirSync(OUTD, { recursive: true });
  fs.writeFileSync(path.join(OUTD, ROSSO_C ? 'censimento-prima.json' : 'censimento.json'), JSON.stringify({ nomi: nomeDi, dati: DATI, saltate, errori }, null, 1));
  if (!ROSSO_C) {
    const rig = [];
    for (const id of ELENCO) for (const w of [1366, 1920]) { const m = DATI[id] && DATI[id][w]; if (!m) continue;
      const v = m.V.slice(0, 2).map(x => `${x.h}/${x.c} px ${x.d}`).join('; ');
      rig.push(`| ${nomeDi[id]} | ${w} | ${m.nV}${v ? ' — ' + v : ''} | ${m.nL} (max ${m.maxCh}) | ${m.nP ? m.P.map(p => '«' + p.t + '» ' + p.stili + ' stili').join(', ') : 0} | ${m.nA ? m.A.map(a => '«' + a.t + '» ' + a.gap + ' px').join(', ') : 0} | ${m.C ? m.C.sx + ' / ' + m.C.dx + ' (larga ' + m.C.larg + ')' : '—'} | ${m.ecc}${m.S ? ' **senza motivo**' : ''} | [foto](foto/${w}/${id}.jpg) |`); }
    fs.writeFileSync(path.join(OUTD, 'CENSIMENTO-PC-tabella.md'), ['| Schermata | Larghezza | V riquadri vuoti (alto/contenuto) | L righe >100 car. | P pulsanti gemelli | A azione staccata | C margini sx/dx | S scorre px | Foto |', '|---|---|---|---|---|---|---|---|---|', ...rig].join('\n') + '\n');
  }
  console.log(saltate.length ? 'SALTATE: ' + saltate.join(' · ') : 'nessuna schermata saltata'); if (errori.length) console.log('ERRORI PAGINA: ' + errori.join(' · '));
  await browser.close(); srv.close(); process.exit(0);
}

/* ── GUARDIANO ── */
const RIS = { verde: {}, rosso: {}, telV: {}, telR: {} };
for (const [k, rossi] of [['verde', []], ['rosso', ['__CPM_NO_G289']]]) {
  await contesti(PC, rossi, false, async (page, id) => { if (!CORRETTE.includes(id)) return; await misuraSu(page, PC, id, async (pg, t) => { (RIS[k][id] = RIS[k][id] || {})[t.w] = await pg.evaluate(MISURA); }); });
}
for (const [k, rossi] of [['telV', []], ['telR', ['__CPM_NO_G289']]]) {
  await contesti(TEL, rossi, true, async (page, id) => { if (!CORRETTE.includes(id)) return; await misuraSu(page, TEL, id, async (pg, t) => { (RIS[k][id] = RIS[k][id] || {})[t.w] = await pg.evaluate(IMPRONTA); }); });
}
let ko = 0; const riga = (ok, s) => { if (!ok) ko++; console.log((ok ? 'ok  ' : 'KO  ') + s); };
for (const id of CORRETTE) for (const t of PC) { const m = RIS.verde[id] && RIS.verde[id][t.w];
  if (!m) { riga(false, `${id}@${t.w}: NON GIUDICATO (schermata non aperta)`); continue; }
  riga(m.nV === 0, `${id}@${t.w} verde · riquadri col vuoto grande ${m.nV}${m.nV ? ' — ' + m.V.map(v => v.h + '/' + v.c + ' ' + v.d).join('; ') : ''}`);
  riga(m.nL === 0, `${id}@${t.w} verde · righe oltre 100 caratteri ${m.nL} (max ${m.maxCh})${m.nL ? ' — ' + m.L.map(l => l.ch + ' ' + l.d).join('; ') : ''}`);
  riga(m.nP === 0, `${id}@${t.w} verde · pulsanti gemelli con stili diversi ${m.nP}${m.nP ? ' — ' + m.P.map(p => p.t).join(', ') : ''}`);
  riga(m.nA === 0, `${id}@${t.w} verde · azioni attaccate al contenuto ${m.nA}${m.nA ? ' — ' + m.A.map(a => a.t + ' ' + a.gap + ' px').join('; ') : ''}`);
  riga(m.nC === 0, `${id}@${t.w} verde · colonna centrata (margini ${m.C ? m.C.sx + '/' + m.C.dx : '?'})`);
  riga(!m.S, `${id}@${t.w} verde · nessuno scorrimento senza motivo (eccesso ${m.ecc})`); }
for (const t of PC) { const m = RIS.rosso.offerte && RIS.rosso.offerte[t.w]; if (!m) { riga(false, `offerte@${t.w} rosso: NON GIUDICATO`); continue; }
  const dif = m.nV + m.nL + m.nP + m.nC + m.nA; riga(dif > 0, `offerte@${t.w} ROSSO (__CPM_NO_G289) · la sonda vede il difetto: V ${m.nV} · L ${m.nL} (max ${m.maxCh}) · P ${m.nP} · C ${m.nC}`); }
for (const id of CORRETTE) for (const t of TEL) { const a = RIS.telV[id] && RIS.telV[id][t.w], b = RIS.telR[id] && RIS.telR[id][t.w];
  if (!a || !b) { riga(false, `${id}@${t.w} telefono: NON GIUDICATO`); continue; }
  riga(a.h === b.h && a.n === b.n, `${id}@${t.w} telefono invariato · impronta ${a.n} elementi ${a.h} contro rosso ${b.n} ${b.h}`); }
if (saltate.length) { riga(false, 'schermate saltate: ' + saltate.join(' · ')); }
if (errori.length) console.log('errori di pagina (informativi): ' + errori.slice(0, 5).join(' · '));
console.log(ko ? `pc-289: ROSSO — ${ko} controlli falliti` : 'pc-289: VERDE');
await browser.close(); srv.close(); process.exit(ko ? 1 : 0);
