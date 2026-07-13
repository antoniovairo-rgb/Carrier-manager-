#!/usr/bin/env node
/* [7.28.0] TEST — ONDA 3 (WEEKLY_LIFE_DESIGN §S7/§S6/§S12): (1) ESONERO derivato (5 sconfitte nelle ultime 7
   di lega + zona pericolo) → nuovo mister, fiducia 48, esame 4 gare, ledger; (2) esame SUPERATO (media ≥6.6
   nelle 4 gare) → fiducia +10; (3) PROGETTO CLUB: transizione a «ciclo vincente» annunciata + stato nel Tab
   Club; (4) stato CRISI da fondo classifica; (5) LISTA DEL CT nel tab Nazionale (4 nomi, tu incluso, rank
   coerente: bomber → vertice, riserva → «il mio 9 gioca ogni settimana»); (6) determinismo NPC su reload. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const lgGame = (week, goals, rating, won, drew, extra) => ({ week, opponent: 'Club ' + week, goals, assists: 0, rating, won, drew: !!drew, ...(extra || {}) });
const badRun = [lgGame(5, 0, 6.0, false), lgGame(6, 0, 5.9, false), lgGame(7, 1, 6.4, true), lgGame(8, 0, 5.8, false), lgGame(9, 0, 6.1, false), lgGame(10, 0, 6.0, false), lgGame(11, 0, 5.9, false)];
const mkStand = (myPts) => Array.from({ length: 18 }, (_, i) => ({ id: i === 17 ? 'sal' : 'c' + i, n: i === 17 ? 'FC Salernum' : 'Club ' + i, played: 12, pts: i === 17 ? myPts : 30 - i, gf: 20 - i, ga: 10 + i, gd: 10 - 2 * i, wins: 5, draws: 2, losses: 5 }));
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Onda3 Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: false, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, matches: 11, goals: 2, assists: 1, totalGoals: 40, totalMatches: 80, nationalCaps: 8, coachPactSeason: 4, bondEv: { s: 4, w: 11 },
  calendar: [{ matchday: 13, week: 13, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  coach: { name: 'Mister Coralli', style: 'Bilanciato', trustMod: 0 },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 66, fatigue: 10, morale: 60, coachTrust: 62, teamChemistry: 60, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1300 } });
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
const goNaz = async (page) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Carriera/.test(x.textContent || '') && x.offsetParent !== null); if (b) b.click(); }); await sleep(700); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Nazionale/.test(x.textContent || '') && x.offsetParent !== null); if (b) b.click(); }); await sleep(800); };

// (1) ESONERO — 5 sconfitte/7 + penultimo posto
{
  const pg = await boot(mkSave({ matchHistory: badRun, standings: mkStand(6) }));
  const card = await hasTxt(pg, 'Esonero|ESONERO');
  if (!card) issues.push('card esonero assente (5L/7 + zona pericolo)');
  try { await pg.getByText('nuovo corso', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone esonero non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.coach && p.coach.name !== 'Mister Coralli' && p.coachTrust === 48 && p.newCoachExam && p.newCoachExam.season === 4 && p.coachSackSeason === 4 && (p.ledger || []).some(l => l.t === 'esonero');
  console.log('(1) esonero:', card, '· effetti:', ok, '· nuovo mister:', p.coach && p.coach.name);
  if (!ok) issues.push('effetti esonero errati: ' + JSON.stringify({ coach: p.coach, trust: p.coachTrust, exam: p.newCoachExam, sack: p.coachSackSeason }));
  await pg.close();
}
// (2) ESAME SUPERATO — 4 gare dopo l'esonero con media 7.0
{
  const pg = await boot(mkSave({ week: 17, coachSackSeason: 4, newCoachExam: { season: 4, fromWeek: 12, games: 4 }, matchHistory: [...badRun, lgGame(13, 1, 7.2, true), lgGame(14, 0, 6.8, false, true), lgGame(15, 1, 7.0, true), lgGame(16, 1, 7.1, true)] }));
  const card = await hasTxt(pg, 'esame superato|riconquistato');
  if (!card) issues.push('verdetto esame superato assente (media 7.0 su 4)');
  const t0 = (await getP(pg)).coachTrust;
  try { await pg.getByText('Il posto è mio', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone esame non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = !p.newCoachExam && p.coachTrust === Math.min(100, t0 + 10);
  console.log('(2) esame pass:', card, '· effetti:', ok, `(trust ${t0}→${p.coachTrust})`);
  if (!ok) issues.push('effetti esame pass errati');
  await pg.close();
}
// (3) PROGETTO CLUB — ciclo vincente annunciato + stato nel Tab Club
{
  const pg = await boot(mkSave({ clubEvo: { fanbase: 2, stadiumTier: 0, budget: 30, seasonsTop: 2, seasonsLow: 0, clubId: 'sal' }, standings: mkStand(34), matchHistory: [lgGame(10, 1, 7.0, true), lgGame(11, 2, 7.4, true)] }));
  const ann = await hasTxt(pg, 'ciclo vincente');
  if (!ann) issues.push('annuncio progetto «ciclo vincente» assente');
  try { await pg.getByText('Si vede in campo', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1000);
  const p = await getP(pg);
  const seen = p.clubProjSeen && p.clubProjSeen.k === 'vincente';
  await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Club/.test(x.textContent || '') && x.offsetParent !== null); if (b) b.click(); });
  await sleep(900);
  const inClub = await hasTxt(pg, 'Progetto');
  console.log('(3) annuncio vincente:', ann, '· persistito:', seen, '· nel Club tab:', inClub);
  if (!seen) issues.push('clubProjSeen non persistito');
  if (!inClub) issues.push('stato progetto assente nel Tab Club');
  await pg.close();
}
// (4) CRISI — fondo classifica a W12 (stesso save esonero ma senza le 7 gare → niente sack, solo stato)
{
  const pg = await boot(mkSave({ standings: mkStand(4), matchHistory: [lgGame(10, 0, 6.0, false), lgGame(11, 0, 6.1, false)], clubEvo: { fanbase: 0, stadiumTier: 0, budget: 5, seasonsTop: 0, seasonsLow: 2, clubId: 'sal' } }));
  const crisi = await hasTxt(pg, 'crisi');
  console.log('(4) stato crisi:', crisi);
  if (!crisi) issues.push('stato CRISI assente (fondo classifica + seasonsLow 2)');
  await pg.close();
}
// (5) LISTA DEL CT — bomber → vertice · riserva → frase squadRole
{
  const pg = await boot(mkSave({ ovr: 88, goals: 18, matches: 12, nationalCaps: 30, coachTrust: 85, matchHistory: Array.from({ length: 10 }, (_, i) => lgGame(i + 2, 2, 7.6, true)) }));
  await goNaz(pg);
  const card = await hasTxt(pg, 'La lista del CT') && await hasTxt(pg, 'Onda3 Probe');
  const top = await pg.evaluate(() => { const m = document.body.innerText.match(/la maglia numero 9 è tua|primo nome dietro/i); return !!m; });
  console.log('(5a) lista CT bomber:', card, '· rank alto:', top);
  if (!card) issues.push('card lista del CT assente nel tab Nazionale');
  if (!top) issues.push('bomber (88 OVR, 18 gol, 30 caps) non in vetta alla lista CT');
  await pg.close();
  const pg2 = await boot(mkSave({ ovr: 72, goals: 1, matches: 10, nationalCaps: 0, coachTrust: 45, form: 50, matchHistory: [lgGame(10, 0, 6.0, false), lgGame(11, 0, 6.2, false)] }));
  await goNaz(pg2);
  const low = await hasTxt(pg2, 'gioca ogni settimana|serve il campo|servono numeri');
  console.log('(5b) riserva → motivazione CT:', low);
  if (!low) issues.push('motivazione dell\'esclusione assente per profilo basso');
  await pg2.close();
}
// (6) DETERMINISMO — stessi 3 NPC su reload
{
  const pg = await boot(mkSave({}));
  await goNaz(pg);
  const n1 = await pg.evaluate(() => { const rows = document.body.innerText.match(/La lista del CT[\s\S]{0,600}/); return rows ? rows[0] : ''; });
  await pg.reload(); await sleep(1800);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(1000);
  await goNaz(pg);
  const n2 = await pg.evaluate(() => { const rows = document.body.innerText.match(/La lista del CT[\s\S]{0,600}/); return rows ? rows[0] : ''; });
  const same = n1 && n1 === n2;
  console.log('(6) determinismo lista:', same);
  if (!same) issues.push('lista CT non deterministica su reload');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ONDA 3 OK (esonero+esame · progetto vincente/crisi · lista CT rank+motivo · determinismo)');
process.exit(issues.length ? 1 : 0);
