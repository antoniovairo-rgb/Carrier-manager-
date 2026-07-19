#!/usr/bin/env node
/* [7.148.0] TUNER mic-in-mano giornalista: boot intervista GLB-ON, sweep di window.__CPM_MICT
   (fwd/her/up/lean/fcR/fcL/fadd) in UNA sessione, crop della mano per ogni config. Non-gate. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { execSync } from 'node:child_process';

const CONFIGS = JSON.parse(process.env.MICT_CONFIGS || '[]');
if (!CONFIGS.length) { console.error('MICT_CONFIGS vuoto'); process.exit(1); }

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const ctxOpt = { viewport: { width: 480, height: 1000 }, serviceWorkers: 'block' };
const issues = [];
const save = { phase: 'career', player: { name: 'GLB Probe', nation: 'Italia', avatarId: 7, proStatus: 'pro', season: 3, week: 10, weekLived: true, age: 23, ovr: 76, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, drawSeen: 3, squadRole: 'titolare', coachTrust: 80, value: 20, popularity: 50,
  goals: 6, assists: 2, matches: 9, matchHistory: [{ opponent: 'FC Test', rating: 7.2, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 1 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } };

const bctx = await browser.newContext(ctxOpt);
const page = await bctx.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript((o) => { localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await page.evaluate(() => window.__CPM_CAREER.dismiss());
await sleep(400);
await page.evaluate((c) => window.__CPM_CAREER.forceInterview(c), 'win');
await sleep(5200);

const files = [];
for (const cfg of CONFIGS) {
  await page.evaluate((c) => { window.__CPM_MICT = c; }, cfg);
  await sleep(500);
  const f = `out/mict-${cfg.name}.png`;
  await page.screenshot({ path: f });
  files.push({ f, name: cfg.name });
  console.log('shot', cfg.name);
}
await browser.close(); srv.close();

// crop each to the hand region via python
try {
  const py = `
from PIL import Image
import sys, json
for name in ${JSON.stringify(files.map(x => x.name))}:
    im = Image.open('out/mict-'+name+'.png')
    im.crop((0,250,160,480)).resize((320,460)).save('out/mictc-'+name+'.png')
    print('crop', name)
`;
  execSync('python3 -c ' + JSON.stringify(py), { cwd: process.cwd(), stdio: 'inherit' });
} catch (e) { console.error('crop fail', e.message); }
console.log(issues.length ? '⚠ ' + issues.join('; ') : 'ok');
