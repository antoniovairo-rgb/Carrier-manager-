/* [23/09 POC] FIGURINE in Spogliatoio e La Stampa (conta le figurine nelle due card) */
const ROSSO = process.env.CPM_ROSSO || '', TAG = ROSSO ? '-rosso' : '';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'spogliatoio'); fs.mkdirSync(out, { recursive: true });
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript((r) => { if (r) window[r] = true; const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 66,
  teammates: [{ name: 'Dario Porcu', archetype: 'rival', bond: 40 }, { name: 'Rocco Landi', archetype: 'mentor', bond: 55 }, { name: 'Michele Giordano', archetype: 'friend', bond: 80 }], journalists: [{ id: 'j1', name: 'Davide Ricci', paper: 'Cifre del Calcio', type: 'critico', trust: 50 }, { id: 'j2', name: 'Sofia Esposito', f: true, paper: 'Diretta TV', type: 'fan', trust: 50 }], club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
  stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 }, form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, ROSSO);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab), { timeout: 25000 }).catch(() => {});
const R = { rosso: ROSSO || null };
for (const t of ['club', 'profile']) { await page.evaluate((t) => window.__CPM_CAREER.goTab(t), t); await sleep(1200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /La Stampa/.test(x.textContent)); if (b) b.click(); }); await sleep(600);
  R[t] = await page.evaluate(() => { const find = (re) => { const h = [...document.querySelectorAll('div,button')].find(d => d.children.length <= 2 && re.test((d.textContent || '').trim())); let c = h; for (let k = 0; k < 4 && c; k++) c = c.parentElement; return c ? c.querySelectorAll('[data-cpm-figurina]').length : null; };
    return { spogliatoio: find(/^Lo spogliatoio$/i), stampa: find(/^La Stampa/) }; });
  const el = await page.evaluate(() => { const h = [...document.querySelectorAll('div,button')].find(d => /^(Lo spogliatoio|La Stampa)/i.test((d.textContent || '').trim()) && d.children.length <= 2); if (h) h.scrollIntoView({ block: 'start' }); return !!h; });
  await sleep(400); await page.screenshot({ path: path.join(out, `${t}${TAG}.png`) }); }
R.errori = err; await browser.close(); await new Promise(r => server.close(r)); console.log(JSON.stringify(R));
