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

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node fondate-558.mjs [CPM_PARTITE=n] [CPM_GUARDIA=1]   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const PARTITE = +(process.env.CPM_PARTITE || 2);
const GUARDIA = !!process.env.CPM_GUARDIA;
const SOGLIA_FONDATE = +(process.env.CPM_SOGLIA || 90);
const SOGLIA_SMENTITE = +(process.env.CPM_SMENT || 5);
const AVV_MIN = 8;      /* avvicinamento minimo alla porta perche' un tiro sia un tiro */
const FINESTRA = 3;     /* minuti di gioco entro cui il fatto deve accadere */
const FERMO_U = 1.2;    /* spostamento sotto il quale la palla e' ferma */
const MIN_CAMP = +(process.env.CPM_MIN_CAMP || 4);
const DEST_U = +(process.env.CPM_DEST_U || 14);  /* quanto vicino al punto dichiarato deve arrivare il pallone */
/* le bande del motore (frammento live r.~2042): la zona dichiarata dalla riga si verifica su cio' che si VEDE */
const ZONE = { defend_goal: { x0: 0, x1: 25 }, retreat: { x0: 25, x1: 42 }, midfield: { x0: 42, x1: 60 },
  attack: { x0: 60, x1: 78 }, wide_right: { x0: 60, x1: 78, largo: true }, attack_goal: { x0: 78, x1: 100 },
  opp_goal: { x0: 0, x1: 25 } };  /* campioni minimi nel minuto della riga: sotto, non si giudica */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false;
    window.__CPM_TRACCIA = [];
    window.__CPM_TR571 = [];/* [7.571.0] la traccia buona la scrive IL GIOCO, un campione per MINUTO */
    setInterval(() => {
      try {
        const o = window.__CPM_OWN && window.__CPM_OWN(); if (!o || o.ph !== 'playing') return;
        const T = window.__CPM_TRACCIA, u = T[T.length - 1];
        const _l = (o.i >= 10 ? 1 : 0); /* [7.554.0] lato del piu' vicino al pallone: 0-9 e l'eroe (-2) sono i nostri, 10-20 gli avversari. E' GEOMETRIA, non una dichiarazione: cosi' la sonda non e' ingannabile dalla riga che dice di aver cambiato possesso. */
        if (u && u.c === o.c) { u.n++; u.x = o.x; u.y = o.y; if (_l !== u.l) u.lmix = 1; if (o.x > u.xmax) u.xmax = o.x; if (o.x < u.xmin) u.xmin = o.x; if (o.y > u.ymax) u.ymax = o.y; if (o.y < u.ymin) u.ymin = o.y; if (o.d < u.dmin) { u.dmin = o.d; u.imin = o.i; } return; }
        T.push({ c: o.c, x0: o.x, y0: o.y, x: o.x, y: o.y, xmax: o.x, xmin: o.x, ymax: o.y, ymin: o.y, dmin: o.d, imin: o.i, n: 1, l: _l, lmix: 0 });
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
    tr: window.__CPM_TRACCIA || [], trT: window.__CPM_TR571 || [],
  })));
  await page.close();
}
srv.close(); await b.close();

/* il minuto della riga di cronaca successiva: da li' in poi il pallone ha un'altra destinazione dichiarata */
const prossimaRiga = (righe, r) => { let best = null;
  for (const o of righe) { const m = o.min | 0; if (m > (r.min | 0) && (o.bx != null || o.ef) && (best == null || m < best)) best = m; }
  return best; };
