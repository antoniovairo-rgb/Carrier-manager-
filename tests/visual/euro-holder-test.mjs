#!/usr/bin/env node
/* [7.199.0 collaudo PO «dopo la vittoria di una competizione, vedi Champions, si abbia di diritto accesso
   l'anno successivo» + «il prestigio non è calcolato bene»] PROBE sul ROLLOVER:
   (A) campione in carica della Conference arrivato 13° → l'anno dopo è in COPPA EUROPA di diritto (upgrade
       di tier) con 6 gare di girone a calendario e la voce nelle Notizie;
   (B) campione in carica della Coppa dei Campioni arrivato 13° → di nuovo COPPA DEI CAMPIONI;
   (C) CONTROPROVA: stesso 13° posto SENZA titolo europeo → nessuna Europa (la classifica comanda ancora);
   (D) PRESTIGIO: il bicampione d'Europa supera il vecchio tetto +24 (il caso del PO: fermo a 66). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const CLUB = { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
/* 18 club di Lega A: il nostro è 13° per punti (la qualificazione via campionato arriva al 7°) */
const LGA = ['juve', 'inter', 'mila', 'napo', 'roma', 'lazi', 'atal', 'fior', 'bolo', 'toro', 'udin', 'geno', 'sal', 'lecc', 'empo', 'vero', 'came', 'cita'];
const standings = LGA.map((id, i) => ({ id, n: id === 'sal' ? 'FC Salernum' : 'Club ' + id, pts: 80 - i * 4, gd: 30 - i * 3, gf: 60 - i * 2, ga: 30 + i, played: 34 }));

async function run(label, euro, trophies, shift0) {
  const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript((d) => {
    window.__CPM_GLB = false;
    const save = { phase: 'career', player: {
      name: 'Holder Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 18, week: 39, weekLived: true, age: 27, ovr: 84,
      tutorialDone: true, campDone: true, popularity: 60, morale: 70, goals: 20, assists: 9, matches: 34,
      club: d.club, leagueOverrides: { sal: 'Lega A' }, standings: d.standings,
      clubPrestigeShifts: { sal: d.shift0 }, euro: d.euro, trophies: d.trophies,
      leagueArchive: [], calendar: [],
      stats: { 'velocità': 84, tecnica: 85, fisico: 82, 'mentalità': 85, tiro: 86, passaggio: 83, dribbling: 84, posizionamento: 85 },
      form: 76, fatigue: 10, contract: { duration: 3, wage: 60000, expiresAtSeason: 21 } } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, { club: CLUB, standings, euro, trophies, shift0: shift0 == null ? 21 : shift0 });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(800);
  const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
  await page.waitForFunction(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); return s && s.player && s.player.season === 19; }, { timeout: 20000 }).catch(() => {});
  const st = await page.evaluate(() => { const p = (JSON.parse(localStorage.getItem('cpm-v3') || 'null') || {}).player || {};
    return { season: p.season, comp: p.euro && p.euro.active ? p.euro.competition : null,
      eg: (p.calendar || []).filter(m => m.type === 'euro_group').length,
      egComp: [...new Set((p.calendar || []).filter(m => m.type === 'euro_group').map(m => m.competition))],
      shift: (p.clubPrestigeShifts || {}).sal, log: (p.log || []).find(l => /QUALIFICAZIONE|DI DIRITTO/i.test(l)) || null }; });
  await page.close();
  if (ok !== true) issues.push(`${label}: startNewSeason → ${ok}`);
  if (errs.length) issues.push(`${label}: pageerror ${errs[0]}`);
  console.log(`${label}: comp=${st.comp} · gare girone=${st.eg} ${JSON.stringify(st.egComp)} · shift prestigio=${st.shift} · log=${(st.log || '—').slice(0, 80)}`);
  return st;
}

const TR2 = [{ season: 17, club: 'FC Salernum', league: 'UECL', type: 'euro' }, { season: 18, club: 'FC Salernum', league: 'UECL', type: 'euro' }, { season: 18, club: 'FC Salernum', league: 'Coppa', type: 'cup' }];

// (A) campione Conference, 13° in campionato → Coppa Europa di diritto
const A = await run('(A) campione UECL 13°', { active: true, competition: 'UECL', phase: 'final', champion: true, koResults: [1, 2, 3], groupResults: [] }, TR2);
if (A.comp !== 'UEL') issues.push(`(A) atteso UEL di diritto, trovato ${A.comp}`);
if (A.eg !== 6) issues.push(`(A) attese 6 gare di girone, trovate ${A.eg}`);
if (A.egComp.length !== 1 || A.egComp[0] !== 'UEL') issues.push(`(A) calendario girone con competizione errata: ${JSON.stringify(A.egComp)}`);
if (!A.log || !/DI DIRITTO/i.test(A.log)) issues.push('(A) manca la voce «di diritto» nelle Notizie');

// (B) campione della Coppa dei Campioni, 13° → di nuovo Coppa dei Campioni
const B = await run('(B) campione UCL 13°', { active: true, competition: 'UCL', phase: 'final', champion: true, koResults: [1, 2, 3], groupResults: [] }, [{ season: 18, club: 'FC Salernum', league: 'UCL', type: 'euro' }]);
if (B.comp !== 'UCL') issues.push(`(B) atteso UCL di diritto, trovato ${B.comp}`);
if (B.eg !== 6) issues.push(`(B) attese 6 gare di girone, trovate ${B.eg}`);

// (D) il caso del PO: bicampione d'Europa GIÀ al vecchio tetto (+24) → deve poterlo superare
const D = await run('(D) bicampione al vecchio tetto', { active: true, competition: 'UCL', phase: 'final', champion: true, koResults: [1, 2, 3], groupResults: [] }, [{ season: 17, club: 'FC Salernum', league: 'UEL', type: 'euro' }, { season: 18, club: 'FC Salernum', league: 'UCL', type: 'euro' }, { season: 18, club: 'FC Salernum', league: 'Coppa', type: 'cup' }], 24);
if (!(D.shift > 24)) issues.push(`(D) prestigio ancora tappato dal vecchio cap ±24: shift ${D.shift} (il club è bicampione d'Europa in carica)`);
if (D.comp !== 'UCL') issues.push(`(D) atteso UCL di diritto, trovato ${D.comp}`);

// (C) CONTROPROVA: 13° senza titolo → niente Europa
const C = await run('(C) controprova 13° senza titolo', { active: true, competition: 'UECL', phase: 'eliminated', champion: false, koResults: [], groupResults: [] }, []);
if (C.comp) issues.push(`(C) REGRESSIONE: qualificazione europea senza titolo né piazzamento (${C.comp})`);
if (C.eg) issues.push(`(C) REGRESSIONE: ${C.eg} gare di girone a calendario senza qualificazione`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ CAMPIONE IN CARICA OK (diritto UCL/UEL · girone rigenerato · controprova pulita · prestigio oltre il vecchio tetto)');
process.exit(issues.length ? 1 : 0);
