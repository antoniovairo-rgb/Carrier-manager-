#!/usr/bin/env node
/* [giro 246 · seguito PO-508, decisione PO 17/11 «Gioca solo salienti ci deve essere in tutte le partite e deve comparire in un unico punto,
   va standardizzato» + «Vedere sempre l'ingresso»] GUARDIANO salienti-246 — `npm run salienti-246`.
   Gioca, non legge il sorgente. Per OGNI percorso che apre una partita giocabile (carriera vera da salvataggio sintetico, ?cpmtest; il
   provino dalla creazione vera con il gancio __CPM_PREP246, perche' sotto cpmtest le sonde lo aprono dritto in campo):
     1. TASTO: nella schermata pre-partita (data-cpm="prepartita23") c'e' «Gioca solo i momenti salienti» (data-cpm="solo-243") con la nota;
     2. UNICO PUNTO: in nessuna schermata attraversata prima della pre-partita (prompt, convocazione, lobby della Nazionale) c'e' un tasto
        dei momenti salienti;
     3. INGRESSO: premuto il tasto si vedono formazioni e ingresso in campo (fase `walkout` raggiunta) PRIMA della prima scena;
     4. SOLI SALIENTI: la partita e' a soli salienti (testimone __CPM_LM166 attiva e scelta243, velo «solo-166-velo», gioco fluido
        <= 400 ms reali per minuto di gioco fino alla prima scena — la partita intera sta a ~1600).
   Tre partite (Mondiale gironi, Primavera, provino) si giocano fino al fischio e la carriera/il provino le registrano.
   Negativo: da PANCHINA il tasto non c'e'.
   Rosso window.__CPM_NO_G246 (comportamento del giro 243): il tasto torna nel prompt e nelle lobby, il tasto della pre-partita salta
   formazioni e ingresso, Primavera e provino non lo hanno, il provino non passa dalla pre-partita → DEVE cadere su ogni percorso.
   «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node salienti-246.mjs   (CPM_PARTE=verde|rosso, CPM_SOLO=<nome percorso>) */
import { apriCarriera166, sleep } from './lib/partita-166.mjs';
import { startServer, launchBrowser, installCdnRoutes, clickByText } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto'; const NOME = 'Collaudo Salienti 246'; const SOLO = process.env.CPM_SOLO || null;
const J = x => JSON.stringify(x);
const RX_SOLO = /momenti salienti/i;

async function inietta(page, W, tipo) {
  return page.evaluate(({ w, tipo }) => {
    const C = window.__CPM_CAREER, p = C.snapshot();
    const opp = CLUBS.find(c => c.lg !== 'Deutsche Liga' && !c.isU18 && c.p >= 72 && c.p <= 80);
    const md = { matchday: 996, week: w, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null, type: tipo, competition: 'UCL', euroPhase: tipo === 'euro' ? 'r16' : undefined, cupRoundName: 'Ottavi di Finale' };
    C.patch({ week: w, weekLived: false, nationsCupQueue: null, euroMondiale: null, calendar: [...(p.calendar || []).filter(m => m.week !== w), md],
      euro: { active: true, competition: 'UCL', phase: tipo === 'euro' ? 'r16' : 'group', groupOpponents: [{ id: opp.id, n: opp.n }], pts: 0, groupResults: [], qualified: true, champion: false, eliminated: false, koResults: [], koRound: 0 } });
    return md;
  }, { w: W, tipo });
}
const EM = (type, phase, extra) => ({ euroMondiale: { active: true, done: false, type, season: 2, phase, host: 'Germania', qualOpponents: ['Belgio', 'Croazia', 'Scozia'], qualMatchIdx: 0, qualPts: 0, qualDone: false,
  groupOpponents: ['Belgio', 'Croazia', 'Scozia'], groupMatchIdx: 0, groupPts: 0, groupResults: [], groupMatches: [], koResults: [], ...(extra || {}) }, nationsCupQueue: null });
