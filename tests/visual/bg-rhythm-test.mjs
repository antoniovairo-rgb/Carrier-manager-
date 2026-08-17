#!/usr/bin/env node
/* GUARDIANO — LA PARTITA HA UN RITMO, NON UNA CADENZA.

   DA DOVE VIENE. Direttiva PO: «a 1x deve sembrare di seguire una vera partita: fase normale →
   costruzione → sviluppo → azione pericolosa → attesa → highlight → conseguenza. Devono esistere anche
   fasi meno importanti fra gli highlight, cosi' da creare ritmo e attesa».

   Fino al 7.500 `playing` non aveva stati: la cronaca usciva con la STESSA probabilita' per tutti i
   novanta minuti (0,55 + momentum) e con lo stesso pavimento di 3 tick fra due righe. Una rimessa
   laterale a centrocampo e un pallone in area avevano lo stesso respiro — e in un feed di testo il
   respiro E' il ritmo.

   COSA GIUDICA. L'intervallo (in MINUTI DI GIOCO) fra due righe consecutive, separato per FASE:
   `pericolo` (pallone in una delle due aree) · `sviluppo` (trequarti avversaria o fascia) ·
   `costruzione` (centrocampo o ripiegamento). Il ritmo esiste se la COSTRUZIONE respira piu' dello
   SVILUPPO: sono le «fasi meno importanti fra gli highlight» che la direttiva chiede, quelle che creano
   l'attesa. Il guardiano pretende una SEPARAZIONE, non una differenza qualsiasi.

   ⚠️ E NON SI GIUDICA SU `pericolo`, PERCHE' LA PRIMA STESURA LO FACEVA E LA MISURA L'HA SMENTITA.
   L'attesa era «in area si racconta piu' fitto»; misurato, in `pericolo` l'intervallo e' PIU' LUNGO che
   in `sviluppo` (4,20 contro 3,00 minuti). Il motivo e' corretto e va lasciato stare: in area gli eventi
   sono quasi sempre IMPORTANTI (sono tiri), e li' scatta la pausa d'enfasi di 7 tick del 7.490 — che ha
   la PRECEDENZA sul pavimento di fase, ed e' la direttiva PO «eventi importanti: piu' tempo di lettura».
   Misurare li' avrebbe messo due regole giuste una contro l'altra.

   ⚠️ SI MISURA IN MINUTI DI GIOCO, NON IN MILLISECONDI. Il tempo reale fra due righe dipende dalla
   velocita' scelta e dal fps dell'headless; i minuti di gioco no, e sono la grandezza che il giocatore
   percepisce come «ritmo della partita».

   ⚠️ SI SCARTANO GLI INTERVALLI A CAVALLO DI UN HIGHLIGHT. Durante gli `hl_*` il clock e' CONGELATO e la
   cronaca sospesa: la coppia di righe che sta a cavallo di un momento interattivo mostra un intervallo
   lungo che non c'entra col ritmo del gioco fluido. Si tengono solo le coppie con la stessa fase da
   entrambi i lati e un salto di minuti plausibile.

   ⚠️ E SI PRETENDE CHE TUTTE E TRE LE FASI ESISTANO: un ritmo misurato su una fase sola non e' un ritmo.

   PROVA DEL ROSSO: `__CPM_NO501` appiattisce densita' e pavimento sui valori unici di prima. La
   separazione fra le fasi deve sparire.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node bg-rhythm-test.mjs [CPM_ROSSO=1]                    */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
/* ⚠️ SEI PARTITE, NON QUATTRO. Con quattro la fase `sviluppo` scendeva sotto le 8 coppie omogenee e il
   guardiano si dichiarava CIECO — correttamente: una media su quattro intervalli non e' una media. Il
   minimo non si abbassa, si campiona di piu'. */
