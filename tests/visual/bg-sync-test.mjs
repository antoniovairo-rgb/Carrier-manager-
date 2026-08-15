#!/usr/bin/env node
/* GUARDIANO — LA CRONACA NON SMENTISCE IL MOVIMENTO CHE HA APPENA ANNUNCIATO.

   DA DOVE VIENE. Direttiva PO: «la cronaca deve rispecchiare ed essere sincronizzata con i movimenti sul
   campo». Ogni riga di `BG_MATCH` DICHIARA dove va il pallone (`bpos`) e come si dispone la squadra
   (`pd`): testo e movimento nascono dalla stessa sorgente — tutte e 188 le voci hanno entrambi i campi,
   verificato — quindi la desincronia non era di contenuto ma di TEMPO.

   COSA GIUDICA. La FRAZIONE del tragitto dichiarato che il pallone percorre prima che la riga successiva
   sposti il bersaglio. E' un rapporto, quindi non dipende da fps o dispositivo.

   ⚠️ IL DIFETTO ERA IL RAGGRUPPAMENTO, NON LA DENSITA' MEDIA. Misurato prima: mediana 64%, ma 5 coppie su
   12 sotto un terzo — e quelle stavano TUTTE a 418-420 ms l'una dall'altra, cioe' un tick solo, con il
   pallone fermo a un passo di lerp (0,25 = 25%) dal punto di partenza. Un pavimento di 3 tick garantisce
   1-0,75^3 = 58% di ogni movimento annunciato; la probabilita' per tick e' salita in cambio (0,18 -> 0,55)
   perche' col solo pavimento la cronaca crollava da 15 righe a 4 su 40 secondi, che e' l'opposto di una
   telecronaca.

   ⚠️ DUE ECCEZIONI LEGITTIME, ed e' importante non trattarle come difetti:
     · IL GOL del micro-simulatore e' esente dal pavimento — si racconta quando accade, non quando la
       pausa lo consente. Nella misura appare come una coppia a un tick di distanza.
     · Una coppia a cavallo di un HIGHLIGHT ha un intervallo enorme (misurati 13,6 s) e una frazione
       bassa: li' la cronaca e' sospesa e il pallone e' stato mosso dall'azione, non dalla riga.
   Il criterio guarda quindi la MEDIANA e conta le coppie sotto un terzo ESCLUDENDO gol e salti di fase.

   PROVA DEL ROSSO: `__CPM_NO485` toglie il pavimento e rimette la probabilita' di prima.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node bg-sync-test.mjs [CPM_ROSSO=1]                      */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const FIN = +(process.env.CPM_FIN || 40000);
const ROSSO = !!process.env.CPM_ROSSO;
const MIN_MEDIANA = 50;   /* nuovo 68% · vecchio 64% con la coda rotta: si giudica la CODA, non la mediana */
const MAX_SCARSE = 15;    /* % di coppie sotto un terzo: misurato 0-5% col pavimento, 42% senza */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_BGSYNC = null; if (r) window.__CPM_NO485 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, ROSSO);
await openMatch(page, port, { skipLoadAll: true });
await sleep(FIN);
const g = await page.evaluate(() => window.__CPM_BGSYNC || []);
await b.close(); srv.close();

const conBp = g.filter(x => x.bp);
const coppie = [];
for (let i = 0; i < conBp.length - 1; i++) {
  const a = conBp[i], c = conBp[i + 1];
  const dTot = Math.hypot(a.bp.x - a.da.x, a.bp.y - a.da.y);
  if (dTot < 3) continue;                                   /* bersaglio gia' addosso: nulla da percorrere */
  if (/gol|gol avversario/i.test(a.txt) || /gol/i.test(c.txt)) continue;   /* il gol e' esente per progetto */
  if (c.t - a.t > 6000) continue;                           /* coppia a cavallo di un highlight */
  coppie.push({ q: 100 * Math.min(1, Math.hypot(c.da.x - a.da.x, c.da.y - a.da.y) / dTot), dt: c.t - a.t, txt: a.txt });
}
coppie.sort((x, y) => x.q - y.q);
const med = coppie.length ? coppie[Math.floor(coppie.length / 2)].q : null;
const scarse = coppie.filter(x => x.q < 33).length;
const pctScarse = coppie.length ? 100 * scarse / coppie.length : 0;

console.log(`\n=== CRONACA ⟺ MOVIMENTO${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO485)' : ''} ===`);
console.log(`  righe di cronaca in ${FIN / 1000}s: ${g.length}   ·   coppie giudicabili: ${coppie.length}`);
if (!coppie.length) { console.log('\n❌ CIECO: nessuna coppia misurata — la cronaca non ha parlato'); process.exit(2); }
console.log(`  tragitto annunciato percorso prima della riga dopo: mediana ${med.toFixed(0)}% (minimo ${coppie[0].q.toFixed(0)}%)`);
console.log(`  coppie sotto un terzo del tragitto: ${scarse}/${coppie.length} = ${pctScarse.toFixed(0)}%`);
for (const x of coppie.slice(0, 3)) console.log(`    ${x.q.toFixed(0).padStart(3)}% in ${String(x.dt).padStart(5)} ms · «${x.txt}»`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

const ko = (med < MIN_MEDIANA) || (pctScarse > MAX_SCARSE);
if (ROSSO) {
  if (ko) { console.log('\n✅ prova del rosso riuscita: senza il pavimento la cronaca smentisce i propri movimenti'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: il guardiano resta verde anche senza il pavimento'); process.exit(2);
}
if (ko) { console.log(`\n❌ la cronaca annuncia movimenti che il campo non fa in tempo a mostrare`); process.exit(2); }
console.log('\n✅ ogni riga di cronaca ha il tempo di essere mostrata prima della successiva');
