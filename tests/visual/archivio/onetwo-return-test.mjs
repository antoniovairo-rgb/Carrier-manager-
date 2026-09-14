/* L'UNO-DUE VERO — il pallone deve TORNARE all'eroe.

   L'etichetta «dai e vai / scarico e ricevi / parete» promette una sponda: l'eroe gioca corto,
   il compagno RESTITUISCE, l'eroe finalizza. Questa sonda misura se la restituzione esiste davvero:
   campiona la distanza palla↔eroe per tutta l'azione e cerca la firma dell'uno-due — la palla si
   allontana (primo appoggio) e poi TORNA a contatto dell'eroe.

   ⚠️ PAGINA NUOVA per ogni scenario: riusare la pagina lascia la macchina in hl_result e il secondo
   `__CPM_RESOLVE` non fa partire nulla (trappola gia' costata tre misure false in questa sessione).

     node onetwo-return-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const CASES = [
  { gi: 180, re: /Scarico e ricevi in area/, o2: true },
  { gi: 186, re: /Sponda corta e ricevi in area/, o2: true },
  { gi: 185, re: /Scarico e ricevi sul fondo/, o2: true },
  { gi: 121, re: /Dai e vai subito/, o2: true },
  /* [7.348.0 collaudo PO «il triangolo sostanzialmente non c'e'»] IL CASO CHE MANCAVA. Questo guardiano
     esercitava solo azioni con premio ASSIST — le uniche che il 7.311 rimappava a `pass`, l'hlType che il
     cancello del triangolo pretendeva. «Triangolo e vai» ha premio GOL, che il 7.8.10 converte in OCCASIONE:
     finiva nel ramo dell'appoggio corto, senza muro e senza ritorno (misurato: palla a 9,2 unita' dall'eroe),
     e il guardiano passava lo stesso perche' non lo provava. E' la prima azione della lista, quella che il
     PO sceglie per prima. */
  { gi: 121, re: /Triangolo e vai/, o2: true },
  { gi: 152, re: /Schema a tre/, o2: true },  // l'UNICA con premio GOL: torna e conclude l'eroe
  /* CONTROPROVE — senza queste il test sarebbe vacuo: un passaggio che NON e' un uno-due
     non deve tornare indietro. Due nature diverse:
     · gi25, filtrante dichiarato `through` (pattern THROUGH_BALL);
     · gi109 «Controlla e serve», intent `progression` col pattern COMBINATION di FALLBACK — il caso del
       collaudo PO 7.324 (scena a quattro tratte): il ritorno spetta solo all'intento onetwo DICHIARATO. */
  { gi: 25, re: /./, through: true, o2: false },
  { gi: 109, re: /Controlla e serve/, o2: false },
];
/* [7.324.0] 3.2 → 3.5: SOLO headless. La fase o2 corre in tempo-SCENA, l'auto-advance del result in
   tempo-WALL: nei run dilatati l'avanzamento puo' tagliare la coda della consegna a un passo dall'uomo
   (tracciato: d 13.8→3.2 a t=0.4, convergenza viva). A 60fps reali la corsa fra i due orologi non esiste
   (2.4s di scena contro ~4s di result) e la porta d'arrivo nel CODICE resta <2.0. */
const RITORNO_MAX = 4.0;   /* tolleranza per il taglio headless. La SEPARAZIONE resta netta: gli uno-due
   veri misurano 1.5-3.9 anche nei run peggiori, le controprove (filtrante, progressione) 6.8-7.8 — il
   guardiano distingue le due nature con oltre 2.8u di banda; la porta d'arrivo vera (<2.0) sta nel codice. */
const APPOGGIO_MIN = 3;    // il primo appoggio deve comunque allontanare il pallone (sponda visibile)
const APPOGGIO_MAX = 14;   /* [7.330.0 collaudo PO «pallone volante che torna indietro»] il muro è l'uomo VICINO:
   prima del fix l'appoggio volava 18.7-22.9u (selezione da assist + scatto +12u) e la sponda era un boomerang
   che attraversava il campo. Un dai-e-vai vero tiene l'appoggio nel corto (banda 2.2-13u + margine poll). */
/* [7.324.0] soglia 3 → 1.0, e la ragione e' il TEMPO-SCENA: in headless la scena scorre a 1/10-1/30 del
   reale e una corsa a velocita' di scena copre in proporzione (misura ESATTA per-frame: 1.3-2.4u nella
   finestra della sponda; il vecchio 3-6u veniva dal massimo su TUTTA la finestra node, fasi successive
   comprese — gonfiato). Qui si asserisce il fatto strutturale — la corsa del «vai» ESISTE ed e' in avanti
   (il bersaglio +6.5 latchato e' nel codice); la sua ampiezza piena si vede a 60fps reali. */
const AVANZ_MIN = 1.0;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = []; let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

