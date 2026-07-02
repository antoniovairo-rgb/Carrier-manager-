#!/usr/bin/env node
/* [6.1.0 ARC-19/§11] SUITE DI NON-REGRESSIONE CARRIERA — il test «N stagioni» reso possibile
   dall'harness __CPM_CAREER (hook test-only in CareerApp che chiama gli handler VERI:
   liveCurrentWeek → simulateAndAdvance/doAdvanceWeek → doStartNewSeason).
   Simula ~2 stagioni complete asserendo gli invarianti del charter §11:
   settimane monotone, rollover stagione, classifica 18 righe con GF=GA, banca ≥0,
   OVR in range, zero pageerror. Non-gate; eseguibile con: node career-sim-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: { name: 'Sim Carriera', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);

const issues = [], log = [];
let prev = null, seasonsDone = 0, iter = 0, stuck = 0;
const MAX_ITER = 400, TARGET_SEASONS = 2;

while (iter++ < MAX_ITER && seasonsDone < TARGET_SEASONS) {
  const r = await page.evaluate(() => {
    const C = window.__CPM_CAREER; if (!C) return null;
    const res = C.step(); C.dismiss();
    return { res, st: C.get() };
  });
  if (!r) { issues.push('harness sparito a iter ' + iter); break; }
  const { res, st } = r;
  if (res === 'seasonEnd') {
    const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
    if (ok !== true) issues.push('startNewSeason fallita: ' + ok);
    seasonsDone++; log.push(`— rollover stagione ${st.season}→${st.season + 1} (iter ${iter})`);
    await sleep(900);
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    prev = null; continue;
  }
  if (res && res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (res && res.startsWith('error:')) { issues.push(`step ${iter} S${st.season}W${st.week}: ${res}`); break; }
  // invarianti
  if (st.standingsN !== 18) issues.push(`S${st.season}W${st.week}: standings ${st.standingsN}≠18`);
  if (st.gf !== st.ga) issues.push(`S${st.season}W${st.week}: somma GF ${st.gf} ≠ GA ${st.ga}`);
  if (st.bank < 0) issues.push(`S${st.season}W${st.week}: banca negativa ${st.bank}`);
  if (!(st.ovr >= 40 && st.ovr <= 99)) issues.push(`S${st.season}W${st.week}: OVR fuori range ${st.ovr}`);
  if (prev && st.season === prev.season && st.week < prev.week) issues.push(`S${st.season}: week regredita ${prev.week}→${st.week}`);
  if (prev && st.season === prev.season && st.week === prev.week && st.lived === prev.lived) { stuck++; if (stuck > 6) { issues.push(`BLOCCO a S${st.season}W${st.week} (res=${res})`); break; } }
  else stuck = 0;
  prev = st;
  if (issues.length > 12) break;
  await sleep(140);
}
const fin = await page.evaluate(() => window.__CPM_CAREER.get());
console.log('══ CAREER-SIM · ' + seasonsDone + ' stagioni simulate in ' + iter + ' step ══');
log.forEach(l => console.log('  ' + l));
console.log(`  stato finale: S${fin.season} W${fin.week} · OVR ${fin.ovr} · ${fin.goals} gol/${fin.matches} presenze · banca ${Math.round(fin.bank / 1000)}k€ · contratto ${fin.contractDur} anni`);
console.log(`  pageerrors: ${errors.length}${errors.length ? ' → ' + errors[0] : ''}`);
issues.slice(0, 12).forEach(i => console.log('  ✗ ' + i));
const pass = issues.length === 0 && errors.length === 0 && seasonsDone >= TARGET_SEASONS;
console.log(pass ? '\n✅ CARRIERA OK — invarianti tenuti su ' + seasonsDone + ' stagioni' : '\n❌ CARRIERA FAIL');
await browser.close(); srv.close();
process.exit(pass ? 0 : 1);
