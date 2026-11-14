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
/* [giro 162 PO-362] LO STRUMENTO ERA CIECO, ANCHE SULLA BASE (21 righe in 40 s, 0 coppie). MISURATO: tutte le righe arrivavano
   SENZA bersaglio (`bp` null). Causa: dal 7.870 il motore del possesso (`MOTORE870`) guida il pallone e la riga lo DESCRIVE
   (`_bt498=null`, src/15) — e il pavimento che questo guardiano sorveglia (`_pausa485`, `_bgProb`) vive solo nel ramo della
   cronaca pescata, che sotto il motore non gira: li' il ritmo lo tiene il narratore (`cool` in `narra870`), che `__CPM_NO485`
   non tocca. Quindi lo strumento si mette nel regime dove vive cio' che giudica: `__CPM_NO870` acceso in ENTRAMBI i bracci
   (cronaca pescata che comanda il pallone), e si gioca ogni partita fino al suo EVENTO di fine (fischio) e se ne gioca un'altra finche' non ci sono
   `MIN_COPPIE` coppie giudicabili, invece di 40 s fissi, con l'autoplay seedato perche' gli highlight non fermino la partita. Soglie invariate. Sotto il minimo = CIECO.
   ⚠️ Ne segue che, a motore acceso (la partita vera), questo pavimento NON e' sorvegliato da nessuno: lo dice il rapporto 162.
   ⚠️ E LA PROVA DEL ROSSO OGGI NON CADE (misurato giro 162: verde 31 coppie, 6% sotto un terzo; rosso 18 coppie, 0%): il criterio
   «sotto un terzo» fu tarato sul lerp 0,25/tick, e dal 7.511 il passo e' 0,65/tick — una riga a un tick mostra gia' il 65%.
   Col lerp d'origine (`CPM_LERP25=1`, diagnosi) il rosso cade ma cade anche il verde (75%): le righe forzate venute dopo il
   7.485 scavalcano il pavimento. Criterio e soglie NON toccati: decisione aperta nel rapporto. */
/* [giro 167 PO-362] RISCRITTO PER LA PARTITA VERA. Il giro 162 l'aveva rimesso a giudicare nel regime `__CPM_NO870`, ma li' il rosso
   `__CPM_NO485` non cade piu' (il passo 0,65 del 7.511 ha sostituito il pavimento) e la partita vera — motore del possesso acceso —
   restava senza sorveglianza: a motore acceso la riga NON comanda il pallone (`_bt498=null`), lo descrive. Il difetto che la direttiva
   PO teme («la cronaca deve essere sincronizzata con i movimenti sul campo») oggi ha un'altra forma, misurata nel giro 151 (PO-354):
   la riga che racconta al presente un fatto che il campo ha gia' chiuso («conclude di prima!» col pallone a centrocampo).
   CRITERIO VECCHIO: frazione del tragitto dichiarato (`bp`) percorsa prima della riga dopo — mediana >= 50%, coppie sotto un terzo
   <= 15%, minimo 12 coppie — nel regime `__CPM_NO870`; rosso `__CPM_NO485`.
   CRITERIO NUOVO: per OGNI riga del narratore che porta il luogo del fatto (tratto from→to dichiarato dal motore: tiri, cross,
   passaggi, ricezioni, conduzioni, battute, …) la distanza in metri fra il pallone del MOTORE nell'istante in cui la riga esce e quel
   tratto (testimone `__CPM_NAR167`); «fuori sincrono» oltre 15 m (la distanza del 151). Giudizio: quota fuori sincrono <= 10%, su
   almeno 40 righe, nella partita VERA (motore acceso), partite intere fino al fischio. Perche' non e' piu' permissivo: la tolleranza
   scende da 15% a 10%, il campione minimo sale da 12 a 40, si giudica il regime in cui il PO gioca invece di uno spento, e il criterio
   copre tutte le righe con un luogo (partita2d-151 giudica solo tiri e cross).
   ROSSO (CPM_ROSSO=1): `__CPM_NO_G151C` — toglie la regola che fa scendere in coda il tiro/cross gia' chiuso dal campo. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { giocaPartita, distM } from './lib/cronaca-motore.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MIN_RIGHE = 40, SOGLIA = 10, DIST = 15, MAX_PARTITE = +(process.env.CPM_PARTITE || 6), MIN_PARTITE = 2;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const righe = [], errs = [], fini = [];
for (let n = 0; n < MAX_PARTITE && (n < MIN_PARTITE || righe.length < MIN_RIGHE); n++) {
  const r = await giocaPartita(b, port, { nome: 'Sync' + n, seed: 485 + n * 31, flags: ROSSO ? ['__CPM_NO_G151C'] : [] });
  errs.push(...r.errs); fini.push(`${r.minMax}' (${r.fine})`);
  for (const x of r.nar) if (x.from && x.palla && !x.ef) righe.push({ d: distM(x.palla, x.from, x.to), k: x.k, min: x.min, txt: x.txt });
}
await b.close(); srv.close();
righe.sort((a, c) => a.d - c.d);
const fuori = righe.filter(x => x.d > DIST), q = righe.length ? 100 * fuori.length / righe.length : 0;
console.log(`\n=== LA CRONACA RACCONTA IL PALLONE DI ADESSO (motore acceso)${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO_G151C)' : ''} ===`);
console.log(`  partite: ${fini.join(' · ')} · righe con il luogo del fatto: ${righe.length} (minimo ${MIN_RIGHE})`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (righe.length < MIN_RIGHE) { console.log(`\n❌ CIECO: ${righe.length} righe giudicabili, minimo ${MIN_RIGHE}`); process.exit(2); }
console.log(`  distanza pallone↔fatto: mediana ${righe[righe.length >> 1].d.toFixed(1)} m · p90 ${righe[Math.floor(righe.length * 0.9)].d.toFixed(1)} m`);
console.log(`  righe fuori sincrono (> ${DIST} m): ${fuori.length}/${righe.length} = ${q.toFixed(1)}%   (soglia ${SOGLIA}%)`);
const pk = {}; for (const x of fuori) pk[x.k] = (pk[x.k] | 0) + 1; if (fuori.length) console.log('  per fatto: ' + JSON.stringify(pk));
for (const x of fuori.slice(-3).reverse()) console.log(`    ${x.d.toFixed(1).padStart(5)} m  ${x.min}'  «${x.txt}»`);
const ko = q > SOGLIA;
if (ROSSO) {
  if (ko) { console.log('\n✅ prova del rosso riuscita: senza la regola del 151 la cronaca racconta azioni gia\' chiuse'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: il guardiano resta verde anche senza la regola'); process.exit(2);
}
if (ko) { console.log('\n❌ la cronaca racconta azioni che il campo non mostra piu\''); process.exit(2); }
console.log('\n✅ ogni riga racconta un fatto dove il pallone e\' adesso');
