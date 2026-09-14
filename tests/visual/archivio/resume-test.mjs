#!/usr/bin/env node
/* [7.149.0] PROBE auto-ripresa dopo background: boot SENZA cpmtest (la ripresa è gated !cpmtest).
   (A) con cpm-active + save valido → rientra DRITTO in carriera sullo stesso tab (non alla home).
   (B) senza cpm-active → home (slot picker). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const save = { phase: 'career', player: { name: 'Resume Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 6, weekLived: true, age: 24, ovr: 78, tutorialDone: true, campDone: true, jerseyNum: 10, presidentModalSeason: 3, drawSeen: 3, mercatoSeen: 3,
  club: { id: 'lec', n: 'FC Salento', a: 'LEC', p: 62, c: '#f5c518', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 74, morale: 72, fatigue: 8, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } };

const domState = async (page) => page.evaluate(() => {
  const vis = el => el.offsetParent !== null;
  const txt = [...document.querySelectorAll('button,a,[role=button],div')].filter(vis).map(e => (e.textContent || '').trim());
  const navSeason = txt.some(t => t === 'Stagione');
  const navHome = txt.some(t => /Nuova Carriera|Slot|Nuova partita/i.test(t) && t.length < 40);
  const heroName = txt.some(t => t === 'Resume Probe');
  const agentTab = txt.some(t => /Patrimonio|procuratore|Situazione Contratto|Stipendio/i.test(t));
  return { navSeason, navHome, heroName, agentTab };
});

// ── (A) con puntatore → rientra in carriera sul tab "agente" ──
{
  const bctx = await browser.newContext({ viewport: { width: 480, height: 900 }, serviceWorkers: 'block' });
  const page = await bctx.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('A pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); localStorage.setItem('cpm-active', '0'); localStorage.setItem('cpm-active-tab', 'agente'); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(2600);
  const s = await domState(page);
  console.log('(A) resume →', JSON.stringify(s));
  if (!s.navSeason) issues.push('(A) NON è rientrato in carriera (nav Stagione assente)');
  if (!s.agentTab) issues.push('(A) non è sul tab agente (nessun contenuto agente)');
  await page.screenshot({ path: 'out/resume-A.png' });
  await bctx.close();
}
// ── (B) senza puntatore → home ──
{
  const bctx = await browser.newContext({ viewport: { width: 480, height: 900 }, serviceWorkers: 'block' });
  const page = await bctx.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('B pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(2200);
  const s = await domState(page);
  console.log('(B) no-pointer →', JSON.stringify(s));
  if (s.navSeason) issues.push('(B) senza puntatore NON dovrebbe entrare in carriera');
  await page.screenshot({ path: 'out/resume-B.png' });
  await bctx.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ ISSUES\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ AUTO-RIPRESA OK (A rientra in carriera sul tab · B home)');
process.exit(issues.length ? 1 : 0);
