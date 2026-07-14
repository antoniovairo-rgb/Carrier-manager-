#!/usr/bin/env node
/* [7.40.0 Sprint 3 §9.7] PROBE — obiettivi personali + piano del procuratore:
   (1) dashboard: card «Obiettivi personali» col target DERIVATO dalla storia (record 12 → «13+ gol»);
   (2) Tab Agente: «IL PIANO DEL PROCURATORE» con base→target dal valore e dall'età;
   (3) rollover: obiettivi centrati → diario persgoal + log procuratore + agentPlan nuovo per la nuova stagione;
   (4) U18 → niente card personale. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (over = {}) => ({ phase: 'career', player: { name: 'Obj Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 20, weekLived: false, age: 23, ovr: 76, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: null, drawSeen: 3, squadRole: 'titolare', coachTrust: 80, value: 30, popularity: 40, hasAgent: true,
  history: [{ season: 2, club: 'FC Werkstadt', clubId: 'b04', goals: 12, assists: 5, matches: 30, ovr: 74, league: 'Deutsche Liga' }],
  goals: 5, assists: 2, matches: 10,
  matchHistory: [1, 2, 3, 4, 5, 6].map(i => ({ opponent: 'X' + i, rating: 7.0, goals: 1, assists: 0 })),
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 }, ...over } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await sleep(500);
  return page;
};

// ── (1)+(2) display: dashboard + Tab Agente ──────────────────────────────
{
  const page = await boot(mkSave());
  const dash = await page.evaluate(() => document.body.innerText);
  console.log('(1) dashboard:', /Obiettivi personali/i.test(dash) ? 'card ✓' : 'card ASSENTE', '·', /Batti il tuo record: 13\+ gol/.test(dash) ? 'target 13+ ✓' : 'target derivato SBAGLIATO');
  if (!/Obiettivi personali/i.test(dash)) issues.push('(1) card «Obiettivi personali» assente sul dashboard');
  if (!/Batti il tuo record: 13\+ gol/.test(dash)) issues.push('(1) target gol non derivato dalla storia (atteso «13+ gol» da record 12)');
  if (!/Media voto/.test(dash)) issues.push('(1) obiettivo media voto assente');
  // Tab Agente (scorciatoia tastiera G → goTab("agente"))
  await page.keyboard.press('g');
  await sleep(700);
  const ag = await page.evaluate(() => document.body.innerText);
  console.log('(2) agente:', /IL PIANO DEL PROCURATORE/i.test(ag) ? 'piano ✓' : 'piano ASSENTE', '·', /€40\.5M/.test(ag) ? 'target 40.5M ✓' : '(testo target: ' + ((ag.match(/Ti porto da[^\n]*/) || ['?'])[0]) + ')');
  if (!/IL PIANO DEL PROCURATORE/i.test(ag)) issues.push('(2) «IL PIANO DEL PROCURATORE» assente nel Tab Agente');
  if (!/€40\.5M/.test(ag)) issues.push('(2) target valore atteso €40.5M (30 × 1.35 a 23 anni) non mostrato');
  await page.close();
}

// ── (3) rollover: verdetti + nuovo agentPlan ─────────────────────────────
{
  const save = mkSave({ week: 38, goals: 14, value: 45, agentPlan: { season: 3, base: 38, target: 44, hold: false } });
  const page = await boot(save);
  const res = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
  await sleep(2500);
  const st = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; return {
    season: p.season, diary: (p.diary || []).filter(d => d.type === 'persgoal').length,
    logPers: (p.log || []).some(l => /Obiettivi personali CENTRATI/.test(l)),
    logAgent: (p.log || []).some(l => /procuratore esulta/.test(l)),
    apSeason: p.agentPlan?.season, apBase: p.agentPlan?.base }; });
  console.log('(3) rollover:', JSON.stringify(st), '· startNewSeason →', res);
  if (st.season !== 4) issues.push('(3) rollover non avvenuto (season ' + st.season + ')');
  if (st.diary !== 1) issues.push('(3) voce diario persgoal attesa 1, trovate ' + st.diary);
  if (!st.logPers) issues.push('(3) log «Obiettivi personali CENTRATI» assente (14 gol ≥ 13, avg 7.0 su 6 gare)');
  if (!st.logAgent) issues.push('(3) log del procuratore (piano centrato, 45 ≥ 44) assente');
  if (st.apSeason !== 4) issues.push('(3) agentPlan della nuova stagione non scritto (season ' + st.apSeason + ')');
  await page.close();
}

// ── (4) U18: niente card personale ───────────────────────────────────────
{
  const save = mkSave({ proStatus: 'u18', history: [], agentPlan: undefined, value: 0.6, hasAgent: false, club: { id: 'b04', n: 'FC Werkstadt U18', a: 'WRK', p: 56, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Primavera 1', isU18: true } });
  const page = await boot(save);
  const dash = await page.evaluate(() => document.body.innerText);
  console.log('(4) U18:', /Obiettivi personali/i.test(dash) ? 'card PRESENTE (sbagliato)' : 'niente card ✓');
  if (/Obiettivi personali/i.test(dash)) issues.push('(4) card personale mostrata a un U18');
  await page.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ OBIETTIVI PERSONALI + PIANO PROCURATORE OK (derivazione · display · rollover · U18)');
process.exit(issues.length ? 1 : 0);
