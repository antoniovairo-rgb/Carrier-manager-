#!/usr/bin/env node
/* [giro 232 · PO-503, decisione PO 16/11 19:35] GUARDIANO rassegna-232 — rassegna di fine partita (fase ended di LiveMatch, src/15),
   SCHEDA 4: classifica/tabellone e prossima partita DELLA COMPETIZIONE della partita appena giocata, mai del campionato quando si e'
   giocata una coppa. «La classifica e la prossima partita deve essere della competizione e non del campionato!»
   L) LOGICA (pagina viva, funzione del gioco window.rassegnaComp232 su salvataggi provocati): campionato · coppa nazionale KO (vinta,
      persa, finale vinta) · Europa girone (gara di mezzo, ultima gara) · Europa KO (vinta, persa) · Coppa delle Nazioni girone e finale ·
      Europeo/Mondiale qualificazioni, girone, KO · Nazionale amichevole. Per ognuna: tipo (campionato/girone/tabellone/nazionale),
      nome della competizione, classifica del girone o percorso, prossima partita della STESSA competizione o il perche' non c'e'.
   P) PARTITE VERE (soli highlight, pilota seedato, 375x667): campionato · coppa nazionale (ottavi, provocati in calendario) · girone
      europeo (3a giornata, provocata) · Coppa delle Nazioni (2a gara, dal pannello) · Europeo quarti (dal pannello). Si legge la scheda 4
      dal DOM: titolo con la competizione, girone o tabellone col risultato di oggi, prossima partita coerente con l'esito; mai la
      classifica del campionato su una coppa.
   R) ROSSO window.__CPM_NO_G232 (dall'avvio, stessa partita di coppa): torna la scheda del giro 224 → DEVE essere bocciato.
   [giro 239 · PO-507b] in P anche l'ETICHETTA in basso (data-cpm titolo200): «4/4 · Tabellone» quando la scheda mostra il tabellone
   (coppa nazionale, Europeo KO), «4/4 · Classifica» altrimenti. ROSSO window.__CPM_NO_G239 (partita di coppa): l'etichetta torna
   «Classifica» → DEVE essere bocciato.
   «Non giudicato» (partita non finita, scheda non trovata) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rassegna-232.mjs   (CPM_SOLO_L=1: solo la parte L) */
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166, CLUB166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const SEME = 7304;
const verde = [], rosso = [];
const ok = (arr, c, m) => { arr.push([!!c, m]); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const pulito = (t) => String(t || '').replace(/\s+/g, ' ').trim();

/* ---------- L) logica ---------- */
async function logica(page) {
  return page.evaluate((CL) => {
    const f = window.rassegnaComp232; if (typeof f !== 'function') return { err: 'rassegnaComp232 assente' };
    const C = (window.__CPM_CLUBS232 ? window.__CPM_CLUBS232() : []); const eu = C.filter(c => c.lg !== CL.lg && c.p >= 82).slice(0, 3);
    const base = { name: 'X', nation: 'Italia', season: 2, week: 10, club: CL, proStatus: 'pro',
      calendar: [{ matchday: 12, week: 12, opponentId: 'l1', opponentName: 'FC Lega', isHome: true, played: false },
        { matchday: 992, week: 19, type: 'cup', cupRound: 2, cupRoundName: 'Quarti di Finale', opponentId: 'c1', opponentName: 'FC Coppa', isHome: false, played: false },
        { matchday: 501, week: 13, type: 'euro_group', opponentId: eu[1] && eu[1].id, opponentName: eu[1] && eu[1].n, isHome: true, played: false },
        { matchday: 801, week: 15, type: 'national', opponentName: 'Spagna', played: false }] };
    const cup = (rd, res) => ({ ...base, calendar: base.calendar.filter(m => m.type !== 'cup'), cup: { active: true, round: rd, results: res || [], champion: false, eliminated: false } });
    const euroG = (n) => ({ ...base, euro: { active: true, competition: 'UCL', phase: 'group', groupOpponents: eu, pts: 0,
      groupResults: Array.from({ length: n }, (_, k) => ({ opp: eu[k % 3].n, hs: 1, as: 0, won: true, drew: false })) } });
    const euroK = { ...base, calendar: base.calendar.filter(m => m.type !== 'euro_group'), euro: { active: true, competition: 'UCL', phase: 'quarti', groupOpponents: eu,
      groupResults: Array.from({ length: 6 }, (_, k) => ({ opp: eu[k % 3].n, hs: 2, as: 1, won: true, drew: false })), koResults: [{ phase: 'r16', name: 'Ottavi di Finale', opp: 'FC Ottavo', homeScore: 3, awayScore: 1, won: true }] } };
    const nc = (idx, pts, fin) => ({ ...base, nationsCupQueue: { active: true, done: false, season: 2, opponents: fin ? ['Spagna', 'Francia', 'Germania', 'Olanda'] : ['Spagna', 'Francia', 'Germania'], matchIdx: idx, pts, isFinal: !!fin,
      matches: Array.from({ length: Math.min(idx, 3) }, (_, k) => ({ opp: ['Spagna', 'Francia', 'Germania'][k], won: true, drew: false, homeScore: 1, awayScore: 0 })) } });
    const em = (o) => ({ ...base, natHistory: [{ season: 2, comp: 'Qualif. Europeo', opp: 'Belgio', hs: 2, as: 0, won: true }], euroMondiale: { active: true, type: 'Europeo', season: 2,
      qualOpponents: ['Belgio', 'Olanda'], qualMatchIdx: 1, qualPts: 3, groupOpponents: ['Spagna', 'Francia', 'Germania'], groupMatchIdx: 0, groupPts: 0, groupMatches: [], koResults: [], ...o } });
    const W = { mg: 2, og: 0, vinta: true, rig: false, avv: 'Oggi FC' }, L = { mg: 0, og: 1, vinta: false, rig: false, avv: 'Oggi FC' };
    const casi = [
      ['campionato', f(base, 'career', W), r => r.tipo === 'campionato' && r.prossima && r.prossima.sett === 12 && /FC Lega/.test(r.prossima.riga)],
      ['coppa ottavi vinti → quarti, sorteggio in attesa, settimana 19', f(cup(1), 'cup', W), r => r.tipo === 'tabellone' && r.comp === 'Coppa Nazionale' && r.percorso.length === 1 && r.percorso[0].oggi && r.percorso[0].ris === '2-0' && /Quarti di Finale · sorteggio in attesa/.test(r.prossima && r.prossima.riga) && r.prossima.sett === 19 && !/FC Lega/.test(JSON.stringify(r))],
      ['coppa quarti persi → eliminati, percorso con gli ottavi', f(cup(2, [{ round: 1, name: 'Ottavi di Finale', opponent: 'FC Primo', homeScore: 2, awayScore: 1, won: true }]), 'cup', L), r => r.tipo === 'tabellone' && !r.prossima && /^Eliminati ai Quarti/.test(r.motivo) && r.percorso.length === 2 && r.percorso[0].avv === 'FC Primo' && r.percorso[1].e === 'P'],
      ['coppa finale vinta ai rigori → coppa vinta', f(cup(4), 'cup', { mg: 1, og: 1, vinta: true, rig: true, avv: 'Oggi FC' }), r => !r.prossima && /Coppa vinta/.test(r.motivo) && r.percorso[0].rig && r.percorso[0].e === 'V'],
      ['coppa con turno gia\' in calendario → avversario vero', f({ ...base, cup: { active: true, round: 1, results: [] } }, 'cup', W), r => r.prossima && /FC Coppa/.test(r.prossima.riga) && r.prossima.sett === 19],
      ['Europa girone 3a giornata → girone a 4 + prossima del girone (sett. 13)', f(euroG(2), 'euro_group', W), r => r.tipo === 'girone' && r.comp === (window.__CPM_SIG232 ? window.__CPM_SIG232('UCL') : '?') && r.tabella && r.tabella.length === 4 && r.io >= 0 && r.prossima && r.prossima.sett === 13 && !/FC Lega/.test(r.prossima.riga)],
      ['Europa girone ultima gara vinta (6/6) → ottavi o eliminati, mai il campionato', f({ ...euroG(5), calendar: base.calendar.filter(m => m.type !== 'euro_group') }, 'euro_group', W), r => r.tipo === 'girone' && ((r.prossima && /Ottavi di Finale · sorteggio in attesa/.test(r.prossima.riga)) || /Eliminati alla fase a gironi/.test(r.motivo || ''))],
      ['Europa quarti vinti → semifinale, percorso girone+ottavi+oggi', f(euroK, 'euro_ko', { ...W, fase: 'quarti' }), r => r.tipo === 'tabellone' && r.percorso.length === 3 && r.percorso[0].riep && r.percorso[1].avv === 'FC Ottavo' && /Semifinale · sorteggio in attesa/.test(r.prossima && r.prossima.riga) && r.prossima.sett === 28],
      ['Europa quarti persi → eliminati ai quarti', f(euroK, 'euro_ko', { ...L, fase: 'quarti' }), r => !r.prossima && /Eliminati ai quarti/.test(r.motivo)],
      ['Coppa delle Nazioni gara 2 → girone + contro Germania', f(nc(1, 3), 'nationsCup', W), r => r.tipo === 'girone' && r.tabella && r.tabella.length === 4 && /Germania · gara 3 di 3/.test(r.prossima && r.prossima.riga)],
      ['Coppa delle Nazioni gara 3 a 7 pt → finale', f(nc(2, 6), 'nationsCup', W), r => r.prossima && /^Finale/.test(r.prossima.riga)],
      ['Coppa delle Nazioni gara 3 persa a 3 pt → eliminati', f(nc(2, 3), 'nationsCup', L), r => !r.prossima && /Eliminati/.test(r.motivo)],
      ['Coppa delle Nazioni finale persa → tabellone, finita', f(nc(3, 7, true), 'nationsCup', L), r => r.tipo === 'tabellone' && !r.prossima && /Sconfitti in finale/.test(r.motivo)],
      ['Europeo qualificazione 2/2 vinta → fase a gironi contro Spagna', f(em({ phase: 'qualificazioni' }), 'euroMondiale_qualif', W), r => r.tipo === 'nazionale' && r.percorso.length === 2 && r.percorso[0].avv === 'Belgio' && /Fase a gironi · contro Spagna/.test(r.prossima && r.prossima.riga)],
      ['Europeo girone gara 1 → girone + contro Francia', f(em({ phase: 'group' }), 'euroMondiale_group', W), r => r.tipo === 'girone' && r.tabella && r.tabella.length === 4 && /Francia · gara 2 di 3/.test(r.prossima && r.prossima.riga)],
      ['Europeo quarti persi → eliminati ai quarti, percorso', f(em({ phase: 'ko', koPhase: 'quarti', groupMatches: [{}, {}, {}], groupPts: 7, koResults: [{ phase: 'r16', opp: 'Olanda', won: true, homeScore: 2, awayScore: 1 }] }), 'euroMondiale_ko', L), r => r.tipo === 'tabellone' && r.percorso.length === 3 && r.percorso[1].avv === 'Olanda' && /Eliminati ai quarti/.test(r.motivo)],
      ['Nazionale amichevole → prossima gara della Nazionale (sett. 15)', f(base, 'national', W), r => r.tipo === 'nazionale' && r.prossima && r.prossima.sett === 15 && /Spagna/.test(r.prossima.riga)],
    ];
    return { casi: casi.map(([n, r, t]) => { let pass = false; try { pass = !!(r && t(r)); } catch (e) {} return { n, pass, r: JSON.stringify(r).slice(0, 260) }; }) };
  }, CLUB166);
}

/* ---------- P) partite vere ---------- */
async function scheda4(page) {
  await page.setViewportSize({ width: 375, height: 667 }); await sleep(500);
  await page.evaluate(() => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (d[3]) d[3].click(); }); await sleep(600);
  return page.evaluate(() => { const q = (k) => document.querySelector(`[data-cpm="${k}"]`); const t = (k) => ((q(k) || {}).innerText || '');
    const root = q('classifica200'); const tit = root ? [...root.querySelectorAll('*')].filter(e => e.children.length === 0 && /Classifica|Tabellone|Prossima/.test(e.textContent || '')).map(e => e.textContent.trim()).slice(0, 6) : [];
    return { c: !!root, tipo: root ? root.getAttribute('data-comp232') : null, titoli: tit, girone: t('girone232'), tab: t('tabellone232'), oggi: t('tabellone232-oggi'),
      lega: document.querySelectorAll('[data-cpm="classifica224-riga"]').length, etichetta: t('titolo200').replace(/\s+/g, ' ').trim(), prossima: t('prossima200'), tutto: root ? root.innerText : '' }; });
}
async function giocaDiretto(page, avvia, seme) {
  const out = { finita: false, score: null };
  await page.evaluate(() => { window.__CPM_SOLO166 = true; });
  const r = await page.evaluate((a) => window.__CPM_CAREER[a](), avvia); out.avvio = r;
  let montata = false;
  for (let i = 0; i < 60 && !montata; i++) {
    montata = await page.evaluate(() => typeof window.__CPM_PHASE === 'function' && !!window.__CPM_PHASE() && typeof window.__CPM_AUTOPLAY === 'function' && /matchday|formations|walkout|playing/.test(String(window.__CPM_PHASE()))).catch(() => false);
    if (montata) break;
    await page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => /^(Continua|Avanti|Vai in campo|In campo|Entra in campo|Gioca|OK|Ok)/i.test((x.textContent || '').trim())); if (B[0]) B[0].click(); }).catch(() => {});
    await sleep(500);
  }
  if (!montata) return out;
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  const t0 = Date.now();
  while (Date.now() - t0 < 420000) { const f = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null); if (f === 'ended') { out.finita = true; break; } await sleep(300); }
  out.score = await page.evaluate(() => { const x = window.__CPM_SCORE && window.__CPM_SCORE(); return x ? { h: x.home | 0, a: x.away | 0 } : null; }).catch(() => null);
  await sleep(1500); return out;
}
async function provoca(page, tipo) {
  return page.evaluate(({ tipo, CL }) => {
    const p = window.__CPM_CAREER.snapshot() || {}; const W = p.week || 1; const C = window.__CPM_CLUBS232 ? window.__CPM_CLUBS232() : [];
    const lega = C.filter(c => c.lg === CL.lg && c.id !== CL.id); const eu = C.filter(c => c.lg !== CL.lg && c.p >= 82 && !c.isU18).slice(0, 3);
    let patch = {}, atteso = {};
    if (tipo === 'cup') { const avv = lega[3]; patch = { cup: { active: true, round: 1, champion: false, eliminated: false, results: [], nextWeek: W, club: CL.id },
      calendar: [...(p.calendar || []).filter(m => (m.week | 0) !== W), { matchday: 991, week: W, isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 1, cupRoundName: 'Ottavi di Finale', opponentId: avv.id, opponentName: avv.n }] };
      atteso = { tipo: 'tabellone', comp: 'Coppa Nazionale', avv: avv.n, avanti: 'Quarti di Finale', fuori: 'Eliminati agli Ottavi', sett: Math.max(19, W + 1) }; }
    if (tipo === 'euro_group') { patch = { euro: { active: true, competition: 'UCL', phase: 'group', groupOpponents: eu, pts: 6, groupResults: [{ opp: eu[1].n, hs: 2, as: 0, won: true, drew: false }, { opp: eu[2].n, hs: 1, as: 0, won: true, drew: false }] },
      calendar: [...(p.calendar || []).filter(m => (m.week | 0) !== W), { matchday: 503, week: W, isHome: true, played: false, result: null, type: 'euro_group', competition: 'UCL', opponentId: eu[0].id, opponentName: eu[0].n, opponentData: eu[0] },
        { matchday: 504, week: W + 3, isHome: false, played: false, result: null, type: 'euro_group', competition: 'UCL', opponentId: eu[1].id, opponentName: eu[1].n, opponentData: eu[1] }] };
      atteso = { tipo: 'girone', comp: (window.__CPM_SIG232 ? window.__CPM_SIG232('UCL') : null), nomi: eu.map(c => c.n), sett: W + 3, avvNx: eu[1].n }; }
    if (tipo === 'nationsCup') { patch = { nationalCaps: 5, nationsCupQueue: { active: true, done: false, season: p.season || 2, opponents: ['Spagna', 'Francia', 'Germania'], matchIdx: 1, pts: 3, matches: [{ opp: 'Spagna', won: true, drew: false, homeScore: 2, awayScore: 1 }] } };
      atteso = { tipo: 'girone', comp: 'Coppa delle Nazioni', nomi: ['Italia', 'Spagna', 'Francia', 'Germania'], avanti: 'Germania' }; }
    if (tipo === 'euroMondiale_ko') { patch = { nationalCaps: 8, euroMondiale: { active: true, type: 'Europeo', season: p.season || 2, phase: 'ko', host: 'Italia', qualOpponents: ['Belgio', 'Olanda'], qualMatchIdx: 2, qualPts: 6, qualDone: true, qualQualified: true,
      groupOpponents: ['Spagna', 'Germania', 'Portogallo'], groupMatchIdx: 3, groupPts: 7, groupMatches: [{ opp: 'Spagna', won: true, homeScore: 1, awayScore: 0 }, { opp: 'Germania', drew: true, homeScore: 1, awayScore: 1 }, { opp: 'Portogallo', won: true, homeScore: 2, awayScore: 0 }],
      koPhase: 'quarti', koOpponent: 'Francia', koResults: [{ phase: 'r16', opp: 'Olanda', won: true, homeScore: 2, awayScore: 1 }], qualified: true, champion: false, eliminated: false, done: false } };
      atteso = { tipo: 'tabellone', comp: 'Europeo', avv: 'Francia', prima: 'Olanda', avanti: 'Semifinale', fuori: 'Eliminati ai quarti' }; }
    window.__CPM_CAREER.patch(patch); return atteso;
  }, { tipo, CL: CLUB166 });
}
function giudica(tipo, at, m, sc) {
  if (!m || !m.c) return { giudicato: false, passa: false, msg: 'scheda 4 non trovata' };
  const t = pulito(m.tutto), pr = pulito(m.prossima); const h = sc ? sc.h : null, a = sc ? sc.a : null;
  const c = [];
  if (tipo === 'career') { c.push(['tipo campionato', m.tipo === 'campionato']); c.push(['classifica del campionato presente', m.lega >= 1]); c.push(['prossima di campionato', /Prossima partita · Campionato/i.test(t) && !/Coppa|Nazionale/.test(pr)]); }
  else {
    c.push(['tipo ' + at.tipo, m.tipo === at.tipo]); c.push(['nessuna riga della classifica di campionato', m.lega === 0]);
    c.push(['competizione nel titolo «' + at.comp + '»', !!at.comp && m.titoli.some(x => x.includes(at.comp))]);
    if (at.tipo === 'girone') { c.push(['girone con tutte le squadre', at.nomi.every(n => pulito(m.girone).includes(n))]); }
    if (at.tipo === 'tabellone') { c.push(['oggi nel tabellone con l\'avversario e il risultato', pulito(m.oggi).includes(at.avv) && pulito(m.oggi).includes(h + '-' + a)]);
      if (at.prima) c.push(['turno precedente nel percorso', pulito(m.tab).includes(at.prima)]);
      if (h > a) c.push(['vinta → turno successivo', pr.includes(at.avanti)]); else if (h < a) c.push(['persa → eliminati', pr.includes(at.fuori)]);
      else c.push(['pareggio → rigori dichiarati, esito della serie e turno coerenti', pulito(m.oggi).includes('(rig.)') && ((pr.includes(at.avanti) && / V$/.test(pulito(m.oggi))) || ((pr.includes(at.fuori) || /Eliminati/.test(pr)) && / P$/.test(pulito(m.oggi))))]); }
    if (tipo === 'euro_group') c.push(['prossima del girone (settimana ' + at.sett + ', ' + at.avvNx + ')', pr.includes('settimana ' + at.sett) && pr.includes(at.avvNx)]);
    if (tipo === 'nationsCup') c.push(['prossima della Coppa delle Nazioni (Germania)', pr.includes('Germania')]);
    if (tipo === 'cup' && h > a) c.push(['settimana del turno ' + at.sett, pr.includes('settimana ' + at.sett)]);
  }
  /* [giro 239 · PO-507b] l'etichetta in basso dice cosa mostra la scheda */
  const etAtt = '4/4 · ' + (m.tipo === 'tabellone' ? 'Tabellone' : 'Classifica');
  c.push(['etichetta «' + etAtt + '» (letta «' + m.etichetta + '»)', m.etichetta.toLowerCase() === etAtt.toLowerCase()]);
  return { giudicato: true, passa: c.every(x => x[1]), msg: c.map(x => (x[1] ? '✓' : '✗') + x[0]).join(' · ') + ` | punteggio ${h}-${a} | prossima «${pr}»` };
}
async function braccio(tipo, init) {
  const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, init, nome: 'Collaudo Salienti' });
  let at = null, g = null, m = null;
  try {
    if (tipo !== 'career') at = await provoca(A.page, tipo); await sleep(500);
    if (tipo === 'career' || tipo === 'cup' || tipo === 'euro_group') { await apriPrompt166(A.page); g = await gioca166(A.page, 'solo', { seme: SEME }); g.score = g.score ? { h: g.score.h, a: g.score.a } : null; }
    else g = await giocaDiretto(A.page, tipo === 'nationsCup' ? 'apriNC243' : 'apriNaz55', SEME);
    await sleep(800); if (g && g.finita) m = await scheda4(A.page);
    if (m && process.env.CPM_FOTO232) await A.page.screenshot({ path: process.env.CPM_FOTO232 + '/scheda4-' + tipo + (init.__CPM_NO_G232 ? '-rosso' : '') + '-375x667.png', fullPage: true }).catch(() => {});
  } catch (e) { console.log('    errore: ' + String(e.message).slice(0, 160)); }
  return { A, at, g, m };
}

