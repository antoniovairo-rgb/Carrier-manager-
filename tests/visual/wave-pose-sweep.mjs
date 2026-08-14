#!/usr/bin/env node
/* SWEEP DELLA POSA DEL SALUTO — «la mano deve essere rivolta in avanti».

   NOTA PO (7.462): «il braccio e la mano sono storte, la mano deve essere rivolta in avanti come gesto
   di saluto». Il 7.430 aveva gia' portato il braccio a un BERSAGLIO CANONICO su X e Z (alzato, gomito
   disteso) ma aveva lasciato la TORSIONE del braccio — la rotazione attorno all'asse dell'osso, Y — al
   valore della posa di RIPOSO, cioe' quello di un braccio che pende lungo il fianco col palmo rivolto
   verso la coscia. Alzato quel braccio senza ruotarlo, il palmo guarda di lato: e' la mano «storta».

   ⚠️ GLB-ON OBBLIGATORIO (direttiva PO 2026-07-29): sotto il CH38 le pose procedurali sono invisibili,
   e una verifica percettiva GLB-OFF non guarda cio' che il giocatore vede.

   COSA FA: apre la SERATA DI PRESENTAZIONE vera, arriva al beat dell'eroe e fotografa il saluto al
   variare della torsione (`__CPM_WVSET.y`), un fotogramma per valore. Non giudica: produce i provini su
   cui si sceglie il numero — e il numero si legge, non si indovina.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node wave-pose-sweep.mjs                                  */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const OUT = 'out/wave';
fs.mkdirSync(OUT, { recursive: true });
const YS = (process.env.CPM_WVY || '-1.4,-1.0,-0.6,-0.3,0,0.3,0.6,1.0,1.4').split(',').map(Number);

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
const browser = await launchBrowser();
/* 3x di pixel: a scala 1 la mano e' venti pixel e «il palmo dove guarda» non e' giudicabile —
   la prima passata di provini e' stata buttata per questo. */
const page = await browser.newPage({ viewport: { width: 480, height: 1000 }, deviceScaleFactor: 3 });
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await installCdnRoutes(page);
await page.addInitScript(o => {
  window.__CPM_GLB = true;            /* CH38: e' l'unico modello sotto cui il gesto si vede */
  window.__CPM_PRESENT = 1;
  localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1');
}, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
await sleep(900);

/* si entra nella serata */
try { await page.getByRole('button', { name: /Vivi la Settimana|Avanza|Gioca/i }).first().click({ timeout: 5000 }); } catch (e) {}
await sleep(900);
for (let i = 0; i < 8; i++) {
  const t = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));
  if (/Presentazione della squadra/i.test(t)) break;
  try { await page.getByRole('button', { name: /Tieni #|Continua|Conferma|Accetta/i }).first().click({ timeout: 2500 }); } catch (e) { break; }
  await sleep(600);
}
try { await page.getByRole('button', { name: /Vai allo stadio/i }).first().click({ timeout: 6000 }); } catch (e) {}
await sleep(2500);

/* ⚠️ IL BEAT CHE IL PO HA FOTOGRAFATO E' UN «NUOVO ACQUISTO», NON L'EROE: la prima passata era andata
   avanti fino al beat dell'eroe e li' il saluto sembrava a posto — si stava guardando un'altra scena.
   `CPM_BEAT` sceglie quanti «Avanti» dare (0 = il primo compagno chiamato). */
const BEAT = +(process.env.CPM_BEAT || 0);
for (let i = 0; i < BEAT; i++) {
  try { await page.getByRole('button', { name: /Avanti/i }).first().click({ timeout: 3000 }); } catch (e) { break; }
  await sleep(1200);
}
await sleep(1800);
console.log('intestazione del beat:', (await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '))).slice(0, 120));
const base = await page.evaluate(() => window.__CPM_WVDBG || null);
console.log('posa di RIPOSO del braccio (euler dell\'osso):', JSON.stringify(base));
if (!base) console.log('⚠️ il testimone del saluto non si e\' popolato: la scena potrebbe non essere sul beat dell\'eroe');

const fatte = [];
for (const y of YS) {
  /* CPM_NOOVR=1: nessun override — si fotografa la posa DI PRODUZIONE, cioe' quella che vede il PO.
     E' la verifica finale: uno sweep prova quale numero serve, solo il ramo vero prova che e' quello. */
  if (process.env.CPM_NOOVR) await page.evaluate(() => { window.__CPM_WVSET = null; });
  /* dal 7.470: si sweeppa la TORSIONE DELL'AVAMBRACCIO (`fy`), che con l'arto alzato e' il comando
     dominante sull'orientamento del PALMO — la sola Y del braccio non bastava (nota PO: «il palmo
     della mano deve essere in direzione dello sguardo del calciatore»). */
  else await page.evaluate(o => { window.__CPM_WVSET = { x: -1.95, z: -0.25, y: o.y, fy: o.fy }; },
    { y: +(process.env.CPM_WVY_FIX || -0.8), fy: y });
  await sleep(900);
  const f = `${OUT}/wave-y${String(y).replace('.', 'p').replace('-', 'm')}.png`;
  await page.screenshot({ path: f, clip: (process.env.CPM_PAGE ? undefined : process.env.CPM_FULL ? { x: 40, y: 320, width: 400, height: 340 } : { x: 8, y: 478, width: 92, height: 130 }) });
  fatte.push({ y, f });
  console.log(`  torsione y=${y.toFixed(2)} → ${f}`);
}
await page.evaluate(() => { window.__CPM_WVSET = null; });
await browser.close(); srv.close();
for (const e of errs.slice(0, 4)) console.log('⚠ pageerror: ' + e);
console.log(`\n${fatte.length} provini in ${OUT}/ — si sceglie il valore in cui il PALMO guarda la camera.`);
