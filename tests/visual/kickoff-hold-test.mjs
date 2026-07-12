#!/usr/bin/env node
/* [7.9.3 direttiva PO «basta burattini»] TEST PERMANENTE — KICKOFF HOLD: con GLB LENTO (footballer.glb
   ritardato 22s via route, service worker BLOCCATO perché servirebbe i GLB bypassando le route) la partita
   NON parte: overlay «Verso il fischio d'inizio» + clock congelato a 0'; all'aggancio del CH38 (~1s di
   transizione) il fischio arriva e il clock corre. Partita REALE senza ?cpmtest=1 (trattenuta spenta in
   test-mode). Esecuzione: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node kickoff-hold-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 900 }, serviceWorkers: 'block' });/* il SW serviva i GLB bypassando le route → impossibile simulare la rete lenta */
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
// GLB del corpo servito con ~10s di ritardo (rete mobile lenta simulata); le clip anim passano normali.
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const GLB = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../assets/footballer.glb');
let glbServedAt = 0; const t0 = Date.now(); const glbLog = [];
await page.route('**/footballer.glb*', async (route) => {
  glbLog.push('req@' + Math.round((Date.now() - t0) / 1000) + 's');
  await sleep(22000);
  glbServedAt = Date.now() - t0;
  glbLog.push('served@' + Math.round(glbServedAt / 1000) + 's');
  try { route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: fs.readFileSync(GLB) }); } catch (e) { glbLog.push('ERR ' + e.message.slice(0, 60)); route.abort(); }
});
page.on('request', r => { if (r.url().includes('.glb')) glbLog.push('URL ' + r.url().split('/').slice(-2).join('/')); });
page.on('console', m => { const t = m.text(); if (/CPM-GLB|CPM-HOLD/i.test(t)) console.log('BROWSER:', t.slice(0, 140)); });
await page.addInitScript(() => {
  let _v; const _log = []; window.__READY_LOG = _log;
  Object.defineProperty(window, '__CPM_GLB_READY', { configurable: true, get: () => _v, set: (x) => { _v = x; _log.push({ v: x, t: Math.round(performance.now()), st: ((new Error().stack || '').split('\n')[2] || '').slice(0, 80) }); } });
  const save = { phase: 'career', player: { name: 'Hold Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 2, age: 21, ovr: 74, tutorialDone: true, weekLived: true,
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 74, tiro: 76, passaggio: 73, dribbling: 75, posizionamento: 74 },
    form: 72, morale: 74, fatigue: 12, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1800);
const click = async (rx) => page.evaluate((s) => { const r = new RegExp(s, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 30); } return null; }, rx);

// campiona READY già dal boot (pre-match): quando/chi lo setta?
const boot=[];for(let i=0;i<10;i++){boot.push(await page.evaluate(()=>window.__CPM_GLB_READY));await sleep(500);}
console.log('READY al boot (0-5s):',boot.join(','));
console.log('continua:', await click('^CONTINUA')); await sleep(1000);
console.log('gioca:', await click('Gioca vs')); await sleep(1200);
console.log('gioca la partita:', await click('Gioca la partita')); await sleep(1200);
console.log('nav:', await click('Entra in campo|Salta|SALTA')); await sleep(600);
console.log('nav2:', await click('Salta|SALTA'));
// campiona per 24s: overlay presente? minuto del clock?
const samples = [];
for (let t = 0; t < 30; t += 0.6) {
  const s = await page.evaluate(() => {
    const _vis=(el)=>el&&el.offsetParent!==null;
    const hold=[...document.querySelectorAll('div')].some(el=>_vis(el)&&(el.textContent||'').trim()==='Verso il fischio d\u2019inizio'.replace('\u2019','\u0027'))||[...document.querySelectorAll('div')].some(el=>_vis(el)&&/^Verso il fischio d.inizio$/i.test((el.textContent||'').trim()));
    const ready=window.__CPM_GLB_READY;
    // clock: il chip del minuto in testata è un elemento il cui testo è ESATTAMENTE "N'"
    let min = null;
    for (const el of document.querySelectorAll('div,span')) { const t = (el.textContent || '').trim(); const m = /^(\d{1,2})'$/.exec(t); if (m) { min = +m[1]; break; } }
    return { hold, min, ready };
  });
  samples.push({ t:Math.round(t*10)/10, ...s }); if(false)await page.screenshot({path:'/tmp/claude-0/-home-user-Carrier-manager-/a3b10e06-a091-53c6-a479-b4aa1dffc92e/scratchpad/hold-t10.png'});
  await sleep(600);
}
console.log('glb log:', glbLog.join(' · ') || 'NESSUNA richiesta GLB');
console.log('READY_LOG:', JSON.stringify(await page.evaluate(() => window.__READY_LOG)));
samples.forEach(s => console.log(`t=${s.t}s hold=${s.hold} min=${s.min} ready=${s.ready}`));
const early = samples.filter(s => s.ready===false), late = samples.filter(s => s.ready===true);
const sawHold = early.some(s => s.hold);
const _minsEarly=early.filter(s=>s.min!=null).map(s=>s.min);const clockFrozeEarly=_minsEarly.length===0||( Math.max(..._minsEarly)-Math.min(..._minsEarly)<=1);
const _minsLate=late.filter(s=>s.min!=null).map(s=>s.min);const clockRanLate=_minsLate.length>=2&&Math.max(..._minsLate)>Math.min(..._minsLate);
const holdCleared = samples.slice(-5).every(s => !s.hold) && late.filter(s => s.hold).length <= 4;/* lo sblocco ha cadenza 400ms → tollera ~2s di transizione dopo l'aggancio */
const issues = [];
if (!sawHold) issues.push('overlay di trattenuta MAI apparso con GLB lento');
if (!clockFrozeEarly) issues.push('il clock è avanzato DURANTE la trattenuta');
if (!clockRanLate) issues.push('il clock non è ripartito dopo l\'aggancio GLB');
if (!holdCleared) issues.push('overlay ancora presente a fine probe');
if (errors.length) issues.push('pageerror: ' + errors[0]);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ KICKOFF HOLD OK — niente partita coi burattini, fischio al CH38 pronto');
await browser.close(); srv.close();
process.exit(issues.length ? 1 : 0);
