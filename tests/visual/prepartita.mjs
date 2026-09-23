/* [23/09 POC] PRE-PARTITA: testata, analisi, formazioni, ingresso in campo (foto). CPM_ROSSO=__CPM_NO_PREMATCH23 / __CPM_NO_SCOUT23 */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, '..', 'character-lab', 'prepartita'); fs.mkdirSync(out, { recursive: true });
const ROSSO = process.env.CPM_ROSSO || '', TAG = ROSSO ? '-rosso' : '';
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript((r) => { window.__CPM_CAMT767ON = true; if (r) window[r] = true;
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
R.pre = await page.evaluate(() => ({ standard: !!document.querySelector('[data-cpm=prepartita23]'), larghezza: document.documentElement.scrollWidth }));
await page.screenshot({ path: path.join(out, `prepartita${TAG}.png`), fullPage: true });
try { await page.getByText(/Analisi completa/).first().click({ timeout: 4000 }); await sleep(1200); R.scout = await page.evaluate(() => !!document.querySelector('[data-cpm=scout23]')); await page.screenshot({ path: path.join(out, `analisi${TAG}.png`), fullPage: true });
  await page.getByText(/Entra in campo|Capito/).first().click({ timeout: 4000 }); await sleep(800); } catch (e) { R.scoutErr = String(e.message).slice(0, 80); }
try { await page.getByRole('button', { name: /Formazioni/ }).first().click({ timeout: 4000 }); await sleep(1800); await page.screenshot({ path: path.join(out, `formazioni${TAG}.png`), fullPage: true });
  await page.getByText(/Ingresso in campo/).first().click({ timeout: 4000 }); R.audit = null; R.ingresso = []; for (let k = 0; k < 10; k++) { await sleep(900); R.ingresso.push(await page.evaluate(() => { try { return { att: (() => { try { const a = window.__CPM_CGTRADER_ACTORS_AUDIT && window.__CPM_CGTRADER_ACTORS_AUDIT(); return a ? (a.actors || a).slice(0, 3).map(x => JSON.stringify(x).slice(0, 260)) : null; } catch (e) { return String(e).slice(0, 80); } })(), cam: window.__CPM_CAMT767 || null, st: window.__CPM_HYPER_CASUAL_STATUS, audit: (window.__CPM_CGTRADER_SCALE_AUDIT || []).length, masc: window.__CPM_HYPER_MASCOTS || null, pol: window.__CPM_HYPER_INTRO_POLICY || null, fase: window.__CPM_PHASE && window.__CPM_PHASE() }; } catch (e) { return null; } })); await page.screenshot({ path: path.join(out, `ingresso-${k}${TAG}.png`) }); }
R.led = await page.evaluate(() => window.__CPM_LED23 || null);
R.bimbi = await page.evaluate(() => window.__CPM_BIMBI23_H || null);
R.audit = await page.evaluate(() => (window.__CPM_CGTRADER_SCALE_AUDIT || []).slice(0, 4));
R.cam = await page.evaluate(() => { try { return window.__CPM_CAMPOS ? window.__CPM_CAMPOS() : null; } catch (e) { return null; } }); } catch (e) { R.formErr = String(e.message).slice(0, 80); }
R.errori = err; await browser.close(); await new Promise(r => server.close(r));
fs.writeFileSync(path.join(out, `settimana${TAG}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
