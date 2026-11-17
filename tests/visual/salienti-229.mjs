#!/usr/bin/env node
/* [giro 229 · PO-494, decisione PO 16/11 «Sempre disponibile»] GUARDIANO salienti-229 — `npm run salienti-229`.
   Da titolare il tasto «Gioca solo i momenti salienti» c'e' in OGNI partita della carriera da professionista; il risultato lo decide la
   stessa partita (src/15, _lotto166). Resta solo da titolare, non con infortunio/squalifica/Simula scelto.
   A. STATICO: il tasto dipende da salienti229 (rosso: senzaPosta166); la modalita' arriva alla partita in ogni contesto (non piu' solo
      «career»); i tornei della Nazionale hanno il loro tasto e consumano la scelta.
   B. PROMPT (carriera vera, salvataggio sintetico, ?cpmtest): da TITOLARE il tasto c'e' in campionato CON posta, coppa nazionale, Europa
      girone, Europa eliminazione diretta, amichevole della Nazionale, e la nota non dice piu' «senza posta»; da PANCHINA (decisione forzata
      dal gancio __CPM_CD229) e da SQUALIFICATO non c'e'.
   C. PARTITA: un ottavo di Europa (eliminazione diretta) aperto col TASTO, chiuso 1-1 alla prima scena dal gancio __CPM_SO_FORCE (il
      pareggio va ai rigori), contro la stessa partita intera: la modalita' e' attiva, ci sono i rigori in entrambe, risultato, libro mastro,
      schermata finale, voce di storico, voce di calendario (giocata, risultato) e stato europeo (turno, eliminato/campione, risultati KO)
      IDENTICI; nessun errore di pagina. Sorteggi senza seme (avversario del turno dopo, fatica rng(6,12), giornalista) NON si confrontano:
      differiscono anche fra due partite intere (misurato, docs/sviluppo/RAPPORTO-giro229.md).
   Rosso window.__CPM_NO_G229: il tasto sparisce dalle coppe/Europa/Nazionale/campionato con posta e la partita KO non si apre col tasto
   → DEVE cadere su B e C. «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node salienti-229.mjs   (CPM_PARTE=verde|rosso) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apriCarriera166, apriPrompt166, gioca166, seq166, chiudi166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(QUI, '../..');
/* [giro 246 · decisione PO 17/11] dal giro 246 il tasto c'e' SOLO nella schermata pre-partita (guardiano salienti-246): il tasto del prompt e
   delle lobby (la regola di questo giro) vive nel rosso __CPM_NO_G246, ed e' li' che si giudica — come il 166 fa col rosso del 229. */
const G246 = { __CPM_NO_G246: true };
const PARTE = process.env.CPM_PARTE || 'tutto'; const NOME = 'Collaudo Salienti 229', SEME = 7300;

