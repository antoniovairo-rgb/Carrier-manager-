#!/usr/bin/env node
/* [7.27.0] TEST — ONDA 2 (WEEKLY_LIFE_DESIGN §S4/§S3/§S9): (1) offerta PATTO dopo gara di lega dal vivo con
   voto ≥7.2 → accetta → coachPact attivo + ledger {t:"patto"}; (2) patto attivo con target raggiunto →
   verdetto MANTENUTO → fiducia +8 e status kept; (3) patto scaduto senza gol → verdetto FALLITO; (4) episodio
   spogliatoio da 2+ assist reali → bond del compagno +4; stato leggibile nel Tab Club; (5) riga ASPETTATIVE:
   sotto le attese → firma CRITICO; sopra → firma FAN; (6) niente offerta patto dopo gara SIMULATA. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const lgGame = (week, goals, rating, extra) => ({ week, opponent: 'Club ' + week, goals, assists: 0, rating, won: goals > 0, drew: false, ...(extra || {}) });
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Onda2 Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: false, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, matches: 8, goals: 6, assists: 2, totalGoals: 40, totalMatches: 80,
  calendar: [{ matchday: 13, week: 13, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null }],
  teammates: [{ name: 'Rino Marchesi', archetype: 'capitano', icon: '💪', bond: 40 }, { name: 'Ciro Valenti', archetype: 'mentore', icon: '🧠', bond: 40 }, { name: 'Nino Serra', archetype: 'giovane', icon: '⚡', bond: 40 }],
  journalists: [{ id: 'j_ferretti', name: 'Marco Ferretti', paper: 'Sprint Sportivo', icon: '📰', color: '#ef4444', type: 'critico', trust: 50 }, { id: 'j_esposito', name: 'Sofia Esposito', paper: 'Diretta TV', icon: '📺', color: '#3b82f6', type: 'fan', trust: 50 }, { id: 'j_neri', name: 'Giovanni Neri', paper: 'Cronaca di Sport', icon: '🔍', color: '#7c3aed', type: 'investigativa', trust: 50 }],
  history: [{ season: 3, club: 'FC Salernum', clubId: 'sal', goals: 14, assists: 4, matches: 30 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  coach: { name: 'Mister Coralli', style: 'Bilanciato', trustMod: 0 },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, coachTrust: 66, teamChemistry: 62, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

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

// (1) OFFERTA patto (ultima di lega dal vivo, voto 7.8) → accetta → pact attivo + ledger
{
  const pg = await boot(mkSave({ matchHistory: [lgGame(9, 1, 6.8), lgGame(10, 0, 6.4), lgGame(11, 2, 7.8)] }));
  const off = await hasTxt(pg, 'Il patto col mister') && await hasTxt(pg, 'il rigorista sei tu');
  if (!off) issues.push('offerta patto assente con ultima di lega live ≥7.2');
  try { await pg.getByText('«Ci sto»', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone «Ci sto» non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const okPact = p.coachPact && p.coachPact.status === 'active' && p.coachPact.season === 4 && p.coachPact.fromWeek === 12 && p.coachPact.games === 5;
  const okLed = (p.ledger || []).some(l => l.t === 'patto');
  console.log('(1) offerta:', off, '· pact attivo:', okPact, '· ledger:', okLed, '· target:', p.coachPact && p.coachPact.target);
  if (!okPact) issues.push('coachPact non attivo dopo accettazione: ' + JSON.stringify(p.coachPact));
  if (!okLed) issues.push('patto non scritto nel ledger');
  const prog = await hasTxt(pg, 'Patto col mister:');
  if (!prog) issues.push('progress-card del patto attivo assente');
  await pg.close();
}
// (2) VERDETTO MANTENUTO — pact attivo, 3 gol nelle gare successive a fromWeek
{
  const pg = await boot(mkSave({ week: 16, coachPact: { season: 4, fromWeek: 12, target: 3, games: 5, status: 'active' }, matchHistory: [lgGame(11, 2, 7.8), lgGame(13, 1, 7.0), lgGame(14, 0, 6.5), lgGame(15, 2, 7.6)] }));
  const verd = await hasTxt(pg, 'verdetto') && await hasTxt(pg, 'Da oggi il rigorista sei tu');
  if (!verd) issues.push('verdetto MANTENUTO assente (3/3 gol)');
  const t0 = (await getP(pg)).coachTrust;
  try { await pg.getByText('Una stretta di mano', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone verdetto kept non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.coachPact.status === 'kept' && p.coachTrust === Math.min(100, t0 + 8) && (p.diary || []).some(d => d.type === 'pact');
  console.log('(2) kept:', verd, '· effetti:', ok, `(trust ${t0}→${p.coachTrust})`);
  if (!ok) issues.push('effetti verdetto kept errati: status=' + p.coachPact.status + ' trust=' + t0 + '→' + p.coachTrust);
  await pg.close();
}
// (3) VERDETTO FALLITO — 5 gare giocate, 1 gol su 3
{
  const pg = await boot(mkSave({ week: 18, coachPact: { season: 4, fromWeek: 12, target: 3, games: 5, status: 'active' }, matchHistory: [lgGame(13, 0, 6.2), lgGame(14, 1, 6.8), lgGame(15, 0, 6.0), lgGame(16, 0, 6.3), lgGame(17, 0, 6.1)] }));
  const verd = await hasTxt(pg, 'Il patto è andato a vuoto');
  console.log('(3) failed:', verd);
  if (!verd) issues.push('verdetto FALLITO assente (1/3 in 5 gare)');
  await pg.close();
}
// (4) SPOGLIATOIO — 2+ assist reali → episodio «ti deve una cena» → bond +4; stato leggibile nel Club tab
{
  const pg = await boot(mkSave({ matchHistory: [lgGame(10, 0, 6.9, { assists: 1 }), lgGame(11, 1, 7.4, { assists: 1 })], coachPactSeason: 4 }));
  const ev = await hasTxt(pg, 'ti deve una cena');
  if (!ev) issues.push('episodio spogliatoio (2 assist) assente');
  try { await pg.getByText('Il gruppo prima di tutto', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone episodio spogliatoio non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const bonded = (p.teammates || []).some(t => (t.bond || 0) === 44) && p.bondEv && p.bondEv.w === 12;
  console.log('(4) episodio:', ev, '· bond+4:', bonded);
  if (!bonded) issues.push('bond non aggiornato dall\'episodio: ' + JSON.stringify((p.teammates || []).map(t => t.bond)));
  // stato leggibile nel Tab Club
  await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Club/.test(x.textContent || '') && x.offsetParent !== null); if (b) b.click(); });
  await sleep(900);
  const st = await hasTxt(pg, 'Conoscente|Alleato|Amico fraterno|Gelo');
  console.log('(4b) stato legame nel Club tab:', st);
  if (!st) issues.push('stato leggibile del legame assente nella card Lo Spogliatoio');
  await pg.close();
}
// (5) ASPETTATIVE — sotto le attese → firma CRITICO; sopra → firma FAN
{
  const pg = await boot(mkSave({ goals: 1, matches: 12, matchHistory: [lgGame(9, 0, 6.0), lgGame(10, 0, 6.1), lgGame(11, 1, 6.6)], coachPactSeason: 4 }));
  const sotto = await hasTxt(pg, 'il processo del lunedì') && await hasTxt(pg, 'Marco Ferretti');
  const pg2 = await boot(mkSave({ goals: 14, matches: 10, matchHistory: [lgGame(7, 3, 8.2, { simulated: true }), lgGame(8, 3, 8.0, { simulated: true }), lgGame(9, 2, 7.6, { simulated: true }), lgGame(10, 3, 7.8, { simulated: true }), lgGame(11, 3, 8.0, { simulated: true })], bondEv: { s: 4, w: 11 } }));
  const sopra = await hasTxt(pg2, 'sopra le attese') && await hasTxt(pg2, 'Sofia Esposito');
  console.log('(5) sotto→critico:', sotto, '· sopra→fan:', sopra);
  if (!sotto) issues.push('riga aspettative SOTTO con firma critico assente');
  if (!sopra) issues.push('riga aspettative SOPRA con firma fan assente');
  await pg.close(); await pg2.close();
}
// (6) niente offerta patto dopo gara SIMULATA (voto alto ma non dal vivo)
{
  const pg = await boot(mkSave({ matchHistory: [lgGame(10, 1, 6.6), lgGame(11, 2, 8.0, { simulated: true })], bondEv: { s: 4, w: 11 } }));
  const off = await hasTxt(pg, 'Il patto col mister');
  console.log('(6) offerta dopo sim:', off);
  if (off) issues.push('offerta patto proposta dopo gara SIMULATA');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ONDA 2 OK (patto offerta/kept/failed · spogliatoio bond+stati · aspettative critico/fan · no-offer su sim)');
process.exit(issues.length ? 1 : 0);
