/* [23/09 POC] STAGIONE: Tabs del kit, tendina delle leghe, Gioca primario. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'stagione-tab'); fs.mkdirSync(out, { recursive: true });
const ROSSO = process.env.CPM_ROSSO || '', TAG = ROSSO ? '-rosso' : '';
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript((r) => { if (r) window[r] = true;
  const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 66, jerseyNum: 77,
    club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
    teammates: [{ name: 'Rocco Landi', archetype: 'mentor', icon: '🧠' }],
    stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 },
    form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, ROSSO);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriSettimana), { timeout: 25000 }).catch(() => {});
try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); await sleep(500); } catch (_e) {}
const R = { rosso: ROSSO || null };
for (const t of ['standings', 'calendar']) {
  await page.evaluate((t) => window.__CPM_CAREER.goTab(t), t); await sleep(1200);
  R[t] = await page.evaluate(() => { const sel = document.querySelector('[data-cpm=lega23]'); const g = [...document.querySelectorAll('button')].find(b => /^Gioca/.test((b.textContent || '').trim()));
    return { tendina: !!sel, opzioni: sel ? sel.options.length : 0, gioca: g ? { h: Math.round(g.getBoundingClientRect().height), bg: getComputedStyle(g).backgroundColor } : null, larghezzaPagina: document.documentElement.scrollWidth }; });
  await page.screenshot({ path: path.join(out, `${t}${TAG}.png`) });
}
for (const w of [412, 1100]) {
  await page.setViewportSize({ width: w, height: 915 }); await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(1000);
  R['cta' + w] = await page.evaluate(() => { const st = [...document.querySelectorAll('div')].find(d => getComputedStyle(d).position === 'sticky' && d.querySelector('button')); if (!st) return null;
    const r = st.getBoundingClientRect(), b = st.querySelector('button').getBoundingClientRect(); let c = st.nextElementSibling; while (c && c.getBoundingClientRect().width < 50) c = c.nextElementSibling; const cr = c ? c.getBoundingClientRect() : null;
    return { striscia: [Math.round(r.left), Math.round(r.right)], bottone: [Math.round(b.left), Math.round(b.right)], card: cr ? [Math.round(cr.left), Math.round(cr.right)] : null }; });
  await page.screenshot({ path: path.join(out, `dashboard-${w}${TAG}.png`) });
}
R.errori = err; await browser.close(); await new Promise(r => server.close(r));
fs.writeFileSync(path.join(out, `settimana${TAG}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
