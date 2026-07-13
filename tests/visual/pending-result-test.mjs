#!/usr/bin/env node
/* [7.24.3] TEST — COMMIT AL FISCHIO FINALE (bug grave «loop nelle ultime giornate: partita già giocata e
   vinta con premiazione, poi riproposta»): se l'app muore tra fischio finale e tap del post-partita, il
   sidecar 'cpm-pending-mr' viene recuperato al mount e la gara COMMITTATA (voce calendario giocata, storico,
   settimana avanzata) — mai due volte.
   (1) sidecar valido → recovery: voce marcata, matchHistory scritta, settimana avanzata, sidecar rimosso;
   (2) sidecar di un ALTRO salvataggio (nome diverso) → scartato senza effetti;
   (3) voce già giocata → sidecar scartato senza doppio conteggio. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const RESULT = { goals: 2, assists: 0, homeScore: 2, awayScore: 0, won: true, drew: false, wasBehind: false, opponent: 'FC Pisano', oppAbbr: 'PIS', oppCol: '#0a5', rating: 8.2, context: 'career', isHome: true, attendance: 12000, oppTactic: null, scoutReport: null, homeRoster: [], heroRoster: [], shots: 5, oppShots: 2, fouls: 1, corners: 3, possession: 58 };
const mkSave = (played) => ({ phase: 'career', player: { name: 'Pend Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 23, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4,
  goals: 5, matches: 8, matchHistory: [],
  calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played, result: played ? { homeScore: 2, awayScore: 0, won: true, drew: false } : null }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 72, fatigue: 10, morale: 70, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 } } });

const boot = async (save, sidecar) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o.save)); if (o.sidecar) localStorage.setItem('cpm-pending-mr', JSON.stringify(o.sidecar)); }, { save, sidecar });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1000);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(3200); // il recovery dispatcha a +1200ms dal mount di CareerApp
  return page;
};
const state = (page) => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; return { week: p.week, mdPlayed: !!(p.calendar || []).find(m => m.matchday === 11 && m.played), mh: (p.matchHistory || []).filter(m => m.opponent === 'FC Pisano').length, goals: p.goals, sidecar: !!localStorage.getItem('cpm-pending-mr') }; });

// (1) recovery
{
  const pg = await boot(mkSave(false), { v: 1, n: 'Pend Probe', s: 4, w: 12, result: RESULT });
  const st = await state(pg);
  console.log('(1) recovery:', JSON.stringify(st));
  if (!st.mdPlayed) issues.push('recovery: voce calendario NON marcata giocata');
  if (st.mh !== 1) issues.push('recovery: matchHistory attesa 1 voce, trovate ' + st.mh);
  if (st.goals !== 7) issues.push('recovery: gol stagionali attesi 7 (5+2), trovati ' + st.goals);
  if (st.sidecar) issues.push('recovery: sidecar non rimosso');
  await pg.close();
}
// (2) sidecar di un altro salvataggio → scartato
{
  const pg = await boot(mkSave(false), { v: 1, n: 'ALTRO GIOCATORE', s: 4, w: 12, result: RESULT });
  const st = await state(pg);
  console.log('(2) altro save:', JSON.stringify(st));
  if (st.mdPlayed) issues.push('sidecar altrui APPLICATO (voce marcata)');
  if (st.sidecar) issues.push('sidecar altrui non ripulito');
  await pg.close();
}
// (3) voce già giocata → scartato, niente doppio conteggio
{
  const pg = await boot(mkSave(true), { v: 1, n: 'Pend Probe', s: 4, w: 12, result: RESULT });
  const st = await state(pg);
  console.log('(3) già giocata:', JSON.stringify(st));
  if (st.mh !== 0) issues.push('doppio conteggio: matchHistory scritta su voce già giocata');
  if (st.goals !== 5) issues.push('doppio conteggio: gol stagionali cambiati (' + st.goals + ')');
  if (st.sidecar) issues.push('sidecar stantio non ripulito');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ COMMIT AL FISCHIO FINALE OK (recovery · sidecar altrui scartato · niente doppio conteggio)');
process.exit(issues.length ? 1 : 0);