/* A. statico */
const st = []; const ok = (nome, c, info) => st.push({ nome, ok: !!c, info: info || '' });
const s18 = fs.readFileSync(path.join(ROOT, 'src/18-career-app.jsx'), 'utf8');
const regola = (s18.match(/const salienti229=[\s\S]*?\n  const matchResumeRef/) || [''])[0];
ok('1 il tasto dipende da salienti229 (rosso 229 = senzaPosta166), solo professionisti', /if\(!_g229\(\)\)return senzaPosta166\(md\)/.test(regola) && /player\.proStatus==="pro"/.test(regola) && /salienti229\(showMatchPrompt\)&&\(<>\s*<Btn data-cpm="solo-166"/.test(s18) && !/senzaPosta166\(showMatchPrompt\)/.test(s18), `regola ${regola.length} car.`);
ok('2 la modalita\' arriva alla partita in ogni contesto', /soloHL=\{soloHL166Ref\.current&&\(_g229\(\)\|\|\(matchContext\|\|"career"\)==="career"\)/.test(s18));
ok('3 i tornei della Nazionale: tasto e modalita\' letta dalla scelta o dalla ripresa', /data-cpm="solo-229-nc"/.test(s18) && /data-cpm="solo-229-em"/.test(s18) && (s18.match(/_modo229\(resumeSnap,(true|false)\)/g) || []).length === 3);

/* il salvataggio della competizione: una sola gara nella settimana W del tipo voluto (vedi misura-229.mjs) */
async function inietta(page, W, tipo) {
  return page.evaluate(({ w, tipo }) => {
    const C = window.__CPM_CAREER, p = C.snapshot();
    const opp = CLUBS.find(c => c.lg !== 'Deutsche Liga' && !c.isU18 && c.p >= 72 && c.p <= 80);
    const md = { matchday: 996, week: w, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null, type: tipo, competition: 'UCL', euroPhase: 'r16', cupRoundName: 'Ottavi di Finale' };
    C.patch({ week: w, weekLived: false, calendar: [...(p.calendar || []).filter(m => m.week !== w), md],
      euro: { active: true, competition: 'UCL', phase: 'r16', groupOpponents: [{ id: opp.id, n: opp.n }], pts: 0, groupResults: [], qualified: true, champion: false, eliminated: false, koResults: [], koRound: 0 } });
    return md;
  }, { w: W, tipo });
}

/* B. prompt */
async function prompt(rosso) {
  const P = []; const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G229: true, ...G246 } : { ...G246 }, nome: NOME });
  const esc = async () => { await A.page.evaluate(() => window.__CPM_CAREER.dismiss && window.__CPM_CAREER.dismiss()); await A.page.keyboard.press('Escape').catch(() => {}); await sleep(350); };
  try {
    if (!A.W) throw new Error('nessuna settimana con giornata di lega');
    /* campionato CON posta: ex club + rivale (il caso 5 del giro 166) */
    const av = await A.page.evaluate(() => window.__CPM_CAREER.avv166());
    await A.page.evaluate((id) => window.__CPM_CAREER.patch({ history: [{ clubId: id, club: id, season: 1 }], rival: { name: 'Rivale', club: { id } } }), av.id); await sleep(400);
    const av2 = await A.page.evaluate(() => window.__CPM_CAREER.avv166());
    const casi = [['campionato con posta', undefined], ['coppa nazionale', 'cup'], ['Europa girone', 'euro_group'], ['Europa eliminazione diretta', 'euro'], ['Nazionale (amichevole)', 'national']];
    for (const [nome, tipo] of casi) {
      const r = await apriPrompt166(A.page, tipo);
      const giudicabile = r.bottoni.some(x => /^Gioca la partita/.test(x)) && (tipo || av2.peso >= 5);
      P.push({ nome: `B titolare · ${nome}: il tasto c'e'`, ok: giudicabile && r.solo && /momenti salienti/i.test(r.bottoni.join('|')) && r.nota.length > 20 && !/senza posta/i.test(r.nota),
        info: `bottoni ${JSON.stringify(r.bottoni)} · nota «${r.nota}»${tipo ? '' : ' · peso ' + av2.peso}${giudicabile ? '' : ' · NON GIUDICATO'}` });
      await esc();
    }
    await A.page.evaluate(() => { window.__CPM_CD229 = 'bench'; });
    for (const [nome, tipo] of [['campionato', undefined], ['Europa eliminazione diretta', 'euro']]) {
      const r = await apriPrompt166(A.page, tipo); const panca = await A.page.evaluate(() => /Parti dalla panchina/.test((document.querySelector('[data-cpm="partita23"]') || {}).innerText || ''));
      P.push({ nome: `B panchina · ${nome}: il tasto non c'e'`, ok: panca && r.bottoni.length >= 2 && !r.solo, info: `panchina mostrata ${panca} · bottoni ${JSON.stringify(r.bottoni)}${panca ? '' : ' · NON GIUDICATO'}` }); await esc();
    }
    await A.page.evaluate(() => { window.__CPM_CD229 = null; window.__CPM_CAREER.patch({ isSuspended: true }); }); await sleep(400);
    for (const [nome, tipo] of [['coppa nazionale', 'cup'], ['Europa girone', 'euro_group']]) {
      const r = await apriPrompt166(A.page, tipo); const sq = await A.page.evaluate(() => /squalificato/i.test((document.querySelector('[data-cpm="partita23"]') || {}).innerText || ''));
      P.push({ nome: `B squalificato · ${nome}: il tasto non c'e'`, ok: sq && r.bottoni.length >= 1 && !r.solo, info: `squalifica mostrata ${sq} · bottoni ${JSON.stringify(r.bottoni)}${sq ? '' : ' · NON GIUDICATO'}` }); await esc();
    }
    P.push({ nome: 'B errori di pagina', ok: A.errs.length === 0, info: JSON.stringify(A.errs.slice(0, 3)) });
  } catch (e) { P.push({ nome: 'B flusso del prompt', ok: false, info: String(e.message).slice(0, 160) }); }
  await A.b.close(); A.srv.close(); return P;
}

