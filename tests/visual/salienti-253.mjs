#!/usr/bin/env node
/* [giro 253 · seguito PO-508, decisione PO 17/11 «Sì, anche dalla panchina»] GUARDIANO salienti-253 — `npm run salienti-253`.
   Gioca, non legge il sorgente (carriera vera da salvataggio sintetico, ?cpmtest; il provino dalla creazione vera con __CPM_PREP246).
   A. PANCHINA CON INGRESSO (mister: panchina, gancio __CPM_CD229; minuto d'ingresso fissato dal gancio di collaudo __CPM_BENCH_MIN=35):
      T  nella pre-partita c'e' «Gioca solo i momenti salienti» con la stessa nota e nello stesso posto (stessa fila di tasti) di una gara
         da titolare;
      I  premuto: formazioni e ingresso in campo (fase `walkout`) prima del gioco;
      P  in panchina la partita scorre in cronaca veloce: velo con «Sei in panchina…», nessuna scena prima dell'ingresso, gioco fluido
         <= 400 ms reali per minuto di gioco (la partita intera sta a ~1600);
      E  la cronaca veloce si ferma al minuto d'ingresso: il giocatore entra al 35' (±1), non dopo;
      H  dopo l'ingresso solo gli highlight: almeno una scena, gioco fluido sempre <= 400 ms/minuto, fischio finale e gara registrata.
   B. PANCHINA SENZA INGRESSO (__CPM_BENCH_MIN=95 e schede che spostano l'ingresso spente: il minuto non arriva mai): T, nessuna scena, cronaca veloce fino al fischio, messaggio
      chiaro nella schermata finale (data-cpm="salienti-253-mai", «Non sei entrato in campo», e nessun «Entrato al N'» sulla stessa schermata), gara registrata.
   D. PROVINO, IMPAGINAZIONE a 360 · 375 · 412 px: nella pre-partita tasto e nota a >= 16 px dai bordi; nelle formazioni «Ingresso in
      campo» e «Salta l'ingresso» interi (rettangolo non tagliato da nessun contenitore, portati in vista) e a >= 16 px dai bordi.
   Rosso window.__CPM_NO_G253 (comportamento di oggi): niente tasto dalla panchina, provino a margine 0 e tasti tagliati → DEVE cadere su
   A, B (pre-partita raggiunta: giudicato) e D. «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   [giro 287] l'etichetta di un tasto si legge SENZA la sua nota (dal 287 la nota e' il sottotitolo DENTRO il tasto).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node salienti-253.mjs   (CPM_PARTE=verde|rosso, CPM_SOLO=A|B|D) */
import { apriCarriera166, sleep } from './lib/partita-166.mjs';
import { startServer, launchBrowser, installCdnRoutes, clickByText } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto'; const SOLO = process.env.CPM_SOLO || null; const NOME = 'Collaudo Salienti 253';
const J = x => JSON.stringify(x);
const NOTA = /solo le tue azioni/;
const FILA_TITOLARE = ['Vedi le formazioni', 'Salta e gioca', 'Gioca solo i momenti salienti'];

/* una gara di lega NUOVA nella settimana W (stesso avversario, matchday 996): la giornata vera, misurato nel giro 246, a volte risulta
   gia' giocata appena aperto il salvataggio (dubbio 6 del 246, misurato in questo giro con misura-253c) */