const NC = s => ({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'], matchIdx: 0, pts: 0, matches: [], done: false }, euroMondiale: null });

/* tasti dei momenti salienti visibili FUORI dalla schermata pre-partita */
const fuoriDOM = page => page.evaluate((src) => { const rx = new RegExp(src, 'i'); const pp = document.querySelector('[data-cpm="prepartita23"]');
  return [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && rx.test(b.textContent || '') && !(pp && pp.contains(b))).map(b => (b.textContent || '').trim().slice(0, 50)); }, RX_SOLO.source).catch(() => []);
/* dal clic d'ingresso alla schermata pre-partita, guardando ogni schermata attraversata */
async function alPrepartita(page, fuori) {
  for (let i = 0; i < 60; i++) {
    for (const t of await fuoriDOM(page)) if (!fuori.includes(t)) fuori.push(t);
    const s = await page.evaluate(() => { const pp = document.querySelector('[data-cpm="prepartita23"]');
      return { pp: !!pp, f: typeof window.__CPM_PHASE === 'function' ? window.__CPM_PHASE() : null, solo: !!document.querySelector('[data-cpm="solo-243"]'),
        nota: ((document.querySelector('[data-cpm="solo-243-nota"]') || {}).textContent || '').trim(),
        bottoni: pp ? [...pp.querySelectorAll('button')].map(x => (x.textContent || '').trim()) : [] }; }).catch(() => null);
    if (s && s.pp && s.f === 'matchday') return s;
    if (s && s.f && s.f !== 'matchday') return { ...s, fuoriPre: true };
    await page.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {}
      const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /^(Gioca la partita|Gioca · parti dalla panchina|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim()));
      const b = B[B.length - 1]; if (b) b.click(); }).catch(() => {});
    await sleep(500);
  }
  return null;
}
async function daPrompt(page, W, tipo, fuori, CAL0) {
  if (tipo) await inietta(page, W, tipo); else await page.evaluate(({ w, c }) => window.__CPM_CAREER.patch({ week: w, weekLived: false, calendar: c, nationsCupQueue: null, euroMondiale: null }), { w: W, c: CAL0 });
  await sleep(500);
  await page.evaluate((t) => window.__CPM_CAREER.apriPartita('starter', t || undefined), tipo || null); await sleep(800);
  for (const t of await fuoriDOM(page)) fuori.push(t);
  const clic = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca( la partita| · parti dalla panchina)/.test((x.textContent || '').trim())); if (!b) return false; const t = (b.textContent || '').trim(); b.click(); return t; });
  if (!clic) return { nonGiudicato: 'prompt senza «Gioca la partita»' };
  const r = await alPrepartita(page, fuori); return r ? { ...r, ingresso: clic } : { nonGiudicato: 'schermata pre-partita mai raggiunta' };
}
async function daHome(page, W, patch, fuori) {
  await page.evaluate(({ w, p }) => window.__CPM_CAREER.patch({ week: w, weekLived: true, ...p }), { w: W, p: patch }); await sleep(700);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(1300);
  for (const t of await fuoriDOM(page)) fuori.push(t);
  const clic = await page.evaluate(() => { const b = document.querySelector('[data-cpm="avanza23"]'); if (!b || b.disabled) return (b ? 'disabilitato' : 'assente'); b.click(); return true; });
  if (clic !== true) return { nonGiudicato: 'tasto principale della home ' + clic };
  return (await alPrepartita(page, fuori)) || { nonGiudicato: 'schermata pre-partita mai raggiunta' };
}
/* dalla lobby della scheda Nazionale (giro 229): «Gioca Partita» */
async function daLobby(page, W, patch, fuori) {
  await page.evaluate(({ w, p }) => window.__CPM_CAREER.patch({ week: w, weekLived: true, ...p }), { w: W, p: patch }); await sleep(600);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} window.__CPM_CAREER.goTab('nazionale'); }); await sleep(1500);
  const lobby = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim()).filter(t => /Gioca Partita|Gioca la partita|Simula/.test(t)));
  for (const t of await fuoriDOM(page)) fuori.push(t);
  const clic = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && /Gioca Partita/.test(x.textContent || '')); if (!b) return false; b.click(); return true; });
  if (!clic) return { nonGiudicato: 'lobby senza «Gioca Partita»: ' + J(lobby) };
  const r = await alPrepartita(page, fuori); return r ? { ...r, lobby } : { nonGiudicato: 'schermata pre-partita mai raggiunta' };
}
/* il provino dalla creazione vera */
async function apriProvino(init) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript((init) => { window.__CPM_GLB = false; window.__CPM_PREP246 = true; for (const k of Object.keys(init)) window[k] = init[k]; }, init);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(800);
  if (!await clickByText(page, 'Nuova carriera')) throw new Error('"Nuova carriera" non trovato');
  await sleep(700);
  await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, NOME);
  if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('"INIZIA I PROVINI" non trovato');
  await sleep(400);
  return { page, b, srv, errs, port };
}

