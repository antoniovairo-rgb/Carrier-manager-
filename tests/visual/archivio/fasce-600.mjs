/* [7.600.0 STRUMENTO] IL PALLONE USA LE FASCE, O SOLO IL CORRIDOIO CENTRALE?
   COLLAUDO PO, e per una volta e' una sua OSSERVAZIONE e non la bozza automatica: «in cronaca, mai
   un'azione, uno schema, il pallone viaggia sempre in verticale in mezzo al campo mai sulle fasce».
   Non e' mai stata misurata. Un campo va da y=2 a y=98: le fasce sono i due quinti esterni (y<30 e y>70),
   il corridoio centrale il quinto di mezzo. In una partita vera il gioco cambia lato di continuo e i cross
   nascono dalle fasce; se il pallone vive in mezzo, il PO ha ragione e si vede.
   NON e' un guardiano: misura la distribuzione laterale, quante volte il gioco CAMBIA LATO, e quanto e'
   lunga la corsa in verticale fra un cambio e l'altro. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
/* CPM_INV=1: braccio appaiato con l'inversione del verso 7.579 accesa (la riga descrive, la trama comanda).
   CPM_FLAGS="NO612,NO528": bandiere __CPM_* da accendere (bracci appaiati coi rossi, stessa build).
   CPM_SEED: seed dell'autoplay (default 7300). */
if (process.env.CPM_INV === '1') await page.addInitScript(() => { window.__CPM_INV579 = true; });
if (process.env.CPM_FLAGS) await page.addInitScript((fl) => { for (const f of fl) window['__CPM_' + f] = true; }, process.env.CPM_FLAGS.split(',').map(s => s.trim()).filter(Boolean));
const SEED = (process.env.CPM_SEED | 0) || 7300;
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_FS = { ys: [], cambi: 0, _lato: 0, corse: [], _corsa: 0, xs: [] };
  setInterval(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.ball) return;
    const F = window.__CPM_FS; if (F.ys.length > 2000) return;
    const y = st.ball.y, x = st.ball.x;
    F.ys.push(+y.toFixed(1)); F.xs.push(+x.toFixed(1));
    /* lato: -1 fascia bassa, 0 centro, +1 fascia alta. Il cambio si conta solo fra le due FASCE, non
       ogni volta che si sfiora il centro: cambiare lato vuol dire portare il gioco da una parte all'altra. */
    const l = y < 30 ? -1 : y > 70 ? 1 : 0;
    if (l !== 0) { if (F._lato !== 0 && l !== F._lato) { F.cambi++; F.corse.push(F._corsa); F._corsa = 0; } F._lato = l; }
    F._corsa++;
  } catch (_e) {} }, 200);
});
await openMatch(page, port, { skipLoadAll: true, name: 'Fa' });
await page.evaluate((sd) => window.__CPM_AUTOPLAY(true, { seed: sd, policy: 'seeded', tickMs: 300 }), SEED);
await sleep(150000);
const F = await page.evaluate(() => window.__CPM_FS || null);
await b.close(); srv.close();

console.log('\n=== IL PALLONE USA LE FASCE? ===\n');
if (!F || !F.ys.length) { console.log('  ⚠ nessun campione: NON GIUDICABILE.\n'); process.exit(1); }
const n = F.ys.length, sec = n * 0.2;
const bassa = F.ys.filter(y => y < 30).length, alta = F.ys.filter(y => y > 70).length;
const centro = n - bassa - alta;
console.log(`  campioni ${n} (${sec.toFixed(0)} s di gioco)`);
console.log(`  fascia BASSA  (y<30) : ${(bassa / n * 100).toFixed(0)}%  ${'█'.repeat(Math.round(bassa / n * 40))}`);
console.log(`  CORRIDOIO centrale   : ${(centro / n * 100).toFixed(0)}%  ${'█'.repeat(Math.round(centro / n * 40))}`);
console.log(`  fascia ALTA   (y>70) : ${(alta / n * 100).toFixed(0)}%  ${'█'.repeat(Math.round(alta / n * 40))}`);
console.log(`\n  (il corridoio centrale e' un quinto del campo: se prende molto piu' del 20%, il gioco vive in mezzo)`);
const ysort = F.ys.slice().sort((a, c) => a - c);
console.log(`\n  y del pallone · mediana ${ysort[Math.floor(n / 2)].toFixed(0)} · quarto basso ${ysort[Math.floor(n * .25)].toFixed(0)} · quarto alto ${ysort[Math.floor(n * .75)].toFixed(0)}`);
console.log(`  cambi di LATO (da una fascia all'altra): ${F.cambi} in ${(sec / 60).toFixed(1)} minuti = ${(F.cambi / (sec / 60)).toFixed(1)} al minuto`);
if (F.corse && F.corse.length) { const c = F.corse.slice().sort((a, b2) => a - b2);
  console.log(`  quanto dura una permanenza sullo stesso lato · mediana ${(c[Math.floor(c.length / 2)] * 0.2).toFixed(1)} s`); }
const xs = F.xs.slice().sort((a, c) => a - c);
console.log(`\n  x del pallone · mediana ${xs[Math.floor(n / 2)].toFixed(0)} (per confronto: il campo va da 0 a 100)`);
/* ⚠️ SANATA: qui c'erano tre «tracce» stampate come misure ma erano TESTO FISSO — il censimento
   fatto a mano alla nascita della sonda (7.600), ristampato identico a ogni run. Due bracci diversi
   uscivano con gli stessi numeri e per poco non li ho confrontati come risultati. Uno strumento che
   ristampa il passato come presente e' uno strumento che mente. Il contenuto storico (per il lettore,
   dichiarato come storico): al 7.600 la trama guidava il pallone ~5% del tempo (20 tick su ~400,
   __CPM_TRAMA527), l'80% delle scene partiva nel corridoio centrale (153/191 startZone), il corridoio
   basso veniva sorteggiato ma la y non scendeva mai sotto 39,4. Se serve di nuovo, si RIMISURA. */
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