async function gara(page, W) {
  await page.evaluate((w) => { const C = window.__CPM_CAREER, p = C.snapshot();
    const v = (p.calendar || []).find(m => m.week === w && !m.type); const opp = CLUBS.find(c => c.id === (v && v.opponentId)) || CLUBS.find(c => c.lg !== 'Deutsche Liga' && !c.isU18 && c.p >= 72 && c.p <= 80);
    C.patch({ week: w, weekLived: false, nationsCupQueue: null, euroMondiale: null, calendar: [...(p.calendar || []).filter(m => m.week !== w), { matchday: 996, week: w, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null }] }); }, W);
  for (let i = 0; i < 25; i++) { const t = await page.evaluate((w) => { const C = window.__CPM_CAREER; const m = C.thisWeekMd(); return !!m && m.matchday === 996 && C.snapshot().week === w; }, W).catch(() => false); if (t) return true; await sleep(200); }
  return false;
}
/* dal prompt alla schermata pre-partita (la conferenza stampa si chiude rispondendo, come in salienti-246) */
async function alPrepartita(page) {
  for (let i = 0; i < 60; i++) {
    const s = await page.evaluate(() => { const pp = document.querySelector('[data-cpm="prepartita23"]');
      return { pp: !!pp, f: typeof window.__CPM_PHASE === 'function' ? window.__CPM_PHASE() : null, solo: !!document.querySelector('[data-cpm="solo-243"]'),
        nota: ((document.querySelector('[data-cpm="solo-243-nota"]') || {}).textContent || '').trim(), bottoni: pp ? [...pp.querySelectorAll('button')].map(x => (c => (c.querySelectorAll('[data-cpm$="-nota"]').forEach(n => n.remove()), (c.textContent || '').trim()))(x.cloneNode(true))).filter(t => !/^←|Dashboard|Torna/i.test(t)) : [] }; }).catch(() => null);
    if (s && s.pp && s.f === 'matchday') return s;
    if (s && s.f && s.f !== 'matchday') return { ...s, fuoriPre: true };
    await page.evaluate(() => {
      const iv = document.querySelector('[data-cpm="intervista231"]');
      if (iv) { const B = [...iv.querySelectorAll('button')].filter(x => x.offsetParent !== null && !x.disabled); const b = B.find(x => /Rispondi|Continua|Avanti|Chiudi|Salta|Fine|Torna/i.test(x.textContent || '')) || B[0]; if (b) b.click(); return; }
      try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {}
      const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /^(Gioca la partita|Gioca · parti dalla panchina|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim()));
      const b = B[B.length - 1]; if (b) b.click(); }).catch(() => {});
    await sleep(500);
  }
  return { nonGiudicato: 'schermata pre-partita mai raggiunta' };
}
async function prepartita(A, panca) {
  if (!A.W) return { nonGiudicato: 'nessuna settimana con giornata di lega' };
  if (!await gara(A.page, A.W)) return { nonGiudicato: 'gara della settimana non pronta' };
  await A.page.evaluate((p) => { window.__CPM_CD229 = p ? 'bench' : null; }, panca);
  await A.page.evaluate(() => window.__CPM_CAREER.apriPartita('starter')); await sleep(800);
  const clic = await A.page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca( la partita| · parti dalla panchina)/.test((x.textContent || '').trim())); if (!b) return false; const t = (b.textContent || '').trim(); b.click(); return t; });
  if (!clic) return { nonGiudicato: 'prompt senza «Gioca»' };
  const r = await alPrepartita(A.page); return { ...r, ingresso: clic };
}

