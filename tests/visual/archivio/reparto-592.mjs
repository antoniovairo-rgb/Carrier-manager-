/* [STRUMENTO] CHI FIRMA LA POSIZIONE FINALE — censimento 006 con il collettore 7.592 gia' in campo.
   Il blocco che difende sta a 37,5u dal pallone con correlazione 0,336 (volante-703) e la leva sul
   termine-pallone dello schieramento non sposta nulla (spinta 11,1u in INGRESSO, uscita nulla).
   Qui si legge, in cronaca viva, quanto ogni tappa del builder sposta la x del bersaglio:
   forma (scorrimento linea+possesso) · ruolo (richiamo corsie) · pressing · dopo (marcature/staging)
   · mesh (ritardo del corpo sul bersaglio). La tappa grande e' l'indiziato che mangia il termine-pallone. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_D592 = {}; });
await openMatch(page, port, { skipLoadAll: true, name: 'Rp' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(90000);
const D = await page.evaluate(() => window.__CPM_D592 || null);
await b.close(); srv.close();
if (!D || !D.n12) { console.log('collettore vuoto'); process.exit(0); }
const n = D.n12;
console.log(`\n=== CHI FIRMA LA X FINALE (u per giocatore-fotogramma · campioni ${n}) ===\n`);
for (const [k, lbl] of [['forma','forma (linea+possesso)'],['ruolo','richiamo corsie'],['pressing','pressing'],['dopo','dopo (marcature/staging)'],['mesh','ritardo mesh<-bersaglio'],['tot','TOTALE mesh<-forma']]) {
  if (D[k] != null) console.log(`  ${lbl.padEnd(26)} ${(D[k]/n).toFixed(2)}u`);
}
if (D.st1 != null) console.log(`  stadio1 (ctx<-tg) ${(D.st1/n).toFixed(2)}u · stadio2 (mesh<-ctx) ${(D.st2/n).toFixed(2)}u`);
console.log('');
