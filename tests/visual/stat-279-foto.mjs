import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'stat-279'); fs.mkdirSync(OUT, { recursive: true });
const ROSSO = process.env.CPM_ROSSO || '', BERS = process.env.CPM_OPP || 'FC Goldwald';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); const page = await ctx.newPage(); await installCdnRoutes(page);
let armato = true; await ctx.route(/\.glb(\?|$)/, async r => { if (armato) await sleep(9000); try { await r.continue(); } catch (e) {} });
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.addInitScript(([r]) => { window.__CPM_GLB = true; if (r) window[r] = 1; if (localStorage.getItem('cpm-v3')) return;
  localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: { name: 'Marco Vairo', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 1, age: 24, ovr: 78, tutorialDone: true,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 89, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 78, tecnica: 77, fisico: 74, 'mentalità': 76, tiro: 80, passaggio: 75, dribbling: 77, posizionamento: 93 },
    form: 74, morale: 72, fatigue: 10, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 }, goals: 0, assists: 0, matches: 0, totalGoals: 97, totalAssists: 48, totalMatches: 98,
    history: [{ season: 1, club: 'FC Goldwald', clubId: 'bvb', goals: 12, assists: 4, matches: 30 }, { season: 2, club: 'FC Goldwald', clubId: 'bvb', goals: 8, assists: 5, matches: 20 }, { season: 3, club: 'FC Werkstadt', clubId: 'b04', goals: 15, assists: 9, matches: 34 }] } })); }, [ROSSO]);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
for (let i = 0; i < 12; i++) { const md = await page.evaluate(() => { window.__CPM_CAREER.dismiss(); return window.__CPM_CAREER.thisWeekMd(); });
  if (md && md.opp === BERS && (await page.evaluate(() => window.__CPM_CAREER.get().lived)) === false) break;
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.step(); C.dismiss(); }); await sleep(900); }
armato = true;
console.log('playMatch', await page.evaluate(() => window.__CPM_CAREER.playMatch()));
const t0 = Date.now(); let fatto = false;
while (Date.now() - t0 < 90000) { const tx = await page.evaluate(() => { const e = document.querySelector('[data-cpm="attesa241"]'); return e ? e.innerText : null; });
  if (tx) { await sleep(300); await page.screenshot({ path: path.join(OUT, `foto-${ROSSO ? 'rosso' : 'verde'}-${BERS.replace(/\W+/g, '')}.png`) }); console.log('riquadro: ' + tx.replace(/\n/g, ' · ')); fatto = true; break; }
  const ph = await page.evaluate(() => [window.__CPM_PHASE && window.__CPM_PHASE(), window.__CPM_CORPI232 && JSON.stringify(window.__CPM_CORPI232())]); if ((Date.now()-t0) % 5000 < 200) console.log(ph);
  if (ph[0] === 'matchday') { try { await page.getByText('Salta', { exact: false }).first().click({ timeout: 2000 }); } catch (e) {} }
  await sleep(150); }
console.log('foto', fatto, 'errori', errs.slice(0, 2));
await b.close(); srv.close();
