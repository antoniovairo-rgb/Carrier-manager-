#!/usr/bin/env node
/* [7.999.23] GUARDIANO — I NUMERI DELLA HOME NON PRENDONO TROPPO SPAZIO (collaudo PO: «numeri da restringere, prendono
   troppo spazio»: «Gol e assist 26 · 10» andava su due righe e il riquadro stagione usava cifre da 32 px). Salvataggio sintetico
   con 26 gol e 10 assist, telefono 360 e 412 px: verde se il valore «26 · 10» sta su UNA riga (altezza < 1,6 volte il corpo) e
   nessuna cifra della home supera i 24 px. CPM_ROSSO=1 → __CPM_NO_NUM23: devono tornare le cifre grandi. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const out = []; const E = [];
for (const w of [360, 412]) {
  const page = await browser.newPage({ viewport: { width: w, height: 915 } }); await installCdnRoutes(page);
  page.on('pageerror', e => E.push(String(e.message).slice(0, 140)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_NUM23 = true;
    const save = { phase: 'career', player: { name: 'Test Numeri', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 20, age: 24, ovr: 80,
      tutorialDone: true, hasAgent: true, bankBalance: 500000, popularity: 50, coachTrust: 60, goals: 26, assists: 10, matches: 19, form: 70,
      club: { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 88, c: '#111', c2: '#fff', nat: '🇮🇹', lg: 'Lega A' },
      stats: { 'velocità': 78, tecnica: 78, fisico: 78, 'mentalità': 78, tiro: 78, passaggio: 78, dribbling: 78, posizionamento: 78 },
      calendar: [], standings: [], matchHistory: [], worldMemory: [], contract: { duration: 3, wage: 40000, expiresAtSeason: 6 }, log: [] } };
    localStorage.setItem('cpm-v3', JSON.stringify(save)); }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(2500);
  const m = await page.evaluate(() => { const nums = [...document.querySelectorAll('.cpm-num')].filter(e => e.offsetParent);
    const ga = nums.find(e => /^26\s·\s10$/.test(e.textContent.trim()));
    const r = ga ? { h: ga.getBoundingClientRect().height, fs: parseFloat(getComputedStyle(ga).fontSize) } : null;
    const big = nums.map(e => ({ t: e.textContent.trim().slice(0, 12), fs: parseFloat(getComputedStyle(e).fontSize) })).filter(x => x.fs > 24);
    return { ga: r, big }; });
  out.push({ w, ...m }); await page.close();
}
await browser.close(); srv.close();
console.log(JSON.stringify(out), 'errori pagina', E.length);
const fails = [];
for (const o of out) { if (!o.ga) fails.push(`${o.w}px: «26 · 10» non trovato`); else if (o.ga.h > o.ga.fs * 1.6) fails.push(`${o.w}px: «26 · 10» a capo (alto ${o.ga.h.toFixed(0)} px, corpo ${o.ga.fs})`);
  if (o.big.length) fails.push(`${o.w}px: cifre sopra i 24 px: ${JSON.stringify(o.big.slice(0, 4))}`); }
if (E.length) fails.push('errori di pagina: ' + E[0]);
if (ROSSO) { const ok = fails.some(f => /24 px|a capo/.test(f)); console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.23 tornano le cifre grandi' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL numeri-home\n  ' + fails.join('\n  ') : '✅ PASS numeri-home'); process.exit(fails.length ? 1 : 0);
