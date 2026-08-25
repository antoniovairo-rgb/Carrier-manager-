#!/usr/bin/env node
/* SONDA — LA SCENOGRAFIA OSPITE IN UNA PARTITA NORMALE (collaudo PO «gli striscioni, sciarpe e bandiere
   della tifoseria ospite non ci sono»).

   PERCHE' NESSUN COLLAUDO L'AVEVA VISTO: `tifo-shot` — l'unica sonda che fotografa la scenografia —
   forza `__CPM_CROWD_OVERRIDE = {tier:'derby', fill:0.98, awayFill:0.98}`. Guarda cioe' un derby col
   tutto esaurito, l'unico caso in cui il cancello ospite si apre. Questa sonda NON forza niente: prende
   la folla che il gioco calcola davvero per la partita in calendario, e conta l'arredo lato per lato.

   Non e' un guardiano: misura, e stampa la fotografia accanto ai numeri. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
/* La partita del banco di prova e' un PROVINO (fill 0,016, intensita' 0,03): folla sbagliata per la
   domanda. Qui si mette la folla che LA FORMULA DEL GIOCO produce per un campionato ben frequentato —
   `awayFill = fill x awayShare.normal = 0,72 x 0,55 = 0,396`. Non e' un numero scelto per far tornare
   il verdetto: e' esattamente cio' che `computeCrowd` restituisce a stadio pieno al 72%. */
const FILL = 0.72, AWAY = +(0.72 * 0.55).toFixed(3);
const ROSSO = !!process.env.CPM_NO573T;/* prova del rosso: rimette la soglia 0,45 e la scenografia ospite sparisce */
await page.addInitScript(([f, a, r]) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO573T = 1;
  window.__CPM_CROWD_OVERRIDE = { tier: 'league', fill: f, awayFill: a, intensity: 0.62, capacity: 30000, attendance: Math.round(30000 * f), seed: 7 };
}, [FILL, AWAY, ROSSO]);
await openMatch(page, port, { skipLoadAll: true, name: 'To' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now();
while (Date.now() - t0 < 90000) { await sleep(1200); if ((await matchPhase(page)) === 'playing') break; }
await sleep(4000);
const cen = await page.evaluate(() => (window.__CPM_TIFO ? window.__CPM_TIFO() : { err: 'hook assente' }));
const dec = await page.evaluate(() => (window.__CPM_DECOR ? window.__CPM_DECOR() : {}));
await page.screenshot({ path: 'out/tifo-ospiti-573.png' });
await b.close(); srv.close();

console.log('\n=== SCENOGRAFIA TIFO IN UNA PARTITA NORMALE (folla non forzata) ===\n');
if (cen.err) { console.log('  ERRORE: ' + cen.err); }
else {
  console.log('  folla calcolata dal gioco:  fill ' + cen.ctx.fill + '  ·  awayFill ' + cen.ctx.awayFill + '  ·  intensita ' + cen.ctx.intensity);
  console.log('  cancelli:  casa ' + (cen.cancelli.home ? 'APERTO' : 'CHIUSO') + '  ·  ospiti ' + (cen.cancelli.away ? 'APERTO' : 'CHIUSO') + '   (soglia ospiti: awayFill >= 0.18 · rosso __CPM_NO573T = 0.45)');
  console.log('  tier coreografico: ' + cen.tier);
  console.log('');
  console.log('  arredo COSTRUITO           casa    ospiti');
  console.log('    bandiere                 ' + String(cen.bandiere.home).padStart(4) + '    ' + String(cen.bandiere.away).padStart(4));
  console.log('    sciarpe                  ' + String(cen.sciarpe.home).padStart(4) + '    ' + String(cen.sciarpe.away).padStart(4));
  console.log('    teli coreografici        ' + String(cen.teli.home).padStart(4) + '    ' + String(cen.teli.away).padStart(4));
}
console.log('');
console.log('  costo in scena: mesh totali ' + (dec.n != null ? dec.n : '?') + '  ·  texture uniche ' + (dec.uniche != null ? dec.uniche : '?') + '  ·  ' + (dec.mb != null ? dec.mb.toFixed(1) : '?') + ' MB di texture  ·  texture vuote ' + (dec.texVuote != null ? dec.texVuote : '?'));
console.log('\n  fotografia: out/tifo-ospiti-573.png');
console.log('  pageerror: ' + (errors.length ? errors.join(' | ') : 'nessuno') + '\n');