/* premuto il tasto: formazioni → ingresso → partita a soli salienti, guardando panchina, ingresso e scene */
async function gioca(page, forza) {
  const o = { visti: [], walkout: false, veloPanca: false, sceneInPanca: 0, sceneDopo: 0, entrataAl: null, minMax: 0, tPanca: 0, minPanca: null, tDopo: 0, mai: false, finita: false };
  /* E si giudica DENTRO la pagina (regole 3-4 di PROCESSO.md): il minuto massimo letto mentre il giocatore e' ancora in panchina, dallo stesso
     dato su cui si ferma la cronaca veloce (clockRef, __CPM_BALL3().c; onBenchRef, __CPM_LM215). Misurato alla prima stesura: letto da Node
     ogni 120 ms dopo l'ingresso, il minuto era 35 o 37 secondo il caso — la cronaca veloce riparte a ~20 minuti per scatto (velocita' x
     intervallo, la trappola del 7.360), non un difetto del gioco. */
  await page.evaluate(() => { window.__P253 = { maxPanca: -1, entrata: null }; const iv = setInterval(() => { try { const lm = window.__CPM_LM215 ? window.__CPM_LM215() : null; const m = window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : null;
    if (!lm || m == null || !(window.__CPM_PHASE && window.__CPM_PHASE() === 'playing' || window.__P253.maxPanca >= 0)) return;
    if (lm.onBench) window.__P253.maxPanca = Math.max(window.__P253.maxPanca, m); else if (window.__P253.maxPanca >= 0 && window.__P253.entrata == null) { window.__P253.entrata = m; clearInterval(iv); } } catch (e) {} }, 5); });
  if (forza) await page.evaluate(() => [...document.querySelectorAll('[data-cpm="prepartita23"] button')].find(x => /^Vedi le formazioni/.test((x.textContent || '').trim())).click());
  else await page.evaluate(() => document.querySelector('[data-cpm="solo-243"]').click());
  const t0 = Date.now(); let auto = false, fP = null, ult = Date.now(), panca0 = null, dopo0 = null, minUlt = 0, bP = true;
  while (Date.now() - t0 < 480000) {
    const s = await page.evaluate(() => { const lm = window.__CPM_LM215 ? window.__CPM_LM215() : null;
      return { f: window.__CPM_PHASE ? window.__CPM_PHASE() : null, lm, solo: window.__CPM_LM166 || null, m: window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : 0, ap: typeof window.__CPM_AUTOPLAY === 'function',
        velo: ((document.querySelector('[data-cpm="solo-253-testo"]') || {}).textContent || ''), mai: !!document.querySelector('[data-cpm="salienti-253-mai"]') && /Non sei entrato in campo/.test(document.body.innerText || '') }; }).catch(() => null);
    const ora = Date.now();
    if (s) {
      const panca = !!(s.lm && s.lm.onBench);
      if (fP === 'playing') { if (bP) o.tPanca += ora - ult; else o.tDopo += ora - ult; }
      if (s.f !== fP) { o.visti.push(s.f); if (/^hl_/.test(String(s.f)) && !/^hl_/.test(String(fP))) { if (panca) o.sceneInPanca++; else o.sceneDopo++; } fP = s.f; }
      if (s.f === 'walkout') o.walkout = true;
      if (s.solo) o.solo = s.solo;
      if (s.f === 'playing' && panca && /Sei in panchina/.test(s.velo)) { if (!o.veloPanca && process.env.CPM_FOTO) await page.screenshot({ path: process.env.CPM_FOTO + '/velo-panchina-253-' + Date.now() + '.png' }).catch(() => {}); o.veloPanca = true; }
      if (s.f === 'playing' && panca0 === null) panca0 = s.m || 0;
      if (s.f === 'playing' && panca) o.minPanca = s.m || 0;
      if (bP && !panca && s.lm && panca0 !== null) { bP = false; o.entrataAl = s.m || 0; dopo0 = s.m || 0; }
      o.minMax = Math.max(o.minMax, s.m || 0); minUlt = s.m || 0;
      if (s.mai) o.mai = true;
      if (s.f === 'formations' && !auto) await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && /^Ingresso in campo/.test((x.textContent || '').trim())); if (b) b.click(); }).catch(() => {});
      if (!auto && s.ap && (s.f === 'walkout' || s.f === 'playing')) { if (s.f === 'walkout') await sleep(1200); auto = true; await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7253, policy: 'seeded', tickMs: 300 })); }
      if (s.f === 'ended' || s.f === 'ceremony' || s.f === 'shootout') { o.finita = true; if (s.f === 'ended') { await sleep(1500); o.mai = await page.evaluate(() => !!document.querySelector('[data-cpm="salienti-253-mai"]') && /Non sei entrato in campo/.test(document.body.innerText || '') && !/Entrato al \d/.test(document.body.innerText || '')).catch(() => false); if (o.mai && process.env.CPM_FOTO) await page.screenshot({ path: process.env.CPM_FOTO + '/mai-entrato-253.png' }).catch(() => {}); } break; }
    }
    ult = ora; await sleep(120);
  }
  o.panca0 = panca0; o.p253 = await page.evaluate(() => window.__P253 || null).catch(() => null);
  o.passoPanca = (panca0 != null && o.minPanca != null && o.minPanca - panca0 >= 20) ? Math.round(o.tPanca / (o.minPanca - panca0)) : null;
  o.passoDopo = (dopo0 != null && o.minMax - dopo0 >= 20) ? Math.round(o.tDopo / (o.minMax - dopo0)) : null;
  return o;
}
async function registra(page, n0) {
  for (let i = 0; i < 70; i++) {
    const ok = await page.evaluate((n0) => ((JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}).matchHistory || []).length > n0, n0).catch(() => false);
    if (ok) return true;
    await page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /Continua|Avanti|Torna|Prosegui|Vai|Chiudi|Fine|Rispondi|Salta|Salva/i.test(x.textContent || '')); const b = B[B.length - 1]; if (b) b.click(); }).catch(() => {});
    await sleep(700);
  }
  return false;
}

