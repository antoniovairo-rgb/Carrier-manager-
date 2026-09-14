#!/usr/bin/env node
/* [7.13.0] PROBE — SERATA DI PRESENTAZIONE: sul walkout del 1° match CASALINGO della stagione lo speaker
   annuncia la squadra (beats dal roster reale) e chiude col nome dell'eroe; fuochi via seasonPresentation. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
const baseSave = { phase: 'career', player: { name: 'Pres Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 22, ovr: 78, tutorialDone: true, campDone: true, jerseyNum: 10,
  seasonPledge: { season: 3, tone: 'equilibrato' },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 74, morale: 72, fatigue: 8, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } };
await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, baseSave);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1600);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await sleep(1400);
// il calendario è stato generato dalla migration: trova la 1ª casalinga di lega e mettici la settimana
const fhw = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const ws = ((s && s.player.calendar) || []).filter(m => m && !m.type && m.isHome).map(m => m.week); return ws.length ? Math.min(...ws) : null; });
console.log('prima casalinga di lega: W' + fhw);
if (!fhw) { console.log('❌ FAIL: calendario senza gare casalinghe'); process.exit(1); }
// il calendario è deterministico (seed stagione+club): una NUOVA pagina con week=fhw rigenera lo stesso calendario
await page.close();
const page2 = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(page2);
page2.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page2.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, { ...baseSave, player: { ...baseSave.player, week: fhw, weekLived: true } });
await page2.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page2.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1600);
const page3 = page2; // alias per il resto del flusso
const click = async (rx) => page2.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 26); } return null; }, rx);
console.log('continua:', await click('^CONTINUA')); await sleep(1100);
console.log('gioca:', await click('Gioca vs|Gioca partita|Gioca')); await sleep(1100);
console.log('gioca2:', await click('Gioca la partita')); await sleep(1800);
await page2.screenshot({ path: 'tests/visual/out/pres-preentra.png' });
const btns = await page2.evaluate(() => [...document.querySelectorAll('button,a,[role=button]')].filter(e => e.offsetParent !== null).map(e => (e.textContent || '').trim().slice(0, 30)).slice(0, 12));
console.log('bottoni visibili:', JSON.stringify(btns));
console.log('formazioni:', await click('Formazioni')); await sleep(1600);
console.log('entra:', await click('Entra in campo|ENTRA|Scendi in campo|In campo')); await sleep(1200);/* mai cliccare Salta: il walkout va OSSERVATO */
const issues = [];
const seen = { speaker: false, hero: false };
for (let t = 0; t < 16; t++) {
  const s = await page2.evaluate((nm) => { const vis = el => el.offsetParent !== null; const txt = [...document.querySelectorAll('div')].filter(vis).map(e => (e.textContent || '').trim());
    return { sp: txt.some(x => /Signore e signori|LA VOSTRA|🎤/.test(x) && x.length < 120), hero: txt.some(x => x === nm.toUpperCase() + '!') }; }, 'Pres Probe');
  if (s.sp) seen.speaker = true; if (s.hero) seen.hero = true;
  if (t === 4) await page2.screenshot({ path: 'tests/visual/out/presentazione.png' });
  if (seen.hero) { await page2.screenshot({ path: 'tests/visual/out/presentazione-hero.png' }); break; }
  await sleep(900);
}
console.log('speaker visto:', seen.speaker, '· beat eroe visto:', seen.hero);
if (!seen.speaker) issues.push('banner speaker mai apparso sul walkout della 1ª casalinga');
if (!seen.hero) issues.push('beat finale con nome eroe mai apparso');
if (errors.length) issues.push('pageerror: ' + errors[0]);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ PRESENTAZIONE OK (speaker + beat eroe sul walkout)');
await browser.close(); srv.close();
process.exit(issues.length ? 1 : 0);
