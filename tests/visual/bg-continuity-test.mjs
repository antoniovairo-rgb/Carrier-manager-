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
/* [giro 167 PO-362] RISCRITTO PER LA PARTITA VERA. Era CIECO (0 righe confrontabili, minimo 12, anche sulla base del giro 151): leggeva il
   bersaglio dichiarato `__CPM_BGSYNC.bp`, che a motore acceso e' nullo per costruzione (la riga non comanda il pallone, `_bt498=null`).
   Il freno del 7.498 che sorvegliava vive solo nella cronaca pescata. Il «teletrasporto» che la direttiva teme, a motore acceso, e' la
   riga che manda il racconto dall'altra parte del campo rispetto a dove il pallone sta.
   CRITERIO VECCHIO: salto fra dove sta il pallone all'uscita della riga e dove la riga lo manda (`bp`), quota oltre mezzo campo
   (50 unita') <= 5%, gol esclusi, minimo 12 righe; rosso `__CPM_NO498`.
   CRITERIO NUOVO: salto fra il pallone del MOTORE all'uscita della riga e il punto che la riga dichiara (il `to` del fatto, che e' il
   `bpos` della riga del narratore; testimone `__CPM_NAR167`), stesse unita' (0-100), stessa soglia (oltre 50 unita' <= 5%), gol
   esclusi, minimo 40 righe, partite intere a motore acceso. Perche' non e' piu' permissivo: soglia e unita' identiche, campione minimo
   da 12 a 40, regime della partita vera.
   ROSSO (CPM_ROSSO=1): `__CPM_NO_G151C` — la riga torna a raccontare tiri e cross gia' chiusi, cioe' a mandare il racconto in porta
   mentre il pallone e' altrove. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { giocaPartita } from './lib/cronaca-motore.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const SOGLIA_QUOTA = 5, MEZZO_CAMPO = 50, MIN_RIGHE = 40, MAX_PARTITE = +(process.env.CPM_PARTITE || 6), MIN_PARTITE = 3;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const salti = [], errs = [], fini = []; let nGol = 0;
for (let i = 0; i < MAX_PARTITE && (i < MIN_PARTITE || salti.length < MIN_RIGHE); i++) {
  const r = await giocaPartita(b, port, { nome: 'Cont' + i, seed: 300 + i * 53, flags: ROSSO ? ['__CPM_NO_G151C'] : [] });
  errs.push(...r.errs); fini.push(`${r.minMax}' (${r.fine})`);
  for (const x of r.nar) { if (!x.to || !x.palla) continue; if (x.ef || x.k === 'gol') { nGol++; continue; }
    salti.push({ d: Math.hypot(x.to.x - x.palla.x, x.to.y - x.palla.y), min: x.min, txt: x.txt, k: x.k }); }
}
await b.close(); srv.close();
salti.sort((a, c) => a.d - c.d);
console.log(`\n=== IL RACCONTO NON SI TELETRASPORTA (motore acceso)${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO_G151C)' : ''} ===`);
console.log(`  partite: ${fini.join(' · ')}`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (salti.length < MIN_RIGHE) { console.log(`  ⚠ solo ${salti.length} righe confrontabili (minimo ${MIN_RIGHE})\n\n❌ CIECO: non abbastanza righe per misurare`); process.exit(2); }
const qq = f => salti[Math.min(salti.length - 1, Math.floor(salti.length * f))].d;
const oltre = salti.filter(s => s.d > MEZZO_CAMPO), quota = 100 * oltre.length / salti.length;
console.log(`  righe misurate        ${salti.length}  (${nGol} righe di gol escluse)`);
console.log(`  salto dichiarato      mediana ${qq(0.5).toFixed(1)} · p90 ${qq(0.9).toFixed(1)} · max ${salti[salti.length - 1].d.toFixed(1)} unita'`);
console.log(`  oltre mezzo campo     ${oltre.length}/${salti.length} = ${quota.toFixed(1)}%   (soglia ${SOGLIA_QUOTA}%)`);
for (const s of oltre.slice(-4).reverse()) console.log(`    ${s.d.toFixed(1).padStart(5)}u  ${String(s.min).padStart(2)}'  ${s.k.padEnd(10)} ${s.txt}`);
if (ROSSO) {
  if (quota > SOGLIA_QUOTA) { console.log(`\n✅ prova del rosso riuscita: senza la regola la quota risale a ${quota.toFixed(1)}%`); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: quota ${quota.toFixed(1)}% anche senza la regola`); process.exit(2);
}
if (quota > SOGLIA_QUOTA) { console.log(`\n❌ ${quota.toFixed(1)}% delle righe manda il racconto oltre mezzo campo dal pallone`); process.exit(2); }
console.log('\n✅ la cronaca racconta il gioco dove si gioca, non per salti');