/* fila di tasti di una gara da titolare (riferimento per «stesso posto»), letta sulla stessa pagina */
async function filaTitolare(rosso) {
  const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G253: true } : {}, nome: NOME }); let r;
  try { r = await prepartita(A, false); } catch (e) { r = { nonGiudicato: String(e.message).slice(0, 120) }; }
  await A.b.close(); A.srv.close(); return r;
}
async function panchina(rosso, minIngresso, rif, forza) {
  /* B: il «mai entrato» il gioco non lo produce da solo (ingresso 46'-82', le scelte della panchina lo ANTICIPANO soltanto): si provoca dalla
     sonda (regola 7) con il minuto di collaudo oltre il 90' e spegnendo le due schede che riscrivono il minuto (INT226 «chiedo di entrare»
     e INT259) — misurato alla prima stesura: con le schede accese l'ingresso cadeva al 72' */
  const mai = minIngresso > 90 ? { __CPM_NO_INT226: true, __CPM_NO_SCHEDE259: true } : {};
  /* forza: la modalita' a soli salienti accesa dal gancio di collaudo (__CPM_SOLO166) senza il tasto — nel braccio rosso prova che il fermo
     all'ingresso ha effetto: senza, il minuto supera il 35' col giocatore ancora in panchina */
  const A = await apriCarriera166({ init: { ...(rosso ? { __CPM_NO_G253: true } : {}), __CPM_BENCH_MIN: minIngresso, ...mai, ...(forza ? { __CPM_SOLO166: true } : {}) }, nome: NOME, reseed: 4253 }); const out = {};
  try {
    const n0 = await A.page.evaluate(() => (window.__CPM_CAREER.snapshot().matchHistory || []).length);
    const r = await prepartita(A, true); out.r = r;
    out.pp = !!(r && r.pp && !r.fuoriPre && /panchina/.test(r.ingresso || ''));
    out.tasto = out.pp && r.solo && NOTA.test(r.nota) && J(r.bottoni) === J(rif && rif.bottoni ? rif.bottoni : FILA_TITOLARE) && rif && rif.pp;
    if (forza && out.pp) { out.g = await gioca(A.page, true); }
    else if (out.tasto) { out.g = await gioca(A.page); if (out.g.finita) out.registrata = await registra(A.page, n0); }
  } catch (e) { out.err = String(e.message).slice(0, 180); }
  out.errs = A.errs.slice(0, 3); await A.b.close(); A.srv.close(); return out;
}
function giudicaA(o) {
  const g = o.g || {}; const ng = !o.pp ? `NON GIUDICATO: ${o.err || (o.r && (o.r.nonGiudicato || (o.r.fuoriPre ? 'pre-partita saltata, fase ' + o.r.f : 'pre-partita non raggiunta')))}` : '';
  const tq = o.tasto ? '' : 'NON GIUDICATO: tasto assente · ';
  return [
    { k: 'T tasto dalla panchina, stessa nota e stessa fila', ok: !!o.tasto, info: ng || `prompt «${o.r.ingresso}» · fila ${J(o.r.bottoni)} · nota «${o.r.nota}»` },
    { k: 'I formazioni e ingresso prima del gioco', ok: !!o.tasto && g.walkout && g.visti.indexOf('walkout') >= 0 && g.visti.indexOf('walkout') < g.visti.indexOf('playing'), info: tq + `fasi ${J((g.visti || []).slice(0, 8))}` },
    { k: 'P in panchina cronaca veloce, velo, nessuna scena', ok: !!o.tasto && g.veloPanca && g.sceneInPanca === 0 && g.passoPanca != null && g.passoPanca <= 400, info: tq + `velo panchina ${g.veloPanca} · scene in panchina ${g.sceneInPanca} · ${g.passoPanca == null ? 'passo NON GIUDICATO' : g.passoPanca + ' ms/minuto'} (minuti ${g.panca0}→${g.minPanca})` },
    { k: 'E la cronaca veloce si ferma all\'ingresso (35\'): in panchina il minuto non supera mai il 35\', e il giocatore entra', ok: !!o.tasto && !!g.p253 && g.p253.maxPanca === 35 && g.p253.entrata != null && g.entrataAl != null,
      info: tq + `minuto massimo in panchina ${g.p253 ? g.p253.maxPanca : '—'}' · primo minuto letto in campo ${g.p253 ? g.p253.entrata : '—'}' (dentro la pagina) · da Node ${g.entrataAl}'` },
    { k: 'H dopo l\'ingresso solo highlight, fischio, registrata', ok: !!o.tasto && g.sceneDopo >= 1 && g.passoDopo != null && g.passoDopo <= 400 && g.finita && !!o.registrata && !!o.g.solo && o.g.solo.attiva === true,
      info: tq + `scene dopo ${g.sceneDopo} · ${g.passoDopo == null ? 'passo NON GIUDICATO' : g.passoDopo + ' ms/minuto'} · finita ${g.finita} al ${g.minMax}' · registrata ${!!o.registrata} · testimone ${J(g.solo || null)}` },
    { k: 'errori di pagina', ok: !(o.errs || []).length && !o.err, info: J([o.errs, o.err || null]) }];
}
function giudicaB(o) {
  const g = o.g || {}; const ng = !o.pp ? `NON GIUDICATO: ${o.err || (o.r && (o.r.nonGiudicato || 'pre-partita non raggiunta'))}` : '';
  const tq = o.tasto ? '' : 'NON GIUDICATO: tasto assente · ';
  return [
    { k: 'T tasto dalla panchina', ok: !!o.tasto, info: ng || `fila ${J(o.r.bottoni)}` },
    { k: 'mai entrato: nessuna scena, cronaca veloce fino al fischio', ok: !!o.tasto && g.finita && g.entrataAl == null && (g.sceneInPanca + g.sceneDopo) === 0 && g.passoPanca != null && g.passoPanca <= 400 && g.minMax >= 89,
      info: tq + `finita ${g.finita} al ${g.minMax}' · entrato ${g.entrataAl} · scene ${(g.sceneInPanca | 0) + (g.sceneDopo | 0)} · ${g.passoPanca == null ? 'passo NON GIUDICATO' : g.passoPanca + ' ms/minuto'}` },
    { k: 'messaggio chiaro «Non sei entrato in campo» e gara registrata', ok: !!o.tasto && g.mai && !!o.registrata, info: tq + `messaggio ${g.mai} · registrata ${!!o.registrata}` },
    { k: 'errori di pagina', ok: !(o.errs || []).length && !o.err, info: J([o.errs, o.err || null]) }];
}

