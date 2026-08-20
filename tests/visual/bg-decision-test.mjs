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
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 3);
const TETTO_MS = +(process.env.CPM_TETTO || 240000);
const MIN_RIGHE = 15;
/* SOGLIE SCELTE PER SEPARARE, sui due bracci misurati: col peso di famiglia l'accordo esatto e' 69,0%,
   senza (prova del rosso) 51,6%. 60% sta in mezzo con ~9 punti di margine da entrambe le parti.
   La varieta' misurata e' 63,8% col peso e 60,9% senza — il rimedio NON ha affamato il repertorio, ed e'
   proprio cio' che questa seconda soglia serve a impedire in futuro: un accordo alto comprato ripetendo
   tre frasi non e' un miglioramento. */
const SOGLIA_ESATTO = +(process.env.CPM_SOGLIA || 60);   /* % minima di accordo esatto */
const SOGLIA_VARIETA = +(process.env.CPM_VAR || 55);     /* % minima di righe distinte */

const VIC = { defend_goal: ['retreat'], retreat: ['defend_goal', 'midfield'], midfield: ['retreat', 'attack', 'wide_right'],
  attack: ['midfield', 'wide_right', 'attack_goal'], wide_right: ['attack', 'midfield'], attack_goal: ['attack', 'wide_right'], opp_goal: ['defend_goal'] };

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function partita(i) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO499 = 1; }, ROSSO);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Dec' + i });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 350 }), 700 + i * 61);
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

const righe = [];
for (let i = 0; i < PARTITE; i++) righe.push(...(await partita(i)));
await b.close(); srv.close();

const recite = righe.filter(r => r.rec).length;
const val = righe.filter(r => r.dec && r.pd && !r.ef && !r.rec);/* [7.532.0] le righe di RECITA (kickoff/piazzati/contropiedi/ponte) sono teatro deterministico con pd=dec PER COSTRUZIONE e pool finiti: dentro le metriche gonfiavano l'accordo e affamavano la varieta' del repertorio PESCATO — si misurano a parte (contatore) e si escludono da accordo+varieta'. */
console.log(`\n=== LA CRONACA RACCONTA L'EVENTO DECISO${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO499)' : ''} ===`);
if (val.length < MIN_RIGHE) { console.log(`  ⚠ solo ${val.length} righe utili (minimo ${MIN_RIGHE})\n❌ CIECO: non abbastanza righe`); process.exit(2); }

const esatto = val.filter(r => r.pd === r.dec).length;
const largo = val.filter(r => r.pd === r.dec || (VIC[r.dec] || []).indexOf(r.pd) >= 0).length;
const pEs = 100 * esatto / val.length, pLa = 100 * largo / val.length;

console.log(`  righe misurate        ${val.length}  (gol esclusi · ${recite} righe di recita escluse)`);
console.log(`  accordo ESATTO        ${esatto}/${val.length} = ${pEs.toFixed(1)}%   (soglia ${SOGLIA_ESATTO}%)`);
console.log(`  accordo LARGO         ${largo}/${val.length} = ${pLa.toFixed(1)}%   (decisa o confinante)`);

/* varieta': un accordo alto ottenuto ripetendo tre frasi non e' un miglioramento */
const distinte = new Set(val.map(r => `${r.pd}|${r.bx}|${r.by}`)).size;
const pVar = 100 * distinte / val.length;
console.log(`  varieta'              ${distinte}/${val.length} = ${pVar.toFixed(1)}% righe distinte   (soglia ${SOGLIA_VARIETA}%)`);

const perDec = {};
for (const r of val) { const k = r.dec; (perDec[k] = perDec[k] || { n: 0, ok: 0 }); perDec[k].n++; if (r.pd === r.dec) perDec[k].ok++; }
console.log('\n  per famiglia decisa:');
for (const [k, v] of Object.entries(perDec).sort((a, b2) => b2[1].n - a[1].n))
  console.log(`    ${k.padEnd(13)} ${String(v.ok).padStart(3)}/${String(v.n).padEnd(3)} = ${(100 * v.ok / v.n).toFixed(0)}%`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

if (ROSSO) {
  if (pEs < SOGLIA_ESATTO) { console.log(`\n✅ prova del rosso riuscita: senza il peso di famiglia l'accordo scende a ${pEs.toFixed(1)}%`); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: accordo ${pEs.toFixed(1)}% anche senza il peso — non stava pesando nulla`); process.exit(2);
}
if (pVar < SOGLIA_VARIETA) { console.log(`\n❌ REPERTORIO AFFAMATO: solo ${pVar.toFixed(1)}% di righe distinte — l'accordo e' stato comprato con le ripetizioni`); process.exit(2); }
if (pEs < SOGLIA_ESATTO) { console.log(`\n❌ accordo esatto ${pEs.toFixed(1)}% sotto la soglia`); process.exit(2); }
console.log('\n✅ la riga di cronaca descrive l\'evento deciso, senza affamare il repertorio');
