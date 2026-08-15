#!/usr/bin/env node
/* PROBE — «BRACCIO STORTO»: LA GEOMETRIA DEL SALUTO, MISURATA INVECE CHE GUARDATA.

   PERCHE' UNA PROBE NUOVA. Questa nota e' alla QUARTA comparsa: 7.419 (offset cieco → facepalm), 7.430
   (bersaglio canonico su X/Z), 7.462 (torsione del braccio baked a -0,8 sui provini), 7.470 (palmo
   calcolato in spazio mondo + torsione tolta). Tre volte su quattro la correzione e' stata SCELTA
   guardando fotogrammi in cui la mano e' larga quindici pixel, e tre volte su quattro il PO l'ha
   rimandata indietro. La regola del repo e' esplicita: un difetto che si ripresenta due volte merita
   sempre una probe nuova. Questa smette di guardare e misura.

   COSA MISURA (hook `__CPM_WVGEO`, scritto nel tick della serata dopo che la posa e' stata applicata):
   le posizioni MONDO di spalla, gomito e polso, piu' la direzione dello sguardo del modello. Da li':
     · APERTURA DEL GOMITO — l'angolo fra braccio e avambraccio. 180 gradi = teso, 90 = piegato ad angolo
       retto. ⚠️ LA BANDA E' STATA CORRETTA DOPO LA PRIMA MISURA, e va detto perche' non sembri comodo:
       la prima stesura scriveva «fra 130 e 180», e quella banda dava per BUONO il braccio che il PO ha
       fotografato (misurato a 158-168 gradi, cioe' bloccato). Un criterio che non separa il difetto
       segnalato non e' un criterio: era una descrizione della posa vecchia, non un riferimento. Il
       riferimento vero e' il gesto umano — omero abdotto e avambraccio verticale mettono il gomito
       intorno ai 90-120 gradi; sotto gli 85 la mano cade sulla testa, sopra i 150 il braccio e' un
       bastone. Banda: 85-150.
     · VERSO IN CUI PIEGA — la componente dell'avambraccio perpendicolare al braccio, proiettata sullo
       sguardo. POSITIVA = il gomito piega in AVANTI, come un gomito umano. NEGATIVA = piega all'indietro,
       e nessun essere umano ha quel braccio: e' «storto» in senso letterale, non estetico.
     · ALTEZZA DEL POLSO rispetto alla spalla: un saluto tiene la mano SOPRA la spalla.

   ⚠️ GLB-ON OBBLIGATORIO (direttiva PO 2026-07-29): sotto il CH38 le pose procedurali sono invisibili, e
   una verifica GLB-OFF non guarda cio' che il giocatore vede.

   NON E' UN GATE: dichiara i numeri e stampa il verdetto sui due criteri anatomici (verso e apertura).

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node wave-arm-geometry.mjs [CPM_BEAT=0]                  */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const OUT = 'out/wave';
fs.mkdirSync(OUT, { recursive: true });
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
/* ⚠️ IL BEAT NON SI INDOVINA. La prima passata si fermava al beat 0 — «BUONASERA E BENVENUTI», cioe' la
   panoramica del catino, dove non saluta nessuno — e dichiarava «testimone assente» come se fosse un
   difetto dello strumento. Le schermate del PO stanno al quinto/sesto pallino su otto. Ora si CAMMINA su
   tutti i beat e si misura ovunque il testimone si popoli: e' la scena a dire dove sta il saluto. */
