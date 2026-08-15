#!/usr/bin/env node
/* GUARDIANO — LA VELOCITA' DELLA PARTITA E' QUELLA CHE IL GIOCATORE HA SCELTO.

   DA DOVE VIENE. Direttiva PO: «le partite devono essere piu' serene, tranquille, meno frenetiche — fai
   decidere al giocatore la velocita' 1x 1,25x 2x». Il ritmo di `playing` ha un metronomo solo: il tick
   del clock, su cui girano cronaca di sfondo, grida del mister, micro-simulatore e lerp del pallone. La
   base e' passata da 300 a 420 ms per minuto di gioco, e la manopola divide quel numero.

   COSA GIUDICA. Il TICK VERO in millisecondi reali per minuto di gioco, a ciascuna delle tre velocita'.

   ⚠️ IL CLOCK E' FERMO DURANTE GLI HIGHLIGHT, quindi una media sull'intera finestra misura il tempo
   passato negli hl_* e non il metronomo: la prima stesura di questa misura riportava 727-833 ms dove la
   costante era 300, e ha quasi fatto dichiarare «tick rotto» un tick perfettamente a specifica. Si
   campiona fitto e si sommano SOLO i tratti in cui la fase e' `playing`.

   ⚠️ LA BANDA E' SCELTA PER SEPARARE. Fra 1x (420) e 1,25x (336) ci sono 20 punti percentuali: una banda
   piu' larga di ±10% non distinguerebbe due velocita' adiacenti, cioe' non guarderebbe nulla. Sta a ±10%,
   e lo scarto misurato e' +0/+1%.

   PROVA DEL ROSSO: `__CPM_NO484` fa ignorare la scelta al tick. Con `CPM_ROSSO=1` il guardiano lo accende
   e PRETENDE di fallire: le tre velocita' collassano tutte su 420.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node match-speed-test.mjs [CPM_ROSSO=1]                  */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ATTESO = { 1: 420, 1.25: 336, 2: 210 };
const BANDA = 10;
const FIN = +(process.env.CPM_FIN || 26000);
const ROSSO = !!process.env.CPM_ROSSO;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const misure = {}; const errs = [];
for (const v of [1, 1.25, 2]) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO484 = 1; try { localStorage.setItem('cpm-match-speed', String(o.v)); } catch (e) {} }, { v, r: ROSSO });
  try {
    await openMatch(page, port, { skipLoadAll: true });
    await sleep(1000);
    await page.evaluate(() => { window.__T = []; window.__IV = setInterval(() => { try { const p = window.__CPM_PROBE && window.__CPM_PROBE(); if (p) window.__T.push({ t: +performance.now().toFixed(0), c: p.clock, f: p.phase }); } catch (e) {} }, 30); });
    await sleep(FIN);
    const camp = await page.evaluate(() => { clearInterval(window.__IV); return window.__T; });
    let ms = 0, min = 0;
    for (let i = 1; i < camp.length; i++) { const a = camp[i - 1], c = camp[i]; if (a.f === 'playing' && c.f === 'playing') { ms += c.t - a.t; if (c.c > a.c) min += c.c - a.c; } }
    misure[v] = min ? ms / min : null;
  } catch (e) { misure[v] = null; } finally { await page.close().catch(() => {}); }
}
/* la preferenza deve anche SOPRAVVIVERE: e' un'impostazione della persona, non della singola partita */
let persiste = null;
try {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
  await openMatch(page, port, { skipLoadAll: true });
  persiste = await page.evaluate(() => { try { return localStorage.getItem('cpm-match-speed'); } catch (e) { return null; } });
  await page.close();
} catch (e) {}
await b.close(); srv.close();

let rossi = 0, ciechi = 0;
console.log(`\n=== RITMO DELLA PARTITA · tick vero, solo tratti in playing${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO484)' : ''} ===`);
for (const v of [1, 1.25, 2]) {
  const m = misure[v];
  if (m == null) { console.log(`  ${String(v + '×').padStart(6)} · ⚠ nessuna misura`); ciechi++; continue; }
  const sc = 100 * (m - ATTESO[v]) / ATTESO[v], ko = Math.abs(sc) > BANDA;
  if (ko) rossi++;
  console.log(`  ${String(v + '×').padStart(6)} · atteso ${String(ATTESO[v]).padStart(4)} ms/minuto · misurato ${m.toFixed(0).padStart(4)} (${sc >= 0 ? '+' : ''}${sc.toFixed(0)}%) ${ko ? '❌' : '✅'}   90' = ${(90 * m / 1000).toFixed(0)}s`);
}
/* ⚠️ e le tre devono essere DISTINTE: tre numeri ciascuno «entro banda» non provano da soli che la
   manopola agisca — la separazione si controlla a valle, ed e' cio' che il rosso deve rompere. */
const vals = [1, 1.25, 2].map(v => misure[v]).filter(x => x != null);
if (vals.length === 3 && !(vals[0] > vals[1] * 1.1 && vals[1] > vals[2] * 1.1)) { console.log('  ❌ le tre velocita\' non sono distinte: la scelta non sta agendo sul tick'); rossi++; }
if (persiste !== '2') { console.log(`  ❌ la preferenza non sopravvive al caricamento (letto ${JSON.stringify(persiste)})`); rossi++; }
else console.log('  ✅ la preferenza sopravvive al caricamento');
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

if (ciechi) { console.log(`\n❌ CIECO su ${ciechi} velocita'`); process.exit(2); }
if (ROSSO) {
  if (rossi) { console.log('\n✅ prova del rosso riuscita: ignorando la scelta il guardiano fallisce'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: il guardiano resta verde anche se la scelta viene ignorata'); process.exit(2);
}
if (rossi) { console.log('\n❌ il ritmo non e\' quello scelto'); process.exit(2); }
console.log('\n✅ le tre velocita\' sono quelle dichiarate, distinte, e la scelta si ricorda');