const C = { FONDATA: [], SMENTITA: [], MUTA: [] };
const TIRI = [];
const DEST = [];
const DEST_CHIESTA = [];/* [7.576.0] quanta strada chiedeva ogni riga */
let recite = 0, righeTot = 0, scartate = 0;
let _fonteTick = 0, _fonteOro = 0;
for (const { righe, recite: rc, tr: _trOro, trT } of tutte) {
  /* [7.571.0] si preferisce la traccia a passo di MINUTO scritta dal gioco: e' deterministica.
     Quella campionata a orologio resta come ripiego, e il verdetto dichiara quale ha usato. */
  const _usaTick = (trT && trT.length >= 20);
  if (_usaTick) _fonteTick++; else _fonteOro++;
  const tr = _usaTick ? trT.map(t => ({ c: t.c, x0: t.x0, y0: t.y0, x: t.x, y: t.y, xmax: t.xmax, xmin: t.xmin, ymax: t.ymax, ymin: t.ymin, dmin: 99, imin: -1, n: Math.max(t.n, 4), l: t.l, lmix: t.lmix })) : _trOro;
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
      /* [7.571.0 — LA REGOLA DEL TIRO ERA INSODDISFACIBILE PER META' DEI CASI, e faceva ballare il totale
         di sei punti su codice IDENTICO (11/11, 7/11, 4/10 in tre passate).
         La regola vecchia chiedeva che il pallone si AVVICINASSE alla porta di almeno 8 unita'. Ma la
         misura, riga per riga, dice che SETTE tiri su dodici partono gia' a meno di dieci unita' dalla
         linea: un tiro dall'area non puo' guadagnarne otto, per geometria. La regola non giudicava il
         gioco, giudicava DA DOVE si tirava — e siccome quante conclusioni siano da fuori cambia di partita
         in partita, il verdetto ballava senza che il gioco cambiasse.
         Cosa afferma davvero una riga che dichiara un tiro: che il pallone FINISCE sulla porta. E su
         dodici righe, DODICI portano il pallone entro venti unita' dalla linea. Quindi la regola giusta e'
         quella: il pallone arriva in area (<=18u, la profondita' dell'area di rigore), OPPURE si avvicina
         in modo netto — che copre la conclusione da fuori respinta a meta' strada.
         ⚠️ E va detto in chiaro perche' questo NON e' aggiustare il metro per far tornare il numero: la
         regola vecchia era dimostrabilmente insoddisfacibile per il 58% dei casi PRIMA di guardare il
         risultato, e il difetto si vede nella riga «partiva a 6u», non nella percentuale finale. */
      const _okT = (dmin <= 18) || ((d0 - dmin) >= AVV_MIN);
      claim.push({ k: 'tiro', ok: _okT, nota: `arriva a ${dmin.toFixed(1)}u dalla porta (partiva a ${d0.toFixed(1)}u)` });
      TIRI.push({ min: r.min, d0: +d0.toFixed(1), dmin: +dmin.toFixed(1), avv: +(d0 - dmin).toFixed(1), ok: _okT ? 1 : 0, n: qui.n });
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
    /* [7.558.0 — LA ZONA DICHIARATA E' UN'AFFERMAZIONE, E VA GIUDICATA]
       Il censimento del 7.557 dava 61,5% di righe MUTE, ma la riga sotto («mute per famiglia dichiarata:
       midfield 20 · attack 7 · wide_right 2 · retreat 2 · defend_goal 1») diceva che quelle righe una cosa
       la dichiarano eccome: DOVE si sta giocando. Erano mute per il giudice, non per il gioco.
       `pd` e' la zona che la riga afferma; le bande sono quelle del motore (r.~2042 del frammento live):
       defend_goal <25 · retreat <42 · midfield <60 · attack/wide_right <78 · attack_goal >=78, e
       wide_right pretende anche la palla larga (|y-50| > 22). Il fatto si verifica sulla traccia delle
       MESH — cioe' su quello che si VEDE — non sulla decisione del motore. */
    if (r.pd && ZONE[r.pd]) {
      const z = ZONE[r.pd];
      const dentro = w.some(s2 => (s2.xmax >= z.x0 && s2.xmin <= z.x1) && (!z.largo || Math.max(Math.abs(s2.ymax - 50), Math.abs(s2.ymin - 50)) > 22));
      claim.push({ k: 'zona', ok: dentro, nota: dentro ? `la palla e' in ${r.pd}` : `la palla non entra mai in ${r.pd} (x ${Math.min(...w.map(s2 => s2.xmin)).toFixed(0)}-${Math.max(...w.map(s2 => s2.xmax)).toFixed(0)})` });
    }
    /* [7.558.0] LA DESTINAZIONE DICHIARATA. Una riga che porta `bpos` dice dove finisce il pallone: dal
       7.556 la scena la consegna a un uomo NOMINATO, quindi ora si puo' pretendere che la palla ci arrivi. */
    if (r.bx != null && r.by != null) {
      /* [7.571.0 — LA DESTINAZIONE VALE FINCHE' NESSUNO NE DICHIARA UN'ALTRA.
         Con `tiro` riparato il totale continuava a ballare, e il mobile era diventato questa famiglia:
         40/48 e 36/48 su codice identico. La causa e' la finestra: si concedevano TRE minuti di gioco al
         pallone per arrivare al punto dichiarato, ma in quei tre minuti la cronaca emette spesso un'ALTRA
         riga con un'ALTRA destinazione — e da quel momento il pallone e' legittimamente diretto altrove.
         Pretendere che arrivi lo stesso significa giudicare la riga per una decisione presa DOPO di lei.
         Ora la finestra si chiude al minuto della riga successiva: si chiede al pallone di andare dove la
         riga ha detto FINCHE' quella riga e' l'ultima parola. E' la stessa disciplina del `tiro`: la regola
         deve poter essere soddisfatta da chi la deve rispettare. */
      const _nxt = prossimaRiga(righe, r);
      const _fin = _nxt == null ? (r.min | 0) + FINESTRA : Math.min((r.min | 0) + FINESTRA, _nxt - 1);
      const w2 = w.filter(s2 => s2.c <= _fin);
      const _ww = w2.length ? w2 : [w[0]];
      const d = Math.min(..._ww.map(s2 => Math.hypot(s2.x - r.bx, s2.y - r.by)));
      DEST.push(+d.toFixed(1));
      const _vic = _ww.reduce((a, s2) => { const dd = Math.hypot(s2.x - r.bx, s2.y - r.by); return dd < a.d ? { d: dd, x: s2.x, y: s2.y } : a; }, { d: 1e9, x: 0, y: 0 });
      /* [7.576.0] QUANTA STRADA CHIEDEVA LA RIGA. Il motore ha un tetto di spostamento per riga
         (`_cap528` = 30u, 7.498/7.528): una riga che dichiara un punto piu' lontano di cosi' e' bugiarda
         PER COSTRUZIONE — il pallone non ci puo' arrivare, per progetto. Stamparlo accanto allo scarto
         separa due famiglie di difetto con due rimedi diversi: «la riga chiede l'impossibile» e «la riga
         chiede il possibile e il pallone va altrove». */
      const _chiesta = Math.hypot(qui.x0 - r.bx, qui.y0 - r.by);
      /* [7.576.0] LE TRE DISTANZE, che finora erano una sola. `bx/by` e' cio' che la RIGA dichiara;
         `bex/bey` e' dove il MOTORE manda davvero il pallone (dopo il freno del 7.498); il punto piu'
         vicino della traccia e' dove il PALLONE finisce. Separandole si legge di chi e' la colpa:
           freno   = il motore ha accorciato la proposta della riga (la riga chiede l'impossibile)
           deriva  = il motore ha mandato il pallone dove diceva, e poi qualcun altro l'ha spostato */
      const _freno = (r.bex == null) ? null : +Math.hypot(r.bex - r.bx, r.bey - r.by).toFixed(1);
      DEST_CHIESTA.push({ min: r.min | 0, pd: r.pd, rec: r.rec | 0, sp: r.sp || null, ef: r.ef || null, chiesta: +_chiesta.toFixed(1), scarto: +d.toFixed(1), freno: _freno, ok: d <= DEST_U });
      claim.push({ k: 'destinazione', ok: d <= DEST_U, nota: `dichiara (${r.bx},${r.by}), il pallone al piu' vicino sta a (${_vic.x.toFixed(0)},${_vic.y.toFixed(0)}) = ${d.toFixed(1)}u — la riga chiedeva ${_chiesta.toFixed(0)}u di spostamento (tetto 30) (finestra ${r.min|0}'-${_fin}')` });
    }
    if (!claim.length) { C.MUTA.push({ min: r.min, pd: r.pd, rec: r.rec, at: r.at }); continue; }
    const tutti = claim.every(c => c.ok);
    (tutti ? C.FONDATA : C.SMENTITA).push({ min: r.min, pd: r.pd, rec: r.rec, claim, why: claim.filter(c => !c.ok).map(c => `${c.k}: ${c.nota}`).join(' · ') });
  }
}

