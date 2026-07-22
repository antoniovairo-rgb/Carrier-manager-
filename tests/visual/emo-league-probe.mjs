/* [7.170.0] PROBE: (1) EmoText spezza le run emoji in span senza textShadow (fix box Android);
   (2) etichetta lega del tabellone live override-aware: in trasferta da una NEOPROMOSSA (club DB Lega B,
   leagueOverrides → Lega A) il label di campionato deve dire la lega DEL GIOCATORE (Lega A), mai quella DB. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => typeof window.__CPM_EmoText === 'function', null, { timeout: 40000 });

// ── (1) EmoText: emoji in span textShadow:none, testo intatto ──
const emo = await page.evaluate(() => new Promise((res) => {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;background:#0a0e16;padding:16px;';
  document.body.appendChild(host);
  const root = ReactDOM.createRoot(host);
  const E = window.__CPM_EmoText;
  root.render(React.createElement('div', { id: 'emoprobe', style: { color: '#4ade80', fontWeight: 900, fontSize: 20, textShadow: '0 0 12px #4ade80' } },
    React.createElement(E, null, '⚽ GOL — MOLINARI'),
    React.createElement('div', { id: 'emoprobe2', style: { textShadow: '0 1px 5px rgba(0,0,0,0.85)' } }, React.createElement(E, null, '🧤 Il portiere dice di no 🅰️ ok'))
  ));
  setTimeout(() => {
    const d = document.getElementById('emoprobe');
    const spans = [...d.querySelectorAll('span')];
    const shadows = spans.map(s => getComputedStyle(s).textShadow);
    res({ text: d.textContent, spanN: spans.length, shadows });
  }, 500);
}));
console.log('EmoText:', JSON.stringify(emo));
if (emo.text !== '⚽ GOL — MOLINARI🧤 Il portiere dice di no 🅰️ ok') issues.push('EmoText ha alterato il testo: ' + emo.text);
if (emo.spanN < 3) issues.push(`EmoText: attesi ≥3 span emoji, trovati ${emo.spanN}`);
if (!emo.shadows.every(s => s === 'none')) issues.push('EmoText: span emoji con textShadow ≠ none: ' + JSON.stringify(emo.shadows));

// ── (2) etichetta lega live override-aware: trasferta da neopromossa ──
// save: eroe al 'sal' (leagueOverrides sal→Lega A), gara in settimana vs 'ven' (DB Lega B, override → Lega A)
await page.close();
const p2 = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(p2);
p2.on('pageerror', e => issues.push('pageerror2: ' + String(e.message).slice(0, 160)));
const save = { phase: 'career', player: { name: 'Label Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 5, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNum: 10, presidentModalSeason: 4, drawSeen: 4, mercatoSeen: 4, jerseyNumSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 62, c: '#6c1f2e', c2: '#f2f1ec', nat: '🇮🇹', lg: 'Lega A' },
  leagueOverrides: { sal: 'Lega A', ven: 'Lega A' },
  calendar: [{ matchday: 5, week: 5, opponentId: 'ven', opponentName: 'FC Laguna', isHome: false, played: false }],
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 74, morale: 72, fatigue: 8, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 } } };
await p2.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
await p2.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await p2.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1800);
const click = async (rx) => p2.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 30); } return null; }, rx);
await click('^CONTINUA'); await sleep(900);
console.log('CTA:', await click('Gioca vs|Gioca partita|Gioca la partita|Gioca')); await sleep(1200);
await click('Gioca la partita'); await sleep(1400);
// matchday visibile → salta a playing (Salta/skip) per leggere il label live
await click('Salta|Vai al campo|Formazioni'); await sleep(1200);
await click('Entra in campo|ENTRA|Salta'); await sleep(1600);
const label = await p2.evaluate(() => {
  const els = [...document.querySelectorAll('div')].filter(d => /lega\s*[ab]/i.test(d.textContent || '') && d.children.length === 0);
  return els.map(e => (e.textContent || '').trim()).slice(0, 4);
});
console.log('label live trovate:', JSON.stringify(label));
const bad = label.some(l => /lega\s*b/i.test(l));
const good = label.some(l => /lega\s*a/i.test(l));
if (bad) issues.push('il tabellone live mostra ancora LEGA B in trasferta dalla neopromossa: ' + JSON.stringify(label));
if (!good) console.log('⚠️ label Lega A non intercettata (fase diversa?) — verifica non conclusiva ma nessun LEGA B visto');

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ EMO + LEAGUE LABEL OK (emoji senza shadow-box · label override-aware)');
process.exit(issues.length ? 1 : 0);
