/* sonda fotografica del gala' (sola lettura): apre il gala' col varco apriGala, arriva al vincitore del primo premio e fotografa.
   CPM_INIT = bracci (es. window.__CPM_NO946=true per riaccendere i corpi) · CPM_TAG = prefisso delle foto. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const TAG = process.env.CPM_TAG || 'gala', OUT = '/home/user/cm-poc/docs/collaudo-testi/gala';
import fs from 'fs'; fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript(() => { const save = { phase: 'career', player: { name: 'Marco Carrasco', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93,
  club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
  stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000,
  contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } }; try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} });
if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala), null, { timeout: 25000 }).catch(() => {});
await page.evaluate(() => window.__CPM_CAREER.apriGala()); await sleep(6000);
await page.screenshot({ path: `${OUT}/${TAG}-1-busta.png` });
const clic = async (t) => { try { await page.getByText(t, { exact: false }).first().click({ timeout: 5000 }); return true; } catch (_e) { return false; } };
await clic('Apri la busta'); await sleep(1500);
if (await page.evaluate(() => !!document.querySelector('[data-cpm="gala51"]'))) {
  for (const [k, ms] of [[2, 4000], [3, 10000], [4, 16000]]) { await sleep(ms - (k === 2 ? 0 : k === 3 ? 4000 : 10000)); await page.screenshot({ path: `${OUT}/${TAG}-${k}-momento.png` }); }
  console.log('testimone', JSON.stringify(await page.evaluate(() => window.__CPM_GALA51 || null)));
  if (await clic('Gli altri premi')) { await sleep(2500); await page.screenshot({ path: `${OUT}/${TAG}-5-riepilogo.png` }); }
  await clic('Vai al bilancio'); await sleep(2000); await page.screenshot({ path: `${OUT}/${TAG}-6-dopo.png`, fullPage: false });
} else { await clic('Il secondo posto'); await sleep(1500); await clic('e il vincitore'); await sleep(2500);
  await page.screenshot({ path: `${OUT}/${TAG}-2-vincitore.png` }); await sleep(5000); await page.screenshot({ path: `${OUT}/${TAG}-3-vincitore-dopo.png` }); }
console.log('errori', err.length, err[0] || '', await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\n/g, ' | ')));
await browser.close(); server.close();
