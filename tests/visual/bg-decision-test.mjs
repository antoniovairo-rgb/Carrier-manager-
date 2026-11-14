#!/usr/bin/env node
/* GUARDIANO — LA CRONACA RACCONTA L'EVENTO CHE LA SIMULAZIONE HA DECISO.

   DA DOVE VIENE. Direttiva PO sulla Match Experience: «la simulazione deve essere la single source of
   truth · non voglio sistemi indipendenti che inventano separatamente cio' che sta succedendo». Il 7.486
   aveva gia' fatto pesare la distanza fra la zona dichiarata dalla riga e quella vera del pallone, ma
   nessuno DECIDEVA prima cosa stesse succedendo: la riga usciva da un sorteggio e poi la sua `pd`
   diventava la verita' — muove la forma della squadra, sceglie l'arco, nomina il reparto.

   Dal 7.499 la decisione viene PRIMA ed e' una lettura dello stato reale (dove sta il pallone, su che
   corsia), e la riga si pesca per DESCRIVERLA.

   COSA GIUDICA. La QUOTA DI ACCORDO fra la famiglia decisa (`dec`) e quella dichiarata dalla riga uscita
   (`pd`), su partite vere fino al fischio. Due livelli, perche' il campo e' un continuo:
     · accordo ESATTO — la riga parla della stessa famiglia decisa;
     · accordo LARGO — la riga parla di una famiglia CONFINANTE (una riga di centrocampo mentre si
       ripiega non e' una bugia; una riga di area avversaria si').

   ⚠️ RESTA UN PESO, NON UN FILTRO — quindi l'accordo esatto NON puo' e NON deve arrivare al 100%: 73
   righe su 188 sono `midfield` e `wide_right` ne ha 11, e un filtro secco affamerebbe il repertorio
   facendo tornare le ripetizioni (la lezione e' del 7.486). Percio' questo guardiano misura ANCHE la
   VARIETA' (righe distinte / righe totali): un accordo alto ottenuto ripetendo tre frasi non e' un
   miglioramento, e senza questo secondo numero il primo si potrebbe far salire barando.

   ⚠️ I gol sono esclusi: `opp_goal` ha UNA riga in tutta la tabella e il gol non e' una lettura di zona.

   ⚠️ La fase si legge da `__CPM_PHASE` (7.494/7.495/7.496), mai da `__CPM_STATE`.

   PROVA DEL ROSSO: `__CPM_NO499` toglie il peso di famiglia (resta il solo peso di distanza del 7.486).
   L'accordo esatto deve scendere.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node bg-decision-test.mjs [CPM_ROSSO=1]                  */
/* [giro 162 PO-362] LO STRUMENTO ERA CIECO, ANCHE SULLA BASE (0 righe utili su 15). Il peso di famiglia che questo guardiano
   sorveglia (`_dec499` sul sorteggio pesato di BG_MATCH, src/15) vive solo nel ramo della cronaca pescata; dal 7.870 la partita
   vera la racconta il narratore del motore del possesso (`narra870`), che `__CPM_NO499` non tocca. Lo strumento si mette quindi
   nel regime dove vive cio' che giudica: `__CPM_NO870` acceso in ENTRAMBI i bracci. E la partita si aspetta fino al suo EVENTO
   di fine (fischio), non per 240 s fissi: si abbandona solo per STALLO (fase e minuto fermi per CPM_STALLO ms). Soglie e
   campione minimo invariati. CPM_MOTORE=1 (solo diagnosi) lascia acceso il motore. Stampa i motivi di scarto delle righe.
   ⚠️ Ne segue che, a motore acceso, il peso di famiglia NON e' sorvegliato da nessuno: lo dice il rapporto 162. */