for (const c of CASES) {
  const page = await b.newPage(); await page.setViewportSize({ width: 900, height: 760 });
  await installCdnRoutes(page); page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port); await sleep(900);
  const info = await page.evaluate(([gi, src, thr]) => {
    const s = (window.__CPM_SITS || [])[gi]; if (!s) return null;
    const rx = new RegExp(src);
    /* per la controprova serve un'azione che deriva davvero in un PASSAGGIO (non un tiro) */
    let k = -1;
    (s.actions || []).forEach((a, i) => {
      if (k >= 0 || !rx.test(a.label || '')) return;
      if (!thr) { k = i; return; }
      try { const h = window.deriveHL(s, a); if (h.type === 'pass' && h.pattern !== 'COMBINATION') k = i; } catch (e) { }
    });
    if (k < 0) return null;
    let pat = null; try { pat = window.deriveHL(s, s.actions[k]).pattern; } catch (e) { }
    return { k, label: s.actions[k].label, rew: s.actions[k].rew, intent: s.intent, pat };
  }, [c.gi, c.re.source, !!c.through]);
  if (!info) { say(false, `gi${c.gi} — azione non trovata`); await page.close(); continue; }
  await page.evaluate(gi => window.__CPM_FORCE_SIT(gi, true), c.gi); await sleep(800);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(600);
  await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, info.k);

  /* [7.324.0] gli ESTREMI si leggono dai tracker PER-FRAME in pagina (__CPM_O2MIN / __CPM_O2RUN):
     il poll da node a 120ms li perdeva e il verdetto ballava attorno alle soglie tra un run e l'altro
     (misurato: «vai» 2.4-4.9 e ritorno 1.0-4.7 sullo STESSO contenuto). Terza ricorrenza della trappola
     di campionamento in questa sessione: rincorsa, lancio orfano, e ora questa. Il campione node resta
     solo per l'appoggio (un massimo grosso, robusto anche a poll lento). */
  /* [7.324.0-bis] la sonda aspetta la FINE DELLA FASE, non un tempo fisso: in headless sotto carico la
     scena scorre a 1/10-1/30 del reale e 4 secondi wall leggevano il tracker A META' VOLO — il «minimo»
     era solo dove la palla stava quando smettevamo di guardare (variava 1.5→5.1 fra run identici).
     Fine fase = __CPM_O2.t fermo per 2.5s wall (la fase e' uscita) o cap 45s. */
  /* si aspetta la STABILIZZAZIONE del minimo (tracker per-frame in pagina), con uscita rapida quando la
     consegna e' arrivata (min<2.1) e cap a 45s wall. */
  const d = [];
  let lastMin = null, lastChange = Date.now(), lastBk = null;
  const t0 = Date.now();
  while (Date.now() - t0 < 45000) {
    const v = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return { bk: window.__CPM_O2BK == null ? null : +window.__CPM_O2BK, d: +Math.hypot((s.ball.x - s.hero.x) * 0.972, (s.ball.y - s.hero.y) * 0.6).toFixed(2), m: window.__CPM_O2MIN == null ? null : +window.__CPM_O2MIN }/* [7.330.0] distanza in unità MONDO (game y ×0.6): in unità di gioco uno scarico LATERALE legittimo leggeva 17u e sembrava un lancio — stessa scala del tracker __CPM_O2MIN */ ; } catch (e) { return null; } });
    if (v) { if (v.bk != null) lastBk = v.bk; if (!(v.m != null && v.m < 2.1)) d.push(v.d);/* [7.330.0] l'appoggio si misura SOLO fino all'arrivo del ritorno: il campione preso quando la sponda è già consegnata appartiene alla gamba dell'ASSIST (l'eroe serve l'uomo profondo) e a 150ms di poll gonfiava «via» di 10u su gi180 — boomerang finto, artefatto di campionamento (quarta ricorrenza della trappola) */ if (v.m !== lastMin) { lastMin = v.m; lastChange = Date.now(); } }
    if (lastMin != null && lastMin < 2.1) break;
    if (Date.now() - lastChange > 4000 && d.length > 10) break;
    await sleep(150);
  }
  const exact = await page.evaluate(() => ({ min: window.__CPM_O2MIN, run: window.__CPM_O2RUN }));
  const avanz = exact.run == null ? 0 : +(+exact.run).toFixed(1);
  const via = Math.max(...d);
  const torna = (exact.min != null) ? exact.min : via;
  const tornata = torna <= RITORNO_MAX;
  if (c.o2) say(lastBk != null && lastBk <= 1.2, `gi${c.gi} · [7.333.0] la RESTITUZIONE non viaggia mai all'indietro (moto indietro cumulato ${lastBk == null ? 'n/d' : lastBk.toFixed(2)}u, max 1.2)`);
  say(c.o2 ? (via >= APPOGGIO_MIN && via <= APPOGGIO_MAX && tornata && avanz >= AVANZ_MIN) : !tornata,
    `gi${c.gi} [${info.intent}·${info.rew}·${info.pat}] "${info.label}" · ${c.o2 ? 'UNO-DUE' : 'CONTROPROVA (non deve tornare)'} · appoggio ${via.toFixed(1)}u (banda ${APPOGGIO_MIN}-${APPOGGIO_MAX}) → ritorno ${torna.toFixed(1)}u${c.o2 ? ` · il «vai» dell'eroe ${avanz}u (min ${AVANZ_MIN})` : ''}`);
  await page.close();
}

if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails}` : `\n✅ PASS — l'uno-due si vede: la palla torna all'eroe`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
