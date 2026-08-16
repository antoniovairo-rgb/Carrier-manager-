#!/usr/bin/env node
/* GUARDIANO — LA CRONACA NOMINA CHI PUO' AVER FATTO QUELLA GIOCATA.

   DA DOVE VIENE. Fino al 7.486 il nome di ogni riga era un sorteggio sulla rosa intera: il centravanti
   spazzava in area propria e il portiere crossava. Il 7.487 ha legato il nome al reparto compatibile con
   la zona dichiarata dalla riga (`pd`), e l'avversario alla zona SPECULARE — se noi ci difendiamo, chi
   attacca e' un loro attaccante. Ma il 7.487 ha dovuto scrivere «implementato e NON misurato», perche' la
   sonda provava a risolvere i ruoli delle due rose dal browser e non ci riusciva.

   COSA GIUDICA. La quota di nomi il cui RUOLO e' compatibile con la zona che la riga dichiara.

   ⚠️ SI MISURA ALLA SORGENTE. Il ruolo scelto viene registrato dentro la funzione che sceglie
   (`__CPM_ROLE487`), non ricostruito dal testo a schermo: la cronaca letta dal DOM ha sbagliato tre volte
   di fila (il sorgente dentro il tag <script>, l'osservatore armato tardi, il filtro che non trovava i
   nomi). Dove esiste il punto in cui il dato nasce, si misura li'.

   ⚠️ LA SOGLIA E' SCELTA PER SEPARARE. Misurato: regia attuale 53/53 = 100%, filtro spento 23/58 = 40%
   (che e' il caso: un sorteggio su 23 giocatori azzecca il reparto circa due volte su cinque). La soglia
   sta all'85%, che nessuno dei due bracci attraversa.

   PROVA DEL ROSSO: `__CPM_NO488` toglie il filtro per reparto e il nome torna a essere un sorteggio.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node bg-name-role-test.mjs [CPM_ROSSO=1]                 */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

/* la stessa mappa del gioco: se una delle due cambia, il guardiano smette di misurare cio' che dichiara */
const RUOLI = { attack_goal: /centravanti|attaccante|ala|trequartista/i, attack: /attaccante|centravanti|ala|trequartista|mezzala/i,
  wide_right: /ala|terzino/i, midfield: /mediano|centrocampista|mezzala|trequartista|jolly/i,
  retreat: /difensore|terzino|mediano/i, defend_goal: /difensore|terzino|portiere/i };
const SOGLIA = 85;
const MIN_CAMPIONE = 20;
const FIN = +(process.env.CPM_FIN || 70000);
const ROSSO = !!process.env.CPM_ROSSO;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_ROLE487 = null; if (r) window.__CPM_NO488 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, ROSSO);
await openMatch(page, port, { skipLoadAll: true });
await sleep(FIN);
const dati = await page.evaluate(() => window.__CPM_ROLE487 || []);
await b.close(); srv.close();

let ok = 0, tot = 0; const perZona = {};
for (const d of dati) {
  const re = RUOLI[d.pd]; if (!re || !d.role) continue;
  tot++; const buono = re.test(d.role); if (buono) ok++;
  const z = (perZona[d.pd] = perZona[d.pd] || { ok: 0, n: 0 }); z.n++; if (buono) z.ok++;
}
const pct = tot ? 100 * ok / tot : 0;
console.log(`\n=== IL NOME C'ENTRA CON LA ZONA${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO488)' : ''} ===`);
console.log(`  nomi giudicabili: ${tot}   ·   coerenti: ${ok} = ${tot ? pct.toFixed(0) + '%' : '—'}`);
for (const z of Object.keys(perZona).sort()) console.log(`    ${z.padEnd(12)} ${perZona[z].ok}/${perZona[z].n}`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

/* ⚠️ un guardiano senza campione non e' verde, e' cieco */
if (tot < MIN_CAMPIONE) { console.log(`\n❌ CIECO: solo ${tot} nomi giudicabili (ne servono ${MIN_CAMPIONE}) — la cronaca non ha parlato abbastanza`); process.exit(2); }
const ko = pct < SOGLIA;
if (ROSSO) {
  if (ko) { console.log('\n✅ prova del rosso riuscita: senza il filtro per reparto la coerenza crolla al caso'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: il guardiano resta verde anche col filtro spento'); process.exit(2);
}
if (ko) { console.log(`\n❌ la cronaca nomina giocatori che non c'entrano con la zona (${pct.toFixed(0)}% < ${SOGLIA}%)`); process.exit(2); }
console.log('\n✅ chi viene nominato puo\' davvero aver fatto quella giocata');
