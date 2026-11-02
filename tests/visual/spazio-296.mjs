#!/usr/bin/env node
/* [giro 91 PO-296 guardiano — «Ridurrei anche lo spazio tra i box in tutte le schermate», foto PO sulla 7.999.177; decisione PO: lo spazio
   fra i riquadri a META', circa 8 px (era ~14-16), in tutte le schermate]. Su telefono 412x915 (tocco) e PC 1366x768 (mouse) apre le
   schermate principali (home di carriera, stagione, club, carriera, agente, ufficio, pre-partita, home fuori carriera, opzioni, creazione,
   finestre/Modal, post-partita) e per ogni gruppo di riquadri FRATELLI (stesso genitore, ognuno con la sua cornice/fondo/ombra e raggio >= 6)
   misura la distanza reale (getBoundingClientRect) fra uno e il successivo, in verticale (colonna) e in orizzontale (riga/griglia).
   VERDE se, per ogni schermata e formato:
     1) la MEDIANA delle distanze verticali fra riquadri-carta sta fra 6,5 e 9,2 px (il PO vuole ~8; il banco rende 7,8 dentro lo zoom 1,12);
     2) nessuna distanza fra riquadri-carta sta fuori da 6-10 px (tolti i gruppi dichiarati di proposito in CONTIGUI: righe di una stessa lista a 0 px,
        e le coppie che il gioco affianca volutamente);
     3) nessuna sovrapposizione fra riquadri fratelli (distanza < -1 px);
     4) nessuno scorrimento orizzontale della pagina.
   I «riquadri-carta» sono quelli alti >= 28 px e larghi >= 100 px: i gettoncini, le pillole e le righe di una tabella non sono carte.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_SPAZIO296 (gli spazi della 177) e pretende che il giudizio CADA (mediana fuori 7-9 su almeno una
   schermata per formato). CPM_MISURA=1 stampa tutte le distanze con l'origine (marginBottom/marginTop/gap del genitore) e non giudica.
   CPM_FOTO_296=<prefisso> salva foto in <scratchpad>/<prefisso>-<formato>-<schermata>.png; CPM_SENZA_POST=1 salta il post-partita (lento, ~3 min).
   [giro 97 PO-299 D18] aggiunte intervista, primo incontro col procuratore, Opzioni di carriera e Fine stagione/offerte (su pagina nuova
   ciascuna): sul codice del giro 91 cadono con 12 · 13,4 · 15,7 · 16,8 px; il rosso resta __CPM_NO_SPAZIO296, che riporta anche questi.
   Non prova dispositivi veri: e' Chromium headless alla taglia del telefono del PO e a quella del PC. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, MISURA_SOLA = !!process.env.CPM_MISURA, FOTO = process.env.CPM_FOTO_296 || '', SENZA_POST = !!process.env.CPM_SENZA_POST;
const FORMATI = { tel: { nome: 'Telefono 412x915', w: 412, h: 915, touch: true }, pc: { nome: 'PC 1366x768', w: 1366, h: 768, touch: false } };
const SCELTI = (process.env.CPM_FORMATI || 'tel,pc').split(',').filter(k => FORMATI[k]);
const DIR_FOTO = process.env.CPM_DIR_FOTO || '/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad';
const SAVE_PARTITA = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const TRIALPROG = { ph: 'offers', slot: 0, res: [{ goals: 2, assists: 1, rating: 7.4 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 3, assists: 1, rating: 8.1 }],
  p: { name: 'Grafica Probe', nation: 'Italia', avatarId: 0, ovr: 58, age: 16, proStatus: 'youth', archetype: 'finalizzatore',
       stats: { 'velocità': 60, tecnica: 58, fisico: 56, 'mentalità': 57, tiro: 62, passaggio: 56, dribbling: 60, posizionamento: 58 } } };

/* gira DENTRO la pagina */
function MISURA_IN_PAGINA() {
  const de = document.documentElement, W = de.clientWidth;
  const cs = e => getComputedStyle(e);
  const vis = e => { const c = cs(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.1) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const alfa = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return 0; const p = m[1].split(',').map(Number); return p.length > 3 ? p[3] : 1; };
  const deco = e => { const c = cs(e); if (Math.max(parseFloat(c.borderTopLeftRadius), parseFloat(c.borderBottomLeftRadius), parseFloat(c.borderTopRightRadius), parseFloat(c.borderBottomRightRadius)) < 6) return false;
    const bordo = parseFloat(c.borderTopWidth) > 0 && c.borderTopStyle !== 'none' && alfa(c.borderTopColor) > 0.05;
    const bordoB = parseFloat(c.borderBottomWidth) > 0 && c.borderBottomStyle !== 'none' && alfa(c.borderBottomColor) > 0.05;
    return bordo || bordoB || (c.boxShadow && c.boxShadow !== 'none') || alfa(c.backgroundColor) > 0.5 || (c.backgroundImage && c.backgroundImage !== 'none'); };
  const sel = e => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; const cl = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.'); if (cl) s += '.' + cl;
    const t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 22); return s + (t ? '«' + t + '»' : ''); };
  /* estensione visiva di un figlio: il suo riquadro se e' decorato, altrimenti l'unione dei riquadri decorati piu' esterni che contiene */
  const estensione = (c) => {
    if (!vis(c)) return null; const st = cs(c); if (st.position === 'fixed' || st.position === 'absolute') return null;
    if (deco(c)) { const r = c.getBoundingClientRect(); return r.width > 0 ? { l: r.left, t: r.top, r: r.right, b: r.bottom, el: c, diretto: true } : null; }
    let u = null; const giu = (n, prof) => { if (prof > 6) return; for (const k of n.children) { if (!vis(k)) continue; const ks = cs(k); if (ks.position === 'fixed' || ks.position === 'absolute') continue;
        if (deco(k)) { const r = k.getBoundingClientRect(); u = u ? { l: Math.min(u.l, r.left), t: Math.min(u.t, r.top), r: Math.max(u.r, r.right), b: Math.max(u.b, r.bottom) } : { l: r.left, t: r.top, r: r.right, b: r.bottom }; } else giu(k, prof + 1); } };
    giu(c, 0); if (!u) return null;
    /* un contenitore senza cornice vale come riquadro solo se il suo rettangolo coincide (in alto e in basso, entro 3 px) con quello dei riquadri che porta: altrimenti la distanza includerebbe testo o aria che non sono lo spazio fra riquadri */
    const r = c.getBoundingClientRect(); if (Math.abs(r.top - u.t) > 3 || Math.abs(r.bottom - u.b) > 3 ) return null;
    return { l: r.left, r: r.right, t: u.t, b: u.b, el: c, diretto: false }; };
  const gaps = [], sovr = [];
  for (const P of document.body.querySelectorAll('*')) {
    if (!vis(P) || P.children.length < 2) continue;
    /* catena dei figli in flusso visibili: due figli sono «fratelli» solo se NESSUN altro figlio visibile sta in mezzo; un figlio senza riquadro interrompe la catena */
    const V = []; let rotto = true; for (const c of P.children) { if (!vis(c)) continue; const st = cs(c); if (st.position === 'fixed' || st.position === 'absolute') continue;
      const x = estensione(c); if (!x) { rotto = true; continue; } x.rotto = rotto; rotto = false; V.push(x); }
    if (V.length < 2) continue;
    const pc = cs(P);
    for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
      const a = V[i], b = V[j]; if (j !== i + 1 || b.rotto) continue;
      const wA = a.r - a.l, hA = a.b - a.t, wB = b.r - b.l, hB = b.b - b.t;
      const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (ox > 1 && oy > 1) { if (j === i + 1) sovr.push({ a: sel(a.el), b: sel(b.el), ox: Math.round(ox), oy: Math.round(oy), wA, hA }); continue; }
      if (j !== i + 1) continue;
      let k = null, g = 0;
      if (ox >= 0.5 * Math.min(wA, wB) && b.t >= a.b - 1) { k = 'v'; g = b.t - a.b; } else if (oy >= 0.5 * Math.min(hA, hB) && b.l >= a.r - 1) { k = 'h'; g = b.l - a.r; } else continue;
      /* riquadro-carta: alto >= 28 e largo >= 100 (le testate delle fisarmoniche sono alte ~32) */
      const carta = hA >= 28 && hB >= 28 && wA >= 100 && wB >= 100;
      const mA = k === 'v' ? parseFloat(cs(a.el).marginBottom) : parseFloat(cs(a.el).marginRight), mB = k === 'v' ? parseFloat(cs(b.el).marginTop) : parseFloat(cs(b.el).marginLeft);
      const gp = k === 'v' ? parseFloat(pc.rowGap) || 0 : parseFloat(pc.columnGap) || 0;
      gaps.push({ k, g: Math.round(g * 10) / 10, carta, a: sel(a.el), b: sel(b.el), p: sel(P), mA: mA || 0, mB: mB || 0, gp, dirA: a.diretto, dirB: b.diretto, hA: Math.round(hA), wA: Math.round(wA), top: Math.round(a.t + scrollY), sa: (a.el.getAttribute('style') || '').slice(0, 150), sp: (P.getAttribute('style') || '').slice(0, 110) });
    }
  }
  return { W, hs: Math.max(de.scrollWidth, document.body.scrollWidth) - W, gaps, sovr: sovr.slice(0, 12), testo: (document.body.innerText || '').length };
}
const mediana = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = []; const R = {}; /* R[formato][schermata] = misura */
async function congela(page) {
  await page.evaluate(() => { if (!document.getElementById('__s296')) { const st = document.createElement('style'); st.id = '__s296'; st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(st); } window.scrollTo(0, 0); });
  await sleep(250);
}
async function ferma(page) { let prev = null, uguali = 0; const t0 = Date.now(); await sleep(500);
  while (Date.now() - t0 < 7000) { let t = null; try { t = await page.evaluate(() => (document.body.textContent || '').replace(/\d{1,2}:\d{2}/g, '·').length + '|' + document.body.querySelectorAll('*').length); } catch (e) {}
    if (t != null && t === prev) { if (++uguali >= 2) return; } else { uguali = 0; prev = t; } await sleep(250); } }
