#!/usr/bin/env node
/* [giro 290 · PO-549] GUARDIANO avviso-290 — `npm run avviso-290`.
   Foto del PO (finestra della settimana «GIOCA LA PARTITA / Simula e avanza la settimana / Non ora»): «non c'è il gioco solo azioni salienti».
   Decisione PO 17/11 + 19/11: il tasto «Gioca solo i momenti salienti» sta in UN SOLO punto, la pre-partita. Dove si preme «Gioca» PRIMA
   della pre-partita c'e' solo la riga «Vuoi giocare solo i momenti salienti? Lo scegli nel pre-partita» (giro 318) (data-cpm="avviso-290").
   Gioca, non legge il sorgente. Telefono 360x800. Per ogni percorso:
     1. RIGA: nella schermata d'ingresso (finestra della settimana da titolare e dalla panchina, card «Prossima» della home, convocazione
        della Nazionale, lobby Coppa delle Nazioni e Mondiale, provino) la riga c'e', visibile, col testo esatto, sotto il «Gioca»;
     2. NON TAGLIATA: a 360 px la riga sta dentro lo schermo e dentro la sua scatola (niente testo tagliato), nessuno scorrimento orizzontale;
     3. UNICO PUNTO: in nessuna schermata prima della pre-partita c'e' un TASTO dei momenti salienti;
     4. PROMESSA MANTENUTA: la pre-partita che segue ha davvero il tasto (data-cpm="solo-243");
     5. CONDIZIONE: da infortunato (nessun «Gioca») la riga non c'e'.
   Rosso window.__CPM_NO_G290 (com'era): la riga non c'e' → DEVE cadere su ogni percorso, con la pre-partita raggiunta (giudicato).
   «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node avviso-290.mjs   (CPM_PARTE=verde|rosso, CPM_SOLO=<nome percorso>, CPM_FOTO=<cartella>) */
import { apriCarriera166, sleep } from './lib/partita-166.mjs';
import { startServer, launchBrowser, installCdnRoutes, clickByText } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto'; const SOLO = process.env.CPM_SOLO || null; const FOTO = process.env.CPM_FOTO || null;
const NOME = 'Collaudo Avviso 290'; const VP = { width: 360, height: 800 }; const J = x => JSON.stringify(x);
const TESTO = 'Vuoi giocare solo i momenti salienti? Lo scegli nel pre-partita';/* [giro 318 · PO-605] testo nuovo del PO */

/* stato della schermata: la riga (visibile, intera), i tasti dei salienti fuori dalla pre-partita, lo scorrimento orizzontale */
const leggi = page => page.evaluate((T) => {
  const vis = e => { if (!e || e.offsetParent === null) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const pp = document.querySelector('[data-cpm="prepartita23"]');
  /* con la finestra della settimana aperta sopra la home si guarda solo la finestra (la riga della home resta sotto il velo) */
  const top = document.querySelector('[data-cpm="partita23"]') || document;
  const righe = [...top.querySelectorAll('[data-cpm="avviso-290"]')].filter(vis).map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return { t: (e.textContent || '').trim(), l: Math.round(r.left), r: Math.round(r.right), w: e.scrollWidth, cw: e.clientWidth, h: e.scrollHeight, ch: e.clientHeight, ws: cs.whiteSpace, ov: cs.textOverflow, fs: parseFloat(cs.fontSize) }; });
  const tasti = [...document.querySelectorAll('button')].filter(b => vis(b) && /momenti salienti/i.test(b.textContent || '') && !(pp && pp.contains(b))).map(b => (b.textContent || '').trim().slice(0, 50));
  const gioca = [...document.querySelectorAll('button')].filter(b => vis(b) && /Gioca|Inizia il provino/i.test(b.textContent || '') && !/salienti/i.test(b.textContent || '')).map(b => (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40));
  return { righe, tasti, gioca, scorre: document.documentElement.scrollWidth > window.innerWidth + 1, vw: window.innerWidth,
    pp: !!pp, solo: !!document.querySelector('[data-cpm="solo-243"]'), f: typeof window.__CPM_PHASE === 'function' ? window.__CPM_PHASE() : null,
    schermo: [...document.querySelectorAll('[data-cpm]')].filter(vis).map(x => x.getAttribute('data-cpm')).filter(x => /partita23|prossima-v2|convocazione235|avviso-290/.test(x)) };
}, TESTO).catch(e => ({ err: String(e.message).slice(0, 120) }));
const rigaOk = (s, vw) => s.righe.length === 1 && s.righe[0].t === TESTO && s.righe[0].l >= 0 && s.righe[0].r <= vw && s.righe[0].w <= s.righe[0].cw + 1 && s.righe[0].h <= s.righe[0].ch + 1 && !s.scorre;