const MAXB = +(process.env.CPM_BEAT_MAX || 8);
const misure = [];
for (let bt = 0; bt < MAXB; bt++) {
  await page.evaluate(() => { window.__CPM_WVGEO = null; });
  await sleep(1600);   /* la rampa del saluto e' `_wvT*2.4`: dopo ~0,4s e' a regime */
  const intest = (await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '))).slice(0, 90);
  const g = await page.evaluate(() => { const o = window.__CPM_WVGEO; return o && o.spalla ? { spalla: o.spalla, gomito: o.gomito, polso: o.polso, sguardo: o.sguardo, manoX: o.manoX, manoY: o.manoY, manoZ: o.manoZ, palmo: o.palmo, t: o.t, n: o.n } : null; });
  if (g) { misure.push({ bt, intest, g }); await page.screenshot({ path: `${OUT}/arm-beat${bt}.png` }); }
  else console.log(`  beat ${bt}: nessun saluto in corso — «${intest.slice(0, 60)}»`);
  let avanti = false;
  try { await page.getByRole('button', { name: /Avanti/i }).first().click({ timeout: 3000 }); avanti = true; } catch (e) {}
  if (!avanti) break;
}
await browser.close(); srv.close();
for (const e of errs.slice(0, 4)) console.log('⚠ pageerror: ' + e);
if (!misure.length) { console.log('\n❌ nessun saluto misurato su nessun beat: strumento cieco'); process.exit(2); }

const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const len = a => Math.hypot(a.x, a.y, a.z);
let rotti = 0;
for (const m of misure) {
  const g = m.g;
  const U = sub(g.gomito, g.spalla), F = sub(g.polso, g.gomito);
  const lu = len(U) || 1, lf = len(F) || 1;
  const cos = dot(U, F) / (lu * lf);
  const apertura = 180 - (Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI);
  /* componente dell'avambraccio PERPENDICOLARE al braccio: e' quella che dice da che parte piega */
  const k = dot(F, U) / (lu * lu);
  const P = { x: F.x - U.x * k, y: F.y - U.y * k, z: F.z - U.z * k };
  const avanti = dot(P, g.sguardo) / (len(P) || 1);
  const suSpalla = +(g.polso.y - g.spalla.y).toFixed(3);
  const male = [];
  if (avanti < -0.05) male.push(`gomito piegato ALL'INDIETRO (${avanti.toFixed(3)})`);
  if (apertura < 85) male.push(`gomito troppo chiuso (${apertura.toFixed(1)}°): la mano cade sulla testa`);
  if (apertura > 150) male.push(`gomito BLOCCATO (${apertura.toFixed(1)}°): il braccio e' un bastone, non un saluto`);
  if (suSpalla < 0) male.push(`polso SOTTO la spalla (${suSpalla}u)`);
  console.log(`\n=== beat ${m.bt} · «${m.intest.slice(0, 60)}» (${g.n} fotogrammi) ===`);
  console.log(`  spalla ${JSON.stringify(g.spalla)} · gomito ${JSON.stringify(g.gomito)} · polso ${JSON.stringify(g.polso)}`);
  console.log(`  braccio ${lu.toFixed(3)}u · avambraccio ${lf.toFixed(3)}u`);
  console.log(`  APERTURA DEL GOMITO: ${apertura.toFixed(1)}°  (180 = teso · un saluto umano sta fra 85 e 150)`);
  console.log(`  VERSO IN CUI PIEGA:  ${avanti >= 0 ? '+' : ''}${avanti.toFixed(3)}  (positivo = in avanti, come un gomito umano)`);
  console.log(`  POLSO SOPRA LA SPALLA: ${suSpalla >= 0 ? '+' : ''}${suSpalla}u`);
  /* IL POLSO. Quale asse dell'osso-mano siano le DITA non si deduce da una convenzione (il 7.470 ha gia'
     pagato mezzo giro per averlo dedotto): si prende, fra i sei versi degli assi mondo della mano, quello
     piu' allineato all'avambraccio — le dita di un polso a riposo proseguono l'avambraccio. La deviazione
     da quel verso e' l'angolo che il polso sta tenendo. Un polso umano arriva a ~70 gradi in flessione e
     ~25 in deviazione laterale: oltre i 70 non e' una posa, e' un osso rotto. */
  if (g.manoX && g.manoY && g.manoZ) {
    const dirF = { x: F.x / lf, y: F.y / lf, z: F.z / lf };
    const assi = [g.manoX, g.manoY, g.manoZ].flatMap(a => [a, { x: -a.x, y: -a.y, z: -a.z }]);
    let best = null, bd = -2;
    for (const a of assi) { const d = dot(a, dirF); if (d > bd) { bd = d; best = a; } }
    const polsoDeg = Math.acos(Math.max(-1, Math.min(1, bd))) * 180 / Math.PI;
    console.log(`  ANGOLO DEL POLSO: ${polsoDeg.toFixed(1)}°  (dita contro avambraccio · un polso umano arriva a ~70°)`);
    if (g.palmo) {
      const pg = dot(g.palmo, g.sguardo);
      console.log(`  PALMO vs SGUARDO: ${pg.toFixed(3)}  (1 = il palmo guarda esattamente dove guarda lui — l'obiettivo del 7.470)`);
    }
    if (polsoDeg > 70) male.push(`POLSO PIEGATO ${polsoDeg.toFixed(1)}°: oltre il limite umano (~70°)`);
  }
  console.log(male.length ? `  ❌ ${male.join(' · ')}` : '  ✅ anatomico');
  if (male.length) rotti++;
}
console.log(`\n${rotti}/${misure.length} saluti violano un criterio anatomico · fotogrammi in ${OUT}/`);
