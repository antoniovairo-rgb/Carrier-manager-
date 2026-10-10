/* PROBE RILASCIO (punto 3): N>=3 stagioni con gli handler VERI (__CPM_CAREER),
   partendo da salvataggio NUOVO o da salvataggio VECCHIO (fixtures). Poi ricarica
   la pagina e confronta le chiavi del player prima/dopo: campi persi, errori di pagina. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const MODE = process.env.PROBE_SAVE || 'new';           // new | old
const TARGET = Number(process.env.PROBE_SEASONS || 3);
const FIX = new URL('./fixtures/' + (process.env.PROBE_FIX || 'save-194-primavera-w38.json'), import.meta.url);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
const oldSave = MODE === 'old' ? fs.readFileSync(FIX, 'utf8') : null;
await page.addInitScript(({ mode, oldSave }) => {
  window.__CPM_GLB = false;
  // seme UNA volta per tab: addInitScript rigira anche al reload e sovrascriveva il salvataggio
  if (sessionStorage.getItem('probe-seeded')) return; sessionStorage.setItem('probe-seeded', '1');
  if (mode === 'old') { localStorage.setItem('cpm-v3', oldSave); return; }
  const save = { phase: 'career', player: { name: 'Probe Rilascio', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, { mode: MODE, oldSave });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);
const issues = [], log = [];
let prev = null, seasonsDone = 0, iter = 0, stuck = 0;
const MAX_ITER = 900;
while (iter++ < MAX_ITER && seasonsDone < TARGET) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; if (!C) return null; const res = C.step(); C.dismiss(); return { res, st: C.get() }; });
  if (r && r.res === 'advanced' && await page.evaluate(() => window.__CPM_CAREER.screen()) === 'proTransition') {
    // transizione U18→pro: lo step non la conosce; la scelta la fa il giocatore (prima offerta non-U18)
    const btns = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => (b.innerText || '').trim()).filter(Boolean));
    if (process.env.PROBE_TRACE) console.log('  pulsanti proTransition: ' + btns.slice(0, 8).join(' | ').slice(0, 300));
    const ix = btns.findIndex(t => /firm|accett|scegli|sì|si,|prosegu|continu/i.test(t));
    const sel = ix >= 0 ? btns[ix] : btns[0];
    if (sel) { await page.getByRole('button', { name: sel, exact: false }).first().click({ timeout: 5000 }).catch(() => {}); }
    log.push(`transizione U18→pro: scelta «${(sel || '').slice(0, 60)}»`);
    await sleep(900); continue;
  }
  if (process.env.PROBE_BUMP && r && r.res === 'advanced' && prev && r.st.week === prev.week && r.st.season === prev.season) await page.evaluate(() => window.__CPM_CAREER.bump());
  if (!r) { issues.push('harness sparito a iter ' + iter); break; }
  const { res, st } = r;
  if (process.env.PROBE_TRACE && iter > 0) console.log(`  trace ${iter} res=${res} S${st.season}W${st.week} lived=${st.lived} gf=${st.gf} ga=${st.ga} screen=${await page.evaluate(() => window.__CPM_CAREER.screen())}`);
  if (res === 'seasonEnd') {
    const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
    if (ok !== true) issues.push('startNewSeason fallita: ' + ok);
    seasonsDone++; log.push(`rollover S${st.season}→S${st.season + 1} (iter ${iter}, GF=${st.gf} GA=${st.ga})`);
    await sleep(900); await page.evaluate(() => window.__CPM_CAREER.dismiss()); prev = null; continue;
  }
  if (res && res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (res && res.startsWith('error:')) { issues.push(`step ${iter} S${st.season}W${st.week}: ${res}`); break; }
  if (st.standingsN !== 18) issues.push(`S${st.season}W${st.week}: standings ${st.standingsN}≠18`);
  if (st.gf !== st.ga) issues.push(`S${st.season}W${st.week}: GF ${st.gf} ≠ GA ${st.ga}`);
  if (st.bank < 0) issues.push(`S${st.season}W${st.week}: banca negativa ${st.bank}`);
  if (!(st.ovr >= 40 && st.ovr <= 99)) issues.push(`S${st.season}W${st.week}: OVR fuori range ${st.ovr}`);
  if (prev && st.season === prev.season && st.week < prev.week) issues.push(`S${st.season}: week regredita ${prev.week}→${st.week}`);
  if (prev && st.season === prev.season && st.week === prev.week && st.lived === prev.lived) { stuck++; if (stuck > 6) { issues.push(`BLOCCO S${st.season}W${st.week} (res=${res})`); break; } } else stuck = 0;
  prev = st; if (issues.length > 12) break; await sleep(140);
}
// salvataggio/ricarica: chiavi del player prima e dopo un reload
const before = await page.evaluate(() => { try { return Object.keys(JSON.parse(localStorage.getItem('cpm-v3')).player || {}).sort(); } catch (e) { return ['ERR:' + e.message]; } });
const finBefore = await page.evaluate(() => window.__CPM_CAREER.get());
await page.reload({ waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 }).catch(() => issues.push('ricarica: harness non tornato'));
await sleep(1200);
const after = await page.evaluate(() => { try { return Object.keys(JSON.parse(localStorage.getItem('cpm-v3')).player || {}).sort(); } catch (e) { return ['ERR:' + e.message]; } });
const finAfter = await page.evaluate(() => window.__CPM_CAREER ? window.__CPM_CAREER.get() : null);
const lost = before.filter(k => !after.includes(k));
const gained = after.filter(k => !before.includes(k));
if (finAfter && (finAfter.season !== finBefore.season || finAfter.week !== finBefore.week)) issues.push(`ricarica: S${finBefore.season}W${finBefore.week} → S${finAfter.season}W${finAfter.week}`);
if (lost.length) issues.push(`campi persi al reload: ${lost.join(', ')}`);
const fin = finBefore;
console.log(`══ PROBE 3S · save=${MODE} · stagioni ${seasonsDone}/${TARGET} · step ${iter} ══`);
log.forEach(l => console.log('  ' + l));
console.log(`  stato: S${fin.season} W${fin.week} · OVR ${fin.ovr} · banca ${Math.round(fin.bank / 1000)}k€ · standings ${fin.standingsN}`);
console.log(`  chiavi player: prima ${before.length} · dopo reload ${after.length} · persi ${lost.length} · nuovi ${gained.length}`);
if (lost.length) console.log('  persi: ' + lost.join(', '));
if (gained.length) console.log('  nuovi dopo reload: ' + gained.join(', '));
console.log(`  pageerror: ${errors.length}${errors.length ? ' → ' + errors.slice(0, 3).join(' | ') : ''}`);
issues.slice(0, 12).forEach(i => console.log('  ✗ ' + i));
const pass = issues.length === 0 && errors.length === 0 && seasonsDone >= TARGET;
console.log(pass ? '✅ PROBE 3S OK' : '❌ PROBE 3S FAIL');
await browser.close(); srv.close(); process.exit(pass ? 0 : 1);
