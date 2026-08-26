/* [7.592.0 STRUMENTO] I DIECI METRI, TAPPA PER TAPPA.
   Misurato che la mesh disegnata dista 10,55 m dal modello a gioco vivo e 16,08 m durante una ripresa.
   Buona parte di quello scarto e' VOLUTA — il renderer corregge il bersaglio apposta: la linea scorre col
   pallone, i ruoli richiamano alla zona di competenza, chi difende pressa. Ma «buona parte» non e' un
   numero, e senza numero non si sa dove intervenire.
   Questa sonda non giudica: scompone. Per ogni giocatore e ogni fotogramma somma quanto sposta ciascuna
   tappa, dal modello fino alla mesh che l'utente vede. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_D592 = {}; });
await openMatch(page, port, { skipLoadAll: true, name: 'D5' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(90000);
const D = await page.evaluate(() => window.__CPM_D592 || {});
await b.close(); srv.close();

console.log("\n=== I DIECI METRI FRA LA PARTITA E CIO' CHE SI VEDE, TAPPA PER TAPPA ===\n");
if (!D.n) { console.log('  ⚠ nessuna misura registrata: NON GIUDICABILE.\n'); process.exit(1); }
const m = (k) => (D[k] || 0) / D.n;
const righe = [
  ['forma del reparto (linea col pallone + scarto di possesso)', m('forma')],
  ['richiamo alla zona di competenza del ruolo', m('ruolo')],
  ['pressing sul portatore', m('pressing')],
  ['marcature, linee, coperture, anti-sovrapposizione', m('dopo')],
  ['la mesh che insegue il bersaglio (ritardo di resa)', m('mesh')],
];
const tot = m('tot');
for (const [n, v] of righe) console.log(`  ${v.toFixed(2).padStart(6)} m   ${n}`);
console.log(`  ${'-'.repeat(6)}`);
console.log(`  ${tot.toFixed(2).padStart(6)} m   SCARTO COMPLESSIVO modello -> mesh disegnata   [${D.n} misure]`);
if (D.nn) {
  console.log(`\n  --- E' UN TETTO DI VELOCITA' O UN BERSAGLIO CHE OSCILLA? ---`);
  console.log(`    passo del BERSAGLIO per fotogramma : ${(D.passoTg / D.nn).toFixed(3)} m`);
  console.log(`    passo della MESH per fotogramma    : ${(D.passoMesh / D.nn).toFixed(3)} m`);
  console.log(`    inversioni di verso del bersaglio  : ${((D.inv || 0) / D.nn * 100).toFixed(1)}% dei fotogrammi`);
  const r = (D.passoMesh / D.nn) / Math.max(D.passoTg / D.nn, 1e-9);
  console.log(`    la mesh copre il ${(r * 100).toFixed(0)}% di quanto si sposta il bersaglio`);
} else console.log("\n  ⚠ passo per fotogramma NON misurato: NON GIUDICABILE su tetto contro oscillazione");
console.log('\n  (le tappe si sommano in valore assoluto: possono compensarsi, quindi la somma delle righe');
console.log("   non deve per forza fare il totale — e' proprio quel divario a dire quanto si annullano.)\n");