async function foto(page, nome) { if (!FOTO) return; try { await page.screenshot({ path: `${FOTO}/${nome}.png`, fullPage: false }); } catch (e) {} }

/* dal clic d'ingresso alla pre-partita: ogni schermata attraversata si guarda (tasti fuori, righe), la convocazione si fotografa */
async function alPrepartita(page, O) {
  for (let i = 0; i < 60; i++) {
    await sleep(300); const s = await leggi(page); if (process.env.CPM_TRACE) console.log("    traccia", i, s.f, J(s.schermo), J(s.gioca));
    for (const t of s.tasti || []) if (!O.fuori.includes(t)) O.fuori.push(t);
    if (s.schermo && s.schermo.includes('convocazione235') && !O.convocazione) { O.convocazione = s; await foto(page, O.tag + '-convocazione'); }
    if (s.pp && s.f === 'matchday') return s;
    if (s.f && s.f !== 'matchday') return { ...s, fuoriPre: true };
    await page.evaluate(() => {
      const iv = document.querySelector('[data-cpm="intervista231"]');
      if (iv) { const B = [...iv.querySelectorAll('button')].filter(x => x.offsetParent !== null && !x.disabled);
        const b = B.find(x => /Rispondi|Continua|Avanti|Chiudi|Salta|Fine|Torna/i.test(x.textContent || '')) || B[0]; if (b) b.click(); return; }
      /* la convocazione si chiude col suo «Gioca la partita»: dismiss() la cancellerebbe */
      if (!document.querySelector('[data-cpm="convocazione235"]')) try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {}
      const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /^(Gioca la partita|Gioca · parti dalla panchina|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim()));
      const b = B[B.length - 1]; if (b) b.click(); }).catch(() => {});
    await sleep(500);
  }
  return null;
}
async function settimana(page, W, tipo) {
  const opp = await page.evaluate(({ w, t }) => { const C = window.__CPM_CAREER, p = C.snapshot(); const o = (p.calendar || []).find(m => m.week === w && !m.type);
    const md = { ...o, matchday: 996, played: false, result: null };
    /* amichevole della Nazionale calendarizzata: il «Gioca» passa dalla convocazione (src/18, startMatch → nationalCallup) */
    if (t === 'national') { md.type = 'national'; md.opponentName = 'Francia'; md.opponentId = 'nat_francia'; }
    C.patch({ week: w, weekLived: false, nationsCupQueue: null, euroMondiale: null, calendar: [...(p.calendar || []).filter(m => m.week !== w), md] }); return md; }, { w: W, t: tipo || null });
  for (let i = 0; i < 25; i++) { const ok = await page.evaluate((w) => { const C = window.__CPM_CAREER; return !!C.thisWeekMd() && C.snapshot().week === w; }, W).catch(() => false); if (ok) break; await sleep(200); }
  return opp;
}
const EM = () => ({ euroMondiale: { active: true, done: false, type: 'Mondiale', season: 2, phase: 'group', host: 'Germania', qualOpponents: ['Belgio', 'Croazia', 'Scozia'], qualMatchIdx: 0, qualPts: 0, qualDone: false,
  groupOpponents: ['Belgio', 'Croazia', 'Scozia'], groupMatchIdx: 0, groupPts: 0, groupResults: [], groupMatches: [], koResults: [] }, nationsCupQueue: null });
const NC = s => ({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'], matchIdx: 0, pts: 0, matches: [], done: false }, euroMondiale: null });

const PERCORSI = [
  { nome: 'finestra della settimana · titolare', tag: 'prompt-titolare', tipo: 'prompt', st: 'starter' },
  { nome: 'finestra della settimana · panchina', tag: 'prompt-panchina', tipo: 'prompt', st: 'bench' },
  { nome: 'finestra della settimana · Primavera U18', tag: 'prompt-u18', tipo: 'prompt', st: 'starter', u18: true },
  { nome: 'Nazionale amichevole · finestra → convocazione', tag: 'prompt-nazionale', tipo: 'prompt', st: 'starter', md: 'national' },
  { nome: 'home · card «Prossima»', tag: 'home', tipo: 'home' },
  { nome: 'Coppa delle Nazioni · lobby', tag: 'lobby-nc', tipo: 'lobby', patch: s => NC(s) },
  { nome: 'Mondiale · lobby', tag: 'lobby-em', tipo: 'lobby', patch: () => EM() },
  { nome: 'provino · creazione', tag: 'provino', tipo: 'provino' },
];

async function apriProvino(init) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: FOTO ? 2 : 1 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript((init) => { window.__CPM_GLB = false; window.__CPM_PREP246 = true; for (const k of Object.keys(init)) window[k] = init[k]; }, init);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(800);
  if (!await clickByText(page, 'Nuova carriera')) throw new Error('"Nuova carriera" non trovato');
  await sleep(700);
  await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, NOME);
  if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('"INIZIA I PROVINI" non trovato');
  await sleep(900);
  return { page, b, srv, errs };
}

