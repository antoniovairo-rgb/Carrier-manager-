#!/usr/bin/env node
/* CENSIMENTO — CODICE 007: QUANTO INVERTE LA CORREZIONE DELLO SGUARDO (e un rimedio REVOCATO).

   DA DOVE VIENE. Il 7.475 ha censito la banda sana delle inversioni di camera (0,1-0,3 al secondo), ha
   provato che gli 8,8 e 34,7 del dispositivo del PO sono REALI, e ha chiuso una porta: quel numero in
   headless non e' esprimibile, perche' il testimone campiona una volta per fotogramma e servirebbero 69
   fps. Concludeva: «il rimedio giusto e' uno smorzamento con isteresi, da fare col dispositivo nel ciclo».

   COSA E' STATO PROVATO E REVOCATO NEL 7.478. L'ipotesi era che le due reti su `camLook` (eroe e pallone)
   fossero un interruttore acceso-spento a ogni fotogramma: la rete riporta il soggetto al 98% del
   semiquadro, il lerp lo rispinge fuori, e la frequenza del ping-pong scala coi fps — che spiegherebbe
   perche' il fenomeno vive solo sul dispositivo. L'isteresi (entra al bordo, esce sotto l'80%) e' stata
   scritta e MISURATA su queste stesse cinque scene: gli ingaggi sono SALITI, 1,32/s contro 0,66/s. Il
   contrario della previsione, e la spiegazione e' che senza isteresi la rete non lampeggia affatto —
   resta accesa a lungo, e correggendo piu' a fondo l'isteresi la faceva rilasciare e riagganciare.
   Ipotesi caduta, codice revocato: nel gioco sono rimaste le costanti di prima.

   COSA MISURA ORA, e perche' questa grandezza. Le INVERSIONI DI SEGNO della correzione, rapportate ai
   fotogrammi in cui la rete corregge: un RAPPORTO, non una frequenza. Un rapporto non dipende dal
   frame-rate, quindi headless e dispositivo dicono lo stesso numero — che e' esattamente cio' che
   mancava al 7.475 per poter giudicare. Se sul dispositivo del PO questo rapporto e' vicino a quello
   misurato qui, l'oscillazione NON nasce da queste reti e va cercata altrove; se e' molto piu' alto,
   sono loro e il numero dice di quanto.

   DOVE GUARDA. Non su scene a caso: le reti si accendono solo quando il soggetto esce dal quadro, e nel
   gioco sano succede di rado (misurato: una passata di sei scene vere da 7 ingaggi in 114 secondi). Il
   7.305 ha gia' censito le situazioni con la palla FUORI INQUADRATURA a `hl_choose` — gi 6·37·77·79·133,
   fra cui il caso del collaudo PO «la palla vola!» — ed e' li' che queste reti lavorano davvero.

   PRIMA PASSATA, E VA SCRITTA: ZERO inversioni su 152 fotogrammi corretti (eroe 12, palla 140). Quando
   queste reti correggono, spingono sempre nello stesso verso — l'indiziato del 7.475 e' ESCLUSO, e la
   caccia al codice 007 va spostata su un altro meccanismo.

   NON E' UN GATE: dichiara, non giudica. Vira rosso solo se il testimone e' cieco, perche' un numero
   raccolto da uno strumento che non guarda e' peggio di nessun numero (lezione del censimento 7.477, che
   leggeva una chiave inesistente e restituiva zero).

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node look-inversion-census.mjs                          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const SCENE = (process.env.CPM_SITS || '6,37,77,79,133').split(',').map(v => +v.trim()).filter(v => v >= 0);
const TENUTA = +(process.env.CPM_HOLD || 2200);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
/* il contatore si crea in initScript: creato da fuori, una ricarica di pagina lo cancellerebbe in
   silenzio — e' cosi' che la prima stesura ha letto «testimone assente» dopo aver misurato per minuti */
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true;
  window.__CPM_HY478 = { t0: performance.now() };
});
await openMatch(page, port);
await sleep(700);
await page.evaluate(() => { window.__CPM_HY478 = { t0: performance.now() }; });   /* l'intro non e' la partita */

let scene = 0;
for (const gi of SCENE) {
  const ok = await forceSituation(page, gi, { settle: 500, choose: true }).then(() => true).catch(() => false);
  if (!ok) continue;
  scene++;
  await sleep(TENUTA);   /* la rete si giudica sui fotogrammi in cui la scena e' VIVA, non sull'apertura */
}
const h = await page.evaluate(() => JSON.parse(JSON.stringify(window.__CPM_HY478 || {})));
await b.close(); srv.close();

const NOMI = { g: 'eroe · imbardata', ge: 'eroe · beccheggio', b: 'palla · imbardata', be: 'palla · beccheggio' };
const reti = Object.keys(NOMI).filter(k => h[k] && h[k].n);
console.log(`\n=== correzione dello sguardo su ${scene} scene forzate (${SCENE.join(' · ')}) ===`);
if (!reti.length) {
  console.log('❌ testimone cieco: nessuna rete ha corretto un solo fotogramma — la misura non vale.');
  for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
  process.exit(2);
}
let N = 0, I = 0;
for (const k of reti) {
  const f = h[k]; N += f.n; I += f.inv;
  console.log(`  ${NOMI[k].padEnd(20)} ${String(f.n).padStart(5)} fotogrammi corretti · ${String(f.inv).padStart(4)} inversioni · ${(f.inv / f.n).toFixed(3)} per fotogramma`);
}
console.log(`  ${'TOTALE'.padEnd(20)} ${String(N).padStart(5)} fotogrammi corretti · ${String(I).padStart(4)} inversioni · ${(I / N).toFixed(3)} per fotogramma`);
console.log(`\nBanda dichiarata (non giudicata): ${(I / N).toFixed(3)} inversioni per fotogramma corretto.`);
console.log('Da confrontare col DISPOSITIVO: e\' un rapporto, non una frequenza — se li' + String.fromCharCode(39) + ' e\' molto piu\' alto, l\'oscillazione nasce da queste reti; se e\' simile, nasce altrove.');
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (errs.length) process.exit(2);
