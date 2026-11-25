#!/usr/bin/env node
/* [giro 362 · decisione PO 25/11 09:10 sul dubbio 3 del giro 355: «Sempre il numero»]
 * GUARDIANO «LA RIVALITA' DICE IL NUMERO VERO» — non-gate, carriera. Stessa sonda del 355 (storyChapter VERA su carriere
 * sintetiche: 48 rivali x 6 stagioni da professionista x andata/ritorno, meta' coi gol di carriera alla pari).
 *   A  nessun «da anni» / «da sempre» / «di sempre» / «eterni» / «di una vita» / «da tempo» in nessun capitolo del rivale;
 *   B  ogni «N stagioni» detto (equilibrio, titoli, «vi inseguite») vale esattamente le stagioni vere (min fra stagioni da pro
 *      e stagioni del rivale, conosciute dalla sonda per costruzione) ed e' al plurale giusto; nessun numero sotto 3;
 *      «dalla scorsa stagione» solo in seconda; in prima nessuna frase sugli anni («appena cominciata» compresa);
 *   C  copertura: «testa a testa» in ogni stagione, almeno 20 numeri giudicati dalla terza in poi; nulli/errori = rosso.
 * Rosso: window.__CPM_NO_G362 = testi del 355 (A e B devono cadere). Uso: CPM_PROVA_ROSSO=1 node storia-362.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 82, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' };
const SAVE = { phase: 'career', player: { name: 'Probe Storia', nation: 'Italia', avatarId: 0, proStatus: 'pro', proSeason: 3, season: 3, week: 5, age: 20, ovr: 70,
  campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true, weekLived: false, seasonPledge: { season: 3, tone: 'equilibrato' },
  club: CLUB, stats: { 'velocità': 70, tecnica: 70, fisico: 70, 'mentalità': 70, tiro: 70, passaggio: 70, dribbling: 70, posizionamento: 70 },
  form: 70, morale: 70, fatigue: 10, popularity: 30, value: 5, bankBalance: 9000, goals: 2, assists: 1, matches: 4, calendar: [], contract: { duration: 3, wage: 3000, expiresAtSeason: 6 } } };

const SIM = ({ rosso, club }) => {
  delete window.__CPM_NO_G355; if (rosso) window.__CPM_NO_G362 = true; else delete window.__CPM_NO_G362;
  const C = window.__CPM_CAREER; if (!C || typeof C.storyChapter !== 'function') return { cieco: 'storyChapter non esposta' };
  const RV = { id: 'rvc', n: 'Atletico Norte', p: 78, lg: club.lg };
  const out = { righe: [], nulli: 0, errori: [] };
  let seed = 362; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let r = 0; r < 48; r++) {
    const name = 'Rivale' + String.fromCharCode(65 + (r % 26)) + ' ' + ['Bauer', 'Costa', 'Wolf', 'Greco'][r % 4] + r;
    for (let anni = 1; anni <= 6; anni++) {
      const proSeason = 2 + (r % 2), sn = proSeason + anni - 1;
      for (const leg of [1, 2]) {
        const wk = leg === 1 ? 10 : 24, pari = r % 2 === 0;
        let myG = 4 + Math.floor(rnd() * 20) * anni; if ([100, 200, 300].some(t => myG >= t && myG < t + 6)) myG += 10; /* fuori dalle finestre del «gol numero 100» */ const rvG = pari ? myG + Math.floor(rnd() * 7) - 3 : Math.max(0, Math.floor(myG * (0.3 + rnd() * 2)));
        const mh = []; for (let i = 0; i < wk - 2; i++) mh.push({ week: i + 1, opponent: 'Squadra ' + i, goals: (i % 2) ? 1 : 0, won: true });
        if (leg === 2) mh.push({ week: 10, opponent: RV.n, goals: 0, won: false });
        mh.push({ week: wk - 1, opponent: 'Squadra Z', goals: 1, won: true });
        const hist = []; for (let s = proSeason; s < sn; s++) hist.push({ season: s, club: club.n, clubId: club.id, goals: 3, matches: 3 }); /* presenze col club sempre sotto 50: il tributo «50 volte questa maglia» non copre il rivale */
        const p = { ...window.__CPM_P355, season: sn, week: wk, proStatus: 'pro', proSeason, age: 19 + anni, club, totalGoals: myG, goals: 3, matches: (wk - 1) % 40 + 1,
          history: hist, matchHistory: mh, arcSeen: {}, nationalCaps: 0, isCaptain: false, trophies: [], standings: [],
          calendar: [{ matchday: leg === 1 ? 9 : 23, week: wk, opponentId: RV.id, opponentName: RV.n, isHome: leg === 1, played: false }],
          rival: { name, club: RV, totalGoals: rvG, goals: 3, seasons: anni + (r % 3 === 1 ? 2 : 0) /* un rivale su tre con piu' stagioni di quelle da pro (salvataggio vecchio): il numero vero e' il minore */, ovr: 70, age: 19 + anni, relationship: anni >= 2 ? ['rivale', 'amico', 'rispettato'][r % 3] : 'sconosciuto', trophies: 0 } };
        let ch; try { ch = C.storyChapter(p); } catch (e) { out.errori.push(String(e).slice(0, 80)); continue; }
        if (typeof ch === 'string') { out.errori.push(ch.slice(0, 80)); continue; }
        if (!ch || !/^rivw1/.test(ch.key || '')) { out.nulli++; (out.altri = out.altri || {})[ch ? String(ch.key).replace(/_.*$/, '') : 'null'] = ((out.altri || {})[ch ? String(ch.key).replace(/_.*$/, '') : 'null'] || 0) + 1; continue; }
        out.righe.push({ anni, leg, visti: anni >= 2 || leg === 2, t: (ch.title || '') + ' ¦ ' + (ch.body || '') });
      }
    }
  }
  return out;
};

