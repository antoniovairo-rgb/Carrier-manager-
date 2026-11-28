#!/usr/bin/env node
/* CENSIMENTO DEL SALTO DEL PALLONE — «SALTO del pallone di 7.0 unità in 21 ms (a x 44.9), 330 u/s».

   PERCHE' QUESTA NOTA VALE PIU' DELLE ALTRE. Il taccuino del PO l'ha riportata TRE VOLTE, su tre
   situations diverse (#139 recover, #162 progression, #120 through) e in due partite diverse — con
   numeri IDENTICI: 7,0 unita', 21 ms, x 44,9. Un numero identico fra scene diverse non e' un evento,
   e' una transizione fissa: e' la stessa firma che nel 7.463 ha smascherato una soglia che scattava da
   sola, e nel 7.471 la transizione di camera. Quindi non e' un caso limite da inseguire: e' un unico
   punto di codice che salta sempre allo stesso modo.

   COSA FA. Gioca partite VERE, lascia accumulare le scene nel testimone di bordo e poi cerca il salto
   con la STESSA matematica del detector (`draftBugNote`), scena per scena, riportando ANCHE la fase e
   lo stato dell'azione al momento del salto (il bitfield `f`: arco in volo, post-arco vivo, build-up,
   dentro la scena). E' quell'informazione — non la dimensione del salto — che dice CHI lo fa.

   ⚠️ PRIMA PASSATA, E VA SCRITTA: la terna del PO (7,0u · 21ms · x 44,9) NON si e' riprodotta. Quello
   che si e' trovato e' un fenomeno DIVERSO e piu' largo — su otto scene giocate davvero, OTTO hanno un
   salto del pallone oltre le 6 unita' (da 6,5 a 39u), e cinque di questi avvengono con NESSUN arco in
   volo: e' il riposizionamento della palla all'apertura di scena, che e' legittimo solo se sta dentro
   uno stacco. E' la stessa forma del teletrasporto di camera chiuso nel 7.471 — un movimento istantaneo
   che deve vivere dentro un taglio — ed e' probabilmente il motivo per cui questa riga continua a
   comparire nelle note. Non e' ancora un rimedio: e' la pista, misurata.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node ball-jump-census.mjs                             */
/* ⚠️ [7.495.0 F1] TRE DIFETTI DI QUESTA SONDA, MISURATI E CORRETTI — rilanciata dopo mesi ha risposto
   «0 salti su 1 scena» e «il varco non ha guardato nessun fotogramma», USCENDO CON CODICE 0. Cioe': non
   ha misurato niente, e in CI sarebbe passata.
     (1) LA FASE VENIVA LETTA DA `__CPM_STATE().phase`, che la espone dalle props del 3D. `show3D` non
         include `ended`: a partita finita il componente si smonta e quella funzione resta congelata
         sull'ultimo valore. Il ciclo cercava `playing`, non lo trovava mai piu', e consumava il budget in
         attese a vuoto invece che in scene. Ora usa `matchPhase()` (→ `__CPM_PHASE`, cioe' `phaseRef`
         dentro LiveMatch) e su `ended` riapre SUBITO invece di bruciare dodici giri secchi.
     (2) IL VARCO VENIVA RACCOLTO ALLA FINE. `openMatch` fa `page.goto`, e una navigazione AZZERA
         `__CPM_BJ478`/`__CPM_BJN478`: leggerli dopo l'ultimo riavvio vuol dire leggere i contatori di una
         partita appena aperta — di qui lo zero. Ora si raccoglie e si ACCUMULA prima di ogni riapertura,
         come `camera-step-census` gia' faceva.
     (3) UNA PASSATA CIECA ORA E' ROSSA. Zero fotogrammi visti dal varco, o zero scene giocate, non e' un
         «nessun salto»: e' una misura che non c'e'. Esce 2. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const TARGET = +(process.env.CPM_SCENES || 26);
const BUDGET_MS = +(process.env.CPM_BUDGET_MS || 900000);/* il budget e' il TEMPO, non il numero di giri */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
/* il testimone di bordo esiste solo coi DEVTOOLS accesi: senza questa riga la sonda gira e non guarda */
/* [giro 446 PO-643] DUE SCELTE DEL BANCO, MISURATE.
   (a) GLB ACCESO (direttiva PO 29/07: le verifiche si fanno coi corpi CH38). Prima era spento. `CPM_GLB=0` lo rispegne.
   (b) VELOCITA' 2x, la manopola del giocatore (`cpm-match-speed`, 1 · 1,5 · 2). Misurato sul banco: il cronometro della
       partita gira a ~4 s reali per minuto di gioco (contro i 1,7 nominali: timer contesi in headless), una partita intera
       dura ~6 minuti e da' 7-8 scene, quindi in 15 minuti ne stanno 19 al massimo su 26. La manopola muove SOLO il flusso
       (`playing`): le finestre d'esito degli highlight non cambiano (7.484) e la sequenza della partita e' identica a ogni
       velocita' (7.489, `match-speed-change`). `CPM_SPEED=1` torna a 1x. */