async function percorso(P, rosso) {
  const init = rosso ? { __CPM_NO_G290: true } : {}; const O = { nome: P.nome, tag: (rosso ? 'rosso-' : 'verde-') + P.tag, fuori: [] }; let A;
  try {
    if (P.tipo === 'provino') {
      A = await apriProvino(init);
      for (let i = 0; i < 20; i++) { const s = await leggi(A.page); if ((s.gioca || []).some(t => /Inizia il provino/.test(t))) break; await sleep(300); }
      O.ingresso = await leggi(A.page); await foto(A.page, O.tag);
      for (const t of O.ingresso.tasti || []) O.fuori.push(t);
      await clickByText(A.page, 'Inizia il provino');
      for (let i = 0; i < 80; i++) { const f = await A.page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null); if (f) break; await sleep(400); }
      O.pre = await alPrepartita(A.page, O);
    } else {
      A = await apriCarriera166({ init, nome: NOME, reseed: 4290, vp: VP });
      if (!A.W) throw new Error('nessuna settimana con giornata di lega');
      const s0 = await A.page.evaluate(() => window.__CPM_CAREER.snapshot());
      if (P.u18) { await A.page.evaluate(() => window.__CPM_CAREER.patch({ proStatus: 'u18' })); await sleep(400); }
      if (P.tipo === 'prompt') {
        await settimana(A.page, A.W, P.md); await sleep(300);
        if (P.st === 'bench') await A.page.evaluate(() => { window.__CPM_CD229 = 'bench'; });
        await A.page.evaluate(({ st, t }) => window.__CPM_CAREER.apriPartita(st, t || undefined), { st: P.st, t: P.md || null }); await sleep(900);
        O.ingresso = await leggi(A.page); await foto(A.page, O.tag);
        for (const t of O.ingresso.tasti || []) O.fuori.push(t);
        const clic = await A.page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca( la partita| · parti dalla panchina)/.test((x.textContent || '').trim())); if (!b) return false; b.click(); return true; });
        if (clic) O.pre = await alPrepartita(A.page, O);
      } else if (P.tipo === 'home') {
        await settimana(A.page, A.W);
        await A.page.evaluate(() => window.__CPM_CAREER.patch({ weekLived: true })); await sleep(700);
        await A.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} window.__CPM_CAREER.goTab('dashboard'); }); await sleep(1300);
        await A.page.evaluate(() => { const e = document.querySelector('[data-cpm="prossima-v2"]'); if (e) e.scrollIntoView({ block: 'center' }); }); await sleep(400);
        O.ingresso = await leggi(A.page); await foto(A.page, O.tag);
        for (const t of O.ingresso.tasti || []) O.fuori.push(t);
        const clic = await A.page.evaluate(() => { const c = document.querySelector('[data-cpm="prossima-v2"]'); const b = c && c.querySelector('[data-cpm="avanza23"]'); if (!b || b.disabled) return false; b.click(); return true; });
        if (clic) { await sleep(900); O.finestra = await leggi(A.page); O.pre = await alPrepartita(A.page, O); }
      } else {
        await A.page.evaluate(({ w, p }) => window.__CPM_CAREER.patch({ week: w, weekLived: true, ...p }), { w: A.W, p: P.patch(s0) }); await sleep(600);
        await A.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} window.__CPM_CAREER.goTab('nazionale'); }); await sleep(1500);
        await A.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && /^⚽\s*Gioca/.test((x.textContent || '').trim())); if (b) b.scrollIntoView({ block: 'center' }); }); await sleep(400);
        O.ingresso = await leggi(A.page); await foto(A.page, O.tag);
        for (const t of O.ingresso.tasti || []) O.fuori.push(t);
        const clic = await A.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && /^⚽\s*Gioca/.test((x.textContent || '').trim())); if (!b) return false; b.click(); return true; });
        if (clic) O.pre = await alPrepartita(A.page, O);
      }
      if (O.pre && O.pre.pp) await foto(A.page, O.tag + '-prepartita');
    }
  } catch (e) { O.err = String(e.message).slice(0, 180); }
  O.errs = A ? A.errs.slice(0, 3) : [];
  if (A) { await A.b.close().catch(() => {}); A.srv.close(); }
  return O;
}
function giudica(O, P) {
  const i = O.ingresso || {}; const pre = O.pre && O.pre.pp && !O.pre.fuoriPre;
  const ng = !O.ingresso || i.err ? `NON GIUDICATO: ${O.err || i.err || 'schermata d\'ingresso mai letta'}` : '';
  const righe = [
    { k: 'riga sotto il Gioca', ok: !ng && (i.gioca || []).length > 0 && i.righe.length === 1 && i.righe[0].t === TESTO, info: ng || `righe ${J(i.righe.map(r => r.t))} · Gioca ${J(i.gioca)}` },
    { k: 'non tagliata a 360', ok: !ng && rigaOk(i, VP.width), info: ng || `${J(i.righe)} · scorrimento orizzontale ${i.scorre}` },
  ];
  if (P.tag === 'home') righe.push({ k: 'la finestra che segue ha la riga', ok: !!O.finestra && rigaOk(O.finestra, VP.width), info: O.finestra ? J(O.finestra.righe) : 'NON GIUDICATO: finestra non letta' });
  if (P.md === 'national') righe.push({ k: 'la convocazione ha la riga', ok: !!O.convocazione && rigaOk(O.convocazione, VP.width), info: O.convocazione ? J(O.convocazione.righe) : 'NON GIUDICATO: convocazione mai vista' });
  righe.push({ k: 'unico punto (nessun tasto salienti prima)', ok: !ng && pre && O.fuori.length === 0, info: pre ? `fuori ${J(O.fuori)}` : 'NON GIUDICATO: pre-partita non raggiunta ' + J(O.pre || O.err || null).slice(0, 160) });
  righe.push({ k: 'la pre-partita ha il tasto', ok: pre && O.pre.solo, info: pre ? `solo-243 ${O.pre.solo}` : 'NON GIUDICATO' });
  righe.push({ k: 'errori di pagina', ok: !(O.errs || []).length && !O.err, info: J([O.errs, O.err || null]) });
  return righe;
}
/* da infortunato la finestra non ha «Gioca»: la riga non c'e' */
async function infortunato(rosso) {
  const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G290: true } : {}, nome: NOME, reseed: 4290, vp: VP }); let s = null;
  try { await settimana(A.page, A.W); await A.page.evaluate(() => window.__CPM_CAREER.patch({ injured: true, injuryWeeks: 2, injuryType: 'stiramento' })); await sleep(500);
    await A.page.evaluate(() => window.__CPM_CAREER.apriPartita('starter')); await sleep(900); s = await leggi(A.page); } catch (e) { s = { err: String(e.message).slice(0, 120) }; }
  await A.b.close(); A.srv.close();
  const giud = s && !s.err && (s.schermo || []).includes('partita23');
  return { nome: 'infortunato: finestra senza «Gioca» e senza riga', ok: giud && !(s.gioca || []).some(t => /^Gioca/.test(t)) && s.righe.length === 0, info: giud ? `Gioca ${J(s.gioca)} · righe ${s.righe.length}` : 'NON GIUDICATO ' + J(s).slice(0, 140) };
}

