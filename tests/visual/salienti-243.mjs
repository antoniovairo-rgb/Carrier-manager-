#!/usr/bin/env node
/* [giro 243 · PO-508, decisione PO-494 «Sempre disponibile»] GUARDIANO salienti-243 — `npm run salienti-243`.
   Foto del PO 196: Mondiale, fase a gironi, la schermata pre-partita (MatchdayCard, src/13) non aveva «Gioca solo i momenti salienti».
   Da titolare il tasto deve esserci in OGNI percorso; nella schermata pre-partita, da cui passano TUTTE le gare, c'e' sempre.
   Questo guardiano GIOCA, non legge il sorgente:
   A. PERCORSI (carriera vera, salvataggio sintetico, ?cpmtest): ogni percorso viene aperto fino alla schermata pre-partita e si guarda
      se il tasto (data-cpm="solo-243") e la nota ci sono:
        campionato, coppa nazionale, Europa girone, Europa eliminazione diretta (prompt → «Gioca la partita»);
        amichevole della Nazionale (prompt → convocazione → «Gioca la partita»);
        Coppa delle Nazioni, Europeo qualificazioni, Mondiale gironi, Mondiale eliminazione diretta (TASTO PRINCIPALE della home,
        data-cpm="avanza23", il percorso della foto).
      Panchina (decisione forzata __CPM_CD229): dal giro 253 (decisione PO 17/11 «Sì, anche dalla panchina») il tasto C'E' anche li'; nel
      braccio rosso __CPM_NO_G243 il tasto non esiste e quindi non c'e' nemmeno dalla panchina.
   B. PARTITE: una del Mondiale (gironi) e una amichevole della Nazionale aperte dal tasto della schermata pre-partita e giocate fino al
      fischio: la modalita' e' attiva (testimone __CPM_LM166.attiva, velo «solo-166-velo»), la partita finisce e la carriera la registra
      (Mondiale: gara del girone avanzata; amichevole: presenza in Nazionale in piu').
   Rosso window.__CPM_NO_G243: il tasto sparisce dalla schermata pre-partita → i percorsi del tasto principale e la schermata pre-partita
   DEVONO cadere e le due partite non si aprono a soli salienti. «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node salienti-243.mjs   (CPM_PARTE=verde|rosso) */
