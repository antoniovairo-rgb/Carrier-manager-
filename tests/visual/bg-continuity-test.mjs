#!/usr/bin/env node
/* GUARDIANO — IL PALLONE NON SI TELETRASPORTA FRA DUE RIGHE DI CRONACA.

   DA DOVE VIENE. Direttiva PO sulla Match Experience: «la simulazione deve essere la single source of
   truth; non voglio sistemi indipendenti che inventano separatamente cio' che sta succedendo». L'audit ha
   trovato il verso invertito in una riga sola: `ballTargetRef.current = ev.bpos` — la riga di cronaca,
   pescata da una tabella, ASSEGNA la destinazione del pallone, qualunque sia la posizione reale. Una
   partita vera non sposta il gioco da una trequarti all'altra fra due frasi.

   COSA GIUDICA. Il SALTO DICHIARATO: la distanza (in unita' logiche 0-100) fra dove sta il pallone quando
   esce una riga e dove quella riga lo manda. E' adimensionale rispetto al tempo, quindi confrontabile fra
   headless e telefono. Il testimone e' `__CPM_BGSYNC`, che il 7.485 gia' scriveva col dichiarato (`bp`) e
   il reale (`da`) affiancati: qui non si aggiunge una sonda, si legge quella che c'e'.

   ⚠️ NON TUTTI I SALTI SONO DIFETTI. Un contropiede sposta davvero il gioco, e la cronaca deve poterlo
   dire. Cio' che non e' credibile e' il salto GRANDE e FREQUENTE: si misura la mediana e la coda, non il
   massimo. La soglia guarda la QUOTA di righe che spostano il gioco di oltre mezzo campo.

   ⚠️ La fase si legge da `__CPM_PHASE` (7.494/7.495/7.496), mai da `__CPM_STATE`.

   PROVA DEL ROSSO: `__CPM_NO498` rimette l'assegnazione diretta (il testo comanda senza freni). La quota
   di salti oltre mezzo campo deve risalire.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node bg-continuity-test.mjs [CPM_ROSSO=1]                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 3);
const TETTO_MS = +(process.env.CPM_TETTO || 240000);
/* ⚠️ LA SOGLIA E' SCELTA PER SEPARARE, e la prima non separava. Era a 12% perche' la baseline grezza
   diceva 12,2% — ma quella contava anche le righe di gol; tolte quelle, la baseline scende a 10,3% e una
   soglia al 12% lasciava passare pure il braccio rosso (prova del rosso fallita a 10,3% < 12%). Col
   freno acceso la quota misurata e' 0,0%: 5% sta in mezzo con margine da entrambe le parti.
   ⚠️ E VA DETTO CHE SOPRA IL TETTO LA MISURA E' LIMITATA PER COSTRUZIONE: col freno a 45 unita', «quante
   righe superano le 50» non puo' che essere zero. Quindi il verde da solo dimostra poco — cio' che da'
   valore a questo guardiano e' la PROVA DEL ROSSO, che senza freno risale a 10,3% con punte di 71,9. */
const SOGLIA_QUOTA = +(process.env.CPM_SOGLIA || 5);    /* % massima di righe che spostano oltre mezzo campo */
const MEZZO_CAMPO = 50;
const MIN_RIGHE = 12;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function partita(i) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_BGSYNC = null; if (r) window.__CPM_NO498 = 1; }, ROSSO);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Cont' + i });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 350 }), 300 + i * 53);
    const t0 = Date.now();
    while (Date.now() - t0 < TETTO_MS) {
      await sleep(500);
      const ph = await matchPhase(page);
      if (ph === 'ended' || ph === 'ceremony') break;
    }
    return await page.evaluate(() => window.__CPM_BGSYNC || []);
  } catch (e) { return []; }
  finally { await page.close().catch(() => {}); }
}

const righe = [];
for (let i = 0; i < PARTITE; i++) righe.push(...(await partita(i)));
await b.close(); srv.close();

/* ⚠️ I GOL SONO ESENTI, E VA SCRITTO. Un gol subito porta il pallone nella PROPRIA rete e uno segnato in
   quella avversaria: il «salto» li' e' il gioco, non un difetto. La prima misura contava 5 righe oltre
   mezzo campo e DUE erano `opp_goal` — misurare senza escluderle avrebbe accusato l'unico evento che ha
   tutto il diritto di spostare il pallone da una parte all'altra del campo. */
const eGol = r => r.pd === 'opp_goal' || r.pd === 'attack_goal' || /gol/i.test(r.txt || '');
const salti = righe.filter(r => r && r.bp && r.da && !eGol(r)).map(r => ({
  d: Math.hypot(r.bp.x - r.da.x, r.bp.y - r.da.y), min: r.min, txt: r.txt, pd: r.pd
}));
const nGol = righe.filter(r => r && r.bp && r.da && eGol(r)).length;
salti.sort((a, b2) => a.d - b2.d);

console.log(`\n=== IL PALLONE NON SI TELETRASPORTA FRA DUE RIGHE${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO498)' : ''} ===`);
if (salti.length < MIN_RIGHE) {
  console.log(`  ⚠ solo ${salti.length} righe confrontabili (minimo ${MIN_RIGHE})`);
  console.log('\n❌ CIECO: non abbastanza righe per misurare'); process.exit(2);
}
const q = f => salti[Math.min(salti.length - 1, Math.floor(salti.length * f))].d;
const oltre = salti.filter(s => s.d > MEZZO_CAMPO);
const quota = 100 * oltre.length / salti.length;
console.log(`  righe misurate        ${salti.length}  (${nGol} righe di gol escluse: li' il pallone si sposta davvero)`);
console.log(`  salto dichiarato      mediana ${q(0.5).toFixed(1)} · p90 ${q(0.9).toFixed(1)} · max ${salti[salti.length - 1].d.toFixed(1)} unita'`);
console.log(`  oltre mezzo campo     ${oltre.length}/${salti.length} = ${quota.toFixed(1)}%   (soglia ${SOGLIA_QUOTA}%)`);
if (oltre.length) {
  console.log('\n  le righe che spostano di piu\':');
  for (const s of oltre.slice(-5).reverse()) console.log(`    ${s.d.toFixed(1).padStart(5)}u  ${String(s.min).padStart(2)}'  ${(s.pd || '—').padEnd(12)} ${s.txt}`);
}
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

if (ROSSO) {
  if (quota > SOGLIA_QUOTA) { console.log(`\n✅ prova del rosso riuscita: senza il freno la quota risale a ${quota.toFixed(1)}%`); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: quota ${quota.toFixed(1)}% anche col freno spento — il rimedio non stava frenando nulla`); process.exit(2);
}
if (quota > SOGLIA_QUOTA) { console.log(`\n❌ ${quota.toFixed(1)}% delle righe sposta il gioco oltre mezzo campo`); process.exit(2); }
console.log('\n✅ la cronaca sposta il gioco per continuita\', non per salto');
