/* [23/09 POC] OPZIONI: gli strumenti (copia riepilogo, collaudo, rivedi intro, esporta) stanno in Opzioni; il Profilo non ha piu' «Impostazioni». */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'opzioni'); fs.mkdirSync(out, { recursive: true });
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript(() => { const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 66,
  club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
  stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 }, form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} });
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab), { timeout: 25000 }).catch(() => {});
await page.evaluate(() => window.__CPM_CAREER.goTab('profile')); await sleep(1000);
const R = {}; R.profiloImpostazioni = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Impostazioni/.test(b.textContent) && b.offsetParent && !b.title));
await page.locator('button[title="Impostazioni"]').first().click(); await sleep(1000);
R.opzioni = await page.evaluate(() => { const s = document.querySelector('[data-cpm=strumenti23]'); return s ? [...s.querySelectorAll('button')].map(b => b.textContent.trim().slice(0, 40)) : null; });
await page.evaluate(() => { const s = document.querySelector('[data-cpm=strumenti23]'); s && s.scrollIntoView(); }); await sleep(400);
await page.screenshot({ path: path.join(out, 'opzioni.png') });
R.errori = err; await browser.close(); await new Promise(r => server.close(r)); console.log(JSON.stringify(R));