const PARTITE = +(process.env.CPM_PARTITE || 6);
const TETTO_MS = +(process.env.CPM_TETTO || 300000);
const MIN_COPPIE = 8;          /* per fase, sotto questo numero la media non dice nulla */
/* SOGLIA SCELTA PER SEPARARE — e ri-scelta dopo che la correzione del premio di famiglia (7.501, il
   ×7 sulle famiglie sottili) ha cambiato il MIX delle righe. Misure finali su 6 partite: col ritmo
   1,47× (costruzione 5,72 contro sviluppo 3,90 minuti di gioco), col ritmo piatto 0,84×.
   ⚠️ La prima soglia era 1,45 e lasciava DUE CENTESIMI di margine al verde: sarebbe diventata rossa a
   caso, cioe' esattamente il difetto che questo repo ha gia' pagato con `match-speed`. A 1,30 il verde
   ha +13% di margine e il rosso −35%.
   ⚠️ Il margine del verde resta comunque il piu' stretto dei due: se questo guardiano comincia a
   tremolare, la risposta e' rendere piu' marcato il ritmo (densita' della costruzione sotto 0,60), non
   abbassare ancora la soglia. */
const SEPARAZIONE = +(process.env.CPM_SEP || 1.30);   /* costruzione dev'essere almeno tanto piu' lenta di sviluppo */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function partita(i) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO501 = 1; }, ROSSO);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Rit' + i });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 1100 + i * 67);
    const t0 = Date.now();
    while (Date.now() - t0 < TETTO_MS) {
      await sleep(500);
      const ph = await matchPhase(page);
      if (ph === 'ended' || ph === 'ceremony') break;
    }
    return await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'));
  } catch (e) { return []; }
  finally { await page.close().catch(() => {}); }
}

const perFase = { pericolo: [], sviluppo: [], costruzione: [] };
for (let i = 0; i < PARTITE; i++) {
  const righe = await partita(i);
  for (let k = 1; k < righe.length; k++) {
    const a = righe[k - 1], c = righe[k];
    if (!a.fase || !c.fase || a.fase !== c.fase) continue;   /* coppia omogenea */
    const d = (c.min | 0) - (a.min | 0);
    if (d <= 0 || d > 14) continue;                          /* a cavallo di un highlight: clock congelato */
    if (perFase[c.fase]) perFase[c.fase].push(d);
  }
}
await b.close(); srv.close();

const media = v => v.length ? v.reduce((a, c) => a + c, 0) / v.length : null;
console.log(`\n=== LA PARTITA HA UN RITMO${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO501)' : ''} ===`);
const M = {};
for (const f of ['pericolo', 'sviluppo', 'costruzione']) {
  const v = perFase[f]; M[f] = media(v);
  console.log(`  ${f.padEnd(12)} ${String(v.length).padStart(3)} coppie · intervallo medio ${M[f] == null ? '—' : M[f].toFixed(2) + " minuti di gioco"}`);
}
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

const scarse = ['sviluppo', 'costruzione'].filter(f => perFase[f].length < MIN_COPPIE);
if (scarse.length) {
  console.log(`\n❌ CIECO: fasi con meno di ${MIN_COPPIE} coppie (${scarse.join(', ')}) — la media non dice nulla`);
  process.exit(2);
}
const rapporto = M.costruzione / M.sviluppo;
console.log(`\n  costruzione / sviluppo   ${rapporto.toFixed(2)}×   (serve ≥ ${SEPARAZIONE}×)`);
console.log(`  nota: in \`pericolo\` l'intervallo e' governato dalla pausa d'enfasi del 7.490 (7 tick sugli`);
console.log(`        eventi importanti, che in area sono quasi tutti) — percio' non si giudica li'.`);

if (ROSSO) {
  if (rapporto < SEPARAZIONE) { console.log(`\n✅ prova del rosso riuscita: col ritmo piatto la separazione sparisce (${rapporto.toFixed(2)}×)`); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: separazione ${rapporto.toFixed(2)}× anche col ritmo spento`); process.exit(2);
}
if (rapporto < SEPARAZIONE) { console.log(`\n❌ separazione ${rapporto.toFixed(2)}× sotto la soglia: la costruzione scorre come lo sviluppo, non c'e' attesa`); process.exit(2); }
console.log('\n✅ la costruzione respira, lo sviluppo scorre: il ritmo c\'e\'');