/* [giro 167 PO-362] RISCRITTO PER LA PARTITA VERA. A motore acceso il criterio di prima e' VERO PER COSTRUZIONE: il narratore non porta
   una famiglia sua e la riga riceve `pd=_dec499` (src/15, `if(ev.pd==null)ev.pd=_dec499`) — misurato 159/159 righe con pd==dec. E il
   peso di famiglia del 7.499 vive solo nella cronaca pescata. Il principio («la simulazione decide l'evento, la cronaca lo descrive»)
   a motore acceso si verifica direttamente: ogni riga deve raccontare un FATTO che il motore ha davvero prodotto, con l'uomo giusto.
   CRITERIO VECCHIO: accordo esatto fra famiglia decisa e famiglia della riga >= 60%, varieta' (righe distinte) >= 55%, minimo 15 righe,
   campione 40, nel regime `__CPM_NO870`; rosso `__CPM_NO499`.
   CRITERIO NUOVO: FEDELTA' — quota di righe del narratore il cui fatto (tipo) compare fra i fatti restituiti dal motore nei 3 s prima
   dell'uscita, e il cui uomo nominato e' quello del fatto (registro dei fatti: si avvolge `tick`, lib/cronaca-motore.mjs; righe dal
   testimone `__CPM_NAR167`). Soglia 90% (misurata 98,5% su 131 righe); varieta' >= 55% invariata; minimo 15 righe, campione 40
   invariati; partite intere a motore acceso. Perche' non e' piu' permissivo: la soglia sale da 60% a 90% e il giudizio non puo' essere
   vero per costruzione (un fatto inventato non sta nel registro del motore).
   ROSSO (CPM_ROSSO=1): sabotaggio dal banco «fatto-inventato» — a un battito di minuto su tre il motore consegna al narratore un tiro
   mai avvenuto (non registrato fra i fatti veri). */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { giocaPartita } from './lib/cronaca-motore.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MIN_RIGHE = 15, CAMPIONE = 40, SOGLIA_FEDE = 90, SOGLIA_VARIETA = 55, MAX_PARTITE = +(process.env.CPM_PARTITE || 6), MIN_PARTITE = 2, FINESTRA = 3000;
const CLUB = /calcio d'inizio|dal centro|rimessa laterale per|angolo per|calcio d'angolo per|rinvio dal fondo per|punizione per/i;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const val = [], errs = [], fini = [];
for (let i = 0; i < MAX_PARTITE && (i < MIN_PARTITE || val.length < CAMPIONE); i++) {
  const r = await giocaPartita(b, port, { nome: 'Dec' + i, seed: 700 + i * 61, sabotaggio: ROSSO ? 'fatto-inventato' : null });
  errs.push(...r.errs); fini.push(`${r.minMax}' (${r.fine})`);
  const eroe = r.nome.toLowerCase();
  for (const x of r.nar) {
    const tl = x.txt.toLowerCase();
    const W = r.fatti.filter(f => f.t <= x.t && f.t > x.t - FINESTRA && f.k === x.k);
    const ok = W.some(f => !f.n.length || f.n.some(nm => nm === '{P}' ? tl.includes(eroe) : tl.includes(nm.toLowerCase())) || CLUB.test(x.txt));
    val.push({ ok, k: x.k, min: x.min, txt: x.txt, vuota: !W.length });
  }
}
await b.close(); srv.close();
console.log(`\n=== LA CRONACA RACCONTA I FATTI DEL MOTORE (motore acceso)${ROSSO ? ' · PROVA DEL ROSSO (fatto-inventato)' : ''} ===`);
console.log(`  partite: ${fini.join(' · ')} · righe del narratore ${val.length} (minimo ${MIN_RIGHE}, campione ${CAMPIONE})`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (val.length < MIN_RIGHE) { console.log(`\n❌ CIECO: ${val.length} righe, minimo ${MIN_RIGHE}`); process.exit(2); }
const fede = 100 * val.filter(v => v.ok).length / val.length;
const pVar = 100 * new Set(val.map(v => v.txt)).size / val.length;
console.log(`  fedelta' (fatto e uomo nel registro del motore) ${val.filter(v => v.ok).length}/${val.length} = ${fede.toFixed(1)}%   (soglia ${SOGLIA_FEDE}%)`);
console.log(`  varieta' (righe distinte)                       ${pVar.toFixed(1)}%   (soglia ${SOGLIA_VARIETA}%)`);
const bad = val.filter(v => !v.ok); const pk = {}; for (const v of bad) pk[v.k] = (pk[v.k] | 0) + 1; if (bad.length) console.log('  senza fatto, per tipo: ' + JSON.stringify(pk) + ` · di cui con finestra vuota ${bad.filter(v => v.vuota).length}`);
for (const v of bad.slice(0, 3)) console.log(`    ${v.min}'  ${v.k}  «${v.txt}»`);
if (ROSSO) {
  if (fede < SOGLIA_FEDE) { console.log(`\n✅ prova del rosso riuscita: coi fatti inventati la fedelta' scende a ${fede.toFixed(1)}%`); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: fedelta' ${fede.toFixed(1)}% anche coi fatti inventati`); process.exit(2);
}
if (pVar < SOGLIA_VARIETA) { console.log(`\n❌ REPERTORIO AFFAMATO: solo ${pVar.toFixed(1)}% di righe distinte`); process.exit(2); }
if (fede < SOGLIA_FEDE) { console.log(`\n❌ fedelta' ${fede.toFixed(1)}% sotto la soglia: la cronaca racconta fatti che il motore non ha prodotto`); process.exit(2); }
console.log('\n✅ ogni riga racconta un fatto che la simulazione ha deciso, con l\'uomo giusto');
