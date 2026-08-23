#!/usr/bin/env node
/* CENSIMENTO — QUANTE RIGHE DI CRONACA POGGIANO SU UN FATTO. Fase 4 della roadmap.

   PERCHE' NON BASTA `fatti-546`. Quella baseline stampa un TOTALE che NON risponde alla domanda «quante
   righe stanno su un fatto realmente accaduto». Tre passate, stesso codice di gioco, stesse soglie:

     passata                     TOTALE          solo le AFFERMAZIONI      quota `portatore`
     riferita dal committente    77%             —                         —
     2 partite (misurata)        66/77  = 86%    14/20 = 70%               74% dei verdetti
     3 partite (misurata)        91/111 = 82%    15/28 = 54%               75% dei verdetti

   Il totale balla di 9 punti e il sottoinsieme che giudica davvero un'affermazione della cronaca balla
   di SEDICI, su ventotto verdetti. L'unica famiglia stabile e' `portatore` (91% e 92%) — ed e' l'unica
   che NON e' un'affermazione della cronaca. Le ragioni sono tre, misurate e non opinabili:

     (a) LA FAMIGLIA CHE DOMINA NON E' UN'AFFERMAZIONE DELLA CRONACA. `portatore` viene spinta per OGNI
         riga (fatti-546 r.86) e vale 57 verdetti su 77 — il 74% del totale. Misura se la palla e' ai
         piedi di qualcuno, che e' una proprieta' del motore del possesso: sarebbe vera anche a cronaca
         spenta. Tolta quella famiglia, i verdetti che giudicano davvero un'affermazione sono 20.
     (b) DUE FAMIGLIE SU SEI SONO CODICE MORTO. `fatti-546` legge `r.parata` (r.102) e `r.recupero`
         (r.107), campi che il registro della cronaca NON scrive: il payload di `cpmEv("chronicle")`
         (gioco r.21849) porta min·dec·fase·tn·rec·pd·concorda·ef·bx·by·shots·oppShots·sp·at, e basta.
         Quelle due famiglie stampano zero verdetti a ogni passata, in silenzio.
     (c) LE RIGHE CHE NON AFFERMANO NIENTE CONTANO COME VERE. 107 righe su 223 del repertorio non hanno
         alcun marcatore (censimento statico `cronaca-censimento-554`): per loro l'unico verdetto e'
         `portatore`, quindi entrano nel totale dalla parte dei sì. Una riga che non afferma niente non
         puo' essere vera: e' MUTA, ed e' proprio il bersaglio della fase 4.

   COSA MISURA QUESTA SONDA, con le tre classi separate — mai sommate in un numero solo:
     FONDATA    la riga porta un marcatore E il fatto si vede nella traccia del pallone
     SMENTITA   la riga porta un marcatore MA il fatto non si vede
     MUTA       la riga non porta alcun marcatore: non c'e' niente da verificare

   METODO DICHIARATO: la classe si legge dal MARCATORE nel registro, mai dal testo (lezione 7.546: col
   testo la baseline dava «palla ferma 0/4», col marcatore `sp` il numero era 11/11). Il fatto si
   verifica sulla traccia delle MESH (`__CPM_OWN`, sorgente unica), indicizzata per minuto di gioco.

   ⚠️ LIMITE DICHIARATO, e va rimosso prima che questa sonda possa diventare una porta: le righe di
   RECUPERO (31 righe del repertorio portano `poss`) sono oggi INCLASSIFICABILI, perche' `poss` non
   entra nel registro. Finiscono in MUTA per difetto e il numero che segue e' quindi PESSIMISTICO su
   quel fronte. Il primo passo della fase 4 e' aggiungere `poss` al payload di r.21849.

   ⚠️ SECONDO LIMITE, ED E' DELLO STRUMENTO — non del gioco, e vale anche per `fatti-546`. La traccia si
   campiona con un `setInterval` a 60 ms di OROLOGIO DI PARETE (sotto), mentre la partita avanza a TICK.
   Quanti campioni cadono dentro un minuto di gioco dipende quindi dalla velocita' della macchina, e gli
   estremi per minuto (`xmax`/`xmin`/`dmin`) sono ESTREMI SU QUEI CAMPIONI: piu' campioni = estremi piu'
   larghi = ogni famiglia piu' permissiva. Non e' rumore simmetrico, e' un BIAS con un verso — una
   macchina lenta fa sembrare la cronaca piu' vera. E' la stessa malattia che ha dato a `fatti-546` tre
   totali diversi (77% · 86% · 82%) con le stesse soglie.
   Rimedio applicato qui: un minuto con meno di MIN_CAMP campioni NON si giudica e si conta a parte. Una
   cecita' dichiarata vale piu' di un numero comodo.
   ⚠️ La prima passata di questa sonda e' stata presa PRIMA di questo guardaspalle: quei numeri vanno
   rifatti, non citati.

   SOGLIA DICHIARATA PRIMA (obiettivo della fase 4): FONDATE >= 90% delle righe emesse, con SMENTITE
   <= 5%. Oggi la sonda non fallisce: e' un censimento. Con CPM_GUARDIA=1 applica le soglie.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node fondate-554.mjs [CPM_PARTITE=n] [CPM_GUARDIA=1]   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const PARTITE = +(process.env.CPM_PARTITE || 2);
const GUARDIA = !!process.env.CPM_GUARDIA;
const SOGLIA_FONDATE = +(process.env.CPM_SOGLIA || 90);
const SOGLIA_SMENTITE = +(process.env.CPM_SMENT || 5);
const AVV_MIN = 8;      /* avvicinamento minimo alla porta perche' un tiro sia un tiro */
const FINESTRA = 3;     /* minuti di gioco entro cui il fatto deve accadere */
const FERMO_U = 1.2;    /* spostamento sotto il quale la palla e' ferma */
const MIN_CAMP = +(process.env.CPM_MIN_CAMP || 4);  /* campioni minimi nel minuto della riga: sotto, non si giudica */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false;
    window.__CPM_TRACCIA = [];
    setInterval(() => {
      try {
        const o = window.__CPM_OWN && window.__CPM_OWN(); if (!o || o.ph !== 'playing') return;
        const T = window.__CPM_TRACCIA, u = T[T.length - 1];
        const _l = (o.i >= 10 ? 1 : 0); /* [7.554.0] lato del piu' vicino al pallone: 0-9 e l'eroe (-2) sono i nostri, 10-20 gli avversari. E' GEOMETRIA, non una dichiarazione: cosi' la sonda non e' ingannabile dalla riga che dice di aver cambiato possesso. */
        if (u && u.c === o.c) { u.n++; u.x = o.x; u.y = o.y; if (_l !== u.l) u.lmix = 1; if (o.x > u.xmax) u.xmax = o.x; if (o.x < u.xmin) u.xmin = o.x; if (o.d < u.dmin) { u.dmin = o.d; u.imin = o.i; } return; }
        T.push({ c: o.c, x0: o.x, y0: o.y, x: o.x, y: o.y, xmax: o.x, xmin: o.x, dmin: o.d, imin: o.i, n: 1, l: _l, lmix: 0 });
      } catch (_e) {}
    }, 60);
  });
  await openMatch(page, port, { skipLoadAll: true, name: 'Fd' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => ({
    righe: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'),
    recite: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'recita'),
    tr: window.__CPM_TRACCIA || [],
  })));
  await page.close();
}
srv.close(); await b.close();

