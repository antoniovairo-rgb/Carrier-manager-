/* [7.156.0] SHOT varietà arco rivali: due settimane (casa W12 / trasferta W20) → screenshot card storia
   per mostrare al PO che il testo NON è più ripetitivo. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const RIVAL = { name: 'Dario Ferrero', age: 24, ovr: 80, goals: 14, totalGoals: 191, seasons: 5, relationship: 'rivale', club: { id: 'pis', n: 'FC Pisano', p: 60, lg: 'Lega B', c: '#0a5' } };
const mk = (wk, home) => ({ phase: 'career', player: { name: 'Rival Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: wk, weekLived: false, age: 23, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, totalGoals: 384, rival: RIVAL,
  calendar: [{ matchday: wk - 1, week: wk, opponentId: 'pis', opponentName: 'FC Pisano', isHome: home, played: false, result: null }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 72, fatigue: 10, morale: 70, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 } } });
const shoot = async (sv, out) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  await page.addInitScript((s) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(1200);
  const box = await page.evaluate(() => { const el = [...document.querySelectorAll('*')].find(e => /LA TUA STORIA/i.test(e.textContent || '') && e.textContent.length < 900); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  if (box) await page.screenshot({ path: out, clip: { x: Math.max(0, box.x - 6), y: Math.max(0, box.y - 6), width: Math.min(480, box.w + 12), height: box.h + 12 } });
  else await page.screenshot({ path: out });
  await page.close();
};
await shoot(mk(12, true), 'out/rival-W12-casa.png');
await shoot(mk(20, false), 'out/rival-W20-trasferta.png');
await browser.close(); srv.close();
console.log('→ out/rival-W12-casa.png · out/rival-W20-trasferta.png');