async function misura(page, f, id) {
  await ferma(page); await congela(page);
  const m = await page.evaluate(MISURA_IN_PAGINA); (R[f.k] = R[f.k] || {})[id] = m;
  if (FOTO) { try { await page.screenshot({ path: `${DIR_FOTO}/${FOTO}-${f.k}-${id}.png`, animations: 'disabled', timeout: 40000 }); } catch (e) {} }
  const v = m.gaps.filter(x => x.k === 'v' && x.carta && x.g >= 6).map(x => x.g);
  process.stdout.write(`  ${f.k.padEnd(3)} ${id.padEnd(16)} carte v:${String(v.length).padStart(3)} mediana ${String(mediana(v)).padStart(5)} min ${v.length ? Math.min(...v) : '-'} max ${v.length ? Math.max(...v) : '-'} · sovrapposte ${m.sovr.length} · hscroll ${m.hs}\n`);
}
async function apri(f, init, query) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 120)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSO ? ['__CPM_NO_SPAZIO296'] : [], ...init });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return { ctx, page };
}
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const x = [...document.querySelectorAll('button')].find(y => r.test((y.textContent || '').trim())); if (x) { x.click(); return true; } return false; }, rx);
const mancanti = [];

for (const fk of SCELTI) {
  const f = { ...FORMATI[fk], k: fk };
  /* 1) fuori carriera: home, opzioni, creazione */
  { const { ctx, page } = await apri(f, {}, '?cpmtest=1');
    await misura(page, f, 'menu-home');
    if (await premi(page, 'Opzioni')) { await misura(page, f, 'opzioni'); await premi(page, '^✕$'); await sleep(500); } else mancanti.push(fk + ' opzioni');
    if (await premi(page, 'Nuova carriera')) await misura(page, f, 'creazione'); else mancanti.push(fk + ' creazione');
    await ctx.close(); }
  /* 2) offerte */
  { const { ctx, page } = await apri(f, { trial: TRIALPROG }, '');
    const ok = await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
    if (ok) await misura(page, f, 'offerte'); else mancanti.push(fk + ' offerte');
    await ctx.close(); }
  /* 3) carriera: schede, finestre, pre-partita */
  { const { ctx, page } = await apri(f, { save: SAVE }, '?cpmtest=1');
    await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { mancanti.push(fk + ' Continua'); }
    const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
    if (!vivo) mancanti.push(fk + ' carriera'); else {
      await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(400);
      for (const [id, tab] of [['home', 'dashboard'], ['stagione-classifica', 'standings'], ['stagione-calendario', 'calendar'], ['stagione-coppe', 'coppe'], ['club', 'club'], ['carriera-profilo', 'profile'], ['carriera-nazionale', 'nazionale'], ['agente', 'agente'], ['ufficio', 'ufficio']]) {
        const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); if (r !== true) { mancanti.push(fk + ' ' + id); continue; } await sleep(300); await misura(page, f, id); }
      /* finestre (Modal): impulso, settimana vissuta, invito alla partita */
      for (const [id, fn] of [['finestra-impulso', () => window.__CPM_CAREER.apriSettimana('impulso')], ['finestra-spogliatoio', () => window.__CPM_CAREER.apriSettimana('spogliatoio')], ['finestra-partita', () => window.__CPM_CAREER.apriPartita('starter')]]) {
        await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(300);
        const r = await page.evaluate(fn); if (r !== true) { mancanti.push(fk + ' ' + id + ' ' + r); continue; } await sleep(500); await misura(page, f, id);
        try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(300); }
      /* [giro 97 PO-299 D18] le quattro schermate rimaste larghe nel collaudo grafico 178: intervista (12 px), primo incontro col procuratore
         (13,4), Opzioni di carriera (15,7), Fine stagione/offerte (16,8). Ognuna su pagina NUOVA (sotto): la cerimonia e le finestre
         non si chiudono tutte con dismiss() e contaminerebbero le misure successive (lezione del censimento 178). */
    }
    await ctx.close(); }
  for (const [id, fn] of [['intervista', () => window.__CPM_CAREER.forceInterview('win')], ['procuratore-intro', () => window.__CPM_CAREER.apriIntro253()], ['carriera-opzioni', null], ['fine-stagione-offerte', () => window.__CPM_CAREER.goScreen('proTransition')]]) {
    const { ctx, page } = await apri(f, { save: SAVE }, '?cpmtest=1');
    await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { mancanti.push(fk + ' Continua'); }
    const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
    if (!vivo) { mancanti.push(fk + ' ' + id + ' (carriera)'); await ctx.close(); continue; }
    await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(400);
    await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(300);
    const r = fn ? await page.evaluate(fn).catch(e => 'err ' + e.message) : await premi(page, '^Opzioni$');
    if (r !== true) mancanti.push(fk + ' ' + id + ' ' + r); else { await sleep(900); await misura(page, f, id); }
    await ctx.close(); }
  /* 3b) pre-partita: contesto nuovo col salvataggio di fixtures (ha la partita in settimana), la stessa via del giocatore */
  { const { ctx, page } = await apri(f, { save: SAVE_PARTITA }, '?cpmtest=1');
    await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { mancanti.push(fk + ' Continua'); }
    const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
    if (vivo) { await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(400);
      try { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); } catch (e) {} await sleep(400);
      const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
      if (pm === true) { const ok = await page.waitForFunction(() => /VS|OSPITE|CASA/.test(document.body.innerText || ''), null, { timeout: 40000 }).then(() => true).catch(() => false);
        if (ok) await misura(page, f, 'prepartita'); else mancanti.push(fk + ' prepartita'); } else mancanti.push(fk + ' prepartita ' + pm);
    } else mancanti.push(fk + ' prepartita (carriera)');
    await ctx.close(); }
  /* 4) post-partita: una partita di provino in autoplay fino al tabellino */
  if (!SENZA_POST) {
    const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
    const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => errs.push(`${fk} partita · ${String(e.message).slice(0, 120)}`));
    await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSO ? ['__CPM_NO_SPAZIO296'] : [] });
    let ok = false; try { await openMatch(page, port, { skipLoadAll: true, name: 'Grafica Probe' }); ok = true; } catch (e) { mancanti.push(fk + ' post-partita apertura'); }
    if (ok) { try { await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 })); } catch (e) {}
      let fine = false; for (let t = 0; t < 420; t += 5) { const ph = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }).catch(() => null);
        if (ph === 'ended' || ph === 'ceremony') { fine = true; break; } await sleep(5000); }
      if (fine) { await sleep(900); await misura(page, f, 'post-partita'); } else mancanti.push(fk + ' post-partita (niente fischio)'); }
    await ctx.close(); }
}