const SPEED = String(process.env.CPM_SPEED || '2'), GLB = process.env.CPM_GLB !== '0';
await page.addInitScript(([m, sp, glb]) => { window.__CPM_GLB = glb; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; if (m) window.__CPM_BJMIN = m; try { localStorage.setItem('cpm-devtools', '1'); localStorage.setItem('cpm-match-speed', sp); } catch (e) {} }, [+(process.env.CPM_BJMIN || 0), SPEED, GLB]);
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const salti = [];
/* accumulatori del varco: vanno svuotati PRIMA di ogni `page.goto`, che li azzererebbe */
let fonti = [], visti = 0, partite = 1;
const raccogli = async () => {
  try {
    const d = await page.evaluate(() => ({ f: (window.__CPM_BJ478 || []).slice(), n: window.__CPM_BJN478 || 0 }));
    fonti = fonti.concat(d.f); visti += d.n;
  } catch (_e) {}
};
const riapri = async () => { await raccogli(); await openMatch(page, port, { skipLoadAll: true }); await sleep(700); partite++; };

let secchi = 0, scene = 0, tasti = 0, attese = 0;
const NO_G446 = process.env.CPM_NO_G446 === '1';
const t0run = Date.now();
while (scene < TARGET && Date.now() - t0run < BUDGET_MS) {
  const ph = await matchPhase(page);
  /* `ended`/`ceremony` = partita finita: riaprire SUBITO. Prima si aspettava che una fase stantia
     tornasse `playing`, cosa che non poteva succedere: e' li' che moriva il censimento. */
  if (ph === 'ended' || ph === 'ceremony' || ph === 'shootout') { secchi = 0; try { await riapri(); } catch (e) { break; } continue; }
  if (ph == null) {
    if (++secchi >= 12) { secchi = 0; try { await riapri(); } catch (e) { break; } }
    else await sleep(700);
    continue;
  }
  secchi = 0;
  /* ⚠️ IL CANCELLO SU `playing` AFFAMAVA IL CENSIMENTO. Il ciclo avanzava solo se sorprendeva la partita
     in gioco fluido — ma armata la coda reattiva `numHL` sale subito al tetto di 8 e gli highlight si
     incatenano: fra `hl_result` e l'`hl_intro` successivo passa MENO DI 1,5 s (misurato tracciando le
     transizioni: 28,0→28,5 · 50,4→51,4). La sonda passava il tempo ad aspettare una finestra che quasi
     non esiste e chiudeva con UNA scena su otto. Ora la coda si arma quando capita di essere in
     `playing`, ma il ciclo procede da QUALUNQUE fase in-partita: cio' che conta e' il prossimo
     `hl_choose`, non come ci si arriva. */
  if (ph === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  /* anche queste due attese leggevano la fase dalle props del 3D: stessa sorgente stantia, stesso rischio
     di aspettare per sempre una transizione gia' avvenuta */
  /* [giro 446 PO-643] LA PARTITA SI FERMAVA IN `hl_move` E LA SONDA ASPETTAVA PER SEMPRE. Misurato (traccia delle fasi,
     una lettura per giro): 5 scene nei primi 128 s, poi dal 220 s al 435 s SETTE attese da 30 s di fila tutte in `hl_move`,
     stessa partita. Il timer di pressione che porta da solo `hl_move`→`hl_choose` in 8 s NON parte sulle scene a movimento
     bloccato (`lockMovement`/`maxMoves===0`: rigori e punizioni, src/15 «no pressure on penalty/free kick"): li' il gioco
     aspetta il giocatore, che preme «Tira» o il tasto 0. Non e' un difetto del gioco (e' la lettura del piazzato), e' la
     sonda che non faceva la parte del giocatore: una scena piazzata bloccava il resto del censimento. Ora, se la fase resta
     `hl_move` oltre il timer di pressione (9 s di parete), la sonda preme 0 — lo stesso tasto del giocatore, stesso
     `setPhase("hl_choose")`. Rosso della sonda: `CPM_NO_G446=1` = attesa di prima (solo `hl_choose`). */
  let ok = false;
  { const tW = Date.now(); let tMove = 0;
    while (Date.now() - tW < 30000) {
      const f = await matchPhase(page);
      if (f === 'hl_choose') { ok = true; break; }
      if (f === 'ended' || f === 'ceremony' || f === 'shootout' || f == null) break;
      if (f === 'hl_move' && !NO_G446) { if (!tMove) tMove = Date.now(); else if (Date.now() - tMove > 9000) { await page.keyboard.press('0').catch(() => {}); tasti++; tMove = 0; } }
      else tMove = 0;
      await sleep(250);
    }
  }
  if (!ok) { attese++; await sleep(600); continue; }
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  await page.waitForFunction(() => { try { return !window.__CPM_PHASE || window.__CPM_PHASE() !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
  scene++;
  await sleep(250);
  const r = await page.evaluate(() => {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!snap || !snap.samples || !snap.samples.length) return null;
    const S = snap.samples, ks = S.map(s => s.sk).filter(k => k != null && k >= 0);
    if (!ks.length) return null;
    const k = Math.max(...ks), W = S.filter(s => s.sk === k);
    if (W.length < 8) return null;
    const out = [];
    for (let i = 1; i < W.length; i++) {
      const a = W[i - 1], b2 = W[i], dt = (b2.t - a.t) / 1000;
      /* ⚠️ IL PALLONE NELL'ANELLO SI CHIAMA `x,y,z` — NON `bx,bz`. La prima stesura leggeva `bx`, che
         non esiste, e saltava ogni campione in silenzio: zero salti su quattro scene, cioe' un verde
         che non voleva dire niente. Verificato stampando le chiavi di un campione prima di fidarsi. */
      if (dt <= 0 || dt > 0.5 || a.x == null || b2.x == null) continue;
      const d = Math.hypot(b2.x - a.x, (b2.z - a.z) || 0);
      if (d >= 6) out.push({ d: +d.toFixed(1), dt: Math.round(dt * 1000), x: +b2.x.toFixed(1), z: +(b2.z || 0).toFixed(1),
        fa: a.f | 0, fb: b2.f | 0, hx: +(b2.hx || 0).toFixed(1) });
    }
    return { k, n: W.length, out };
  });
  if (r && r.out.length) for (const s of r.out) salti.push({ scena: r.k, ...s });
}
/* [7.478.0] LA SORGENTE, non la dimensione. L'anello del testimone dice QUANTO salta il pallone ma non chi
   lo sposta, e la sua finestra (una sola chiave-scena) esclude proprio l'apertura di scena a cui la prima
   passata aveva attribuito i salti. Il varco `__CPM_BJ478` e' scritto dal render-loop accanto a ogni
   riassegnazione secca del pallone e letto a fine fotogramma, con lo stato dello stacco nero. */
await raccogli();/* ultima raccolta: quella della partita in corso, che nessuna riapertura ha svuotato */
await b.close(); srv.close();

const bit = f => [(f & 1) ? 'arco' : '', (f & 2) ? 'post-arco' : '', (f & 4) ? 'build-up' : '', (f & 8) ? 'in-scena' : ''].filter(Boolean).join('+') || '—';
console.log(`\n=== ${salti.length} salti (>=6u in un fotogramma) su ${scene} scene ===`);
for (const s of salti.slice(0, 30)) console.log(`  ${String(s.d).padStart(5)}u in ${String(s.dt).padStart(3)}ms → x ${String(s.x).padStart(6)} z ${String(s.z).padStart(6)} · prima: ${bit(s.fa).padEnd(22)} dopo: ${bit(s.fb)}`);
if (salti.length) {
  const perX = {};
  for (const s of salti) { const k = Math.round(s.x); perX[k] = (perX[k] || 0) + 1; }
  const top = Object.entries(perX).sort((a, b2) => b2[1] - a[1]).slice(0, 6);
  console.log(`\ndove atterrano: ${top.map(([x, n]) => `x≈${x} (${n})`).join(' · ')}`);
  const dd = [...new Set(salti.map(s => s.d))];
  console.log(`dimensioni distinte del salto: ${dd.slice(0, 12).join(', ')}${dd.length > 12 ? '…' : ''}`);
  console.log(dd.length <= 3 ? '→ POCHE dimensioni distinte: e\' una transizione fissa, non rumore.' : '→ molte dimensioni distinte: guardare gli stati, non il numero.');
} else console.log('nessun salto osservato in questa passata.');
console.log(`\n=== ${fonti.length} salti ATTRIBUITI su ${visti} fotogrammi VISTI dal varco ===`);
if (!visti) console.log('  ⚠️  il varco non ha guardato nessun fotogramma: la misura non vale (strumenti spenti o codice non raggiunto).');
if (fonti.length) {
  const per = {};
  for (const f of fonti) { const k = f.src + ((f.mask || f.nascosto) ? ' [dentro lo stacco]' : ' [SCOPERTO]'); (per[k] = per[k] || []).push(f.d); }
  for (const [k, ds] of Object.entries(per).sort((a, b2) => b2[1].length - a[1].length))
    console.log(`  ${String(ds.length).padStart(3)}x ${k.padEnd(30)} · da ${Math.min(...ds).toFixed(1)} a ${Math.max(...ds).toFixed(1)} u`);
  const scoperti = fonti.filter(f => !f.mask && !f.nascosto);/* [giro 40 PO-261] nascosto = primo fotogramma dopo il campo 2D, il prima non era a schermo */
  console.log(`\n${scoperti.length}/${fonti.length} salti avvengono SENZA stacco nero vivo: sono quelli che il giocatore vede.`);
} else console.log('  nessun salto attribuito (varco vuoto: strumenti spenti o pallone continuo).');
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

/* ⚠️ UNA PASSATA CHE NON HA MISURATO NON E' UNA PASSATA PULITA. Fino al 7.494 questo censimento usciva 0
   anche dichiarando nel testo che la misura non valeva: in CI si legge «passato», e nessuno va a
   guardare. Un varco vuoto e zero scene sono le due condizioni in cui il risultato non esiste. */
/* il pavimento non e' «una scena»: con una sola scena «zero salti» non significa nulla. Meta' del
   bersaglio, mai sotto tre, e' il minimo perche' la frase «nessun salto osservato» valga qualcosa. */
const MIN_SCENE = Math.max(3, Math.floor(TARGET / 2));
console.log(`\ncopertura: ${scene}/${TARGET} scene giocate su ${partite} partite · ${visti} fotogrammi visti dal varco · piazzati portati alla scelta col tasto 0: ${tasti} · attese di 30 s senza scena: ${attese} · velocita' ${SPEED}x · GLB ${GLB ? 'acceso' : 'SPENTO'}${NO_G446 ? ' · BRACCIO ROSSO CPM_NO_G446 (attesa di prima)' : ''}`);
if (!visti) { console.log('❌ CIECO: il varco non ha guardato nessun fotogramma — la misura non esiste, non e\' un «nessun salto»'); process.exit(2); }
if (scene < MIN_SCENE) { console.log(`❌ COPERTURA INSUFFICIENTE: ${scene} scene su un minimo di ${MIN_SCENE} — «nessun salto» su cosi' poco non e' un risultato`); process.exit(2); }
console.log('✅ misura valida');
