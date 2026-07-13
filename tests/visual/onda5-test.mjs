#!/usr/bin/env node
/* [7.30.0] TEST — ONDA 5 (WEEKLY_LIFE_DESIGN §S17/§S8/§S11/§S15-16): (1) IRRIPETIBILE autobiografia dopo il
   2° Trofeo d'Oro (capitolo scomodo → ledger torto + cassa); (2) documentario a fama 90+; (3) l'erede a 34+
   (mentore → chimica+gratitudine); (4) il ritorno del CT (fuori dal giro 2+ stagioni, 12+ gol); (5) MAI due
   irripetibili nella stessa stagione; (6) PANCHINA-ARCO: riconquista in 3 gare (avvio+verdetto vinto);
   (7) CURVA: idolo da fanLegend/gol col club + contestazione a 7 gare senza gol; (8) allenamento-evento:
   il fisioterapista ti ferma a fatica alta. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const pauseCal = (wk) => [{ matchday: 30, week: wk + 1, opponentId: 'nap', opponentName: 'SSC Partenope', isHome: true, played: false, result: null }];
const lgGame = (week, goals, rating, won, extra) => ({ week, opponent: 'Club ' + week, goals, assists: 0, rating, won, drew: false, ...(extra || {}) });
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Onda5 Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: false, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, matches: 8, goals: 5, assists: 2, totalGoals: 60, totalMatches: 120, popularity: 55, bankBalance: 50000, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 },
  calendar: pauseCal(12),
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  coach: { name: 'Mister Coralli', style: 'Bilanciato', trustMod: 0 },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 78, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, coachTrust: 66, teamChemistry: 60, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1400 } });
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
const getP = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
const clickBtn = async (page, rx, label) => { const ok = await page.evaluate((x) => { const b = [...document.querySelectorAll('button')].find(el => new RegExp(x, 'i').test(el.textContent || '') && el.offsetParent !== null); if (b) { b.click(); return true; } return false; }, rx); if (!ok) issues.push('bottone non trovato: ' + label); };

// (1) AUTOBIOGRAFIA — 2 Trofei d'Oro, settimana di crociera
{
  const pg = await boot(mkSave({ playerAwards: { palloneOros: [2, 3], scarpaOros: [], youngYears: [], seasonRecords: [] } }));
  const ev = await hasTxt(pg, 'autobiografia');
  if (!ev) issues.push('irripetibile autobiografia assente (2 Trofei d\'Oro)');
  const b0 = (await getP(pg)).bankBalance;
  await clickBtn(pg, 'Racconto tutto', 'autobio racconto');
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.onceSeen && p.onceSeen.autobio && p.onceSeenSeason === 4 && (p.bankBalance || 0) > b0 && (p.ledger || []).some(l => l.t === 'torto');
  console.log('(1) autobio:', ev, '· effetti:', ok, `(bank ${b0}→${p.bankBalance})`);
  if (!ok) issues.push('effetti autobiografia errati');
  await pg.close();
}
// (2) DOCUMENTARIO — pop 92, stagione 6
{
  const pg = await boot(mkSave({ popularity: 92, season: 6, jerseyNumSeason: 6, presidentModalSeason: 6, seasonPledge: { season: 6, tone: 'equilibrato' }, drawSeen: 6, coachPactSeason: 6, bondEv: { s: 6, w: 11 }, sponsorDecl: { tier: 'globale', season: 6 }, sponsors: [{ tier: 'locale', brand: 'X', weekly: 400, season: 5 }, { tier: 'tecnico', brand: 'Y', weekly: 1200, season: 5 }, { tier: 'nazionale', brand: 'Z', weekly: 3000, season: 5 }] }));
  const ev = await hasTxt(pg, 'documentario');
  if (!ev) issues.push('irripetibile documentario assente (pop 92)');
  await clickBtn(pg, 'Si gira', 'docu si gira');
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.onceSeen && p.onceSeen.docu;
  console.log('(2) documentario:', ev, '· registrato:', ok);
  if (!ok) issues.push('onceSeen.docu non registrato');
  await pg.close();
}
// (3) L'EREDE — 35 anni, mentore
{
  const pg = await boot(mkSave({ age: 35 }));
  const ev = await hasTxt(pg, 'erede') && await hasTxt(pg, 'il nuovo te');
  if (!ev) issues.push('irripetibile erede assente (35 anni)');
  const c0 = (await getP(pg)).teamChemistry;
  await clickBtn(pg, 'Da mentore', 'erede mentore');
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.onceSeen && p.onceSeen.erede && p.teamChemistry === Math.min(100, c0 + 6) && (p.ledger || []).some(l => l.t === 'gratitudine');
  console.log('(3) erede:', ev, '· mentore:', ok);
  if (!ok) issues.push('effetti erede errati');
  await pg.close();
}
// (4) IL RITORNO DEL CT — caps 10, fuori dal giro da S1, 13 gol di lega
{
  const pg = await boot(mkSave({ season: 5, jerseyNumSeason: 5, presidentModalSeason: 5, seasonPledge: { season: 5, tone: 'equilibrato' }, drawSeen: 5, coachPactSeason: 5, bondEv: { s: 5, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 5 }, nationalCaps: 10, natHistory: [{ season: 1, week: 10, comp: 'Amichevole', opp: 'Francia', hs: 1, as: 0, won: true, goals: 1, assists: 0, rating: 7 }], goals: 13, matches: 11, matchHistory: Array.from({ length: 7 }, (_, i) => lgGame(i + 4, 2, 7.4, true)) }));
  const ev = await hasTxt(pg, 'La telefonata che aspettavi');
  if (!ev) issues.push('irripetibile ritorno del CT assente');
  await clickBtn(pg, 'Dovevate chiamarmi prima', 'ct torto');
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.onceSeen && p.onceSeen.ctcall && (p.ledger || []).some(l => l.t === 'torto' && /Federazione/.test(l.who || ''));
  console.log('(4) ritorno CT:', ev, '· torto nel ledger:', ok);
  if (!ok) issues.push('effetti ritorno CT errati');
  await pg.close();
}
// (5) MAI DUE IRRIPETIBILI NELLA STESSA STAGIONE — autobio+erede entrambe mature: dopo la 1ª, la 2ª tace
{
  const pg = await boot(mkSave({ age: 35, playerAwards: { palloneOros: [2, 3], scarpaOros: [], youngYears: [], seasonRecords: [] } }));
  const first = await hasTxt(pg, 'autobiografia');
  await clickBtn(pg, 'Proteggo lo spogliatoio', 'autobio protetto');
  await sleep(1200);
  const second = await hasTxt(pg, 'il nuovo te');
  console.log('(5) primo (autobio):', first, '· secondo nella stessa stagione:', second);
  if (!first) issues.push('primo irripetibile assente nello scenario doppio');
  if (second) issues.push('DUE irripetibili nella stessa stagione (erede dopo autobio)');
  await pg.close();
}
// (6) PANCHINA-ARCO — riserva (trust 45) → avvio; poi verdetto VINTO (3 gare a 7.0)
{
  const pg = await boot(mkSave({ coachTrust: 45, form: 55 }));
  const ev = await hasTxt(pg, 'La riconquista');
  if (!ev) issues.push('arco riconquista assente (riserva, trust 45)');
  await clickBtn(pg, 'Fatti trovare pronto', 'riconquista avvio');
  await sleep(1200);
  const p1 = await getP(pg);
  const okA = p1.benchArc && p1.benchArc.season === 4 && p1.benchArc.games === 3;
  console.log('(6a) avvio arco:', ev, '· registrato:', okA);
  if (!okA) issues.push('benchArc non registrato');
  await pg.close();
  const pg2 = await boot(mkSave({ coachTrust: 45, form: 55, week: 16, benchArc: { season: 4, fromWeek: 12, games: 3 }, benchArcSeason: 4, matchHistory: [lgGame(13, 1, 7.0, true), lgGame(14, 0, 6.9, false), lgGame(15, 1, 7.2, true)] }));
  const verd = await hasTxt(pg2, 'posto riconquistato|Il campo ha parlato');
  if (!verd) issues.push('verdetto riconquista assente');
  const t0 = (await getP(pg2)).coachTrust;
  await clickBtn(pg2, 'Ora si gioca', 'riconquista verdetto');
  await sleep(1200);
  const p2 = await getP(pg2);
  const okB = !p2.benchArc && p2.coachTrust === Math.min(100, t0 + 9);
  console.log('(6b) verdetto vinto:', verd, '· effetti:', okB, `(trust ${t0}→${p2.coachTrust})`);
  if (!okB) issues.push('effetti riconquista errati');
  await pg2.close();
}
// (7) CURVA — idolo (fanLegend 6 stagioni + 70 gol col club) + CONTESTAZIONE (7 gare senza gol)
{
  const pg = await boot(mkSave({ fanLegend: [{ clubId: 'sal', seasons: 6 }], history: Array.from({ length: 6 }, (_, i) => ({ season: i + 1, club: 'FC Salernum', clubId: 'sal', goals: 12, assists: 3, matches: 30 })), matchHistory: Array.from({ length: 7 }, (_, i) => lgGame(i + 4, 0, 6.0, false)), matches: 8 }));
  await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Club/.test(x.textContent || '') && x.offsetParent !== null); if (b) b.click(); });
  await sleep(900);
  const idolo = await hasTxt(pg, "idolo della Sud");
  const contest = await hasTxt(pg, 'la Sud non canta');
  console.log('(7) idolo:', idolo, '· contestazione:', contest);
  if (!idolo) issues.push('stato curva «idolo» assente (6 stagioni + 70+ gol)');
  if (!contest) issues.push('contestazione assente (7 gare senza gol)');
  await pg.close();
}
// (8) ALLENAMENTO-EVENTO — fisioterapista a fatica 85
{
  const pg = await boot(mkSave({ fatigue: 85 }));
  const ev = await hasTxt(pg, 'fisioterapista');
  if (!ev) issues.push('evento fisioterapista assente (fatica 85)');
  await clickBtn(pg, 'Ascolto: recupero', 'fisio ascolto');
  await sleep(1200);
  const p = await getP(pg);
  const ok = (p.fatigue || 0) <= 71 && p.trainEv && p.trainEv.s === 4;
  console.log('(8) fisio:', ev, '· recupero:', ok, `(fatica → ${p.fatigue})`);
  if (!ok) issues.push('effetti fisioterapista errati');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ONDA 5 OK (irripetibili ×4 + cap stagionale · panchina-arco · curva idolo/contestazione · fisioterapista)');
process.exit(issues.length ? 1 : 0);