const C = { FONDATA: [], SMENTITA: [], MUTA: [] };
let recite = 0, righeTot = 0, scartate = 0;
for (const { righe, recite: rc, tr } of tutte) {
  recite += rc.length;
  const byMin = new Map(); tr.forEach(s => byMin.set(s.c, s));
  const fin = m => { const o = []; for (let k = 0; k <= FINESTRA; k++) { const s = byMin.get(m + k); if (s) o.push(s); } return o; };
  for (const r of righe) {
    const w = fin(r.min | 0); if (!w.length) continue;      /* fuori traccia: non giudicabile */
    /* il minuto DELLA RIGA dev'esserci ed essere campionato abbastanza, o gli estremi non dicono niente */
    if (w[0].c !== (r.min | 0) || w[0].n < MIN_CAMP) { scartate++; continue; }
    righeTot++;
    const qui = w[0];
    const claim = [];
    if (/goal/.test(String(r.ef || ''))) {
      const gx = /opp/.test(String(r.ef)) ? 0 : 100;
      const dmin = Math.min(...w.map(s => Math.min(Math.abs(gx - s.xmax), Math.abs(gx - s.xmin))));
      claim.push({ k: 'gol', ok: dmin <= 6, nota: `palla a ${dmin.toFixed(1)}u dalla linea` });
    }
    if (r.shots || r.oppShots) {
      const gx = r.shots ? 100 : 0, d0 = Math.abs(gx - qui.x0);
      const dmin = Math.min(...w.map(s => Math.min(Math.abs(gx - s.xmax), Math.abs(gx - s.xmin))));
      claim.push({ k: 'tiro', ok: (d0 - dmin) >= AVV_MIN, nota: `si avvicina di ${(d0 - dmin).toFixed(1)}u` });
    }
    if (r.sp) {
      const fermo = w.some(s => Math.hypot(s.x - s.x0, s.y - s.y0) < FERMO_U && s.n >= 3);
      claim.push({ k: 'fermo', ok: fermo, nota: fermo ? 'la palla si ferma' : 'la palla non si ferma mai' });
    }
    /* [7.554.0] LE RIGHE DI RECUPERO ENTRANO NEL GIUDIZIO. `poss` e' nel registro dal 7.554: una riga che
       dichiara di spostare il possesso e' verificabile come tutte le altre — il turno di possesso nella
       traccia deve cambiare entro la finestra. Prima erano incassate in MUTA per difetto, ed erano 31 su
       223 del repertorio: la sonda dichiarava il proprio limite invece di misurarlo. */
    if (r.poss) {
      const l0 = qui.l, cambia = qui.lmix === 1 || w.some(s => s.l !== l0 || s.lmix === 1);
      claim.push({ k: 'possesso', ok: cambia, nota: cambia ? 'il pallone cambia lato' : 'il pallone non cambia lato' });
    }
    if (!claim.length) { C.MUTA.push({ min: r.min, pd: r.pd, rec: r.rec, at: r.at }); continue; }
    const tutti = claim.every(c => c.ok);
    (tutti ? C.FONDATA : C.SMENTITA).push({ min: r.min, pd: r.pd, rec: r.rec, why: claim.map(c => `${c.k}: ${c.nota}`).join(' · ') });
  }
}

