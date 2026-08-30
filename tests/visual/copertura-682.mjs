/* [STRUMENTO] LE DICIANNOVE SCHEDE ESCONO DAVVERO? (copertura e ripetizioni fra partite)
   ⚠️ IL METRO CHE AVEVO SCRITTO NEL DOCUMENTO ERA SBAGLIATO: «nessun ramo deve valere piu' del 50%»
   non misura niente se e' un bot a scegliere a caso — verrebbe 50/50 per costruzione, e direbbe
   soltanto che il mio generatore casuale funziona. Le domande che contano sono altre:
   (a) COPERTURA: su N partite, quante delle 19 schede si affacciano almeno una volta? Se ne escono
       sempre le stesse tre, il giocatore vede lo stesso film e la libreria e' finta.
   (b) RIPETIZIONI FRA PARTITE: quante volte la stessa scheda torna in partite diverse, e quante
       volte torna con lo STESSO ramo (che e' la ripetizione che si nota davvero). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = Number(process.env.CPM_N || 8);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
/* ⚠️ UN SOLO CONTESTO PER TUTTE LE PARTITE. `browser.newPage()` apre un contesto ISOLATO, con il suo
   localStorage: misurando cosi' la memoria fra partite (7.682) non sarebbe mai stata esercitata — ogni
   gara sarebbe stata la prima. Un giocatore vero apre le sue partite nello stesso browser. */
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const tutte = [];
/* ⚠️ TERZA IMPOSTAZIONE DI QUESTA MISURA, e le prime due erano sbagliate per due ragioni diverse.
   (1) Un contesto browser NUOVO per ogni partita isola il localStorage: la memoria fra partite non
   sarebbe mai stata esercitata, ogni gara sarebbe stata la prima. (2) Condividere il contesto — o
   ricaricare la stessa pagina — fa ritrovare al gioco la CARRIERA salvata, che non vive solo nel
   localStorage, e dalla seconda partita openMatch non aggancia piu' (timeout, due volte).
   Qui si tiene il contesto isolato (partita pulita, come la prima di sempre) e si trasporta A MANO
   la sola memoria delle interazioni: e' esattamente cio' che il gioco vero conserva fra una gara e
   l'altra, senza portarsi dietro nient'altro. */
let memoria = null, NSCHEDE = null;
for (let g = 0; g < N; g++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript((m) => {
    try { if (m) localStorage.setItem('cpm-intx-recenti', m); } catch (_e) {}
    window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_SC681 = []; window.__CPM_SCMS681 = 1200;
  }, memoria);
  await openMatch(page, port, { skipLoadAll: true, name: 'Cop' });
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 90 }), 7300 + g * 137);
  for (let k = 0; k < 120; k++) {
    await sleep(900);
    await page.evaluate(() => { const d = document.querySelector('[data-cpm="com661"]'); if (!d) return; const bs = [...d.querySelectorAll('button')]; if (bs.length) bs[Math.floor(Math.random() * bs.length)].click(); });
    const c = await page.evaluate(() => { try { return window.__CPM_STATE().clock; } catch (_e) { return null; } });
    if (c != null && c >= 89) break;
  }
  if (NSCHEDE == null) NSCHEDE = await page.evaluate(() => { try { return (window.__CPM_INTX_N || null); } catch (_e) { return null; } });
  const SC = await page.evaluate(() => window.__CPM_SC681 || []);
  memoria = await page.evaluate(() => { try { return localStorage.getItem('cpm-intx-recenti'); } catch (_e) { return null; } });
  tutte.push(SC);
  console.log(`  partita ${g + 1}: ${SC.map(x => x.id + '#' + x.idx).join(' \u00b7 ') || '(nessuna)'}`);
  await ctx.close();
}
await b.close(); srv.close();
const flat = tutte.flat();
const schede = new Set(flat.map(x => x.id));
/* il denominatore si LEGGE dal gioco: cablarlo a 19 avrebbe fatto sembrare una copertura del 53%
   quella che, con le nove schede aggiunte, e' del 36% — un numero cablato mente appena il codice cambia. */

const coppie = {}; for (const x of flat) { const k = x.id + '#' + x.idx; coppie[k] = (coppie[k] || 0) + 1; }
const rip = Object.entries(coppie).filter(([, v]) => v > 1);
console.log(`\n=== COPERTURA DELLE SCHEDE SU ${N} PARTITE ===\n`);
console.log(`  scelte totali: ${flat.length} · schede distinte viste: ${schede.size}/${NSCHEDE}`);
console.log(`  mai uscite: ${NSCHEDE - schede.size}`);
console.log(`  coppie (scheda, ramo) ripetute in partite diverse: ${rip.length}`);
for (const [k, v] of rip.sort((a, c) => c[1] - a[1]).slice(0, 8)) console.log(`    ${k} × ${v}`);
console.log('');
