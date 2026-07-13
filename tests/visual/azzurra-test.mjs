#!/usr/bin/env node
/* [7.23.0] TEST — LA PRIMA MAGLIA AZZURRA + LA FASCIA: (1) nationalCaps=1 + natHistory → capitolo esordio
   con l'avversario vero; (2) caps=8 → NON ricompare (fuori finestra); (3) isCaptain → «La fascia al braccio»
   (una volta, career-wide); (4) capitano già visto → non ricompare. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (patch) => ({ phase: 'career', player: { name: 'Azz Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 14, weekLived: false, age: 24, ovr: 82, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
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

// (1) esordio azzurro
{
  const pg = await boot(mkSave({ nationalCaps: 1, natHistory: [{ season: 4, week: 13, comp: 'Amichevole', opp: 'Francia', hs: 1, as: 1, drew: true, goals: 0, assists: 0, rating: 6.8 }] }));
  const deb = await hasTxt(pg, 'La prima maglia azzurra') && await hasTxt(pg, 'contro Francia');
  console.log('(1) esordio:', deb);
  if (!deb) issues.push('capitolo esordio azzurro assente (caps=1)');
  await pg.close();
}
// (2) veterano azzurro (caps 8) → niente capitolo esordio
{
  const pg = await boot(mkSave({ nationalCaps: 8 }));
  const deb = await hasTxt(pg, 'La prima maglia azzurra');
  console.log('(2) caps 8:', deb);
  if (deb) issues.push('capitolo esordio mostrato a caps=8 (fuori finestra)');
  await pg.close();
}
// (3) la fascia
{
  const pg = await boot(mkSave({ isCaptain: true }));
  const arm = await hasTxt(pg, 'La fascia al braccio');
  console.log('(3) fascia:', arm);
  if (!arm) issues.push('capitolo fascia assente con isCaptain');
  await pg.close();
}
// (4) fascia già vista → non ricompare
{
  const pg = await boot(mkSave({ isCaptain: true, arcSeen: { captain_arm: true } }));
  const arm = await hasTxt(pg, 'La fascia al braccio');
  console.log('(4) già vista:', arm);
  if (arm) issues.push('capitolo fascia riproposto dopo arcSeen');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ AZZURRA+FASCIA OK (esordio con avversario vero · finestra · fascia · non ricompare)');
process.exit(issues.length ? 1 : 0);