/* premuto il tasto: formazioni → ingresso → partita a soli salienti */
async function gioca(page, { finoAlFischio, registrata }) {
  const o = { visti: [], walkout: false, walkoutPrimaScena: null, velo: false, lm: null, minMax: 0 };
  await page.evaluate(() => document.querySelector('[data-cpm="solo-243"]').click());
  const t0 = Date.now(); let auto = false, faseP = null, tPlay = 0, ultT = Date.now(), min0 = null, minScena = null, playScena = null;
  while (Date.now() - t0 < (finoAlFischio ? 420000 : 150000)) {
    const s = await page.evaluate(() => ({ f: window.__CPM_PHASE ? window.__CPM_PHASE() : null, v: !!document.querySelector('[data-cpm="solo-166-velo"]'), lm: window.__CPM_LM166 || null,
      m: window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : 0, ap: typeof window.__CPM_AUTOPLAY === 'function' })).catch(() => null);
    const ora = Date.now();
    if (s) {
      if (faseP === 'playing') tPlay += ora - ultT;
      if (s.f !== faseP) { o.visti.push(s.f); faseP = s.f; }
      if (s.f === 'walkout') o.walkout = true;
      if (s.v) o.velo = true; if (s.lm) o.lm = s.lm; o.minMax = Math.max(o.minMax, s.m || 0);
      if (s.f === 'playing' && min0 === null) min0 = s.m || 0;
      if (s.f === 'formations' && !auto) await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && /^Ingresso in campo/.test((x.textContent || '').trim())); if (b) b.click(); }).catch(() => {});
      /* il pilota parte dall'ingresso (o, se l'ingresso non arriva, dal campo): l'autoplay chiude l'ingresso come «Salta ingresso» */
      if (!auto && s.ap && (s.f === 'walkout' || s.f === 'playing')) { if (s.f === 'walkout') await sleep(1200); auto = true; await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7246, policy: 'seeded', tickMs: 300 })); }
      if (o.walkoutPrimaScena === null && /^hl_/.test(String(s.f))) { o.walkoutPrimaScena = o.walkout; minScena = s.m || 0; playScena = tPlay; if (!finoAlFischio) break; }
      if (s.f === 'ended' || s.f === 'ceremony' || s.f === 'shootout') { o.finita = true; break; }
    }
    ultT = ora; await sleep(120);
  }
  o.passo = (minScena != null && min0 != null && minScena - min0 >= 5) ? Math.round(playScena / (minScena - min0)) : null;
  o.minScena = minScena; o.min0 = min0;
  /* fino al fischio: il passo si misura sull'intera partita (il provino ha la prima scena al 3': troppo presto per misurarlo li') */
  if (finoAlFischio && o.finita && min0 != null && o.minMax - min0 >= 30) o.passo = Math.round(tPlay / (o.minMax - min0));
  if (finoAlFischio && o.finita && registrata) {
    for (let i = 0; i < 70 && !o.registrata; i++) {
      o.registrata = await registrata(page).catch(() => false);
      if (o.registrata) break;
      await page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /Continua|Avanti|Torna|Prosegui|Vai|Chiudi|Fine|Rispondi|Salta|Risultati provino/i.test(x.textContent || '')); const b = B[B.length - 1]; if (b) b.click(); }).catch(() => {});
      await sleep(700);
    }
    if (!o.registrata) o.ultimo = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 300) + ' | ' + [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim()).join(' / ')).catch(() => '');
  }
  return o;
}