/* ---- giudizio ---- */
const fail = [];
if (MISURA_SOLA) {
  for (const fk of Object.keys(R)) for (const [id, m] of Object.entries(R[fk])) {
    console.log(`\n== ${fk} ${id}  (hscroll ${m.hs}, sovrapposti ${m.sovr.length})`);
    for (const x of m.gaps.filter(x => x.carta)) { console.log(`  ${x.k} ${String(x.g).padStart(6)}  mA ${x.mA} mB ${x.mB} gap ${x.gp}  ${x.p} > ${x.a} -> ${x.b}`); if (x.g > 10) console.log(`       A:[${x.sa}] P:[${x.sp}]`); }
    for (const s of m.sovr) console.log('  SOVR', JSON.stringify(s));
  }
  fs.writeFileSync(`${DIR_FOTO}/spazio296-misura-${ROSSO ? 'rosso' : 'verde'}.json`, JSON.stringify(R));
  await b.close(); srv.close(); process.exit(0);
}
let cadute = 0;
for (const fk of Object.keys(R)) for (const [id, m] of Object.entries(R[fk])) {
  /* sotto i 6 px sono righe/gettoni di elenco o riquadri uniti di proposito (testata + strisce): gia' piu' stretti di 8, il PO chiede di RIDURRE, non si allargano */
  const v = m.gaps.filter(x => x.carta && x.g >= 6), vv = v.filter(x => x.k === 'v');
  const med = mediana(vv.map(x => x.g)); const fuori = v.filter(x => x.g > 10);
  const motivi = [];
  if (vv.length && (med < 6.5 || med > 9.2)) motivi.push(`mediana ${med}`);
  if (fuori.length) motivi.push(`${fuori.length} distanze oltre 10 (${fuori.slice(0, 3).map(x => x.g + ' ' + x.a).join('; ')})`);
  if (m.sovr.length) motivi.push(`${m.sovr.length} sovrapposizioni (${m.sovr[0].a} / ${m.sovr[0].b})`);
  if (m.hs > 0) motivi.push(`scorrimento orizzontale ${m.hs} px`);
  if (motivi.length) { cadute++; fail.push(`${fk} ${id}: ${motivi.join(' · ')}`); }
}
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | '));
if (mancanti.length) console.log('schermate non raggiunte: ' + mancanti.join(', '));
const totSchermate = Object.values(R).reduce((s, o) => s + Object.keys(o).length, 0);
let esito;
if (ROSSO) { esito = cadute > 0; console.log(esito ? `ROSSO ATTESO OK: con __CPM_NO_SPAZIO296 cadono ${cadute} schermate su ${totSchermate}` : 'ROSSO NON RIUSCITO: con l\'interruttore acceso il guardiano resta verde'); fail.slice(0, 8).forEach(s => console.log('  ' + s)); }
else { esito = cadute === 0 && totSchermate >= 12 * SCELTI.length && mancanti.filter(x => !/post-partita/.test(x) || !SENZA_POST).length === 0; fail.forEach(s => console.log('  ✗ ' + s));
  console.log(esito ? `spazio-296 VERDE: ${totSchermate} schermate misurate, distanze fra riquadri-carta 6-10 px, nessuna sovrapposizione` : `spazio-296 ROSSO: ${cadute} schermate cadute, ${mancanti.length} non raggiunte`); }
await b.close(); srv.close(); process.exit(esito ? 0 : 1);
