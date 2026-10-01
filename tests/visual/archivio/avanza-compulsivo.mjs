/* [24/09 POC] FRENO ALL'AVANZAMENTO COMPULSIVO: 20 tocchi sul tasto «Avanza» in 4 s (anche SOTTO le finestre, via dispatch diretto:
   il caso peggiore). Misura: settimane avanzate, tocchi frenati, finestre saltate. CPM_ROSSO=__CPM_NO_FRENO23 */
const ROSSO = process.env.CPM_ROSSO || '', TAG = ROSSO ? '-rosso' : '';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'freno'); fs.mkdirSync(out, { recursive: true });
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript((r) => { if (r) window[r] = true; const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: 'u18', season: 1, week: 3, age: 17, ovr: 66,
  club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
  stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 }, form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, ROSSO);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab), { timeout: 25000 }).catch(() => {});
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(1200);
const stato = () => page.evaluate(() => { let m = null; try { const s = JSON.parse(localStorage.getItem('cpm-v3')); m = { week: s.player.week, lived: !!s.player.weekLived, played: (s.player.matchHistory || []).length }; } catch (_e) {}
  const dlg = document.querySelectorAll('[role="dialog"],[aria-modal="true"]').length; return { sett: m && m.week, vissuta: m && m.lived, partite: m && m.played, dialoghi: dlg, freno: window.__CPM_FRENO23 | 0, promptPartita: /Gioca la partita/.test(document.body.innerText), tasto: !!document.querySelector('[data-cpm="avanza23"]') }; });
const R = { rosso: ROSSO || null, prima: await stato(), tocchi: [] };
for (let i = 0; i < 20; i++) { const ok = await page.evaluate(() => { const b = document.querySelector('[data-cpm="avanza23"]'); if (!b) return false; b.click(); return true; });
  await sleep(200); if (i % 5 === 4) R.tocchi.push({ i: i + 1, ok, ...(await stato()) }); }
R.dopo = await stato(); await page.screenshot({ path: path.join(out, `freno${TAG}.png`) });
R.errori = err; await browser.close(); await new Promise(r => server.close(r)); console.log(JSON.stringify(R));