console.log('L) logica — window.rassegnaComp232 su salvataggi provocati');
{
  const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, nome: 'Collaudo Salienti' });
  try { const L = await logica(A.page); if (L.err) ok(verde, false, 'non giudicato: ' + L.err); else for (const c of L.casi) ok(verde, c.pass, c.n + (c.pass ? '' : '  ' + c.r)); }
  catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
if (!process.env.CPM_SOLO_L) {
  for (const tipo of ['career', 'cup', 'euro_group', 'nationsCup', 'euroMondiale_ko']) {
    console.log('P) partita vera: ' + tipo);
    const { A, at, g, m } = await braccio(tipo, {});
    const r = giudica(tipo, at, m, g && g.score);
    ok(verde, !!(g && g.finita) && r.giudicato && r.passa, (g && g.finita ? '' : 'partita non finita · ') + (r.giudicato ? '' : 'non giudicato · ') + r.msg);
    ok(verde, A.errs.length === 0, `${tipo}: zero errori di pagina ${A.errs.length ? JSON.stringify(A.errs.slice(0, 2)) : ''}`);
    await A.b.close(); A.srv.close();
  }
}
console.log('R) rosso __CPM_NO_G232 (partita di coppa, stessa del verde)');
{
  const { A, at, g, m } = await braccio('cup', { __CPM_NO_G232: true });
  const r = giudica('cup', at, m, g && g.score);
  console.log('    ' + r.msg + ` · righe di campionato ${m ? m.lega : '?'}`);
  ok(rosso, !!(g && g.finita) && r.giudicato && !r.passa, `rosso bocciato: ${!!(g && g.finita) && r.giudicato && !r.passa} (giudicato ${!!(g && g.finita && r.giudicato)})`);
  await A.b.close(); A.srv.close();
}
console.log('R) rosso __CPM_NO_G239 (partita di coppa): l\'etichetta torna «Classifica»');
{
  const { A, at, g, m } = await braccio('cup', { __CPM_NO_G239: true });
  const r = giudica('cup', at, m, g && g.score);
  console.log('    ' + r.msg);
  ok(rosso, !!(g && g.finita) && r.giudicato && !r.passa && !!m && m.tipo === 'tabellone', `rosso bocciato: ${!!(g && g.finita) && r.giudicato && !r.passa} (giudicato ${!!(g && g.finita && r.giudicato)}, etichetta «${m && m.etichetta}»)`);
  await A.b.close(); A.srv.close();
}
const vOk = verde.length > 0 && verde.every(x => x[0]); const rOk = rosso.length > 0 && rosso.every(x => x[0]);
console.log(`\nVERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
console.log(`ROSSI __CPM_NO_G232 e __CPM_NO_G239 bocciati: ${rosso.filter(x => x[0]).length}/${rosso.length} ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? '✓ rassegna-232 VERDE' : '✗ rassegna-232 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
