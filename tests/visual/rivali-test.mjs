#!/usr/bin/env node
/* [7.21.0] TEST — GLI ETERNI RIVALI: (1) settimana del match contro il club del rivale (non giocato) →
   capitolo pre-partita col nome/gol del rivale; (2) giocato con GOL → «Il duello è tuo»; (3) perso senza
   gol → «Round al rivale»; (4) senza rivale → nessun capitolo rivali. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const RIVAL = { name: 'Dario Ferrero', age: 24, ovr: 80, goals: 14, totalGoals: 47, seasons: 5, relationship: 'rivale', club: { id: 'pis', n: 'FC Pisano', p: 60, lg: 'Lega B', c: '#0a5' } };
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Rival Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: false, age: 23, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, totalGoals: 52,
  rival: RIVAL,
  calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: false, result: null }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 72, fatigue: 10, morale: 70, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1300);
  return page;
};
const hasTxt = (page, rx) => page.evaluate((x) => new RegExp(x, 'i').test(document.body.innerText), rx);

// (1) pre-partita
{
  const pg = await boot(mkSave({}));
  const pre = await hasTxt(pg, 'Gli eterni rivali') && await hasTxt(pg, 'Dario Ferrero');
  console.log('(1) pre-partita:', pre);
  if (!pre) issues.push('capitolo pre-partita rivali assente');
  await pg.close();
}
// (2) giocato con gol → duello tuo
{
  const pg = await boot(mkSave({ calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: true, result: { homeScore: 2, awayScore: 0, won: true, drew: false } }], matchHistory: [{ week: 12, opponent: 'FC Pisano', goals: 2, assists: 0, rating: 8, won: true }], arcSeen: { 'rivw1_w12_S4': true } }));
  const win = await hasTxt(pg, 'Il duello è tuo');
  console.log('(2) gol → duello tuo:', win);
  if (!win) issues.push('verdetto «Il duello è tuo» assente con 2 gol');
  await pg.close();
}
// (3) perso senza gol → round al rivale
{
  const pg = await boot(mkSave({ calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: true, result: { homeScore: 0, awayScore: 1, won: false, drew: false } }], matchHistory: [{ week: 12, opponent: 'FC Pisano', goals: 0, assists: 0, rating: 6, won: false }], arcSeen: { 'rivw1_w12_S4': true } }));
  const loss = await hasTxt(pg, 'Round al rivale');
  console.log('(3) sconfitta → round al rivale:', loss);
  if (!loss) issues.push('verdetto «Round al rivale» assente su sconfitta senza gol');
  await pg.close();
}
// (4) senza rivale → nessun capitolo
{
  const pg = await boot(mkSave({ rival: null }));
  const any = await hasTxt(pg, 'Gli eterni rivali');
  console.log('(4) senza rivale:', any);
  if (any) issues.push('capitolo rivali mostrato SENZA rivale');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ETERNI RIVALI OK (pre · duello tuo · round al rivale · senza rivale)');
process.exit(issues.length ? 1 : 0);
