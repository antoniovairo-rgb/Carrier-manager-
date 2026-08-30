/* [STRUMENTO] QUANTE AZIONI SALIENTI EXTRA-EROE ARRIVANO IN UNA PARTITA.
   Il PO l'ha segnalato quattro volte: «le azioni salienti extra eroe non partono». Qui si contano
   le azioni composte dalla libreria che finiscono nel feed, con quante righe ciascuna e a che minuto. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((on) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_LIB666 = []; if (!on) window.__CPM_NO683 = 1;/* [7.683.0] la libreria e' accesa di default: il rosso la SPEGNE */ }, process.env.CPM_OFF !== '1');
await openMatch(page, port, { skipLoadAll: true, name: 'Az' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const all = [];
for (let k = 0; k < 12; k++) { await sleep(20000);
  const c = await page.evaluate(() => { const e = (window.__CPM_EV && window.__CPM_EV()) || []; if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); return e; });
  all.push(...c); }
const AZ = await page.evaluate(() => window.__CPM_LIB666 || []);
const clock = await page.evaluate(() => { try { return window.__CPM_STATE().clock; } catch (_e) { return null; } });
await b.close(); srv.close();
const righe = all.filter(e => e.ev === 'chronicle');
console.log('\n=== AZIONI SALIENTI EXTRA-EROE IN UNA PARTITA ===\n');
console.log(`  minuto raggiunto: ${clock} · righe di cronaca totali: ${righe.length}`);
console.log(`  AZIONI SALIENTI composte: ${AZ.length} (banda dichiarata: 3-5)`);
for (const a of AZ) console.log(`    ${String(a.min).padStart(2)}' · ${a.n} righe · struttura ${a.sig}`);
const strutture = new Set(AZ.map(a => String(a.sig).split('|')[0]));
console.log(`  strutture distinte: ${strutture.size}/${AZ.length}`);
console.log('');
