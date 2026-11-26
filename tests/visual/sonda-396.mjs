/* [giro 396] SONDA «uno 0-0 e' una partita valida» per gol-eroe-154. Il registro gol del motore (_S._golLog) nasce al primo gol
   (src/14 case 'gol'): su uno 0-0 non esiste e il guardiano dichiarava la partita «non valida» (k7 verde, treno 45787013506, due
   tentativi su due). La sonda apre una partita vera e la legge a inizio gara (motore vivo, tabellone 0-0, nessun gol: la condizione
   dello 0-0 provocata, non attesa), con la STESSA regola del guardiano. Verde: registro letto [] (partita giudicabile). Rosso
   (CPM_NO_G396=1): registro null, la partita sarebbe «non valida». Poi segna un gol finto nel registro (dichiarato) per provare che
   un registro presente si legge com'e'. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const d = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url))); const SV = typeof d['cpm-v3'] === 'string' ? JSON.parse(d['cpm-v3']) : d['cpm-v3'];
const regola = (no396) => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const T = M && M._S && M._S.tab; const zero396 = !!(T && T.home && T.away && ((T.home.gol | 0) + (T.away.gol | 0)) === 0);
  const log = (M && M._S && M._S._golLog) || ((!no396 && zero396) ? [] : null); return { motore: !!(M && M._S), tab: T ? [T.home && T.home.gol, T.away && T.away.gol] : null, haLog: !!(M && M._S && M._S._golLog), log }; };
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const b = await launchBrowser(); const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, SV);
await page.goto(url, { waitUntil: 'load', timeout: 90000 }); await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 150 }));
await page.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() && window.__CPM_MOTORE_OBJ()._S, null, { timeout: 60000 });
const fn = `(${regola.toString()})`;
const verde = await page.evaluate(`${fn}(false)`), rosso = await page.evaluate(`${fn}(true)`);
const conLog = await page.evaluate(`(()=>{const S=window.__CPM_MOTORE_OBJ()._S; const prima=S._golLog; S._golLog=[{min:1,lato:'home',scena:false,chi:'X'}]; const r=${fn}(false); S._golLog=prima; return r;})()`);
await b.close(); srv.close();
console.log('VERDE:', JSON.stringify(verde)); console.log('ROSSO (CPM_NO_G396):', JSON.stringify(rosso)); console.log('CON REGISTRO (gol finto, dichiarato):', JSON.stringify(conLog));
const err = [];
if (!verde.motore || !verde.tab || verde.haLog) err.push('condizione non provocata (motore/tabellone/registro): non giudicato');
if (!Array.isArray(verde.log) || verde.log.length) err.push('verde: lo 0-0 non si legge come registro vuoto');
if (rosso.log !== null) err.push('rosso: col rosso lo 0-0 non torna «non valido»');
if (!conLog.log || conLog.log.length !== 1) err.push('un registro presente non si legge com\'e\'');
if (err.length) { console.error('❌ sonda-396: ' + err.join(' · ')); process.exit(1); }
console.log('✅ sonda-396 verde e rosso');
