#!/usr/bin/env node
/* [giro 355 · PO-586, foto docs/collaudo-po/198-storia-equilibrio-anni.png — «un equilibrio che dura da anni è fuori luogo,
 * primo anno tra i professionisti»]
 * GUARDIANO «LA STORIA DEL RIVALE HA I SUOI ANNI» — non-gate, carriera. Chiama la funzione VERA di «La tua storia»
 * (storyChapter, esposta solo sotto ?cpmtest=1 come __CPM_CAREER.storyChapter) su carriere sintetiche: sei stagioni da
 * professionista per 48 rivali diversi, la gara d'andata (settimana 10) e il ritorno (settimana 24), meta' delle volte
 * coi gol di carriera alla pari (cosi' esce anche il «testa a testa» della foto). Il giudice e' indipendente dal gioco:
 * legge titolo e testo del capitolo e li confronta con gli anni che la sonda conosce per costruzione.
 *   A  nessun «da anni» / «eterni rivali» / «sfida di sempre» prima della terza stagione da professionista insieme;
 *      nessun «dalla scorsa stagione» fuori dalla seconda; nessun «appena cominciata» fuori dalla prima.
 *   B  nessun «di nuovo» / «ancora voi due» / «rimette di fronte» / «torna sulla tua strada» / «riparte sempre» prima
 *      di essersi affrontati (prima stagione, gara d'andata); nessun «per la prima volta» / «primo incrocio» dopo.
 *   C  copertura: ogni stagione 1, 2, 3+ produce capitoli del rivale e il «testa a testa»; un capitolo nullo o un errore
 *      e' «non giudicato» = rosso.
 * Rosso: window.__CPM_NO_G355 = testi di prima (A e B devono cadere; misura quante volte uscivano).
 * Uso: node storia-355.mjs  ·  CPM_PROVA_ROSSO=1 node storia-355.mjs (gira anche il rosso e pretende che cada). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 82, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' };
const SAVE = { phase: 'career', player: { name: 'Probe Storia', nation: 'Italia', avatarId: 0, proStatus: 'pro', proSeason: 3, season: 3, week: 5, age: 20, ovr: 70,
  campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true, weekLived: false, seasonPledge: { season: 3, tone: 'equilibrato' },
  club: CLUB, stats: { 'velocità': 70, tecnica: 70, fisico: 70, 'mentalità': 70, tiro: 70, passaggio: 70, dribbling: 70, posizionamento: 70 },
  form: 70, morale: 70, fatigue: 10, popularity: 30, value: 5, bankBalance: 9000, goals: 2, assists: 1, matches: 4, calendar: [], contract: { duration: 3, wage: 3000, expiresAtSeason: 6 } } };

const SIM = ({ rosso, club }) => {
  if (rosso) window.__CPM_NO_G355 = true; else delete window.__CPM_NO_G355;
  const C = window.__CPM_CAREER; if (!C || typeof C.storyChapter !== 'function') return { cieco: 'storyChapter non esposta' };
  const RV = { id: 'rvc', n: 'Atletico Norte', p: 78, lg: club.lg };
  const out = { righe: [], nulli: 0, errori: [] };
  let seed = 355; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
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
          rival: { name, club: RV, totalGoals: rvG, goals: 3, seasons: anni, ovr: 70, age: 19 + anni, relationship: anni >= 2 ? ['rivale', 'amico', 'rispettato'][r % 3] : 'sconosciuto', trophies: 0 } };
        let ch; try { ch = C.storyChapter(p); } catch (e) { out.errori.push(String(e).slice(0, 80)); continue; }
        if (typeof ch === 'string') { out.errori.push(ch.slice(0, 80)); continue; }
        if (!ch || !/^rivw1/.test(ch.key || '')) { out.nulli++; (out.altri = out.altri || {})[ch ? String(ch.key).replace(/_.*$/, '') : 'null'] = ((out.altri || {})[ch ? String(ch.key).replace(/_.*$/, '') : 'null'] || 0) + 1; continue; }
        out.righe.push({ anni, leg, visti: anni >= 2 || leg === 2, t: (ch.title || '') + ' ¦ ' + (ch.body || '') });
      }
    }
  }
  return out;
};

const REG = [
  { k: 'da anni', re: /da anni|eterni rivali|sfida di sempre/i, ok: (s) => s.anni >= 3 },
  { k: 'scorsa stagione', re: /dalla scorsa stagione/i, ok: (s) => s.anni === 2 },
  { k: 'appena cominciata', re: /appena cominciata/i, ok: (s) => s.anni === 1 },
  { k: 'gia visti', re: /di nuovo|ancora voi due|rimette di fronte|torna sulla tua strada|riparte sempre/i, ok: (s) => s.visti },
  { k: 'prima volta', re: /per la prima volta|primo incrocio/i, ok: (s) => !s.visti },
];
const giudica = (d) => {
  const viol = [], perAnno = {}, testa = {};
  for (const s of d.righe) {
    const b = s.anni >= 3 ? '3+' : String(s.anni); perAnno[b] = (perAnno[b] || 0) + 1;
    if (/testa a testa/.test(s.t)) testa[b] = (testa[b] || 0) + 1;
    for (const g of REG) if (g.re.test(s.t) && !g.ok(s)) viol.push({ k: g.k, anni: s.anni, leg: s.leg, t: s.t.slice(0, 160) });
  }
  return { viol, perAnno, testa };
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
console.log('── storia-355 · braccio VERDE (testi legati agli anni)');
if (V.cieco) ok(false, 'non giudicato: ' + V.cieco);
else {
  const g = giudica(V);
  console.log(`  capitoli del rivale ${V.righe.length} · nulli ${V.nulli} · errori ${V.errori.length} · altri ${JSON.stringify(V.altri || {})} · per stagione ${JSON.stringify(g.perAnno)} · testa a testa ${JSON.stringify(g.testa)}`);
  ok(V.errori.length === 0 && V.nulli === 0, `C nessun capitolo nullo o in errore (non giudicato = rosso)${V.errori.length ? ': ' + V.errori[0] : ''}`);
  ok(['1', '2', '3+'].every(b => (g.perAnno[b] || 0) >= 40), 'C ogni stagione (1, 2, 3+) ha almeno 40 capitoli del rivale');
  ok(['1', '2', '3+'].every(b => (g.testa[b] || 0) >= 2), 'C il «testa a testa» della foto esce in ogni stagione');
  ok(g.viol.length === 0, `A+B nessun testo che presuppone anni o incontri che non ci sono (${g.viol.length})`);
  for (const v of g.viol.slice(0, 6)) console.log(`     · [${v.k}] stagione ${v.anni} gara ${v.leg}: ${v.t}`);
}
if (ROSSO) {
  const R = await giro(true);
  console.log('── storia-355 · braccio ROSSO (__CPM_NO_G355 = testi di prima)');
  if (R.cieco) ok(false, 'rosso non giudicato: ' + R.cieco);
  else {
    const g = giudica(R); const n = (k, a) => g.viol.filter(v => v.k === k && (a == null || v.anni === a)).length;
    const s1 = g.viol.filter(v => v.anni === 1).length, s2 = g.viol.filter(v => v.anni === 2).length;
    console.log(`  violazioni ${g.viol.length} su ${R.righe.length} capitoli · prima stagione ${s1} · seconda ${s2} · «da anni» in prima stagione ${n('da anni', 1)} · «già visti» al primo incrocio ${n('gia visti')}`);
    ok(n('da anni', 1) > 0, 'il rosso rimette «da anni»/«eterni»/«di sempre» nella prima stagione (il caso della foto)');
    ok(n('gia visti') > 0, 'il rosso rimette «di nuovo»/«ancora voi due» al primo incrocio');
  }
}
console.log(esito ? '\n✅ storia-355 VERDE' : '\n❌ storia-355 ROSSO');
await browser.close(); srv.close(); process.exit(esito ? 0 : 1);