if (!righeTot) { console.log('nessuna riga giudicabile'); process.exit(1); }
const p = n => (100 * n / righeTot).toFixed(1) + '%';
console.log(`\n=== QUANTE RIGHE DI CRONACA POGGIANO SU UN FATTO (${tutte.length} partite) ===\n`);
console.log(`  righe emesse e giudicabili   ${righeTot}     (di cui ${C.FONDATA.concat(C.SMENTITA, C.MUTA).filter(x => x.rec).length} dirottate da una macchina di recita · ${recite} recite nel registro)`);
console.log(`  righe SCARTATE dal giudizio   ${scartate}     (minuto assente o con meno di ${MIN_CAMP} campioni: gli estremi non direbbero niente)\n`);
console.log(`  FONDATA   ${String(C.FONDATA.length).padStart(4)}/${righeTot} = ${p(C.FONDATA.length).padStart(6)}   marcatore + fatto visto nella traccia`);
console.log(`  SMENTITA  ${String(C.SMENTITA.length).padStart(4)}/${righeTot} = ${p(C.SMENTITA.length).padStart(6)}   marcatore ma il fatto non si vede`);
console.log(`  MUTA      ${String(C.MUTA.length).padStart(4)}/${righeTot} = ${p(C.MUTA.length).padStart(6)}   nessun marcatore: niente da verificare`);
console.log(`\n  ✔ le righe di RECUPERO sono ora giudicate: \`poss\` e' nel registro dal 7.554 e il turno si verifica nella traccia.`);
if (C.SMENTITA.length) {
  console.log('\n  smentite (prime 8):');
  C.SMENTITA.slice(0, 8).forEach(x => console.log(`    ${String(x.min).padStart(3)}'  pd=${String(x.pd).padEnd(12)} ${x.why}`));
}
{
  const per = {}; C.MUTA.forEach(x => per[x.pd] = (per[x.pd] || 0) + 1);
  console.log('\n  mute per famiglia dichiarata: ' + Object.entries(per).sort((a, c) => c[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
}
const qF = 100 * C.FONDATA.length / righeTot, qS = 100 * C.SMENTITA.length / righeTot;
console.log(`\n  soglie dichiarate per la fase 4: fondate ≥ ${SOGLIA_FONDATE}%  ·  smentite ≤ ${SOGLIA_SMENTITE}%`);
if (!GUARDIA) { console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.'); process.exit(0); }
let ko = 0;
if (qF < SOGLIA_FONDATE) { console.log(`\n❌ fondate ${qF.toFixed(1)}% sotto la soglia`); ko = 1; }
if (qS > SOGLIA_SMENTITE) { console.log(`❌ smentite ${qS.toFixed(1)}% sopra la soglia`); ko = 1; }
if (!ko) console.log('\n✅ la cronaca poggia su fatti');
process.exit(ko ? 2 : 0);
