#!/usr/bin/env node
/* [giro 164, PO-364] SONDA DI MISURA (non guardiano, non gate): com'e' oggi la stagione da PROFESSIONISTA.
   Domanda del PO: «gestire a momenti salienti e non partita dopo partita? non vorrei che diventi noioso alla lunga».
   Gioca DUE stagioni consecutive sugli handler VERI (__CPM_CAREER.step → liveCurrentWeek / simulateAndAdvance /
   doAdvanceWeek, poi startNewSeason) per piu' profili (club di prestigio basso/medio/alto, titolare/riserva) e
   registra settimana per settimana:
     - le voci di calendario della settimana (lega / cup / euro_group / euro / national ...) e la gara servita;
     - i riquadri aperti (settimana23 con numero di pulsanti, intervista, offerta, rinnovo, convocazione);
     - l'impulso settimanale (recentImpulses) per la ripetizione;
     - il peso della gara (calcMatchWeight, la funzione che il gioco usa per la conferenza e il numero di highlight);
     - la PRE-selezione degli highlight (selectContextualSituations con il seed vero della partita) per N=4 e N=6;
     - la domanda d'intervista post-partita che pickInterviewByCtx pescherebbe (stima: la funzione usa Math.random).
   I riquadri si CHIUDONO senza scegliere (come la sonda 153), le interviste si chiudono col primo pulsante.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node stagione-pro-164.mjs [profilo...]  → out/stagione-pro-164.json
   Profili: basso-tit · medio-tit · alto-tit · alto-ris (default) · primavera (una stagione U18, per confronto). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';
const CL = {
  lec: { id: 'lec', n: 'FC Salento', a: 'SLN', p: 62, c: '#f5c518', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' },
  fio: { id: 'fio', n: 'FC Brenvar', a: 'BRN', p: 77, c: '#7c3aed', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  prim: { id: 'milan', n: 'AC Dorvelli Primavera', a: 'ACR', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
  juve: { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 95, c: '#f5f5f5', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' },
};
const PROFILI = {
  'basso-tit': { club: 'lec', ovr: 72, trust: 75 },
  'medio-tit': { club: 'fio', ovr: 78, trust: 72 },
  'alto-tit': { club: 'juve', ovr: 86, trust: 80 },
  'alto-ris': { club: 'juve', ovr: 68, trust: 40 },
  'primavera': { club: 'prim', ovr: 66, trust: 60, u18: true },
};
const scelti = process.argv.slice(2).filter(a => PROFILI[a]);
const LISTA = scelti.length ? scelti : Object.keys(PROFILI).filter(k => !PROFILI[k].u18);
const STAGIONI = +(process.env.CPM_STAGIONI || 3);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const all = fs.existsSync('out/stagione-pro-164.json') && scelti.length ? JSON.parse(fs.readFileSync('out/stagione-pro-164.json', 'utf8')).filter(x => !LISTA.includes(x.profilo)) : [];
for (const nome of LISTA) {
  const pr = PROFILI[nome]; const t0 = Date.now();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ pr, club, nome }) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1;
    const s = pr.ovr;
    const save = { phase: 'career', player: { name: 'Sonda Pro ' + nome, nation: 'Italia', avatarId: 0, proStatus: pr.u18 ? 'u18' : 'pro', season: pr.u18 ? 1 : 3, week: 1, weekLived: false, age: pr.u18 ? 17 : 22, ovr: s, tutorialDone: true, position: 'ATT',
      club, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
      form: 70, morale: 72, fatigue: 10, coachTrust: pr.trust, popularity: 40, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1 } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, { pr, club: CL[pr.club], nome });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(1200);
  const stagioni = [];
  for (let si = 0; si < (pr.u18 ? 1 : STAGIONI); si++) {
    const s0 = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { season: p.season, cal: (p.calendar || []).map(m => ({ md: m.matchday, w: m.week, t: m.type || 'lega', c: m.competition || null })), euro: p.euro ? { comp: p.euro.competition, active: !!p.euro.active } : null, cup: p.cup ? { active: !!p.cup.active } : null, lg: p.club && p.club.lg, club: p.club && p.club.n, nStand: (p.standings || []).length }; });
    const weeks = []; let end = null, iter = 0;
    while (iter++ < 320) {
      const r = await page.evaluate(() => {
        const C = window.__CPM_CAREER; const P = C.snapshot();
        const md = C.thisWeekMd();
        const calW = (P.calendar || []).filter(m => m.week === P.week).map(m => (m.type || 'lega') + (m.played ? '*' : ''));
        let p165 = null, mdT = null, mdC = null, mw = null, sitsA = null, sitsB = null, iv = null, rank = null;
        if (md && typeof md === 'object') {
          const e = (P.calendar || []).find(m => m.matchday === md.matchday && m.week === md.week) || {};
          const oid = e.opponentId || md.opp;
          try { mw = calcMatchWeight(P, oid, P.standings || [], P.week || 1); } catch (x) { mw = 'err'; }
          try { p165 = (typeof posta165 === 'function') ? posta165(P, { ...e, opponentId: oid, opponentName: e.opponentName || md.opp }) : 'assente'; } catch (x) { p165 = 'err:' + x.message; } mdT = e.type || 'league'; mdC = e.competition || null;
          const seed = (P.season || 1) * 1000 + (P.week || 1) * 13 + hashStr(md.opp || '');
          try { sitsA = selectContextualSituations([...SITUATIONS], 4, P, seed, { opponentId: oid }).map(s => s.text); } catch (x) { sitsA = 'err:' + x.message; }
          try { sitsB = selectContextualSituations([...SITUATIONS], 6, P, seed, { opponentId: oid }).map(s => s.text); } catch (x) { sitsB = 'err:' + x.message; }
          try { const q = pickInterviewByCtx(P, { won: true }); iv = q && q.q && (q.q.q || q.q.text || JSON.stringify(q.q).slice(0, 90)); } catch (x) { iv = 'err:' + x.message; }
        }
        try { const st = [...(P.standings || [])].sort((a, b) => (b.pts || 0) - (a.pts || 0)); rank = st.findIndex(t => t.id === (P.club && P.club.id)) + 1; } catch (x) {}
        const scr = C.screen();
        if (scr === 'seasonEnd' || scr === 'seasonAwards' || scr === 'proTransition') return { res: 'seasonEnd', w: P.week, s: P.season };
        const imp0 = (P.recentImpulses || []).slice(-1)[0] || null;
        const res = C.step();
        return { res, w: P.week, s: P.season, md, calW, mw, p165, mdT, mdC, sitsA, sitsB, iv, rank, imp0, cupA: !!(P.cup && P.cup.active && !P.cup.eliminated && !P.cup.champion), euA: !!(P.euro && P.euro.active), nat: !!(P.nationsCupQueue && P.nationsCupQueue.active && !P.nationsCupQueue.done), em: !!(P.euroMondiale && P.euroMondiale.active && !P.euroMondiale.done), lived: P.weekLived };
      });
      await sleep(r.res === 'lived' ? 420 : 240);
      const ui = await page.evaluate(() => {
        const q = s => document.querySelector(`[data-cpm="${s}"]`);
        const txt = el => el ? el.innerText.replace(/\s+/g, ' ').slice(0, 160) : null;
        const o = {};
        const m = q('settimana23'); if (m) o.sett = { t: txt(m), nb: m.querySelectorAll('button').length };
        for (const k of ['intervista231', 'eroe-intervista23', 'offerta23', 'offerta-v2', 'rinnovo94', 'convocazione235', 'contratto-v2']) { const el = q(k); if (el) o[k] = txt(el); }
        const P = window.__CPM_CAREER.snapshot();
        o.imp = (P.recentImpulses || []).slice(-1)[0] || null; o.nImp = (P.recentImpulses || []).length;
        o.saga = P.transferSaga ? { club: P.transferSaga.club && (P.transferSaga.club.n || P.transferSaga.club), w: P.transferSaga.week } : null;
        o.m = P.matches || 0; o.g = P.goals || 0; o.ovr = P.ovr; o.club = P.club && P.club.n; o.scr = window.__CPM_CAREER.screen();
        return o;
      });
      /* chiusura: intervista col primo pulsante (fino a 4 passi), il resto con dismiss() */
      for (let k = 0; k < 4; k++) {
        const aperta = await page.evaluate(() => { const el = document.querySelector('[data-cpm="intervista231"],[data-cpm="eroe-intervista23"]'); if (!el) return false; const b = [...el.querySelectorAll('button')].filter(x => !x.disabled); if (b[0]) b[0].click(); return true; });
        if (!aperta) break; await sleep(250);
      }
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
      weeks.push({ ...r, ui });
      if (r.res === 'seasonEnd') {
        end = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot();
          const st = [...(p.standings || [])].sort((a, b) => (b.pts || 0) - (a.pts || 0));
          return { season: p.season, week: p.week, goals: p.goals, matches: p.matches, ovr: p.ovr, club: p.club && p.club.n, pos: st.findIndex(t => t.id === (p.club && p.club.id)) + 1, nSt: st.length,
            hist: (p.matchHistory || []).filter(h => h.season === p.season || true).slice(0, 80).map(h => ({ cup: !!h.cup, euro: !!h.euro, nat: !!(h.national || h.nat), opp: h.opponent, r: h.result || h.score, st: h.status || h.role || null })) };
        });
        break;
      }
      if (String(r.res).startsWith('error:')) { break; }
      if (String(r.res).startsWith('blocked')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
    }
    stagioni.push({ s0, weeks, end });
    const lived = weeks.filter(x => x.res === 'lived').length;
    console.log(`${nome} S${s0.season}: cal ${s0.cal.length} (${[...new Set(s0.cal.map(c => c.t))].join('/')}) · passi ${weeks.length} · lived ${lived} · fine ${end ? `pos ${end.pos}/${end.nSt} ${end.goals}g/${end.matches}p ovr ${end.ovr}` : 'NON RAGGIUNTA'} · err ${errors.length} · ${Math.round((Date.now() - t0) / 1000)}s`);
    if (!end) break;
    if (si < STAGIONI - 1) {
      const ns = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
      await sleep(1500);
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
      if (ns !== true) { console.log('startNewSeason:', ns); break; }
    }
  }
  all.push({ profilo: nome, pr, stagioni, errors });
  fs.mkdirSync('out', { recursive: true });
  fs.writeFileSync('out/stagione-pro-164.json', JSON.stringify(all, null, 1));
  await page.close();
}
await browser.close(); srv.close();