/* D. provino: impaginazione */
async function provino(rosso, W) {
  const H = { 360: 740, 375: 812, 412: 915 }[W];
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); const out = { W };
  try {
    await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_PREP246 = true; if (r) window.__CPM_NO_G253 = true; }, rosso);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(800);
    if (!await clickByText(page, 'Nuova carriera')) throw new Error('"Nuova carriera" non trovato');
    await sleep(700);
    await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, NOME);
    if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('"INIZIA I PROVINI" non trovato');
    await sleep(500); await clickByText(page, 'Inizia il provino');
    for (let i = 0; i < 80; i++) { if (await page.evaluate(() => !!document.querySelector('[data-cpm="solo-243"]')).catch(() => false)) break; await sleep(400); }
    /* rettangolo VISIBILE: il rettangolo dell'elemento intersecato con viewport e con ogni antenato che taglia (overflow non visible) */
    const mis = sel => page.evaluate((sel) => { const el = typeof sel === 'string' && sel.startsWith('[') ? document.querySelector(sel) : [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && new RegExp(sel).test((x.textContent || '').trim()));
      if (!el) return null; el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(); let v = { l: r.left, t: r.top, r: r.right, b: r.bottom };
      const cut = (q) => { v = { l: Math.max(v.l, q.left), t: Math.max(v.t, q.top), r: Math.min(v.r, q.right), b: Math.min(v.b, q.bottom) }; };
      cut({ left: 0, top: 0, right: innerWidth, bottom: innerHeight });
      for (let a = el.parentElement; a; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') cut(a.getBoundingClientRect()); }
      const ah = Math.max(0, v.b - v.t), aw = Math.max(0, v.r - v.l);
      return { sx: Math.round(r.left), dx: Math.round(innerWidth - r.right), h: Math.round(r.height), intero: ah >= r.height - 1 && aw >= r.width - 1, visH: Math.round(ah) }; }, sel).catch(() => null);
    out.pre = { tasto: await mis('[data-cpm="solo-243"]'), nota: await mis('[data-cpm="solo-243-nota"]') };
    await page.evaluate(() => document.querySelector('[data-cpm="solo-243"]').click());
    for (let i = 0; i < 40; i++) { if (await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'formations').catch(() => false)) break; await sleep(300); }
    await sleep(1500);
    out.form = { ing: await mis('^Ingresso in campo'), salta: await mis('^Salta l\'ingresso') };
  } catch (e) { out.err = String(e.message).slice(0, 160); }
  out.errs = errs.slice(0, 3); await b.close(); srv.close(); return out;
}
const bordi = x => !!x && x.sx >= 16 && x.dx >= 16;
function giudicaD(o) {
  const p = o.pre || {}, f = o.form || {};
  return [
    { k: `${o.W} px pre-partita: tasto e nota a >= 16 px dai bordi`, ok: bordi(p.tasto) && bordi(p.nota) && p.tasto.intero, info: o.err || `tasto ${J(p.tasto)} · nota ${J(p.nota)}` },
    { k: `${o.W} px formazioni: «Ingresso in campo» e «Salta l'ingresso» interi, a >= 16 px dai bordi`, ok: !!f.ing && !!f.salta && f.ing.intero && f.salta.intero && bordi(f.ing) && bordi(f.salta), info: o.err || `ingresso ${J(f.ing)} · salta ${J(f.salta)}` },
    { k: `${o.W} px errori di pagina`, ok: !(o.errs || []).length && !o.err, info: J([o.errs, o.err || null]) }];
}

