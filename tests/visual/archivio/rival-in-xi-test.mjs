/* [7.173.0] PROBE: (1) il RIVALE di carriera gioca nella gara contro il suo club — il suo nome è nell'XI
   avversario della schermata Formazioni; (2) cognomi suffisso-aware: eroe «... jr» → maglia «PISANO JR»,
   mai «JR» nudo. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const page = await browser.newPage({ viewport: { width: 480, height: 950 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
const save = { phase: 'career', player: { name: 'Giovanni Pisano jr', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 6, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNum: 20, presidentModalSeason: 4, drawSeen: 4, mercatoSeen: 4, jerseyNumSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 62, c: '#6c1f2e', c2: '#f2f1ec', nat: '🇮🇹', lg: 'Lega A' },
  leagueOverrides: { sal: 'Lega A' },
  rival: { name: 'Pablo Bernard', club: { id: 'milan', n: 'AC Rossoneri' }, totalGoals: 30 },
  calendar: [{ matchday: 6, week: 6, opponentId: 'milan', opponentName: 'AC Rossoneri', isHome: true, played: false }],
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 74, morale: 72, fatigue: 8, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 } } };
await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1800);
const click = async (rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 30); } return null; }, rx);
await click('^CONTINUA'); await sleep(900);
console.log('CTA:', await click('Gioca vs|Gioca partita|Gioca la partita|Gioca')); await sleep(1200);
await click('Gioca la partita'); await sleep(1500);
// matchday → formazioni
console.log('nav:', await click('Formazioni|Vai al campo')); await sleep(1600);
const body = await page.evaluate(() => document.body.innerText);
const hasRival = /BERNARD/i.test(body);
const hasJr = /PISANO JR/i.test(body);
const bareJr = /(^|\s)JR(\s|$)/.test(body.split('\n').find(l => /^JR$/.test(l.trim())) || '');
console.log('XI avversario con BERNARD:', hasRival, '· maglia eroe PISANO JR:', hasJr);
if (!hasRival) issues.push('il rivale Pablo Bernard NON è nell\'XI avversario (Formazioni)');
if (!hasJr) issues.push('la maglia dell\'eroe non mostra «PISANO JR» (suffisso non gestito)');
if (bareJr) issues.push('trovata etichetta «JR» nuda');
await page.screenshot({ path: 'out/rival-in-xi.png' });
await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ RIVALE IN CAMPO OK (XI avversario + cognome suffisso-aware)');
process.exit(issues.length ? 1 : 0);
