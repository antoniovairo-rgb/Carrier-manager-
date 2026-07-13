#!/usr/bin/env node
/* [7.26.0] TEST — ONDA 1 (WEEKLY_LIFE_DESIGN §S1/§S2/§S13): (1) weekTheme FINALE dalla voce di calendario;
   (2) weekTheme DERBY reale (milan-inter) + Meteo Interiore «Fermo ai box» da injured; (3) settimana vuota →
   «Settimana di lavoro» + «In stato di grazia» da striscia reale; (4) W20 vuota pro → «Settimana di mercato»
   + «In apnea» da 3 gare senza gol; (5) ledger: «blinda» della saga scrive {t:"promessa"}; (6) capitolo
   «Le parole di agosto» a W34 con promessa ambiziosa indietro sugli obiettivi. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (patch) => ({ phase: 'career', player: { name: 'Onda Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 10, weekLived: false, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, matches: 20, goals: 5, assists: 2, totalGoals: 60, totalMatches: 90, nationalCaps: 0,
  calendar: [],
  club: { id: 'milan', n: 'AC Milano', a: 'MIL', p: 82, c: '#dc2626', c2: '#111827', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1200 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1100);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1300);
  return page;
};
const hasTxt = (page, rx) => page.evaluate((x) => new RegExp(x, 'i').test(document.body.innerText), rx);

// (1) tema FINALE — voce di Coppa round 4 in settimana
{
  const pg = await boot(mkSave({ week: 35, cup: { active: true, round: 4, eliminated: false, champion: false, results: [] }, calendar: [{ matchday: 994, week: 35, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: false, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 4, cupRoundName: 'FINALE' }] }));
  const ok = await hasTxt(pg, 'La tua settimana') && await hasTxt(pg, 'La settimana della FINALE');
  console.log('(1) tema finale:', ok);
  if (!ok) issues.push('tema FINALE assente con finale di Coppa in calendario');
  await pg.close();
}
// (2) tema DERBY reale + meteo «Fermo ai box» (injured)
{
  const pg = await boot(mkSave({ injured: true, injuryWeeks: 2, injuryType: 'contusione', injurySeverity: 'lieve', calendar: [{ matchday: 10, week: 10, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null }] }));
  const drb = await hasTxt(pg, 'Derby di Milano');
  const iw = await hasTxt(pg, 'Meteo interiore') && await hasTxt(pg, 'Fermo ai box');
  console.log('(2) derby:', drb, '· meteo stop:', iw);
  if (!drb) issues.push('tema DERBY assente su milan-inter in calendario');
  if (!iw) issues.push('meteo «Fermo ai box» assente da injured');
  await pg.close();
}
// (3) settimana di PAUSA (calendario reale, nessuna gara in W corrente) → «Settimana di lavoro» + «In stato di grazia»
//     ⚠️ calendario NON vuoto: la migration rigenererebbe il calendario (INV-CALHEAL) mettendo una gara in settimana.
const pauseCal = (wk) => [{ matchday: 12, week: wk + 1, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null }];
{
  const pg = await boot(mkSave({ calendar: pauseCal(10), matchHistory: [{ opponent: 'A', goals: 2, assists: 0, rating: 8.2, won: true }, { opponent: 'B', goals: 2, assists: 1, rating: 8.0, won: true }, { opponent: 'C', goals: 1, assists: 0, rating: 7.8, won: true }] }));
  const th = await hasTxt(pg, 'Settimana di lavoro');
  const iw = await hasTxt(pg, 'In stato di grazia');
  console.log('(3) sosta:', th, '· flow:', iw);
  if (!th) issues.push('tema SOSTA assente a calendario vuoto (fuori finestra mercato)');
  if (!iw) issues.push('meteo «In stato di grazia» assente con striscia reale');
  await pg.close();
}
// (4) W20 vuota (finestra invernale, pro) → «Settimana di mercato» + «In apnea» (3 gare senza gol)
{
  const pg = await boot(mkSave({ week: 20, calendar: pauseCal(20), matchHistory: [{ opponent: 'A', goals: 0, assists: 0, rating: 6.0, won: false }, { opponent: 'B', goals: 0, assists: 0, rating: 6.1, won: false }, { opponent: 'C', goals: 0, assists: 0, rating: 6.0, drew: true }] }));
  const th = await hasTxt(pg, 'Settimana di mercato');
  const iw = await hasTxt(pg, 'In apnea');
  console.log('(4) mercato:', th, '· apnea:', iw);
  if (!th) issues.push('tema MERCATO assente a W20 con calendario vuoto');
  if (!iw) issues.push('meteo «In apnea» assente con 3 gare senza gol');
  await pg.close();
}
// (5) LEDGER — la scelta «blinda» della saga scrive la promessa {t:"promessa"} in p.ledger
{
  const pg = await boot(mkSave({ week: 6, transferSaga: { offer: { wage: 15000 }, week: 5, season: 4, club: 'FC Bavaria' } }));
  const ep2 = await hasTxt(pg, 'Saga di mercato');
  if (!ep2) issues.push('card saga episodio 2 assente (setup probe)');
  try { await pg.getByText('Sono concentrato solo sul mio club', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone «blinda» non cliccabile'); }
  await sleep(1200);
  const led = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); return (s.player.ledger || []); });
  const ok = led.length === 1 && led[0].t === 'promessa' && led[0].season === 4 && led[0].week === 6 && !!led[0].what;
  console.log('(5) ledger dopo blinda:', JSON.stringify(led));
  if (!ok) issues.push('ledger non scritto dalla scelta «blinda»: ' + JSON.stringify(led));
  await pg.close();
}
// (6) «Le parole di agosto» — W34, promessa ambiziosa, obiettivi indietro (0/3)
{
  const pg = await boot(mkSave({ week: 34, seasonPledge: { season: 4, tone: 'ambizioso' }, seasonObjectives: [{ type: 'goals', target: 30 }, { type: 'assists', target: 15 }, { type: 'matches', target: 40 }], matchHistory: [{ opponent: 'A', goals: 1, rating: 6.8, won: true }, { opponent: 'B', goals: 1, rating: 6.9, won: true }, { opponent: 'C', goals: 1, rating: 6.7, won: false }] }));
  const ok = await hasTxt(pg, 'Le parole di agosto');
  // controprova: promessa EQUILIBRATA → capitolo assente
  const pg2 = await boot(mkSave({ week: 34, seasonObjectives: [{ type: 'goals', target: 30 }, { type: 'assists', target: 15 }, { type: 'matches', target: 40 }], matchHistory: [{ opponent: 'A', goals: 1, rating: 6.8, won: true }, { opponent: 'B', goals: 1, rating: 6.9, won: true }, { opponent: 'C', goals: 1, rating: 6.7, won: false }] }));
  const no = await hasTxt(pg2, 'Le parole di agosto');
  console.log('(6) parole di agosto (ambizioso):', ok, '· (equilibrato):', no);
  if (!ok) issues.push('capitolo «Le parole di agosto» assente (ambizioso, 0/3 a W34)');
  if (no) issues.push('capitolo mostrato con promessa NON ambiziosa');
  await pg.close(); await pg2.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ONDA 1 OK (tema finale/derby/sosta/mercato · meteo stop/flow/apnea · ledger blinda · parole di agosto)');
process.exit(issues.length ? 1 : 0);