const PERCORSI = [
  { nome: 'campionato (prompt)', tipo: 'prompt', md: null },
  { nome: 'coppa nazionale (prompt)', tipo: 'prompt', md: 'cup' },
  { nome: 'Europa girone (prompt)', tipo: 'prompt', md: 'euro_group' },
  { nome: 'Europa eliminazione diretta (prompt)', tipo: 'prompt', md: 'euro' },
  { nome: 'Nazionale amichevole (prompt → convocazione)', tipo: 'prompt', md: 'national' },
  { nome: 'Primavera U18 (prompt)', tipo: 'prompt', md: null, u18: true, fischio: true },
  { nome: 'Coppa delle Nazioni (tasto della home)', tipo: 'home', patch: s => NC(s) },
  { nome: 'Coppa delle Nazioni (lobby)', tipo: 'lobby', patch: s => NC(s) },
  { nome: 'Europeo qualificazioni (tasto della home)', tipo: 'home', patch: () => EM('Europeo', 'qualificazioni') },
  { nome: 'Mondiale gironi (tasto della home)', tipo: 'home', patch: () => EM('Mondiale', 'group'), fischio: true },
  { nome: 'Mondiale gironi (lobby)', tipo: 'lobby', patch: () => EM('Mondiale', 'group') },
  { nome: 'Mondiale eliminazione diretta (tasto della home)', tipo: 'home', patch: () => EM('Mondiale', 'quarti', { koPhase: 'quarti', koOpponent: 'Germania' }) },
  { nome: 'provino (creazione)', tipo: 'provino', fischio: true },
];

async function percorso(P, rosso) {
  const init = rosso ? { __CPM_NO_G246: true } : {}; const fuori = []; const out = { nome: P.nome };
  const fischio = !rosso && !!P.fischio;
  let A;
  try {
    let r, registrata = null;
    if (P.tipo === 'provino') {
      A = await apriProvino(init);
      await clickByText(A.page, 'Inizia il provino');
      for (let i = 0; i < 80; i++) { const f = await A.page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null); if (f) break; await sleep(400); }
      r = await alPrepartita(A.page, fuori) || { nonGiudicato: 'partita del provino mai montata' };
      registrata = p => p.evaluate(() => /Prestazione da predestinato|Bella prova|Prova sufficiente|Provino in salita/.test(document.body.innerText || ''));
    } else {
      A = await apriCarriera166({ init, nome: NOME, reseed: 4246 });
      if (!A.W) throw new Error('nessuna settimana con giornata di lega');
      const CAL0 = await A.page.evaluate(() => window.__CPM_CAREER.snapshot().calendar || []);
      const s0 = await A.page.evaluate(() => window.__CPM_CAREER.snapshot());
      if (P.u18) { await A.page.evaluate(() => window.__CPM_CAREER.patch({ proStatus: 'u18' })); await sleep(400); }
      if (P.tipo === 'prompt') r = await daPrompt(A.page, A.W, P.md, fuori, CAL0);
      else if (P.tipo === 'home') r = await daHome(A.page, A.W, P.patch(s0), fuori);
      else r = await daLobby(A.page, A.W, P.patch(s0), fuori);
      const n0 = (s0.matchHistory || []).length;
      registrata = P.u18 ? (p => p.evaluate((n0) => ((JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}).matchHistory || []).length > n0, n0))
        : (p => p.evaluate(() => { const e = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}).euroMondiale; return !!e && (e.groupMatchIdx | 0) >= 1; }));
    }
    out.pp = !!(r && r.pp && !r.fuoriPre); out.r = r;
    out.tasto = out.pp && r.solo && /solo le tue azioni/.test(r.nota) && r.bottoni.some(b => /^Gioca solo i momenti salienti$/.test(b));
    out.fuori = fuori;
    if (out.tasto) out.g = await gioca(A.page, { finoAlFischio: fischio, registrata });
  } catch (e) { out.err = String(e.message).slice(0, 180); }
  out.errs = A ? A.errs.slice(0, 3) : [];
  if (A) { await A.b.close().catch(() => {}); A.srv.close(); }
  return out;
}
function giudica(o, fischio) {
  const g = o.g || {}; const ng = !o.pp ? `NON GIUDICATO: ${o.err || (o.r && (o.r.nonGiudicato || (o.r.fuoriPre ? 'pre-partita saltata, fase ' + o.r.f : ''))) || 'pre-partita non raggiunta'}` : '';
  const righe = [
    { k: 'tasto', ok: !!o.tasto, info: ng || `bottoni ${J(o.r.bottoni)} · nota «${o.r.nota}»` },
    { k: 'unico punto', ok: o.pp && o.fuori.length === 0, info: ng || `tasti fuori dalla pre-partita ${J(o.fuori)}` },
    { k: 'ingresso prima della prima scena', ok: !!o.tasto && g.walkout === true && g.walkoutPrimaScena === true, info: o.tasto ? `fasi ${J(g.visti)}` : 'NON GIUDICATO: tasto assente' },
    { k: 'a soli salienti', ok: !!o.tasto && !!g.lm && g.lm.attiva === true && g.lm.scelta243 === true && g.velo && g.passo != null && g.passo <= 400,
      info: o.tasto ? `testimone ${J(g.lm)} · velo ${g.velo} · ${g.passo == null ? 'passo NON GIUDICATO' : g.passo + ' ms/minuto'} (minuti ${g.min0}→${g.minScena})` : 'NON GIUDICATO: tasto assente' },
  ];
  if (fischio) righe.push({ k: 'fischio finale e registrata', ok: !!g.finita && !!g.registrata, info: `finita ${!!g.finita} al ${g.minMax}' · registrata ${!!g.registrata}${g.ultimo ? ' · schermata: ' + g.ultimo : ''}` });
  righe.push({ k: 'errori di pagina', ok: !(o.errs || []).length && !o.err, info: J([o.errs, o.err || null]) });
  return righe;
}