import { apriCarriera166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto'; const NOME = 'Collaudo Salienti 243';
const J = x => JSON.stringify(x);

/* una sola gara nella settimana W del tipo voluto (come salienti-229) */
async function inietta(page, W, tipo) {
  return page.evaluate(({ w, tipo }) => {
    const C = window.__CPM_CAREER, p = C.snapshot();
    const opp = CLUBS.find(c => c.lg !== 'Deutsche Liga' && !c.isU18 && c.p >= 72 && c.p <= 80);
    const md = { matchday: 996, week: w, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null, type: tipo, competition: 'UCL', euroPhase: tipo === 'euro' ? 'r16' : undefined, cupRoundName: 'Ottavi di Finale' };
    C.patch({ week: w, weekLived: false, calendar: [...(p.calendar || []).filter(m => m.week !== w), md],
      euro: { active: true, competition: 'UCL', phase: tipo === 'euro' ? 'r16' : 'group', groupOpponents: [{ id: opp.id, n: opp.n }], pts: 0, groupResults: [], qualified: true, champion: false, eliminated: false, koResults: [], koRound: 0 } });
    return md;
  }, { w: W, tipo });
}
const fase = page => page.evaluate(() => (typeof window.__CPM_PHASE === 'function' ? window.__CPM_PHASE() : null)).catch(() => null);
const torneiSpenti = { nationsCupQueue: null, euroMondiale: null };

/* dal clic d'ingresso alla schermata pre-partita: chiude le finestre intermedie (presentazione, discorso, convocazione) */
async function alPrepartita(page) {
  for (let i = 0; i < 50; i++) {
    const s = await page.evaluate(() => { const pp = document.querySelector('[data-cpm="prepartita23"]');
      return { pp: !!pp, f: typeof window.__CPM_PHASE === 'function' ? window.__CPM_PHASE() : null, solo: !!document.querySelector('[data-cpm="solo-243"]'),
        nota: ((document.querySelector('[data-cpm="solo-243-nota"]') || {}).textContent || '').trim(),
        bottoni: pp ? [...pp.querySelectorAll('button')].map(x => (x.textContent || '').trim()) : [], testo: pp ? (pp.innerText || '').slice(0, 120).replace(/\s+/g, ' ') : '' }; }).catch(() => null);
    if (s && s.pp && s.f === 'matchday') return s;
    if (s && s.f && s.f !== 'matchday') return { ...s, fuori: true };
    await page.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {}
      const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /^(Gioca la partita|Gioca · parti dalla panchina|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim()));
      const b = B[B.length - 1]; if (b) b.click(); }).catch(() => {});
    await sleep(500);
  }
  return null;
}
/* torna alla home dalla schermata pre-partita (onQuit: la gara resta pendente) */
async function allaHome(page) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="prepartita23"] button')].find(x => /Torna alla home/.test(x.textContent || '')); if (b) b.click(); }).catch(() => {});
  await sleep(900); await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }).catch(() => {}); await page.keyboard.press('Escape').catch(() => {}); await sleep(400);
}
/* dal prompt della settimana: «Gioca la partita» */
let CAL0 = null;/* il calendario originale: il campionato si apre sulla sua giornata vera, non sulla gara iniettata prima */
async function daPrompt(page, W, tipo) {
  await page.evaluate((t) => window.__CPM_CAREER.patch(t), torneiSpenti);
  if (CAL0 === null) CAL0 = await page.evaluate(() => window.__CPM_CAREER.snapshot().calendar || []);
  if (tipo) await inietta(page, W, tipo); else await page.evaluate(({ w, c }) => window.__CPM_CAREER.patch({ week: w, weekLived: false, calendar: c }), { w: W, c: CAL0 });
  await sleep(500);
  await page.evaluate((t) => window.__CPM_CAREER.apriPartita('starter', t || undefined), tipo || null); await sleep(700);
  const clic = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca( la partita| · parti dalla panchina)/.test((x.textContent || '').trim())); if (!b) return false; const t = (b.textContent || '').trim(); b.click(); return t; });
  if (!clic) return { nonGiudicato: 'prompt senza «Gioca la partita»' };
  const r = await alPrepartita(page); return r ? { ...r, ingresso: clic } : { nonGiudicato: 'schermata pre-partita mai raggiunta' };
}
/* dal TASTO PRINCIPALE della home (avanza23) con un torneo della Nazionale in corso */
async function daHome(page, W, patch) {
  await page.evaluate(({ w, p }) => window.__CPM_CAREER.patch({ week: w, weekLived: true, ...p }), { w: W, p: patch }); await sleep(700);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(1300);/* il freno ai tocchi (1,2 s) */
  const clic = await page.evaluate(() => { const b = document.querySelector('[data-cpm="avanza23"]'); if (!b || b.disabled) return (b ? 'disabilitato' : 'assente'); b.click(); return true; });
  if (clic !== true) return { nonGiudicato: 'tasto principale della home ' + clic };
  return (await alPrepartita(page)) || { nonGiudicato: 'schermata pre-partita mai raggiunta' };
}
const EM = (type, phase, extra) => ({ euroMondiale: { active: true, done: false, type, season: 2, phase, host: 'Germania', qualOpponents: ['Belgio', 'Croazia', 'Scozia'], qualMatchIdx: 0, qualPts: 0, qualDone: false,
  groupOpponents: ['Belgio', 'Croazia', 'Scozia'], groupMatchIdx: 0, groupPts: 0, groupResults: [], groupMatches: [], koResults: [], ...(extra || {}) }, nationsCupQueue: null });