async function braccio(rosso) {
  const ris = []; const tag = rosso ? 'rosso' : 'verde';
  if (!SOLO || SOLO === 'A' || SOLO === 'B') {
    const rif = await filaTitolare(rosso); console.log(`  [${tag}] fila di riferimento (titolare): ${J(rif.bottoni || rif)}`);
    if (!SOLO || SOLO === 'A') { const o = await panchina(rosso, 35, rif); const righe = giudicaA(o); ris.push({ nome: 'A panchina con ingresso al 35\'', righe, giudicato: !!o.pp }); console.log(`  [${tag}] A: ${righe.map(x => (x.ok ? '✓' : '✗') + x.k.split(' ')[0]).join(' ')}`); }
    if (rosso && (!SOLO || SOLO === 'A')) { const o = await panchina(true, 35, rif, true); const g = o.g || {};
      const r = { k: 'E senza il fermo (gancio __CPM_SOLO166, rosso 253): il minuto supera il 35\' col giocatore in panchina', ok: !!(o.pp && g.p253 && g.p253.maxPanca > 35), info: o.pp ? `minuto massimo in panchina ${g.p253 ? g.p253.maxPanca : '—'}' · testimone ${J(g.solo || null)}` : 'NON GIUDICATO: pre-partita non raggiunta' };
      /* qui «ok» vuol dire che il difetto si VEDE: e' la riga che il rosso deve far cadere su E */
      ris.push({ nome: 'A\' panchina, soli salienti dal gancio, senza fermo', righe: [{ ...r, ok: !r.ok, k: 'E il minuto non supera il 35\' in panchina' + (r.ok ? '' : ' (il difetto non si vede: ' + r.info + ')') }], giudicato: !!(o.pp && g.p253 && g.p253.maxPanca >= 0), info: r.info });
      console.log(`  [rosso] A' (gancio): ${r.info}`); }
    if (!SOLO || SOLO === 'B') { const o = await panchina(rosso, 95, rif); const righe = giudicaB(o); ris.push({ nome: 'B panchina senza ingresso', righe, giudicato: !!o.pp }); console.log(`  [${tag}] B: ${righe.map(x => (x.ok ? '✓' : '✗') + x.k.split(' ')[0]).join(' ')}`); }
  }
  if (!SOLO || SOLO === 'D') for (const W of [360, 375, 412]) { const o = await provino(rosso, W); const righe = giudicaD(o); ris.push({ nome: `D provino ${W} px`, righe, giudicato: !o.err && !!(o.pre && o.pre.tasto) }); console.log(`  [${tag}] D ${W}: ${righe.map(x => (x.ok ? '✓' : '✗')).join(' ')}`); }
  return ris;
}
const stampa = (tit, B) => { console.log(tit); for (const p of B) { console.log(`  ${p.nome}`); for (const x of p.righe) console.log(`    ${x.ok ? '✓' : '✗'} ${x.k} — ${x.info}`); } };
let V = null, R = null, verde = null, rosso = null;
if (PARTE !== 'rosso') { V = await braccio(false); verde = V.length > 0 && V.every(p => p.righe.every(x => x.ok)); }
if (PARTE !== 'verde') { R = await braccio(true);
  /* ogni parte deve cadere GIUDICATA: A e B sul tasto con la pre-partita raggiunta, D su margini o tasti tagliati con la pagina aperta */
  rosso = R.length > 0 && R.every(p => p.giudicato && p.righe.slice(0, p.nome.startsWith('D') ? 2 : 1).some(x => !x.ok)); }
if (V) stampa('braccio VERDE', V);
if (R) stampa('braccio ROSSO (__CPM_NO_G253)', R);
if (verde !== null) console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
if (rosso !== null) console.log(`ROSSO: ${rosso ? 'CADE (come deve) su ogni parte' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit((verde === null || verde) && (rosso === null || rosso) ? 0 : 1);
