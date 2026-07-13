#!/usr/bin/env node
/* [7.25.0] TEST — GERARCHIA DEI TROFEI (collaudo PO «una Champions è molto più prestigiosa di un campionato»):
   (1) euro.champion → banner premium «CAMPIONI D'EUROPA!» in cima al fine stagione; (2) trionfo NAZIONALE
   (worldMemory euro_mondiale won) → banner «CAMPIONI DEL MONDO!»; (3) stagione senza trionfi → nessun banner. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (patch) => ({ phase: 'career', player: { name: 'Enf Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 39, weekLived: true, age: 25, ovr: 85, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3,
  goals: 22, assists: 6, matches: 30,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 85, tecnica: 84, fisico: 83, 'mentalità': 85, tiro: 87, passaggio: 84, dribbling: 86, posizionamento: 85 },
  form: 76, fatigue: 10, morale: 74, contract: { duration: 3, wage: 15000, expiresAtSeason: 6 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1000);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(900);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await page.evaluate(() => window.__CPM_CAREER.step()); // W39 → seasonAwards
  await sleep(1500);
  try { await page.getByText('Salta il gala', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await sleep(700);
  // dalla schermata premi → Continua verso il SeasonEndScreen
  await page.evaluate(() => { const el = [...document.querySelectorAll('button')].find(b => /Continua|Avanti|→/.test(b.textContent || '') && b.offsetParent !== null && !/gala/i.test(b.textContent || '')); if (el) el.click(); });
  await sleep(1300);
  return page;
};
const hasTxt = (page, rx) => page.evaluate((x) => new RegExp(x, 'i').test(document.body.innerText), rx);

// (1) trionfo europeo di club (UCL)
{
  const pg = await boot(mkSave({ euro: { active: true, competition: 'UCL', phase: 'champion', pts: 16, groupResults: [{ opp: 'X', won: true, drew: false, hs: 2, as: 0 }], qualified: true, champion: true, eliminated: false, koResults: [{ phase: 'final', opp: 'FC Paris', won: true, homeScore: 2, awayScore: 0 }], koRound: 4, groupOpponents: [] }, trophies: [{ season: 3, club: 'FC Salernum', league: 'UCL', type: 'euro' }] }));
  const b = await hasTxt(pg, "CAMPIONI D'EUROPA!") && await hasTxt(pg, 'nessun campionato vale una notte così');
  console.log('(1) banner UCL:', b);
  if (!b) issues.push('banner premium UCL assente col trionfo europeo');
  await pg.close();
}
// (2) trionfo Mondiale in Nazionale
{
  const pg = await boot(mkSave({ worldMemory: [{ type: 'euro_mondiale', season: 3, type_em: 'Mondiale', won: true }] }));
  const b = await hasTxt(pg, 'CAMPIONI DEL MONDO!');
  console.log('(2) banner Mondiale:', b);
  if (!b) issues.push('banner premium Mondiale assente col trionfo in Nazionale');
  await pg.close();
}
// (3) stagione normale → nessun banner premium
{
  const pg = await boot(mkSave({}));
  const b = await hasTxt(pg, "CAMPIONI D'EUROPA!|CAMPIONI DEL MONDO!|L'EUROPA È VOSTRA!");
  console.log('(3) senza trionfi:', b);
  if (b) issues.push('banner premium mostrato SENZA trionfi');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ENFASI TROFEI OK (banner UCL · banner Mondiale · assente senza trionfi)');
process.exit(issues.length ? 1 : 0);
