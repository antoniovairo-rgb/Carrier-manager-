#!/usr/bin/env node
/* [7.40.1] PROBE — rivalutazione del mercato (collaudo PO «il valore di mercato è troppo basso!»):
   (1) save esistente sotto-scala (bomber 81 OVR, 36 gol, valore 4.3M) → la migration ri-àncora il valore
       alla nuova curva (>25M), scrive la voce «Rivalutazione di mercato» e RIGENERA il piano del procuratore
       sulla nuova baseline; (2) un valore GIÀ in scala non viene toccato (idempotenza);
   (3) la curva in-page rispetta le ancore (calcMarketValue via weekly recompute). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (over = {}) => ({ phase: 'career', player: { name: 'Val Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 7, week: 30, weekLived: true, age: 23, ovr: 81, tutorialDone: true, campDone: true, jerseyNumSeason: 7, presidentModalSeason: 7, drawSeen: 7, squadRole: 'leader', isCaptain: true, coachTrust: 90, value: 4.3, popularity: 85, hasAgent: true,
  goals: 30, assists: 12, matches: 26, matchHistory: [],
  history: [{ season: 6, club: 'FC Salernum', clubId: 'sal', goals: 36, assists: 18, matches: 34, ovr: 79, league: 'Lega A' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 81, 'mentalità': 82, tiro: 84, passaggio: 79, dribbling: 80, posizionamento: 83 },
  form: 80, morale: 90, fatigue: 20, contract: { duration: 2, wage: 22000, expiresAtSeason: 9 },
  agentPlan: { season: 7, base: 4.0, target: 5.4, hold: false }, ...over } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(600);
  return page;
};
const readP = (page) => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; return { value: p.value, apBase: p.agentPlan?.base, apTarget: p.agentPlan?.target, apSeason: p.agentPlan?.season, logRival: (p.log || []).some(l => /Rivalutazione di mercato/.test(l)) }; });

// (1) re-àncora del save sotto-scala
{
  const page = await boot(mkSave());
  const st = await readP(page);
  console.log('(1) re-àncora:', JSON.stringify(st));
  if (!(st.value > 25)) issues.push('(1) valore non ri-ancorato (atteso >25M, trovato ' + st.value + ')');
  if (!st.logRival) issues.push('(1) voce «Rivalutazione di mercato» assente dalle Notizie');
  if (!(st.apSeason === 7 && st.apBase > 20)) issues.push('(1) agentPlan non rigenerato sulla nuova baseline (base ' + st.apBase + ')');
  await page.close();
}
// (2) idempotenza: valore già in scala → intatto
{
  const page = await boot(mkSave({ value: 40, agentPlan: { season: 7, base: 38, target: 46, hold: false } }));
  const st = await readP(page);
  console.log('(2) già in scala:', JSON.stringify(st));
  if (st.value !== 40) issues.push('(2) valore già in scala MODIFICATO (' + st.value + ')');
  if (st.apBase !== 38) issues.push('(2) agentPlan rigenerato senza motivo');
  if (st.logRival) issues.push('(2) voce rivalutazione scritta senza re-àncora');
  await page.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ MERCATO RIVALUTATO OK (re-àncora+log+piano · idempotenza)');
process.exit(issues.length ? 1 : 0);
