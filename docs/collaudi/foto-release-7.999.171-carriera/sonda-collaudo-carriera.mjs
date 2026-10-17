// Sonda di collaudo non-3D — release 7.999.171 (carriera, GLB off). Solo lettura del gioco.
import fs from 'fs';
import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '/home/user/Carrier-manager-/tests/visual/lib/harness.mjs';

const OUT = '/home/user/Carrier-manager-/docs/collaudi/foto-release-7.999.171-carriera';
fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const report = { errors: [], steps: [], texts: {}, screens: [] };

async function newPage(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await installCdnRoutes(page);
  page.on('pageerror', e => report.errors.push(String(e.message).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + String(m.text()).slice(0, 160)); });
  return page;
}
async function shot(page, name) { await page.screenshot({ path: path.join(OUT, name), fullPage: false }); report.screens.push(name); }
async function visibleText(page) { return page.evaluate(() => document.body.innerText || ''); }
async function overflowInfo(page) {
  return page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
}

// ---------- 1. CARRIERA 3 SETTIMANE (412x915) ----------
const page = await newPage(412, 915);
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: { name: 'Collaudo Carriera', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { report.steps.push('CONTINUA non cliccato: ' + e.message.slice(0, 80)); }
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);
await page.evaluate(() => window.__CPM_CAREER.dismiss());
await sleep(500);
await shot(page, '01-carriera-inizio-412.png');
report.texts.inizio = await visibleText(page);

const snap = () => page.evaluate(() => { const C = window.__CPM_CAREER; const g = C.get(); return g; });
const s0 = await snap();
report.steps.push({ w0: { season: s0.season, week: s0.week, standingsN: s0.standingsN, gf: s0.gf, ga: s0.ga } });

let weeksDone = 0, lastWeek = s0.week, lastLabel = null;
for (let i = 1; weeksDone < 3 && i <= 30; i++) {
  let res = null;
  for (let k = 0; k < 40; k++) {
    res = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
    if (res && String(res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
    break;
  }
  const after = await snap();
  if (after.week !== lastWeek) { weeksDone++; lastWeek = after.week; }
  report.steps.push({ passo: i, res, w: after.week, weeksDone });
  await sleep(700);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await sleep(400);
  const st = await snap();
  report.steps.push({ settimana: i, res, season: st.season, week: st.week, standingsN: st.standingsN, gf: st.gf, ga: st.ga, bank: st.bank, lived: st.lived });
  await shot(page, `s${String(i).padStart(2,"0")}-dopo-passo-${i}-412.png`);
  report.texts[`settimana${i}`] = await visibleText(page);
}

// ---------- 1b. Schede calendario / classifica / profilo ----------
for (const t of ['calendar', 'standings', 'profile']) {
  const r = await page.evaluate(t => window.__CPM_CAREER.goTab(t), t);
  await sleep(900);
  await shot(page, `20-tab-${t}-412.png`);
  report.texts['tab_' + t] = await visibleText(page);
  report.steps.push({ tab: t, goTab: r, overflow: await overflowInfo(page) });
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
}
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard'));
await sleep(600);

// ---------- 2. Overflow a 360 px della pagina carriera ----------
await page.setViewportSize({ width: 360, height: 780 });
await sleep(600);
report.overflow360_carriera = await overflowInfo(page);
await shot(page, '05-carriera-360.png');

await page.close();

// ---------- 3. HOME: Crediti a 412 e 360 ----------
for (const w of [412, 360]) {
  const hp = await newPage(w, w === 412 ? 915 : 780);
  await hp.addInitScript(() => { window.__CPM_GLB = false; localStorage.clear(); });
  await hp.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
  await hp.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  await shot(hp, `10-home-${w}.png`);
  report.texts[`home${w}`] = await visibleText(hp);
  try {
    await hp.getByText('Crediti', { exact: false }).first().click({ timeout: 6000 });
    await sleep(900);
    await shot(hp, `11-crediti-${w}.png`);
    report.texts[`crediti${w}`] = await visibleText(hp);
    report.overflowCrediti = report.overflowCrediti || {};
    report.overflowCrediti[w] = await overflowInfo(hp);
    report.crediti_pannello_scroll = await hp.evaluate(() => { const p = document.querySelector('[data-cpm="crediti238-pannello"]') || document.querySelector('[data-cpm="crediti238"]'); if (!p) return 'pannello non trovato'; return { sh: p.scrollHeight, ch: p.clientHeight, sw: p.scrollWidth, cw: p.clientWidth }; });
  } catch (e) { report.steps.push('Crediti non aperto a ' + w + ': ' + e.message.slice(0, 100)); }
  await hp.close();
}

fs.writeFileSync(path.join(OUT, 'dati-sonda.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ steps: report.steps, errors: report.errors.slice(0, 20), overflow360: report.overflow360_carriera, overflowCrediti: report.overflowCrediti, pannello: report.crediti_pannello_scroll, screens: report.screens }, null, 1));
await browser.close();
srv.close();