async function panchina(rosso) {
  const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G246: true } : {}, nome: NOME }); const fuori = []; let r = null;
  try { const CAL0 = await A.page.evaluate(() => window.__CPM_CAREER.snapshot().calendar || []); await A.page.evaluate(() => { window.__CPM_CD229 = 'bench'; });
    r = await daPrompt(A.page, A.W, null, fuori, CAL0); } catch (e) { r = { nonGiudicato: String(e.message).slice(0, 120) }; }
  await A.b.close(); A.srv.close();
  const g = r && r.pp && /panchina/.test(r.ingresso || '');
  return { nome: 'panchina (prompt): il tasto NON c\'e\'', ok: g && !r.solo && fuori.length === 0, info: g ? `bottoni ${J(r.bottoni)} · fuori ${J(fuori)}` : `NON GIUDICATO: ${J(r).slice(0, 160)}` };
}

async function braccio(rosso) {
  const ris = [];
  for (const P of PERCORSI) { if (SOLO && !P.nome.includes(SOLO)) continue;
    const o = await percorso(P, rosso); const righe = giudica(o, !rosso && !!P.fischio);
    ris.push({ nome: P.nome, righe }); console.log(`  [${rosso ? 'rosso' : 'verde'}] ${P.nome}: ${righe.map(x => (x.ok ? '✓' : '✗') + x.k).join(' · ')}`); }
  const pa = SOLO ? null : await panchina(rosso);
  return { ris, pa };
}
const stampa = (tit, B) => { console.log(tit); for (const p of B.ris) { console.log(`  ${p.nome}`); for (const x of p.righe) console.log(`    ${x.ok ? '✓' : '✗'} ${x.k} — ${x.info}`); }
  if (B.pa) console.log(`  ${B.pa.ok ? '✓' : '✗'} ${B.pa.nome} — ${B.pa.info}`); };

let V = null, R = null, verde = null, rosso = null;
if (PARTE !== 'rosso') { V = await braccio(false); verde = V.ris.length > 0 && V.ris.every(p => p.righe.every(x => x.ok)) && (!V.pa || V.pa.ok); }
if (PARTE !== 'verde') { R = await braccio(true);
  /* ogni percorso deve cadere su almeno uno dei quattro giudizi (tasto / unico punto / ingresso / soli salienti) per un motivo GIUDICATO;
     la panchina resta senza tasto */
  rosso = R.ris.length > 0 && R.ris.every(p => p.righe.slice(0, 4).some(x => !x.ok)) && (!R.pa || R.pa.ok); }
if (V) stampa('braccio VERDE', V);
if (R) stampa('braccio ROSSO (__CPM_NO_G246)', R);
if (verde !== null) console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
if (rosso !== null) console.log(`ROSSO: ${rosso ? 'CADE (come deve) su ogni percorso' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit((verde === null || verde) && (rosso === null || rosso) ? 0 : 1);
