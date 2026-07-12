#!/usr/bin/env node
/* [7.18.0] TEST — TRIBUTI DI CARRIERA (favola): (1) militanza — 100 presenze col club (storia clubId +
   stagione corrente) → capitolo «100 volte questa maglia» + persistenza arcSeen per-club; (2) bandiera —
   ≥5 stagioni e ≥60 gol con lo stesso club → «La bandiera»; (3) anti-falso-positivo: presenze col club
   diverse (altro clubId in history) NON contano; (4) il tributo visto non ricompare. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const hist = (n, clubId, matches, goals) => Array.from({ length: n }, (_, i) => ({ season: i + 1, club: 'FC Salernum', clubId, goals, assists: 2, matches, ovr: 70 + i, league: 'Lega B' }));
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Trib Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 5, week: 10, weekLived: false, age: 25, ovr: 82, tutorialDone: true, campDone: true, jerseyNumSeason: 5, presidentModalSeason: 5, seasonPledge: { season: 5, tone: 'equilibrato' }, drawSeen: 5,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
  form: 72, fatigue: 10, morale: 70, popularity: 40, contract: { duration: 3, wage: 9000, expiresAtSeason: 8 }, ...patch } });

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
const clickBtn = (page, rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx);

// ───── (1) militanza: 4 stagioni × 25 presenze (100) + 1 in corso → crossing a 101
{
  const pg = await boot(mkSave({ history: hist(4, 'sal', 25, 8), matches: 1, goals: 0 }));
  const trib = await hasTxt(pg, '100 volte questa maglia');
  console.log('(1) militanza 100:', trib);
  if (!trib) issues.push('capitolo militanza 100 assente (101 presenze col club)');
  await clickBtn(pg, 'Continua la storia'); await sleep(900);
  const st = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; return { seen: p.arcSeen && p.arcSeen['trib100_sal'], diary: (p.diary || []).some(d => d.type === 'story' && /100 volte/.test(d.headline)) }; });
  console.log('(1) post-continua:', JSON.stringify(st));
  if (!st.seen) issues.push('arcSeen trib100_sal non persistito');
  if (!st.diary) issues.push('diario story del tributo assente');
  await pg.close();
}
// ───── (2) bandiera: 5ª stagione col club, 60+ gol (militanza fuori finestra: 4×30=120+5=125)
{
  const pg = await boot(mkSave({ history: hist(4, 'sal', 30, 16), matches: 5, goals: 2 }));
  const flag = await hasTxt(pg, 'La bandiera') && await hasTxt(pg, 'Uno di noi');
  console.log('(2) bandiera:', flag);
  if (!flag) issues.push('capitolo «La bandiera» assente (5 stagioni, 66 gol col club)');
  await pg.close();
}
// ───── (3) anti-falso-positivo: stessa quantità di presenze ma con ALTRO club
{
  const pg = await boot(mkSave({ history: hist(4, 'altro-club', 25, 8), matches: 1, goals: 0 }));
  const trib = await hasTxt(pg, 'volte questa maglia');
  console.log('(3) altro club:', trib);
  if (trib) issues.push('tributo militanza scattato con presenze di un ALTRO club');
  await pg.close();
}
// ───── (4) tributo già visto non ricompare
{
  const pg = await boot(mkSave({ history: hist(4, 'sal', 25, 8), matches: 1, goals: 0, arcSeen: { trib100_sal: true } }));
  const trib = await hasTxt(pg, '100 volte questa maglia');
  console.log('(4) già visto:', trib);
  if (trib) issues.push('tributo militanza riproposto dopo arcSeen');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ TRIBUTI OK (militanza 100 · bandiera · anti-falso-positivo · non ricompare)');
process.exit(issues.length ? 1 : 0);