const NC = s => ({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'], matchIdx: 0, pts: 0, matches: [], done: false }, euroMondiale: null });

async function percorsi(rosso) {
  const P = []; const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G243: true } : {}, nome: NOME });
  const giudica = (nome, r, atteso) => {
    const g = r && !r.nonGiudicato && !r.fuori; const ha = g && r.solo && /solo le tue azioni/.test(r.nota) && r.bottoni.some(b => /^Gioca solo i momenti salienti$/.test(b));
    P.push({ nome, ok: g && (atteso ? ha : !r.solo), info: g ? `bottoni ${J(r.bottoni)} · nota «${r.nota}» · ${r.testo.slice(0, 60)}` : `NON GIUDICATO: ${r ? (r.nonGiudicato || 'fase ' + r.f) : 'nessuna risposta'}` });
  };
  try {
    if (!A.W) throw new Error('nessuna settimana con giornata di lega');
    const W = A.W;
    for (const [nome, tipo] of [['campionato', null], ['coppa nazionale', 'cup'], ['Europa girone', 'euro_group'], ['Europa eliminazione diretta', 'euro'], ['Nazionale amichevole', 'national']]) {
      const r = await daPrompt(A.page, W, tipo); giudica(`A prompt → pre-partita · ${nome}: il tasto c'e'`, r, true); if (r && r.pp) await allaHome(A.page);
    }
    const s = await A.page.evaluate(() => window.__CPM_CAREER.snapshot());
    for (const [nome, patch] of [['Coppa delle Nazioni', NC(s)], ['Europeo qualificazioni', EM('Europeo', 'qualificazioni')], ['Mondiale gironi', EM('Mondiale', 'group')],
      ['Mondiale eliminazione diretta', EM('Mondiale', 'quarti', { koPhase: 'quarti', koOpponent: 'Germania' })]]) {
      const r = await daHome(A.page, W, patch); giudica(`A tasto principale della home → pre-partita · ${nome}: il tasto c'e'`, r, true); if (r && r.pp) await allaHome(A.page);
    }
    await A.page.evaluate((t) => { window.__CPM_CD229 = 'bench'; window.__CPM_CAREER.patch(t); }, torneiSpenti);
    { const r = await daPrompt(A.page, W, null); const panca = !!(r && r.pp); giudica(rosso ? 'A panchina → pre-partita · campionato: il tasto NON c\'e\' (rosso 243: il tasto non esiste)' : 'A panchina → pre-partita · campionato: il tasto c\'e\' (giro 253, decisione PO 17/11)', (r && r.pp && !/panchina/.test(r.ingresso || '')) ? { nonGiudicato: 'il prompt non era da panchina: ' + r.ingresso } : r, !rosso); if (panca) await allaHome(A.page); }
    await A.page.evaluate(() => { window.__CPM_CD229 = null; });
    P.push({ nome: 'A errori di pagina', ok: A.errs.length === 0, info: J(A.errs.slice(0, 3)) });
  } catch (e) { P.push({ nome: 'A flusso dei percorsi', ok: false, info: String(e.message).slice(0, 160) }); }
  await A.b.close(); A.srv.close(); return P;
}

