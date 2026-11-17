#!/usr/bin/env node
/* [giro 253 · salienti-229 instabile] SONDA misura-253b — rifa' l'ottavo europeo di salienti-229 (stesso salvataggio, stesso reseed,
   stessa iniezione) e registra DENTRO la pagina, ogni secondo, settimana, giornate di lega giocate, punti della nostra squadra, somma dei
   punti in classifica, fase della partita e prima riga del registro: dice QUANDO e DA DOVE arriva la giornata di lega in piu' trovata
   nelle corse rosse (classifica a 2 giornate contro 1). Strumento, non giudica. Uso: CPM_N=6 CPM_MODO=solo|intera node misura-253b.mjs */
import { apriCarriera166, apriPrompt166, gioca166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const N = +(process.env.CPM_N || 6), MODO = process.env.CPM_MODO || 'solo';
const spia = () => { window.__W253 = []; let u = '';
  setInterval(() => { try { const p = window.__CPM_CAREER.snapshot(); const my = (p.standings || []).find(r => r.id === p.club.id) || {};
    const s = [p.week, (p.calendar || []).filter(m => !m.type && m.played).length, my.pts | 0, (p.standings || []).reduce((t, r) => t + (r.pts | 0), 0), (window.__CPM_PHASE && window.__CPM_PHASE()) || '-', String((p.log || [])[0] || '').slice(0, 90)].join(' | ');
    if (s !== u) { u = s; window.__W253.push(Math.round(performance.now()) + ' ' + s); } } catch (e) {} }, 1000)
  let f0 = ''; setInterval(() => { try { const sc = window.__CPM_SCORE ? window.__CPM_SCORE() : {}; const f = ((window.__CPM_PHASE && window.__CPM_PHASE()) || '-') + ' min ' + (window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : '?') + ' ' + (sc.home | 0) + '-' + (sc.away | 0);
    if (f.split(' ')[0] !== f0) { f0 = f.split(' ')[0]; window.__W253.push(Math.round(performance.now()) + ' FASE ' + f); } } catch (e) {} }, 50); };
for (let i = 0; i < N; i++) {
  const A = await apriCarriera166({ init: { __CPM_NO_G246: true }, nome: 'Collaudo Salienti 229', reseed: 4242 });
  await A.page.evaluate(spia);
  await A.page.evaluate((w) => { const C = window.__CPM_CAREER, p = C.snapshot(); const opp = CLUBS.find(c => c.lg !== 'Deutsche Liga' && !c.isU18 && c.p >= 72 && c.p <= 80);
    C.patch({ week: w, weekLived: false, calendar: [...(p.calendar || []).filter(m => m.week !== w), { matchday: 996, week: w, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null, type: 'euro', competition: 'UCL', euroPhase: 'r16', cupRoundName: 'Ottavi di Finale' }],
      euro: { active: true, competition: 'UCL', phase: 'r16', groupOpponents: [{ id: opp.id, n: opp.n }], pts: 0, groupResults: [], qualified: true, champion: false, eliminated: false, koResults: [], koRound: 0 } }); }, A.W);
  await sleep(600); await apriPrompt166(A.page, 'euro');
  let visti = 0; const t0 = Date.now();
  const tic = setInterval(async () => { const w = await A.page.evaluate(() => window.__W253 || []).catch(() => []); for (const x of w.slice(visti)) console.log(`   [${Math.round((Date.now() - t0) / 1000)}s] ` + x); visti = Math.max(visti, w.length); }, 5000);
  const r = await gioca166(A.page, MODO, { seme: 7300, rigoriAllaScena: 1 }); clearInterval(tic);
  const w = (await A.page.evaluate(() => window.__W253)).slice(visti);
  const due = (r.classifica || []).some(x => /:6:/.test(x));
  console.log(`corsa ${i + 1} (${MODO}): W=${A.W} · finita ${r.finita} · note ${JSON.stringify(r.note)} · forzati ${JSON.stringify(r.forzamento)} · fasi ${JSON.stringify(r.fasi)} · classifica ${due ? 'A DUE GIORNATE' : 'a una giornata'}`);
  for (const x of w) console.log('   ' + x);
  await A.b.close(); A.srv.close();
}