if (!righeTot) { console.log('nessuna riga giudicabile'); process.exit(1); }
const p = n => (100 * n / righeTot).toFixed(1) + '%';
console.log(`\n=== QUANTE RIGHE DI CRONACA POGGIANO SU UN FATTO (${tutte.length} partite) ===\n`);
console.log(`  traccia usata: ${_fonteTick} partite a PASSO DI MINUTO (deterministica, scritta dal gioco) · ${_fonteOro} a orologio da parete (ripiego)\n`);
console.log(`  righe emesse e giudicabili   ${righeTot}     (di cui ${C.FONDATA.concat(C.SMENTITA, C.MUTA).filter(x => x.rec).length} dirottate da una macchina di recita · ${recite} recite nel registro)`);
console.log(`  righe SCARTATE dal giudizio   ${scartate}     (minuto assente o con meno di ${MIN_CAMP} campioni: gli estremi non direbbero niente)\n`);
console.log(`  FONDATA   ${String(C.FONDATA.length).padStart(4)}/${righeTot} = ${p(C.FONDATA.length).padStart(6)}   marcatore + fatto visto nella traccia`);
console.log(`  SMENTITA  ${String(C.SMENTITA.length).padStart(4)}/${righeTot} = ${p(C.SMENTITA.length).padStart(6)}   marcatore ma il fatto non si vede`);
console.log(`  MUTA      ${String(C.MUTA.length).padStart(4)}/${righeTot} = ${p(C.MUTA.length).padStart(6)}   nessun marcatore: niente da verificare`);
console.log(`\n  ✔ dal 7.558 si giudicano anche la ZONA dichiarata (\`pd\`) e la DESTINAZIONE dichiarata (\`bpos\`): erano l'80% di cio' che il vecchio giudice chiamava «muta».`);
{ const per = {}; for (const k of ['zona', 'destinazione', 'possesso', 'gol', 'tiro', 'fermo']) per[k] = { ok: 0, ko: 0 };
  for (const x of C.FONDATA.concat(C.SMENTITA)) for (const c of (x.claim || [])) if (per[c.k]) per[c.k][c.ok ? 'ok' : 'ko']++;
  console.log('  per tipo di affermazione: ' + Object.entries(per).filter(([, v]) => v.ok + v.ko).map(([k, v]) => `${k} ${v.ok}/${v.ok + v.ko}`).join(' · ')); }
