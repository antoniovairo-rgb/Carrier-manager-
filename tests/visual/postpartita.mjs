/* [23/09 POC] POST-PARTITA di carriera: figurine di mister, protagonista, migliore in campo */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'postpartita'); fs.mkdirSync(out, { recursive: true });
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
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(500);
for (let k = 0; k < 6; k++) { R.play = await page.evaluate(() => window.__CPM_CAREER.playMatch()); if (R.play === true) break; try { await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); } catch (_e) {} await sleep(800); }
R.aperta = await page.waitForFunction(() => !!document.querySelector('[data-cpm=prepartita23]') || /OSPITE|Ospite/.test(document.body.innerText || ''), null, { timeout: 40000 }).then(() => true).catch(() => false);
await sleep(1500);
await page.evaluate(() => { try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
await page.getByRole('button', { name: /Entra subito/ }).first().click({ timeout: 6000 });
await sleep(1500); await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7 })).catch(() => {});
const t0 = Date.now(); let hl = 0;
while (Date.now() - t0 < 300000) { const f = await page.evaluate(() => window.__CPM_PHASE?.() || null).catch(() => null); if (f === 'ended') break;
  if (f === 'hl_choose') { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k % 3), hl++).catch(() => {}); await sleep(1500); }
  if (f === 'hl_result') { await sleep(2000); await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => /Continua/i.test(y.textContent || '')); if (x) x.click(); }).catch(() => {}); }
  await sleep(400); }
await sleep(3000);
R.fine = await page.evaluate(() => ({ fase: window.__CPM_PHASE?.(), motm: !!document.querySelector('[data-cpm=motm23]'), figurine: document.querySelectorAll('[data-cpm-figurina]').length }));
await page.evaluate(() => { const m = document.querySelector('[data-cpm=motm23]'); if (m) m.scrollIntoView({ block: 'center' }); }); await sleep(500);
await page.screenshot({ path: path.join(out, `post-motm${TAG}.png`) });
await page.evaluate(() => { const m = [...document.querySelectorAll('div')].find(d => /dopo la partita/i.test(d.textContent || '') && d.children.length === 0); if (m) m.scrollIntoView({ block: 'center' }); }); await sleep(500);
await page.screenshot({ path: path.join(out, `post-mister${TAG}.png`) });
await page.evaluate(() => { const m = [...document.querySelectorAll('div')].find(d => /^Tabellino della gara$/i.test((d.textContent || '').trim())); if (m) m.scrollIntoView({ block: 'start' }); }); await sleep(500);
R.numeri = await page.evaluate(() => { const h = [...document.querySelectorAll('div')].find(d => /^IL TUO TABELLINO IN NUMERI$/.test((d.textContent || '').trim())); const g = h && h.nextElementSibling; return g ? g.innerText.replace(/\n+/g, ' | ') : null; });
R.eroeBrain = await page.evaluate(() => { try { return null; } catch (e) { return null; } });
R.voci = await page.evaluate(() => ['Azioni dalle fasce', 'Cross', 'Dribbling riusciti'].map(t => document.body.innerText.includes(t)));
await page.screenshot({ path: path.join(out, `post-tabellino${TAG}.png`) });
R.errori = err; await browser.close(); await new Promise(r => server.close(r));
fs.writeFileSync(path.join(out, `settimana${TAG}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
