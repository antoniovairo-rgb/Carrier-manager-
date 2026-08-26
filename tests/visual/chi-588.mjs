/* [7.588.0 STRUMENTO] CHI RIMETTE INDIETRO GLI OSPITI DOPO UN GOL.
   Il censimento della ripresa (ripresa-588) dice una cosa che nessuna delle mie sei ipotesi regge: il
   ripiegamento legge bersaglio 62 e trova il giocatore a 44, PASSATA DOPO PASSATA, con guadagno 0,92 —
   una sola passata dovrebbe portarlo a 60,6. Quindi fra una passata e l'altra qualcun altro SCRIVE.
   Questa sonda non deduce: mette un testimone sul setter e stampa, per l'indice sorvegliato, ogni
   scrittura che lo sposta piu' di 1,5 unita', raggruppata per l'IMPRONTA dello scrittore (il testo del
   suo aggiornamento). Non e' un guardiano: non fallisce, nomina. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const IDX = Number(process.env.CPM_IDX || 19);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((idx) => { window.__CPM_GLB = false; window.__CPM_W588 = { idx, mosse: [] }; }, IDX);
await openMatch(page, port, { skipLoadAll: true, name: 'Ch' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await page.waitForTimeout(150000);
const M = await page.evaluate(() => (window.__CPM_W588 && window.__CPM_W588.mosse) || []);
await b.close(); srv.close();

console.log(`\n=== CHI SPOSTA IL GIOCATORE i${IDX} (soglia 1,5 unita') ===\n`);
console.log(`  scritture registrate: ${M.length}\n`);
const per = new Map();
for (const m of M) {
  const k = m.fn || '(?)';
  const e = per.get(k) || { n: 0, indietro: 0, avanti: 0, somma: 0, ko: 0, koSomma: 0, es: m };
  e.n++; const d = m.a - m.da; e.somma += d;
  if (d < 0) e.indietro++; else e.avanti++;
  if (m.ko) { e.ko++; e.koSomma += d; }
  per.set(k, e);
}
const righe = [...per.entries()].sort((a, c) => c[1].n - a[1].n);
for (const [k, e] of righe) {
  console.log(`  ${String(e.n).padStart(3)} scritture · indietro ${e.indietro} · avanti ${e.avanti} · spostamento medio ${(e.somma / e.n).toFixed(1)}u`);
  console.log(`      di cui DURANTE una ripresa: ${e.ko}${e.ko ? ` (spostamento medio ${(e.koSomma / e.ko).toFixed(1)}u)` : ''}`);
  console.log(`      esempio: ${e.es.da} -> ${e.es.a}`);
  console.log(`      impronta: ${k.slice(0, 400)}`);
}
if (!M.length) { console.log('  NESSUNA scrittura registrata: il testimone non ha visto niente. NON GIUDICABILE.'); process.exit(1); }
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, nomina.\n');