/* B. una partita aperta dal tasto della schermata pre-partita e giocata fino al fischio */
async function gioca(tipo, rosso) {
  const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G243: true } : {}, nome: NOME, reseed: 4243 }); const out = { tipo };
  try {
    if (!A.W) throw new Error('nessuna settimana di lega');
    const s0 = await A.page.evaluate(() => window.__CPM_CAREER.snapshot()); out.caps0 = s0.nationalCaps | 0;
    const r = tipo === 'mondiale' ? await daHome(A.page, A.W, EM('Mondiale', 'group')) : await daPrompt(A.page, A.W, 'national');
    out.prepartita = !!(r && r.pp); out.tasto = !!(r && r.solo);
    if (!out.prepartita) throw new Error('pre-partita non raggiunta: ' + J(r));
    if (!out.tasto) throw new Error('tasto dei momenti salienti assente nella schermata pre-partita');
    await A.page.evaluate(() => document.querySelector('[data-cpm="solo-243"]').click()); await sleep(800);
    out.dopoClic = await fase(A.page);
    await A.page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7243, policy: 'seeded', tickMs: 300 }));
    const t0 = Date.now(); out.velo = false; out.minMax = 0;
    while (Date.now() - t0 < 420000) {
      const s = await A.page.evaluate(() => ({ f: window.__CPM_PHASE ? window.__CPM_PHASE() : null, v: !!document.querySelector('[data-cpm="solo-166-velo"]'), lm: window.__CPM_LM166 || null,
        m: window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : 0 })).catch(() => null);
      if (s) { if (s.v) out.velo = true; if (s.lm) out.lm = s.lm; out.minMax = Math.max(out.minMax, s.m || 0); if (s.f === 'ended' || s.f === 'ceremony' || s.f === 'shootout') { out.finita = true; out.fine = s.f; break; } }
      await sleep(250);
    }
    out.tPartita = Date.now() - t0;
    /* dalla schermata finale alla carriera */
    for (let i = 0; i < 60; i++) {
      const p = await A.page.evaluate(() => (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {}).catch(() => ({}));
      const reg = tipo === 'mondiale' ? (p.euroMondiale && ((p.euroMondiale.groupMatchIdx | 0) >= 1 || (p.euroMondiale.groupResults || []).length >= 1)) : ((p.nationalCaps | 0) > out.caps0);
      if (reg) { out.registrata = true; out.carriera = tipo === 'mondiale' ? { groupMatchIdx: p.euroMondiale.groupMatchIdx, groupResults: (p.euroMondiale.groupResults || []).slice(-1) } : { nationalCaps: p.nationalCaps }; break; }
      await A.page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /Continua|Avanti|Torna|Prosegui|Vai|Chiudi|Fine|Rispondi|Salta/i.test(x.textContent || '')); const b = B[B.length - 1]; if (b) b.click(); }).catch(() => {});
      await sleep(700);
    }
  } catch (e) { out.err = String(e.message).slice(0, 200); }
  out.errs = A.errs.slice(0, 3); await A.b.close(); A.srv.close(); return out;
}
const passiB = (G, nome) => [
  { nome: `B ${nome}: aperta dal tasto della pre-partita e a soli salienti (testimone, velo)`, ok: !!G.lm && G.lm.attiva === true && G.lm.scelta243 === true && G.velo, info: `testimone ${J(G.lm || null)} · velo ${G.velo} · ${G.err || ''}` },
  { nome: `B ${nome}: finisce e la carriera la registra`, ok: !!G.finita && !!G.registrata, info: `fine ${G.fine || '—'} al ${G.minMax}' in ${G.tPartita | 0} ms · carriera ${J(G.carriera || null)}` },
  { nome: `B ${nome}: errori di pagina`, ok: !(G.errs || []).length && !G.err, info: J([G.errs, G.err || null]) }];

let verde = null, rosso = null;
if (PARTE !== 'rosso') {
  const A = await percorsi(false); const M = await gioca('mondiale', false), N = await gioca('amichevole', false);
  const B = [...passiB(M, 'Mondiale gironi'), ...passiB(N, 'Nazionale amichevole')];
  console.log('braccio VERDE'); for (const x of [...A, ...B]) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
  verde = [...A, ...B].every(x => x.ok);
}
if (PARTE !== 'verde') {
  const A = await percorsi(true); const M = await gioca('mondiale', true), N = await gioca('amichevole', true);
  console.log('braccio ROSSO (__CPM_NO_G243)'); for (const x of A) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
  console.log(`  Mondiale: pre-partita ${M.prepartita} · tasto ${M.tasto} · ${M.err || ''}`); console.log(`  amichevole: pre-partita ${N.prepartita} · tasto ${N.tasto} · ${N.err || ''}`);
  const cade = n => { const x = A.find(y => y.nome.includes(n)); return !!x && !x.ok && !/NON GIUDICATO/.test(x.info); };
  const tieni = n => { const x = A.find(y => y.nome.includes(n)); return !!x && x.ok; };
  rosso = ['· campionato: il tasto c', '· coppa nazionale', '· Europa girone', '· Europa eliminazione', '· Nazionale amichevole', '· Coppa delle Nazioni', '· Europeo qualificazioni', '· Mondiale gironi', '· Mondiale eliminazione'].every(cade)
    && tieni('panchina') && M.prepartita && M.tasto === false && N.prepartita && N.tasto === false;
}
if (verde !== null) console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
if (rosso !== null) console.log(`ROSSO: ${rosso ? 'CADE (come deve): nessun tasto nella schermata pre-partita, Mondiale e amichevole non apribili a soli salienti' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit((verde === null || verde) && (rosso === null || rosso) ? 0 : 1);
