#!/usr/bin/env node
/* [7.22.0] TEST — LA SETTIMANA DELLA FINALE + IL GOL 100: (1) finale di Coppa in settimana (non giocata) →
   «La vigilia della finale»; (2) giocata + cup.champion → «Il giorno che non dimenticherai»; (3) giocata +
   eliminato → «Il dolore delle finali»; (4) finale EUROPEA (euroPhase final) → vigilia; (5) totalGoals 101 →
   «Il gol numero 100» (e non a 120). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const cupFinal = (played, won) => [{ matchday: 994, week: 35, opponentId: 'pis', opponentName: 'FC Pisano', isHome: false, played, result: played ? { homeScore: won ? 2 : 0, awayScore: won ? 0 : 1, won, drew: false } : null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 4, cupRoundName: 'FINALE' }];
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Fin Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 35, weekLived: false, age: 24, ovr: 81, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, totalGoals: 60,
  cup: { active: true, round: 4, eliminated: false, champion: false, results: [] },
  calendar: cupFinal(false, false),
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 81, tecnica: 80, fisico: 79, 'mentalità': 81, tiro: 83, passaggio: 80, dribbling: 82, posizionamento: 81 },
  form: 74, fatigue: 10, morale: 70, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 }, ...patch } });

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

// (1) vigilia finale di Coppa
{
  const pg = await boot(mkSave({}));
  const pre = await hasTxt(pg, 'La vigilia della finale') && await hasTxt(pg, 'Coppa Nazionale');
  console.log('(1) vigilia coppa:', pre);
  if (!pre) issues.push('vigilia della finale di Coppa assente');
  await pg.close();
}
// (2) vinta (cup.champion)
{
  const pg = await boot(mkSave({ calendar: cupFinal(true, true), cup: { active: true, round: 5, eliminated: false, champion: true, winnerId: 'sal', results: [{ round: 4, name: 'FINALE', opponent: 'FC Pisano', homeScore: 2, awayScore: 0, won: true }] }, arcSeen: { 'fin1_w35_S4': true } }));
  const won = await hasTxt(pg, 'Il giorno che non dimenticherai');
  console.log('(2) trionfo:', won);
  if (!won) issues.push('capitolo trionfo assente con cup.champion');
  await pg.close();
}
// (3) persa
{
  const pg = await boot(mkSave({ calendar: cupFinal(true, false), cup: { active: true, round: 5, eliminated: true, champion: false, results: [] }, arcSeen: { 'fin1_w35_S4': true } }));
  const lost = await hasTxt(pg, 'Il dolore delle finali');
  console.log('(3) dolore:', lost);
  if (!lost) issues.push('capitolo dolore assente su finale persa');
  await pg.close();
}
// (4) finale EUROPEA
{
  const pg = await boot(mkSave({ cup: null, calendar: [{ matchday: 998, week: 35, opponentId: 'bav', opponentName: 'FC Bavaria', isHome: false, played: false, result: null, type: 'euro', competition: 'UEL', euroPhase: 'final', cupRoundName: 'Finale' }], euro: { active: true, competition: 'UEL', phase: 'final', pts: 12, groupResults: [], qualified: true, champion: false, eliminated: false, koResults: [], koRound: 2, groupOpponents: [] } }));
  const pre = await hasTxt(pg, 'La vigilia della finale') && await hasTxt(pg, 'campo neutro');
  console.log('(4) vigilia europea:', pre);
  if (!pre) issues.push('vigilia della finale europea assente');
  await pg.close();
}
// (5) gol numero 100 (a 101 sì, a 120 no)
{
  const pg = await boot(mkSave({ calendar: [], cup: null, totalGoals: 101 }));
  const c100 = await hasTxt(pg, 'Il gol numero 100');
  const pg2 = await boot(mkSave({ calendar: [], cup: null, totalGoals: 120 }));
  const c120 = await hasTxt(pg2, 'Il gol numero');
  console.log('(5) gol 100 a 101:', c100, '· a 120:', c120);
  if (!c100) issues.push('capitolo gol 100 assente a totalGoals 101');
  if (c120) issues.push('capitolo gol 100/200 mostrato fuori finestra (120)');
  await pg.close(); await pg2.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ FINALE+GOL100 OK (vigilia coppa · trionfo · dolore · vigilia europea · finestra gol100)');
process.exit(issues.length ? 1 : 0);
