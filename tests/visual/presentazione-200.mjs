#!/usr/bin/env node
/* [7.999.124 PO-200 collaudo PO 03/10 «Nella presentazione della squadra far vedere i CGTrader ed in piccolo come in televisione la
   figurina»] GUARDIANO sul percorso vero (settimana → «Vai allo stadio» → primo compagno chiamato): in campo i corpi CGTrader
   (testimone __CPM_PRES200.cg) e una sola targhetta piccola (data-cpm="pres200-tv"), niente schieramento di figurine
   (data-cpm-pres23). Rosso __CPM_NO_PRES200: nessun corpo CGTrader e lo schieramento di figurine della 7.947. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out', { recursive: true });
const PRO = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 70, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
const save = { phase: 'career', player: {
  name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 1, age: 24, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 4, presidentModalSeason: 4,
  drawSeen: 4, mercatoSeen: 4, coachPactSeason: 4, presentedClub: PRO.id, presentSeason: 0,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6,
  goals: 0, assists: 0, matches: 0, totalMatches: 90, totalGoals: 40, matchHistory: [],
  contract: { duration: 3, wage: 400000, expiresAtSeason: 8 } } };

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([o, r]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_PRES200 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
  try { await page.getByText('Avvia Stagione', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(1200);
  for (let i = 0; i < 14; i++) { const t = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));
    if (/Vai allo stadio/i.test(t)) break;
    try { await page.getByRole('button', { name: /Tieni #|Continua|Conferma|Accetta|Avanti|Prosegui|Inizia/i }).last().click({ timeout: 2500 }); } catch (e) { break; } await sleep(900); }
  try { await page.getByRole('button', { name: /Vai allo stadio/i }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(2500);
  for (let k = 0; k < 2; k++) { try { await page.getByRole('button', { name: /^Avanti/i }).first().click({ timeout: 4000 }); } catch (e) {} await sleep(1200); }
  let info = null;
  for (let t = 0; t < 40; t++) { info = await page.evaluate(() => ({ serata: /SERATA DI PRESENTAZIONE/.test(document.body.innerText || ''), cg: (window.__CPM_PRES200 || {}).cg || 0,
    tv: document.querySelectorAll('[data-cpm="pres200-tv"]').length, schieramento: document.querySelectorAll('[data-cpm-pres23]').length })); if (info.cg >= 2 || (rosso && t >= 10)) break; await sleep(1000); }
  if (!rosso) await page.screenshot({ path: 'out/presentazione-200-verde.png' }).catch(() => {});
  esito[rosso ? 'rosso' : 'verde'] = info; await page.close();
}
await browser.close(); srv.close();
console.log(JSON.stringify(esito));
const V = esito.verde, R = esito.rosso, g = [];
if (!V.serata) g.push('verde: la serata non si e\' aperta');
if (!(V.cg >= 2)) g.push('verde: corpi CGTrader in campo ' + V.cg);
if (V.tv !== 1 || V.schieramento) g.push('verde: attesa una sola targhetta e nessuno schieramento ' + JSON.stringify(V));
if (!R.serata || R.cg || !R.schieramento || R.tv) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ presentazione-200'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ presentazione-200 verde (e il rosso si vede)');
