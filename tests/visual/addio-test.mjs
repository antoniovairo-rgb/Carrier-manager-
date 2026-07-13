#!/usr/bin/env node
/* [7.20.0] TEST — L'ADDIO AL CALCIO: il ritiro volontario apre la cerimonia a DUE ATTI.
   (1) atto I «Grazie, <nome>» → Continua; (2) atto II «La lettera d'addio» coi fatti VERI (primo club,
   totali) + MAGLIA RITIRATA (bandiera: 6 stagioni/72 gol con lo stesso club, numero vero); (3) chiusura →
   riepilogo «Fine Carriera»; (4) SENZA bandiera (storia spezzata su più club) la lettera c'è ma la maglia
   ritirata NO. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const hist = (clubIds) => clubIds.map((cid, i) => ({ season: i + 1, club: cid === 'sal' ? 'FC Salernum' : 'FC Pisano', clubId: cid, goals: 12, assists: 3, matches: 28, ovr: 74 + i, league: 'Lega B' }));
const mkSave = (clubIds) => ({ phase: 'career', player: { name: 'Addio Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 7, week: 10, weekLived: false, age: 36, ovr: 78, tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 7, presidentModalSeason: 7, seasonPledge: { season: 7, tone: 'equilibrato' }, drawSeen: 7,
  history: hist(clubIds), totalGoals: 80, totalMatches: 180, trophies: [{ season: 3, club: 'FC Salernum', league: 'Lega B' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 74, tecnica: 78, fisico: 72, 'mentalità': 82, tiro: 80, passaggio: 78, dribbling: 76, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 70, contract: { duration: 1, wage: 9000, expiresAtSeason: 8 } } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(1000);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  return page;
};
const hasTxt = (page, rx) => page.evaluate((x) => new RegExp(x, 'i').test(document.body.innerText), rx);
const clickBtn = (page, rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx);
const goRetire = async (page) => {
  // naviga fino alla card «Fine di un'era» (tab Carriera → Profilo) e conferma il ritiro
  for (const nav of ['Carriera', 'Profilo']) { await clickBtn(page, '^' + nav + '$|^👤?\\s*' + nav); await sleep(800); }
  if (!(await clickBtn(page, 'Ritirati →|Ritirati$'))) return 'no-card';
  await sleep(800);
  if (!(await clickBtn(page, 'Ritirati con onore'))) return 'no-confirm';
  await sleep(1500);
  return true;
};

// ───── (1)-(3) bandiera: 6 stagioni sal → lettera + maglia ritirata n.9
{
  const pg = await boot(mkSave(['sal', 'sal', 'sal', 'sal', 'sal', 'sal']));
  const r = await goRetire(pg);
  console.log('(1) goRetire:', r);
  if (r !== true) issues.push('flusso ritiro non raggiunto: ' + r);
  const act1 = await hasTxt(pg, 'Grazie, Addio Probe');
  console.log('(1) atto I:', act1);
  if (!act1) issues.push('atto I «Grazie» assente');
  await clickBtn(pg, '^Continua →$|^Continua'); await sleep(900);
  const letter = await hasTxt(pg, "La lettera d'addio") && await hasTxt(pg, 'appendo le scarpette');
  const shirt = await hasTxt(pg, 'RITIRA la maglia numero 9');
  console.log('(2) atto II — lettera:', letter, '· maglia ritirata:', shirt);
  if (!letter) issues.push('lettera d\'addio assente');
  if (!shirt) issues.push('maglia ritirata assente per la bandiera (6 stagioni, 72 gol)');
  await clickBtn(pg, 'Rivivi la carriera'); await sleep(1000);
  const recap = await hasTxt(pg, 'Fine Carriera');
  console.log('(3) riepilogo:', recap);
  if (!recap) issues.push('riepilogo Fine Carriera non raggiunto');
  await pg.close();
}
// ───── (4) NON bandiera: storia spezzata su 2 club (3+3) → lettera sì, maglia no
{
  const pg = await boot(mkSave(['sal', 'sal', 'sal', 'pis', 'pis', 'pis']));
  const r = await goRetire(pg);
  if (r !== true) issues.push('(4) flusso ritiro non raggiunto: ' + r);
  await clickBtn(pg, '^Continua →$|^Continua'); await sleep(900);
  const letter = await hasTxt(pg, "La lettera d'addio");
  const shirt = await hasTxt(pg, 'RITIRA la maglia');
  console.log('(4) non-bandiera — lettera:', letter, '· maglia:', shirt);
  if (!letter) issues.push('(4) lettera assente senza bandiera');
  if (shirt) issues.push('(4) maglia ritirata mostrata SENZA i requisiti da bandiera');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ ADDIO OK (atto I · lettera+maglia ritirata · riepilogo · anti-falso-positivo)');
process.exit(issues.length ? 1 : 0);
