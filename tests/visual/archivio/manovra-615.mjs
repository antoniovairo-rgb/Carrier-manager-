/* [7.615.0 STRUMENTO] IL GOL HA UNA MANOVRA ALLE SPALLE?
   COLLAUDO PO, ripetuto su piu' build: «in cronaca i gol non arrivano da azioni manovrate»,
   «non si vede l'azione del gol, niente schemi ed azioni di calcio». Mai misurato DAL LATO DEI GOL:
   si sa che la catena scrive l'1% dei fotogrammi (scrittori-601) e guida il pallone il 5% del tempo
   (storico 7.600), ma non quanti GOL arrivino nudi — senza nemmeno una riga di macchina (catena,
   contropiede, ponte) del lato che segna nei minuti prima.
   Legge il libro mastro __CPM_EV (righe con `rk` = quale macchina ha scritto; gol con minuto e lato)
   raccogliendo a finestre (l'anello tiene 400 voci: si vuota e si somma).
   NON e' un guardiano: misura. CPM_SEED per il seed (default 7300). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
const SEED = (process.env.CPM_SEED | 0) || 7300;
await openMatch(page, port, { skipLoadAll: true, name: 'Mn' });
await page.evaluate((sd) => window.__CPM_AUTOPLAY(true, { seed: sd, policy: 'seeded', tickMs: 300 }), SEED);
const all = [];
for (let k = 0; k < 15; k++) { /* 15 finestre da 20 s = 300 s: l'anello non fa in tempo a perdere nulla */
  await sleep(20000);
  const chunk = await page.evaluate(() => { const e = (window.__CPM_EV && window.__CPM_EV()) || []; if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); return e; });
  all.push(...chunk);
}
await b.close(); srv.close();

const goals = all.filter(e => e.ev === 'goal');
const rows = all.filter(e => e.ev === 'chronicle');
console.log(`\n=== IL GOL HA UNA MANOVRA ALLE SPALLE? (${all.length} eventi, ${goals.length} gol, ${rows.length} righe) ===\n`);
if (goals.length < 3) { console.log('  ⚠ meno di 3 gol nel campione: NON GIUDICABILE, allungare la passata.\n'); process.exit(1); }
let nudi = 0, conCat = 0, conMacchina = 0;
const dettagli = [];
for (const g of goals) {
  const lato = g.side === 'home' ? 1 : -1;
  const prima = rows.filter(r => r.min != null && r.min >= g.min - 4 && r.min <= g.min && (r.tn | 0) === lato);
  const cat = prima.filter(r => r.rk === 'catena').length;
  const mac = prima.filter(r => r.rk === 'catena' || r.rk === 'counter' || r.rk === 'ponte').length;
  if (mac === 0) nudi++;
  if (cat >= 2) conCat++;
  if (mac >= 1) conMacchina++;
  dettagli.push({ min: g.min, side: g.side, src: g.src, righeLato: prima.length, catena: cat, macchina: mac });
}
console.log(`  gol NUDI (zero righe di macchina del lato che segna nei 4' prima): ${nudi}/${goals.length}`);
console.log(`  gol con almeno UNA riga di macchina prima: ${conMacchina}/${goals.length}`);
console.log(`  gol con una CATENA vera (>=2 passi) prima: ${conCat}/${goals.length}`);
console.log(`\n  dettaglio per gol:`);
for (const d of dettagli) console.log(`    ${d.min}' ${d.side} (${d.src}) · righe del lato nei 4': ${d.righeLato} · di catena: ${d.catena} · di macchina: ${d.macchina}`);
const perRk = {};
for (const r of rows) { const k = r.rk || '(pescata)'; perRk[k] = (perRk[k] || 0) + 1; }
console.log(`\n  righe per macchina sull'intera passata:`);
for (const [k, n] of Object.entries(perRk).sort((a, c) => c[1] - a[1])) console.log(`    ${String(n).padStart(4)}  ${k}`);
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
