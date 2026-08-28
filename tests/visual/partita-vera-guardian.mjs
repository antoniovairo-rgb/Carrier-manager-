/* [7.628.0 GUARDIANO] LA PARTITA VERA SI GIUDICA DA SOLA.
   Direttiva PO (27/08): «i test di qualita' vanno automatizzati altrimenti non arriviamo
   all'obiettivo». Questo e' il guardiano d'accettazione dello sprint: UN run ambientale seedato
   raccoglie in un colpo i testimoni gia' esistenti e ASSERISCE le bande. Se una release fa
   regredire il cuore della partita — cause del turno, catena degli schemi, fischi dell'arbitro,
   custodia del pallone — il rituale va ROSSO e non si spedisce.
   LEZIONE-MOTION applicata alle soglie: conteggi a soglia su pochi campioni sono flakiness — ogni
   banda ha margine largo sotto il misurato, e i conteggi piccoli (gol) asseriscono solo con
   campione minimo. Le bande si stringono a mano quando i numeri salgono, mai si allentano per
   far passare un rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_TURN616 = {}; window.__CPM_NPD = []; window.__CPM_REC = true; window.__CPM_CARRIER641 = []; });/* [7.643] +REC e +CARRIER641: misura lunga del portatore-stato (informativa finche' la realizzazione non e' stabile, poi banda) */
await openMatch(page, port, { skipLoadAll: true, name: 'Pv' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const all = [];
for (let k = 0; k < 12; k++) { await sleep(20000);
  const chunk = await page.evaluate(() => { const e = (window.__CPM_EV && window.__CPM_EV()) || []; if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); return e; });
  all.push(...chunk); }
const T = await page.evaluate(() => window.__CPM_TURN616 || {});
const NPD = await page.evaluate(() => window.__CPM_NPD || []);
const CAR = await page.evaluate(() => window.__CPM_CARRIER641 || []);
const CODA = await page.evaluate(() => window.__CPM_CODA643 || null);
await b.close(); srv.close();

const rows = all.filter(e => e.ev === 'chronicle');
const goals = all.filter(e => e.ev === 'goal');
const turni = all.filter(e => e.ev === 'turn');
const catRows = rows.filter(r => r.rk === 'catena');
const fischi = turni.filter(t => /^interruzione-/.test(t.causa || '')).length;
const orologio = (T.per && T.per['orologio']) | 0; const totT = T.n | 0;
const causali = totT ? Math.round((totT - orologio) / totT * 100) : null;
const npds = NPD.slice().sort((a, c) => a - c);
const npdMed = npds.length ? npds[Math.floor(npds.length / 2)] : null;
let golCoperti = 0;
for (const g of goals) { const lato = g.side === 'home' ? 1 : -1;
  if (rows.some(r => r.rk && r.min != null && r.min >= g.min - 4 && r.min <= g.min && (r.tn | 0) === lato)) golCoperti++; }

const checks = [
  ['turno-causale', `scritture causali ${causali}% (orologio ${orologio}/${totT})`, totT >= 8 ? causali >= 85 : null],
  ['catena-viva', `${catRows.length} righe di catena`, catRows.length >= 5],
  ['arbitro-esiste', `${fischi} interruzioni ambientali`, fischi >= 6],
  ['custodia', `mediana ${npdMed}u su ${npds.length} campioni (fase 0)`, npds.length >= 6 ? npdMed <= 12 : null],
  ['gol-con-manovra', `${golCoperti}/${goals.length} gol con riga di macchina nei 4' prima`, goals.length >= 3 ? golCoperti >= 1 : null],
];
console.log('\n=== GUARDIANO PARTITA-VERA ===\n');
{ /* [7.643] misura informativa del portatore-stato (F1b): diventa banda quando 2-3 run confermano la stabilita' */
  const _con = CAR.filter(q => q.c).length;
  const _dd = CAR.filter(q => q.d != null).map(q => q.d).sort((a, c) => a - c);
  console.log(`  [info] portatore-stato: campioni ${CAR.length} · copertura ${CAR.length ? Math.round(_con / CAR.length * 100) : 0}% · dist mediana ${_dd.length ? _dd[_dd.length >> 1] : '?'}u · coda consegne ${JSON.stringify(CODA)}`);
}
let fail = 0;
for (const [nome, det, ok] of checks) {
  const tag = ok === null ? '· non giudicabile (campione sotto minimo)' : ok ? '✅' : '❌';
  if (ok === false) fail++;
  console.log(`  ${tag} ${nome} — ${det}`);
}
if (fail) { console.log(`\n❌ PARTITA-VERA: ${fail} banda/e violate — la release non parte.\n`); process.exit(1); }
console.log('\n✅ PARTITA-VERA OK — le bande d\'accettazione tengono.\n');
