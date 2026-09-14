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

const storyBody = (page) => page.evaluate(() => { const el=[...document.querySelectorAll('*')].find(e=>/LA TUA STORIA/i.test(e.textContent||'')&&e.textContent.length<800); return el?el.textContent:document.body.innerText; });
// (1) pre-partita — [7.156.0] titolo SEEDATO → si verifica l'arco tramite emoji 🆚 + nome rivale (non il titolo letterale)
{
  const pg = await boot(mkSave({}));
  const pre = await hasTxt(pg, '🆚') && await hasTxt(pg, 'Dario Ferrero');
  console.log('(1) pre-partita:', pre);
  if (!pre) issues.push('capitolo pre-partita rivali assente (🆚 + nome)');
  await pg.close();
}
// (1b) VARIETÀ — [7.156.0] settimane diverse → testo pre-partita DIVERSO (non più statico/ripetitivo)
{
  const b12 = await boot(mkSave({ week: 12, calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: false, result: null }] })).then(async pg => { const t = await storyBody(pg); await pg.close(); return t; });
  const b20 = await boot(mkSave({ week: 20, calendar: [{ matchday: 19, week: 20, opponentId: 'pis', opponentName: 'FC Pisano', isHome: false, played: false, result: null }] })).then(async pg => { const t = await storyBody(pg); await pg.close(); return t; });
  const varied = b12 && b20 && b12 !== b20;
  console.log('(1b) varietà W12≠W20:', varied);
  if (!varied) issues.push('capitolo rivali IDENTICO tra settimane diverse (ripetitivo)');
}
// (2) giocato con gol → verdetto positivo (emoji 🏆)
{
  const pg = await boot(mkSave({ calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: true, result: { homeScore: 2, awayScore: 0, won: true, drew: false } }], matchHistory: [{ week: 12, opponent: 'FC Pisano', goals: 2, assists: 0, rating: 8, won: true }], arcSeen: { 'rivw1_w12_S4': true } }));
  const win = await hasTxt(pg, '🏆') && await hasTxt(pg, 'Dario Ferrero');
  console.log('(2) gol → verdetto positivo:', win);
  if (!win) issues.push('verdetto positivo (🏆) assente con 2 gol vs rivale');
  await pg.close();
}
// (3) perso senza gol → verdetto negativo (emoji 😤)
{
  const pg = await boot(mkSave({ calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: true, result: { homeScore: 0, awayScore: 1, won: false, drew: false } }], matchHistory: [{ week: 12, opponent: 'FC Pisano', goals: 0, assists: 0, rating: 6, won: false }], arcSeen: { 'rivw1_w12_S4': true } }));
  const loss = await hasTxt(pg, '😤') && await hasTxt(pg, 'Dario Ferrero');
  console.log('(3) sconfitta → verdetto negativo:', loss);
  if (!loss) issues.push('verdetto negativo (😤) assente su sconfitta senza gol vs rivale');
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
