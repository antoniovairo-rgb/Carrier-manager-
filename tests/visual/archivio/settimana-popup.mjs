/* [23/09 POC] POP-UP DELLA SETTIMANA nel Modal del kit: impulso, spogliatoio (con figurina del compagno), settimana vissuta.
   Misura: pannello = Modal (raggio/ombra token), bottoni scelta >= 44 px, testo dentro il pannello. CPM_ROSSO=__CPM_NO_IMPULSO23. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'settimana'); fs.mkdirSync(out, { recursive: true });
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
for (const t of ['impulso', 'spogliatoio', 'vissuta']) {
  await page.evaluate((t) => window.__CPM_CAREER.apriSettimana(t), t); await sleep(1200);
  R[t] = await page.evaluate(() => { const m = document.querySelector('[data-cpm=settimana23]'); const pan = m ? m.parentElement.parentElement : null;
    const btn = [...document.querySelectorAll('button')].filter(b => b.offsetParent && b.getBoundingClientRect().top > 100 && /Accetto|Resto|Chiedo|Stasera|Ho capito|Capito|OK|Avanti/i.test(b.textContent));
    return { standard: !!m, raggio: pan ? getComputedStyle(pan).borderRadius : null, figurina: !!(m && m.querySelector('[data-cpm-figurina]')), bottoniMinH: btn.map(b => Math.round(b.getBoundingClientRect().height)) }; });
  await page.screenshot({ path: path.join(out, `${t}${TAG}.png`) });
  await page.evaluate(() => { try { window.__CPM_CAREER.apriSettimana && null; } catch (_e) {} });
}
R.errori = err; await browser.close(); await new Promise(r => server.close(r));
fs.writeFileSync(path.join(out, `settimana${TAG}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