const VAGO = /da anni|da sempre|di sempre|eterni|di una vita|da tempo|da tanti anni|per anni/i;
const giudica = (d) => {
  const viol = [], perAnno = {}, testa = {}; let numeri = 0;
  for (const s of d.righe) {
    const b = s.anni >= 3 ? '3+' : String(s.anni); perAnno[b] = (perAnno[b] || 0) + 1;
    if (/testa a testa/.test(s.t)) testa[b] = (testa[b] || 0) + 1;
    const m = s.t.match(VAGO); if (m) viol.push({ k: 'vago', anni: s.anni, leg: s.leg, t: '«' + m[0] + '» ' + s.t.slice(0, 140) });
    for (const x of s.t.matchAll(/(\d+) stagion([ei])\b/g)) {
      const n = +x[1]; numeri++;
      if (n !== s.anni || n < 3 || (n === 1) !== (x[2] === 'e')) viol.push({ k: 'numero', anni: s.anni, leg: s.leg, t: `detto ${x[0]} con stagioni vere ${s.anni}: ` + s.t.slice(0, 120) });
    }
    if (/dalla scorsa stagione/i.test(s.t) && s.anni !== 2) viol.push({ k: 'scorsa', anni: s.anni, leg: s.leg, t: s.t.slice(0, 140) });
    if (s.anni === 1 && /appena cominciata|da professionisti/i.test(s.t)) viol.push({ k: 'prima', anni: s.anni, leg: s.leg, t: s.t.slice(0, 140) });
  }
  return { viol, perAnno, testa, numeri };
};

const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const giro = async (rosso) => {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(sv => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); window.__CPM_P355 = sv.player; }, SAVE);
  let pronto = false;
  for (let t = 0; t < 3 && !pronto; t++) {
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
      await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await page.waitForFunction(() => window.__CPM_CAREER && typeof window.__CPM_CAREER.storyChapter === 'function', { timeout: 30000 }); pronto = true;
    } catch (e) { console.log('  · caricamento ' + (t + 1) + ' fallito: ' + String(e.message).slice(0, 80)); }
  }
  if (!pronto) { await page.close(); return { cieco: 'carriera non montata' }; }
  const d = await page.evaluate(SIM, { rosso, club: CLUB });
  d.pageerr = errs; await page.close(); return d;
};

const ROSSO = process.env.CPM_PROVA_ROSSO === '1';
const V = await giro(false);
let esito = true; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) esito = false; };
console.log('── storia-362 · braccio VERDE (il numero vero)');
if (V.cieco) ok(false, 'non giudicato: ' + V.cieco);
else {
  const g = giudica(V);
  console.log(`  capitoli del rivale ${V.righe.length} · nulli ${V.nulli} · errori ${V.errori.length} · per stagione ${JSON.stringify(g.perAnno)} · testa a testa ${JSON.stringify(g.testa)} · numeri di stagioni giudicati ${g.numeri}`);
  ok(V.errori.length === 0 && V.nulli === 0, `C nessun capitolo nullo o in errore (non giudicato = rosso)${V.errori.length ? ': ' + V.errori[0] : ''}`);
  ok(['1', '2', '3+'].every(b => (g.perAnno[b] || 0) >= 40), 'C ogni stagione (1, 2, 3+) ha almeno 40 capitoli del rivale');
  ok(['1', '2', '3+'].every(b => (g.testa[b] || 0) >= 2), 'C il «testa a testa» esce in ogni stagione');
  ok(g.numeri >= 20, `C almeno 20 «N stagioni» giudicati (${g.numeri})`);
  ok(g.viol.filter(v => v.k === 'vago').length === 0, `A nessuna formula vaga sugli anni (${g.viol.filter(v => v.k === 'vago').length})`);
  ok(g.viol.filter(v => v.k !== 'vago').length === 0, `B ogni numero di stagioni e' quello vero, «scorsa stagione» solo in seconda, niente anni in prima (${g.viol.filter(v => v.k !== 'vago').length})`);
  for (const v of g.viol.slice(0, 6)) console.log(`     · [${v.k}] stagione ${v.anni} gara ${v.leg}: ${v.t}`);
}
if (ROSSO) {
  const R = await giro(true);
  console.log('── storia-362 · braccio ROSSO (__CPM_NO_G362 = testi del 355)');
  if (R.cieco) ok(false, 'rosso non giudicato: ' + R.cieco);
  else {
    const g = giudica(R); const n = (k) => g.viol.filter(v => v.k === k).length;
    console.log(`  violazioni ${g.viol.length} su ${R.righe.length} capitoli · vaghe ${n('vago')} · prima stagione ${n('prima')} · numeri sbagliati ${n('numero')}`);
    ok(n('vago') > 0, 'il rosso rimette «da anni»/«eterni»/«di sempre» (testi del 355)');
    ok(n('prima') > 0, 'il rosso rimette «appena cominciata» in prima stagione');
  }
}
console.log(esito ? '\n✅ storia-362 VERDE' : '\n❌ storia-362 ROSSO');
await browser.close(); srv.close(); process.exit(esito ? 0 : 1);
