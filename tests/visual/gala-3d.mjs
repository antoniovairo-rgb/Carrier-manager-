/* [7.999.51] IL GALA' E' IL MOMENTO IN 3D (scelta PO: «il momento in 3D», «in abito da sera», «solo i miei premi in cima»).
   Verde: apertura con la fascia; «Apri la busta» porta DIRETTO al premio vinto (niente terzo/secondo posto); l'eroe sale sul palco
   (testimone __CPM_GALA51: corpo della partita, 9 ossa, camminata, trofeo) e la fascia dice «Il premio è tuo»; alla chiusura la pagina
   mette in cima «I tuoi premi» e i podi della lega in una fisarmonica. Rosso --rosso (__CPM_NO_GALA51): torna la serata a buste. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const rosso = process.argv.includes('--rosso');
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const err = []; page.on('pageerror', e => err.push(String(e).slice(0, 160)));
await page.addInitScript((r) => { if (r) window.__CPM_NO_GALA51 = true;
  const save = { phase: 'career', player: { name: 'Marco Carrasco', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93,
    club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
    stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000,
    contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } }; try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, rosso);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriGala), null, { timeout: 25000 }).catch(() => {});
await page.evaluate(() => window.__CPM_CAREER.apriGala()); await sleep(2500);
const clic = async (t) => { try { await page.getByText(t, { exact: false }).first().click({ timeout: 5000 }); return true; } catch (_e) { return false; } };
const txt = () => page.evaluate(() => document.body.innerText);
const v = { nuovo: await page.evaluate(() => !!document.querySelector('[data-cpm="gala51"]')), apertura: /sono per te|è per te|nessuno per te/i.test(await txt()) };
await clic('Apri la busta');
let tes = null; for (let i = 0; i < 40 && !(tes && tes.eroe); i++) { await sleep(500); tes = await page.evaluate(() => window.__CPM_GALA51 || null); }
const t2 = await txt(); v.premio = /Il premio è tuo/.test(t2); v.buste = /Il secondo posto/.test(t2); v.tes = tes;
if (!rosso) { await clic('Vai al bilancio'); await sleep(1500); }
v.miei = await page.evaluate(() => !!document.querySelector('[data-cpm="premi-miei51"]')); v.podi = /Tutti i podi della lega/i.test(await txt());
await browser.close(); server.close();
console.log(`\n=== GALA' 3D === ${rosso ? '[ROSSO __CPM_NO_GALA51]' : '[VERDE]'}\n  ${JSON.stringify(v)}\n  errori di pagina ${err.length}${err.length ? ' → ' + err[0] : ''}`);
const ok = rosso ? (!v.nuovo && v.buste && err.length === 0)
  : (v.nuovo && v.apertura && v.premio && !v.buste && tes && tes.eroe && tes.ossa === 9 && tes.camminata && tes.trofeo && v.miei && v.podi && err.length === 0);
console.log(ok ? (rosso ? '\n✅ difetto riprodotto — senza il 7.999.51 torna la serata a buste' : '\n✅ PASS — apertura, il tuo premio in 3D in smoking, e in cima solo i tuoi premi') : '\n❌ FAIL');
process.exit(ok ? 0 : 1);
