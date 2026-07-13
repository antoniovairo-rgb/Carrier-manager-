#!/usr/bin/env node
/* [7.29.0] TEST — ONDA 4 (WEEKLY_LIFE_DESIGN §S10/§S14/§S5): (1) offerta SPONSOR a fascia (pop 60 → tecnico)
   → firma → p.sponsors + ledger; (2) bivio SHOOTING nella settimana del big match (vai → cassa+pop, marker
   stagionale); (3) VITA PRIVATA: incontro in settimana di crociera → coppia; (4) matrimonio a W2 della
   stagione dopo (nomina i compagni veri) → sposato; (5) figlio → genitore; (6) PROCURATORE: scelta filosofia
   boutique/global → p.agentStyle. Tutto derivato/deterministico. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const pauseCal = (wk) => [{ matchday: 30, week: wk + 1, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null }];
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Onda4 Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: false, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, matches: 8, goals: 5, assists: 2, totalGoals: 40, totalMatches: 80, popularity: 60, bankBalance: 50000, coachPactSeason: 4, bondEv: { s: 4, w: 11 },
  calendar: pauseCal(12),
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, coachTrust: 66, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

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

// (1) SPONSOR — pop 60 → offerta fascia TECNICO → firma
{
  const pg = await boot(mkSave({}));
  const off = await hasTxt(pg, 'Sponsor — nuova offerta') && await hasTxt(pg, 'tecnico');
  if (!off) issues.push('offerta sponsor tecnico assente a pop 60');
  try { await pg.getByText('Firmo l’accordo', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone firma sponsor non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = (p.sponsors || []).length === 1 && p.sponsors[0].tier === 'tecnico' && p.sponsors[0].weekly > 0 && (p.ledger || []).some(l => l.t === 'sponsor');
  console.log('(1) offerta:', off, '· firmato:', ok, '·', p.sponsors && p.sponsors[0] && (p.sponsors[0].brand + ' ' + p.sponsors[0].weekly + '€/set'));
  if (!ok) issues.push('sponsor non registrato: ' + JSON.stringify(p.sponsors));
  await pg.close();
}
// (2) SHOOTING nel big match — sponsor attivo + avversaria top-3 in settimana
{
  const st = Array.from({ length: 18 }, (_, i) => ({ id: i === 0 ? 'inter' : i === 5 ? 'sal' : 'c' + i, n: i === 0 ? 'FC Internazionale' : i === 5 ? 'FC Salernum' : 'Club ' + i, played: 11, pts: 30 - i, gf: 20, ga: 10, gd: 10, wins: 6, draws: 2, losses: 3 }));
  const pg = await boot(mkSave({ sponsors: [{ tier: 'tecnico', brand: 'Vortex Boots', weekly: 1200, season: 4 }], sponsorDecl: { tier: 'nazionale', season: 4 }, standings: st, calendar: [{ matchday: 12, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null }], popularity: 66 }));
  const ev = await hasTxt(pg, 'shooting');
  if (!ev) issues.push('bivio shooting assente (sponsor + big match)');
  const b0 = (await getP(pg)).bankBalance;
  try { await pg.getByText('Vai allo shooting', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone shooting non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.sponsorEvS === 4 && (p.bankBalance || 0) > b0;
  console.log('(2) shooting:', ev, '· vai → cassa:', ok, `(${b0}→${p.bankBalance})`);
  if (!ok) issues.push('effetti shooting errati');
  await pg.close();
}
// (3) VITA PRIVATA — incontro in settimana di crociera ((s·7+w)%4===0: s4 w12? 40%4=0 ✓)
{
  const pg = await boot(mkSave({ popularity: 40, sponsorDecl: { tier: 'tecnico', season: 4 } }));
  const ev = await hasTxt(pg, 'L’incontro|Qualcuno in tribuna');
  if (!ev) issues.push('card incontro assente in settimana di crociera');
  try { await pg.getByText('Usciamo di nuovo', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone incontro non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.life && p.life.stage === 'coppia' && !!p.life.name;
  console.log('(3) incontro:', ev, '· coppia:', ok, '·', p.life && p.life.name);
  if (!ok) issues.push('life.stage coppia non registrato: ' + JSON.stringify(p.life));
  await pg.close();
}
// (4) MATRIMONIO — stagione dopo, W2, nomina un compagno vero
{
  const pg = await boot(mkSave({ week: 2, season: 5, jerseyNumSeason: 5, presidentModalSeason: 5, seasonPledge: { season: 5, tone: 'equilibrato' }, drawSeen: 5, coachPactSeason: 5, bondEv: { s: 5, w: 1 }, sponsorDecl: { tier: 'tecnico', season: 5 }, popularity: 40, life: { stage: 'coppia', name: 'Giulia', since: { s: 4, w: 12 } }, teammates: [{ name: 'Rino Marchesi', archetype: 'capitano', icon: '💪', bond: 62 }], calendar: pauseCal(2) }));
  const ev = await hasTxt(pg, 'matrimonio') && await hasTxt(pg, 'Rino Marchesi');
  if (!ev) issues.push('card matrimonio assente (coppia, W2 stagione dopo, con compagno nominato)');
  try { await pg.getByText('Il giorno più bello', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone matrimonio non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.life && p.life.stage === 'sposato' && (p.diary || []).some(d => /matrimonio/i.test(d.headline || ''));
  console.log('(4) matrimonio:', ev, '· sposato:', ok);
  if (!ok) issues.push('life.stage sposato non registrato');
  await pg.close();
}
// (5) FIGLIO — sposato da ≥1 stagione, settimana giusta ((s·7+w)%6===0: s4 w8 → 36%6=0 ✓)
{
  const pg = await boot(mkSave({ week: 8, popularity: 40, sponsorDecl: { tier: 'tecnico', season: 4 }, bondEv: { s: 4, w: 7 }, life: { stage: 'sposato', name: 'Giulia', since: { s: 3, w: 2 } }, calendar: pauseCal(8) }));
  const ev = await hasTxt(pg, 'notte insonne|papà');
  if (!ev) issues.push('card figlio assente');
  try { await pg.getByText('Giochi per qualcuno', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone figlio non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.life && p.life.stage === 'genitore';
  console.log('(5) figlio:', ev, '· genitore:', ok);
  if (!ok) issues.push('life.stage genitore non registrato');
  await pg.close();
}
// (6) PROCURATORE — hasAgent senza filosofia → scelta boutique
{
  const pg = await boot(mkSave({ hasAgent: true, popularity: 20, sponsorDecl: { tier: 'locale', season: 4 }, bondEv: { s: 4, w: 11 } }));
  const ev = await hasTxt(pg, 'filosofia|boutique');
  if (!ev) issues.push('card filosofia procuratore assente');
  try { await pg.getByText('Boutique', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('bottone boutique non cliccabile'); }
  await sleep(1200);
  const p = await getP(pg);
  const ok = p.agentStyle === 'boutique';
  console.log('(6) filosofia:', ev, '· boutique:', ok);
  if (!ok) issues.push('agentStyle non registrato: ' + p.agentStyle);
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ONDA 4 OK (sponsor firma+shooting · vita privata incontro/matrimonio/figlio · procuratore boutique)');
process.exit(issues.length ? 1 : 0);
