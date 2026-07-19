#!/usr/bin/env node
/* [7.150.0] PROBE ripresa DENTRO la partita dopo background.
   Fase 1 (cpmtest): scopre una gara di lega casalinga W>2 (sede). Fase 2 (SENZA cpmtest): inietta cpm-active +
   cpm-match-resume (clock 63, 1-0) → al boot deve rientrare in CAMPO al ~63' 1-0 (non alla dashboard). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const club = { id: 'lec', n: 'FC Salento', a: 'LEC', p: 62, c: '#f5c518', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' };
const base = { phase: 'career', player: { name: 'Resume Match', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: true, age: 24, ovr: 78, tutorialDone: true, campDone: true, jerseyNum: 10, presidentModalSeason: 3, drawSeen: 3, mercatoSeen: 3, squadRole: 'titolare', coachTrust: 80,
  club, stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 74, morale: 72, fatigue: 8, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } };

// ── Fase 1: scopri una casalinga di lega W>2 ──
const p1 = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(p1);
p1.on('pageerror', e => issues.push('F1 pageerror: ' + String(e.message).slice(0, 120)));
await p1.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, base);
await p1.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await p1.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1400);
try { await p1.getByText('CONTINUA', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await sleep(1400);
const fix = await p1.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const m = ((s && s.player.calendar) || []).filter(x => x && !x.type && x.isHome && x.week > 2).sort((a, b) => a.week - b.week)[0]; return m ? { week: m.week, isHome: m.isHome !== false } : null; });
await p1.close();
if (!fix) { console.log('❌ nessuna casalinga W>2'); await browser.close(); srv.close(); process.exit(1); }
console.log('fixture: W' + fix.week + ' ' + (fix.isHome ? 'CASA' : 'TRASFERTA'));

// ── Fase 2: snapshot in-match + boot SENZA cpmtest ──
const sig = `${3}|${fix.week}|career|${fix.isHome ? 'H' : 'A'}`;
const snap = { v: 1, sig, context: 'career', isHome: fix.isHome, clock: 63, score: { home: 1, away: 0 }, momentum: 58 };
const bctx = await browser.newContext({ viewport: { width: 480, height: 900 }, serviceWorkers: 'block' });
const page = await bctx.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('F2 pageerror: ' + String(e.message).slice(0, 120)));
await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o.sv)); localStorage.setItem('cpm-active', '0'); localStorage.setItem('cpm-match-resume', JSON.stringify(o.snap)); },
  { sv: { ...base, player: { ...base.player, week: fix.week, weekLived: true } }, snap });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(4200);
const st = await page.evaluate(() => {
  const vis = el => el.offsetParent !== null;
  const hasCanvas = !!document.querySelector('canvas');
  const txt = [...document.querySelectorAll('div,span')].filter(vis).map(e => (e.textContent || '').trim());
  const minute = txt.some(t => /\b(6[0-9]|[78][0-9])['’]/.test(t));   // clock ≥ 60' → siamo a metà/fine gara, non a 0'
  const consumed = !localStorage.getItem('cpm-match-resume');          // lo snapshot è stato consumato (anti-loop)
  const onDash = txt.some(t => t === 'Stagione') && !hasCanvas;
  return { hasCanvas, minute, consumed, onDash };
});
console.log('resume-match →', JSON.stringify(st));
if (!st.hasCanvas) issues.push('NON è rientrato in campo (nessun canvas match)');
if (!st.minute) issues.push('clock non ripreso (nessun minuto ≥ 60 in vista)');
if (!st.consumed) issues.push('snapshot NON consumato (rischio loop)');
await page.screenshot({ path: 'out/resume-match.png' });
await bctx.close();
await browser.close(); srv.close();
console.log(issues.length ? '❌ ISSUES\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ RIPRESA IN-MATCH OK (rientra in campo al minuto/punteggio salvati, snapshot consumato)');
process.exit(issues.length ? 1 : 0);