if (C.SMENTITA.length) {
  console.log('\n  smentite (prime 20):');
  C.SMENTITA.slice(0, 20).forEach(x => console.log(`    ${String(x.min).padStart(3)}'  pd=${String(x.pd).padEnd(12)} ${x.why}`));
}
{
  const per = {}; C.MUTA.forEach(x => per[x.pd] = (per[x.pd] || 0) + 1);
  console.log('\n  mute per famiglia dichiarata: ' + Object.entries(per).sort((a, c) => c[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
}
const qF = 100 * C.FONDATA.length / righeTot, qS = 100 * C.SMENTITA.length / righeTot;
if (DEST.length) {
  /* [7.571.0] UNA GRANDEZZA CONTINUA SI MISURA CON UNA MEDIANA, non con un si/no su una soglia.
     Il conteggio «quante entro 14u» e' l'unico verdetto rimasto instabile (37/48 e 33/48 su codice
     identico): una manciata di casi al bordo della soglia lo fanno ballare. La distanza mediana usa gli
     stessi dati ma non ha bordi, quindi dice la stessa cosa senza tremare — ed e' anche piu' utile per
     lavorarci: dice DI QUANTO la cronaca sbaglia, non solo quante volte. */
  const _s = DEST.slice().sort((a, b2) => a - b2);
  const _md = _s.length % 2 ? _s[(_s.length - 1) / 2] : (_s[_s.length / 2 - 1] + _s[_s.length / 2]) / 2;
  const _p90 = _s[Math.min(_s.length - 1, Math.floor(_s.length * 0.9))];
  console.log(`\n  --- DESTINAZIONE: quanto lontano finisce il pallone dal punto che la riga dichiara ---`);
  console.log(`  mediana ${_md.toFixed(1)}u · p90 ${_p90.toFixed(1)}u · peggiore ${_s[_s.length-1].toFixed(1)}u · su ${_s.length} righe`);
  console.log(`  (la soglia del si/no e' ${DEST_U}u: e' il conteggio a soglia a ballare, non i dati)`);
}
if (TIRI.length) {
  console.log(`\n  --- LA FAMIGLIA `+'`tiro`'+` SOTTO LA LENTE (e' quella che fa ballare il totale di sei punti) ---`);
  console.log(`  la regola: fondata se il pallone ARRIVA entro 18u dalla porta (in area) oppure si avvicina di ${AVV_MIN}u.`);
  for (const t of TIRI) console.log(`    ${String(t.min).padStart(3)}'  partiva a ${String(t.d0).padStart(5)}u · arriva a ${String(t.dmin).padStart(5)}u · avvicinamento ${String(t.avv).padStart(5)}u · campioni ${t.n}  ${t.ok ? '✓' : '✗'}`);
  const gia = TIRI.filter(t => t.d0 < AVV_MIN + 4);
  console.log(`  quante partivano gia' troppo vicine per poter guadagnare ${AVV_MIN}u: ${gia.length}/${TIRI.length}`);
  const arriva = TIRI.filter(t => t.dmin <= 20);
  console.log(`  quante portano comunque il pallone entro 20u dalla porta (cioe' in area): ${arriva.length}/${TIRI.length}`);
}
{
  const ko = DEST_CHIESTA.filter(o => !o.ok), oltre = ko.filter(o => o.chiesta > 30), dentro = ko.filter(o => o.chiesta <= 30);
  console.log('\n  --- LE DESTINAZIONI SBAGLIATE: CHIEDEVANO L\'IMPOSSIBILE, O NO? ---');
  console.log('  il motore sposta al massimo 30u per riga (tetto 7.498/7.528): oltre quella soglia la riga e\' bugiarda per costruzione');
  console.log('  destinazioni sbagliate ' + ko.length + '  ·  chiedevano PIU\' di 30u: ' + oltre.length + '  ·  chiedevano il possibile: ' + dentro.length);
  if (oltre.length) console.log('    impossibili: ' + oltre.map(o => o.min + "'" + o.pd + '(' + o.chiesta + 'u' + (o.rec ? ', RECITATA' : '') + ')').join(' · '));
  if (oltre.length) console.log('    di cui costruite da una macchina di recita: ' + oltre.filter(o => o.rec).length + '/' + oltre.length + '  ← queste NON passano dal repertorio, quindi il filtro 7.577 non le vede');
  if (dentro.length) console.log('    possibili ma mancate: ' + dentro.map(o => o.min + "'" + o.pd + '(chiesta ' + o.chiesta + 'u, scarto ' + o.scarto + 'u)').join(' · '));
  /* [7.576.0] LE RIGHE CHE PROMETTONO UNA DESTINAZIONE CHE IL MOTORE NON APPLICA MAI. Sono quelle in cui
     il registro porta `bx` ma non `bex`: la riga dichiara al giocatore dove va il pallone, e il motore
     scarta quella destinazione per scelta (durante un'azione recitata il pallone lo guida la recita).
     Vanno contate a parte: non e' «il pallone e' andato altrove», e' «la cronaca ha promesso una cosa
     che nessuno aveva intenzione di mantenere». */
  {
    const senza = DEST_CHIESTA.filter(o => o.freno == null);
    const koS = senza.filter(o => !o.ok);
    console.log('\n  --- RIGHE CHE DICHIARANO UNA DESTINAZIONE CHE IL MOTORE NON APPLICA MAI ---');
    console.log('  sono ' + senza.length + '/' + DEST_CHIESTA.length + ' delle righe con una destinazione dichiarata  ·  di queste sbagliano ' + koS.length);
    const perRec = {}; senza.forEach(o => { const k = (o.rec ? 'recitata' : 'normale') + (o.sp ? '+piazzato' : '') + (o.ef ? '+esito' : ''); perRec[k] = (perRec[k] || 0) + 1; });
    console.log('  composizione: ' + Object.entries(perRec).map(([k, v]) => k + ' ' + v).join(' · '));
    const perPd = {}; koS.forEach(o => perPd[o.pd] = (perPd[o.pd] || 0) + 1);
    console.log('  zone delle sbagliate: ' + Object.entries(perPd).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(' · '));
  }
  const conFreno = DEST_CHIESTA.filter(o => o.freno != null);
  if (conFreno.length) {
    const frenate = conFreno.filter(o => o.freno > 1), koFrenate = frenate.filter(o => !o.ok);
    console.log('\n  --- DI CHI E\' LA COLPA: IL FRENO DEL MOTORE, O QUALCUNO CHE SPOSTA IL PALLONE DOPO? ---');
    console.log('  righe in cui il motore ha ACCORCIATO la proposta della riga: ' + frenate.length + '/' + conFreno.length + '  ·  di queste, sbagliate: ' + koFrenate.length);
    const koLibere = conFreno.filter(o => !o.ok && o.freno <= 1);
    console.log('  righe che il motore ha onorato ALLA LETTERA e che sbagliano lo stesso: ' + koLibere.length + '  ← qui il pallone lo sposta qualcun altro dopo');
    if (koLibere.length) console.log('    ' + koLibere.slice(0, 14).map(o => o.min + "'" + o.pd + '(scarto ' + o.scarto + 'u)').join(' · '));
  }
  const okk = DEST_CHIESTA.filter(o => o.ok);
  if (okk.length) console.log('  per confronto, le destinazioni CENTRATE chiedevano in media ' + (okk.reduce((a, o) => a + o.chiesta, 0) / okk.length).toFixed(1) + 'u');
}
console.log(`\n  soglie dichiarate per la fase 4: fondate ≥ ${SOGLIA_FONDATE}%  ·  smentite ≤ ${SOGLIA_SMENTITE}%`);
if (!GUARDIA) { console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.'); process.exit(0); }
let ko = 0;
if (qF < SOGLIA_FONDATE) { console.log(`\n❌ fondate ${qF.toFixed(1)}% sotto la soglia`); ko = 1; }
if (qS > SOGLIA_SMENTITE) { console.log(`❌ smentite ${qS.toFixed(1)}% sopra la soglia`); ko = 1; }
if (!ko) console.log('\n✅ la cronaca poggia su fatti');
process.exit(ko ? 2 : 0);