/* C. ottavo europeo ai rigori: col tasto (verde/rosso) e intero (riferimento) */
async function ottavo(modo, init) {
  const A = await apriCarriera166({ init: { ...(init || {}), ...G246 }, nome: NOME, reseed: 4242 }); const out = { modo, finita: false };
  try {
    if (!A.W) throw new Error('nessuna settimana di lega');
    await inietta(A.page, A.W, 'euro'); await sleep(600);
    const pr = await apriPrompt166(A.page, 'euro'); out.tasto = pr.solo;
    if (modo === 'solo' && !pr.solo) { out.note = ['tasto dei momenti salienti assente: la partita non si apre a soli salienti']; throw new Error('tasto assente'); }
    const r = await gioca166(A.page, modo, { seme: SEME, rigoriAllaScena: 1 });
    Object.assign(out, { finita: r.finita, score: r.score, lm: r.lm, velo: r.velo, rigori: !!r.rigori, forzati: r.rigoriForzati, finale: r.finale, seq: seq166(r.ev || []), scene: r.scene });
    if (r.finita) await chiudi166(A.page);
    await sleep(1500);
    const p = await A.page.evaluate(() => (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || null);
    const cal = p && (p.calendar || []).find(m => m.matchday === 996);
    out.carriera = p ? { cal: cal ? { played: !!cal.played, result: cal.result || null } : null, euro: p.euro ? { phase: p.euro.phase, eliminated: !!p.euro.eliminated, champion: !!p.euro.champion, koRound: p.euro.koRound, koResults: p.euro.koResults || [] } : null,
      voce: (p.matchHistory || []).slice(-1)[0] || null, matches: p.matches, totalMatches: p.totalMatches, goals: p.goals, assists: p.assists, week: p.week, trophies: p.trophies || null } : null;
  } catch (e) { out.err = String(e.message).slice(0, 160); }
  out.errs = A.errs.slice(0, 3); await A.b.close(); A.srv.close(); return out;
}
function passiC(I, S) {
  const g = I.finita && S.finita && I.rigori && I.carriera && S.carriera;
  const J = x => JSON.stringify(x);
  return [
    { nome: 'C la partita KO aperta col tasto e\' a soli salienti (testimone, velo)', ok: !!S.lm && S.lm.attiva === true && S.lm.chiesta === true && S.velo, info: `testimone ${J(S.lm || null)} · velo ${S.velo} · ${S.err || ''} ${J(S.note || [])}` },
    { nome: 'C pareggio a eliminazione diretta → rigori in entrambe, stesso risultato', ok: g && S.rigori && J(I.score) === J(S.score), info: `rigori ${I.rigori}/${S.rigori} · forzati ${J(I.forzati)} ${J(S.forzati)} · risultato ${J(I.score)} vs ${J(S.score)}${g ? '' : ' · NON GIUDICATO'}` },
    { nome: 'C libro mastro e schermata finale identici', ok: g && I.seq.length > 5 && J(I.seq) === J(S.seq) && (I.finale || '').length > 400 && I.finale === S.finale, info: `voci ${I.seq ? I.seq.length : '—'}/${S.seq ? S.seq.length : '—'} · finale ${(I.finale || '').length}/${(S.finale || '').length} car.` },
    { nome: 'C il turno si chiude come nella partita intera (calendario, stato europeo, storico, presenze)', ok: g && !!I.carriera.cal && I.carriera.cal.played && J(I.carriera.cal) === J(S.carriera.cal) && J(I.carriera.euro) === J(S.carriera.euro) && I.carriera.euro.phase !== 'r16' && J(I.carriera.voce) === J(S.carriera.voce) && I.carriera.matches === S.carriera.matches && I.carriera.week === S.carriera.week && J(I.carriera.trophies) === J(S.carriera.trophies),
      info: `intera ${J(I.carriera && { cal: I.carriera.cal, euro: I.carriera.euro, week: I.carriera.week }).slice(0, 260)} · soli ${J(S.carriera && { cal: S.carriera.cal, euro: S.carriera.euro, week: S.carriera.week }).slice(0, 260)}` },
    { nome: 'C errori di pagina', ok: !(I.errs || []).length && !(S.errs || []).length && !I.err, info: J([I.errs, S.errs, I.err || null]) }];
}

console.log('A. STATICO'); for (const x of st) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
let verde = null, rosso = null;
if (PARTE !== 'rosso') {
  const B = await prompt(false); const I = await ottavo('intera'), S = await ottavo('solo'); if (process.env.CPM_G229_DUMP) fs.writeFileSync(process.env.CPM_G229_DUMP, JSON.stringify({ I, S }));/* [giro 246] per confrontare le due schermate finali */ const C = passiC(I, S);
  console.log('B+C. braccio VERDE'); for (const x of [...B, ...C]) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
  verde = st.every(x => x.ok) && [...B, ...C].every(x => x.ok);
}
if (PARTE !== 'verde') {
  const B = await prompt(true); const S = await ottavo('solo', { __CPM_NO_G229: true });
  console.log('B+C. braccio ROSSO (__CPM_NO_G229)'); for (const x of B) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
  console.log(`  ottavo a soli salienti: tasto ${S.tasto} · ${S.err || ''} ${JSON.stringify(S.note || [])}`);
  const cade = n => { const x = B.find(y => y.nome.startsWith(n)); return !!x && !x.ok; };
  const tieni = n => { const x = B.find(y => y.nome.startsWith(n)); return !!x && x.ok; };
  rosso = cade('B titolare · campionato con posta') && cade('B titolare · coppa') && cade('B titolare · Europa girone') && cade('B titolare · Europa eliminazione') && cade('B titolare · Nazionale')
    && tieni('B panchina · campionato') && tieni('B squalificato · coppa') && S.tasto === false && !(S.errs || []).length;
}
if (verde !== null) console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
if (rosso !== null) console.log(`ROSSO: ${rosso ? 'CADE (come deve): tasto assente fuori dal campionato senza posta, partita KO non apribile a soli salienti' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit((verde === null || verde) && (rosso === null || rosso) ? 0 : 1);