async function braccio(rosso) {
  const ris = [];
  for (const P of PERCORSI) { if (SOLO && !P.nome.includes(SOLO)) continue;
    const O = await percorso(P, rosso); const righe = giudica(O, P);
    ris.push({ nome: P.nome, righe, pre: !!(O.pre && O.pre.pp && !O.pre.fuoriPre), letta: !!(O.ingresso && !O.ingresso.err) });
    console.log(`  [${rosso ? 'rosso' : 'verde'}] ${P.nome}: ${righe.map(x => (x.ok ? '✓' : '✗') + x.k).join(' · ')}`); }
  const inf = (!SOLO || SOLO === 'infortunato') ? await infortunato(rosso) : null;
  return { ris, inf };
}
const stampa = (tit, B) => { console.log(tit); for (const p of B.ris) { console.log(`  ${p.nome}`); for (const x of p.righe) console.log(`    ${x.ok ? '✓' : '✗'} ${x.k} — ${x.info}`); }
  if (B.inf) console.log(`  ${B.inf.ok ? '✓' : '✗'} ${B.inf.nome} — ${B.inf.info}`); };

let V = null, R = null, verde = null, rosso = null;
if (PARTE !== 'rosso') { V = await braccio(false); verde = (V.ris.length > 0 || !!V.inf) && V.ris.every(p => p.righe.every(x => x.ok)) && (!V.inf || V.inf.ok); }
if (PARTE !== 'verde') { R = await braccio(true);
  /* ogni percorso: schermata letta, pre-partita raggiunta (giudicato) e riga assente (il primo giudizio cade) */
  rosso = R.ris.length > 0 && R.ris.every(p => p.letta && p.pre && !p.righe[0].ok); }
if (V) stampa('braccio VERDE', V);
if (R) stampa('braccio ROSSO (__CPM_NO_G290)', R);
if (verde !== null) console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
if (rosso !== null) console.log(`ROSSO: ${rosso ? 'CADE (come deve) su ogni percorso' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit((verde === null || verde) && (rosso === null || rosso) ? 0 : 1);
