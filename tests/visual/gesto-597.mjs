/* [7.597.0 STRUMENTO] QUANTE CONCLUSIONI «DI PRIMA» DIVENTANO UN'ACROBAZIA?
   COLLAUDO PO, sesta segnalazione: «rovesciata al contrario», su un'azione che il gioco stesso chiama
   «Controbalzo secco al volo». Quell'etichetta incontrava il test «al volo» prima del test «controbalzo»,
   quindi un colpo di prima veniva reso col gesto acrobatico. Questa sonda non deduce: legge il registro
   delle scelte reali e conta. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const ROSSO = !!process.env.CPM_ROSSO;
await page.addInitScript((r) => { if (r) window.__CPM_NO597 = true; window.__CPM_GLB = false; window.__CPM_VAR597 = []; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Ge' });
/* [7.597.0] la scelta del gesto vive nella preparazione di una SITUATION, non nel gioco ambientale: in
   autoplay il registro restava vuoto e la sonda non misurava niente. Si aprono le scene una per una. */
const tot = await page.evaluate(() => (window.__CPM_SITS || []).length);
for (let gi = 0; gi < tot; gi++) {
  try { await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]); } catch (_e) {}
  await sleep(60);
}
const V = await page.evaluate(() => window.__CPM_VAR597 || []);
await b.close(); srv.close();

console.log(`\n=== QUALE ETICHETTA DIVENTA QUALE GESTO ===\n`);
if (!V.length) { console.log('  ⚠ registro vuoto: NON GIUDICABILE.\n'); process.exit(1); }
const shots = V.filter(x => x.t === 'shot');
const diPrima = shots.filter(x => /prima|deviazion|istintiv|tap-in|controbalz/i.test(x.l));
const acro = diPrima.filter(x => x.v === 'shot_volley');
const veraAcro = shots.filter(x => /rovesciat|sforbiciat/i.test(x.l));
console.log(`  conclusioni registrate: ${shots.length}`);
console.log(`  di cui etichettate «di prima / controbalzo / deviazione / tap-in»: ${diPrima.length}`);
console.log(`  ... rese con il GESTO ACROBATICO (shot_volley): ${acro.length}  ${diPrima.length ? `(${(acro.length / diPrima.length * 100).toFixed(0)}%)` : ''}`);
console.log(`  acrobazie VERE (etichetta rovesciata/sforbiciata): ${veraAcro.length} · rese acrobatiche ${veraAcro.filter(x => x.v === 'shot_volley').length}`);
if (acro.length) { console.log('\n  esempi di conclusioni «di prima» rese come acrobazia:');
  for (const x of acro.slice(0, 5)) console.log(`    «${x.l}» → ${x.v}`); }
/* [7.597.0] COSA CONTIENE DAVVERO `lbl`: la sonda non trova nessuna etichetta «controbalzo» anche se la
   situation del collaudo si chiama «Controbalzo improvviso in area!». Prima di concludere qualunque cosa,
   si guarda il testo che la funzione riceve per davvero. */
console.log('\n  esempi di etichetta ricevuta dalla scelta del gesto:');
for (const x of shots.slice(0, 6)) console.log(`    [${x.a}] «${x.l}» → ${x.v}`);
const per = {}; for (const x of shots) per[x.v] = (per[x.v] || 0) + 1;
console.log('\n  ripartizione dei gesti di conclusione:');
for (const [k, n] of Object.entries(per).sort((a, c) => c[1] - a[1])) console.log(`    ${String(n).padStart(3)}  ${k}`);
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
