#!/usr/bin/env node
/* GUARDIANO — «IL PALLONE VIAGGIA DA SOLO» (codice 008): QUALCUNO CI DEVE ARRIVARE.

   NOTA PO (#188 [switch], 7.457): «nessun compagno è mai arrivato sul pallone (il più vicino si è
   fermato a 10.0 unità) — eppure l'azione prevedeva un destinatario» → «il pallone viaggia da solo,
   non è sincronizzato con i movimenti dei giocatori». Stessa famiglia: #30, #104, #105, #48.

   PERCHE' I DUE GUARDIANI ESISTENTI NON LO VEDONO, pur essendo verdi:
     · `assist-delivery-test.mjs` verifica che il ricevente sia AGGANCIATO (`assist_recv` ha un uomo)
       e che la palla non ARRETRI. Un uomo agganciato che non si muove abbastanza passa il test.
     · `carry-run-ball-test.mjs` misura la CONDUZIONE dentro il build-up — un'altra finestra: li' il
       pallone e' gia' ai piedi di qualcuno. La nota del PO parla del volo e di cosa succede DOPO.
   Nessuno dei due chiude il cerchio: «il destinatario ci ARRIVA». E' il criterio che manca.

   COSA MISURA. Sul FLUSSO VERO (partite vere, executor cine acceso), per ogni scena la distanza
   MINIMA nel tempo fra il pallone e il compagno di movimento piu' vicino — che e' esattamente la
   grandezza che il taccuino di bordo gia' registra per fotogramma (`md` nell'anello del testimone) e
   su cui e' costruita la riga che il PO ha letto. Se in tutta la scena nessuno scende sotto la
   soglia, il pallone ha viaggiato da solo.

   LA FINESTRA D'AZIONE C'ERA GIA', e la prima stesura di questa sonda non l'aveva vista: lo slot 6
   dell'anello (`f`) e' un BITFIELD scritto ogni fotogramma — bit1 arco in volo, bit2 post-arco vivo,
   bit4 build-up (`tlOn`), bit8 «sono dentro la scena» (aggiunto dal 7.420 proprio perche' la chiave
   `sk` resta attiva anche DOPO l'esito e la finestra sconfinava nella cronaca). Misurare il minimo su
   tutta la chiave di scena dava 0,2-0,9u su OGNI scena, comprese quelle segnalate dal PO: erano i
   fotogrammi di build-up, dove il pallone e' al piede di chi conduce, a schiacciare il minimo.

   LA FINESTRA GIUSTA E' UNA SOLA: da quando l'arco della consegna ATTERRA (bit1 che si spegne) fino
   alla fine della scena (bit8), esclusi i fotogrammi di build-up (bit4). E' l'unico tratto in cui la
   domanda «qualcuno e' arrivato sul pallone?» ha senso: prima il pallone e' ai piedi del portatore,
   durante e' in volo e nessuno puo' esserci sopra.

   SOGLIA: 3,4u, che e' quella con cui il GIOCO STESSO considera il pallone «ai piedi»
   (`_addosso389`, r.~12860; il guardiano gemello giudica a 3). Non e' scelta a occhio.   PROVA DEL ROSSO: `CPM_NO464=1` rimette il ripiego cieco del bersaglio. ⚠️ VA LANCIATA CON L'INTERA
   SEQUENZA (`CPM_SIT=188,30,104,105,98,158,39,56`): il difetto dipende dallo STATO DI CAMPO che le
   scene precedenti lasciano — gi56 da sola non lo riproduce (0,7u), in coda alle altre sette si'
   (5,5u col ripiego cieco, 0,2u col fix). Misurare la scena isolata avrebbe dato un verde falso.

   [7.999.12] ⚠️ LA PROVA DEL ROSSO NON DISCRIMINA PIU'. La rete del 7.464 (compagno piu' vicino quando il filtro
   non sceglie nessuno) non cambia piu' il verdetto: stesso verde nei due bracci sulla sequenza PO, dove il ramo
   viene raggiunto 2 volte (testimone `__CPM_RES464`, che conta gli ingressi). Una scansione di 101 scene-assist
   lo ha trovato su gi3/gi49/gi85/gi86, e anche li' il braccio rosso NON e' peggiore (gi85: 5,3u col fix, 2,7u senza — in isolamento
   0,7u: rumore di stato di campo). Quindi sotto `CPM_NO464` il guardiano esce 2 e dice perche', invece di
   stampare un verde che sembra una prova riuscita. Serve una leva nuova (decisione PO), non una soglia.

   DEFAULT = MODO MIRATO sulla sequenza PO (~3,5 min, verdetto reale). Il flusso vero (`CPM_VERO=1`) produce su
   questa macchina ~1 consegna giudicabile ogni 3 minuti — la maggior parte delle scene-assist o si concatena
   o si chiude con l'arco in volo — e con il budget di 9 minuti sta sul pavimento: e' un secondo passo, non il
   default.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node delivery-arrival-test.mjs [--verbose]     (sequenza PO)
     CPM_SIT=3,49,85,86 node delivery-arrival-test.mjs                                      (scene che entrano nel ramo 7.464)
     CPM_VERO=1 node delivery-arrival-test.mjs                                               (flusso vero, budget CPM_BUDGET_MS) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const SEQ_PO = '188,30,104,105,98,158,39,56';
if (!process.env.CPM_VERO && !(process.env.CPM_SIT || '').length) process.env.CPM_SIT = SEQ_PO;
const TARGET = +(process.env.CPM_SCENE_N || 6);
const VICINO = +(process.env.CPM_VICINO || 3.4);   /* «ai piedi» secondo il gioco stesso */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
/* i DEVTOOLS accendono il testimone di bordo (`_DEVT344`): senza, `__CPM_WATCH_SNAP` non esiste e la
   sonda gira senza guardare niente. `__CPM_CINE` accende l'executor, spento sotto `?cpmtest=1`. */
await page.addInitScript(n => {
  window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
  if (n) window.__CPM_NO464 = 1;   /* prova del rosso: rimette il ripiego cieco del bersaglio */
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {}
}, process.env.CPM_NO464 ? 1 : 0);
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const righe = [];
let partite = 1;

/* [7.999.12] UNA SOLA MISURA per il modo mirato e per il flusso vero (erano due copie che divergevano).
   `sk0` e' la chiave della scena fissata alla risoluzione (vedi sotto, le catene). Ritorna la riga misurata
   oppure `{why}` col motivo per cui la scena non e' giudicabile.
   ⚠️ LA FINESTRA E' IN TEMPO DI SCENA, NON IN TEMPO REALE. Il render-loop tappa `dt` a 0,05: a 5 fps (pagina
   che ha gia' forzato qualche scena, lezione 7.483) la scena scorre a un QUARTO del tempo reale, e 2,5 s reali
   ne contengono 0,6. Misurato su gi98 forzata tre volte di fila: 0,7u · 3,4u · 8,0u, con 40 · 40 · 12
   fotogrammi di finestra — non e' il compagno che rallenta, e' la sonda che guarda un quarto dell'azione.
   Si somma quindi min(Δt, 50 ms) fotogramma per fotogramma: 2,5 s di SCENA, come la finestra d'esito del
   gioco (`postHighlightDuration`, >=2,55 s) a frame rate pieno. */
const SCENA_MS = 2500;
async function misura(sk0) {
  return page.evaluate(([sk0, SCENA_MS]) => {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!snap || !snap.samples || !snap.samples.length) return { why: 'anello vuoto' };
    const S = snap.samples, ks = S.map(x => x.sk).filter(v => v != null && v >= 0);
    if (!ks.length) return { why: 'nessuna chiave di scena' };
    const W = S.filter(x => x.sk === (sk0 != null ? sk0 : Math.max(...ks)) && (x.f & 8));
    if (W.length < 8) return { why: `scena ${sk0} con ${W.length} fotogrammi` };
    /* ultimo fotogramma con l'arco IN VOLO: da li' in poi il pallone e' stato consegnato */
    let last = -1; for (let i = 0; i < W.length; i++) if (W[i].f & 1) last = i;
    if (last < 0) return { why: 'nessun arco in volo' };
    /* SE LA SCENA SI CHIUDE COL PALLONE IN VOLO la domanda non ha risposta: il testimone registra solo negli
       highlight (misurato: l'anello non cresce in `playing`) e l'attesa della cinematica ha un tetto di 6 s
       (7.461) che in headless a volte arriva prima dell'atterraggio. Non e' ne' un orfano ne' un arrivo. */
    if (last === W.length - 1) return { why: `scena chiusa con l'arco in volo`, inVolo: true };
    /* ⚠️ E LA FINESTRA VA CHIUSA ANCHE NEL TEMPO. Col force-sit la scena resta aperta ~50 secondi: in
       cinquanta secondi qualcuno passa vicino al pallone comunque, e il minimo torna a 0,7u su tutto. */
    const dopo = []; let ts = 0;
    for (let i = last + 1; i < W.length; i++) {
      ts += Math.min(50, Math.max(0, W[i].t - W[i - 1].t));
      if (ts > SCENA_MS) break;
      const x = W[i];
      if (!(x.f & 4) && x.md >= 0 && x.md < 900) dopo.push(x);
    }
    if (dopo.length < 4) return { why: `finestra dopo l'atterraggio di ${dopo.length} fotogrammi` };
    const mds = dopo.map(x => x.md);
    return { n: W.length, nDopo: dopo.length, scenaMs: Math.round(Math.min(ts, SCENA_MS)), realeMs: Math.round(dopo[dopo.length - 1].t - W[last].t), mdMin: Math.min(...mds), mdFin: mds[mds.length - 1] };
  }, [sk0, SCENA_MS]);
}
const fase = () => page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }).catch(() => null);
/* la chiave della scena aperta, letta subito dopo la risoluzione */
const chiaveScena = () => page.evaluate(() => { const sn = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); const ks = sn && sn.samples ? sn.samples.map(x => x.sk).filter(v => v != null && v >= 0) : []; return ks.length ? Math.max(...ks) : null; });

/* MODO MIRATO (`CPM_SIT=188,30,104,105`): le note del PO nominano scene precise, e il flusso vero le
   propone a caso — su tre consegne pescate a campione la #188 non esce mai. Qui si forzano quelle.
   ⚠️ Il percorso forzato e' cieco sulla classe «props del commit sbagliato» (costo gia' pagato due
   volte col codice 007), ma questa misura non e' di quella famiglia: guarda se qualcuno CORRE sul
   pallone, cioe' l'AI off-ball e il bersaglio dell'arco — che il force-sit riproduce identici. */
if ((process.env.CPM_SIT || '').length) {
  for (const gi of process.env.CPM_SIT.split(',').map(Number)) {
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
    if (!ok) { console.log(`  gi${gi}: non forzabile`); continue; }
    await sleep(420);
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
    const k = acts ? ((acts.find(a => /assist/i.test(String(a.rew || ''))) || acts[0] || {}).i) : 0;
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
    try { await page.evaluate(i => window.__CPM_RESOLVE(i), k); } catch (e) { continue; }
    /* [7.999.12] la scena forzata resta aperta ~50 s: aspettare che esca da `hl_result` costava 25 s di timeout
       a scena (misurato: 8 scene in 4 min 41 s). Si aspetta invece che la finestra di misura sia PIENA —
       2,5 s di scena dopo l'atterraggio — o che la scena finisca, con un tetto. */
    await sleep(300);
    const skM = await chiaveScena();
    const tM = Date.now();
    let r = null;
    while (Date.now() - tM < 30000) {
      await sleep(600);
      r = await misura(skM);
      const ph = await fase();
      if ((r && r.scenaMs >= SCENA_MS) || (ph && ph !== 'hl_result' && ph !== 'hl_choose')) break;
    }
    if (r && r.mdMin != null) { r.gi = gi; righe.push(r); console.log(`  gi${gi} · ${r.nDopo} fotogrammi in ${r.scenaMs} ms di scena (${r.realeMs} ms reali) · piu' vicino al pallone ${r.mdMin.toFixed(1)}u (fine finestra ${r.mdFin.toFixed(1)}u)`); }
    else console.log(`  gi${gi}: non giudicabile — ${r ? r.why : 'nessuna risposta'}`);
  }
}
const MIRATO = (process.env.CPM_SIT || '').length > 0;
/* [7.999.12] IL FLUSSO VERO E' GUIDATO DALLA FASE, E HA UN BUDGET DI TEMPO.
   Il 26/09 questa sonda e' girata 36 minuti senza finire. Misurato con un tetto di 480 s: 8 partite aperte,
   0 scene. Due cause, nessuna delle quali era «poche scene»:
     · la scena si apre in `hl_move` (il movimento dell'eroe) e resta li' ~8 s se nessuno preme «Scegli».
       La sonda aspettava `hl_choose` per 30 s dopo `playing`, poi contava 12 «secchi» fuori da `playing` e
       riapriva la partita: ogni partita moriva al primo highlight, al 12'. Ciclo infinito a zero misure.
     · `__CPM_ACTS` restituiva le sole etichette (seconda definizione 7.553): `rew` era undefined e l'azione-
       assist non veniva mai trovata. Corretto nel gioco.
   Ora un solo ciclo legge `__CPM_PHASE` (mai `__CPM_STATE`, lezione 7.494) e fa quello che farebbe chi gioca:
   in `hl_move` preme «Scegli», in `hl_choose` sceglie, a fine partita ne apre un'altra con un NOME diverso (7.496:
   stesso nome = stessa partita). E si ferma a un budget di tempo reale, non a un conteggio di giri.
   COPERTURA: dal 7.999.6 una partita produce poche scene vere e solo una parte promette un destinatario. Il
   bersaglio e' CPM_SCENE_N (default 6); sotto il PAVIMENTO (meta', mai meno di 3) il guardiano e' cieco ed esce 2. */
const BUDGET = +(process.env.CPM_BUDGET_MS || 540000);
const PAVIMENTO = Math.max(3, Math.ceil(TARGET / 2));
const T0 = Date.now();
let scenePartita = 0, scene = 0, senzaAssist = 0, misureVuote = 0, catene = 0, inVolo = 0, prima = null, tUltima = Date.now();
const fineScena = () => page.waitForFunction(() => { try { const p = window.__CPM_PHASE(); return p !== 'hl_result' && p !== 'hl_choose'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
while (!MIRATO && righe.length < TARGET && Date.now() - T0 < BUDGET) {
  const ph = await fase();
  const entrata = ph !== prima; prima = ph;
  if (VERB && ph !== fase._ult) { console.log(`  [${((Date.now() - T0) / 1000).toFixed(0)}s] fase ${ph}`); fase._ult = ph; }
  if (ph === 'playing') {
    /* piu' highlight per partita (il gioco li tetta a 8): la coda reattiva e' il percorso vero dei «momenti tuoi» */
    await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); }).catch(() => {});
    /* LE DOMANDE DEL MISTER FERMANO IL CRONOMETRO finche' non rispondi (misurato: «Vado io dentro / Resto
       largo…» al 18', clock fermo in `playing` a tempo indeterminato). Chi gioca risponde; la sonda anche. */
    await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /^1\D/.test((x.textContent || '').trim()) && !/×/.test(x.textContent)); if (bt) bt.click(); }).catch(() => {});
    /* esaurito il tetto di 8 highlight (misurato: raggiunto verso il 33'), il resto della partita e' solo
       cronaca — ~200 s reali senza una scena. Si apre la partita successiva invece di aspettare il 90'. */
    const nhl = await page.evaluate(() => window.__CPM_NUMHL && window.__CPM_NUMHL()).catch(() => null);
    if (nhl >= 8 && ((scenePartita > 0 && Date.now() - tUltima > 45000) || Date.now() - tUltima > 150000)) {/* 45 s: la prima scena di una partita nuova arriva a ~26 s reali */
      partite++; tUltima = Date.now(); scenePartita = 0;
      try { await openMatch(page, port, { skipLoadAll: true, name: 'Consegna' + partite }); await sleep(700); } catch (e) { break; }
      continue;
    }
    await sleep(600); continue;
  }
  if (ph === 'hl_move') {
    /* il bottone che chiude il movimento: «Scegli» su telefono (misurato: nessun «✅» a 412 px), «✅ Pronto [0]» su desktop.
       Il tasto 0 NO: preseleziona l'azione 0. Senza click la fase si chiude da sola dopo ~8 s: non blocca, rallenta. */
    await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /^(✅|Scegli)/.test((x.textContent || '').trim())); if (bt) bt.click(); }).catch(() => {});
    await sleep(300); continue;
  }
  if (ph === 'ended' || ph === 'ceremony' || ph == null) {
    partite++;
    try { await openMatch(page, port, { skipLoadAll: true, name: 'Consegna' + partite }); await sleep(700); } catch (e) { break; }
    tUltima = Date.now(); scenePartita = 0; continue;
  }
  if (ph !== 'hl_choose') { await sleep(300); continue; }
  const ctx = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return { gi: (s && s.sitText) ? String(s.sitText).slice(0, 40) : (s && s.hlType), min: s && s.clock }; });
  /* una scena = un'ENTRATA in hl_choose (lo stato non espone l'indice dell'highlight: deduplicare su
     `hlIdx` lo trovava sempre undefined e scartava tutte le scene dopo la prima) */
  if (!entrata) { await sleep(300); continue; }
  scene++; scenePartita++; tUltima = Date.now();

  /* interessa l'azione che PROMETTE UN DESTINATARIO: premio assist. Senza destinatario promesso
     «nessuno arriva sul pallone» non e' un difetto — e' un tiro. */
  const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
  const k = acts ? (acts.find(a => /assist/i.test(String(a.rew || ''))) || {}).i : null;
  if (VERB) console.log(`  [${((Date.now() - T0) / 1000).toFixed(0)}s] partita ${partite} ${ctx.min}' scena ${ctx.gi}: ${acts ? acts.map(a => a.rew).join('/') : '—'}${k == null ? '' : ' → assist'}`);
  if (k == null) {
    senzaAssist++;
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
    await fineScena();
    continue;
  }
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(i => window.__CPM_RESOLVE && window.__CPM_RESOLVE(i), k); } catch (e) { continue; }
  /* si aspetta la fine VERA della scena (dal 7.461 dura quanto le serve): un'attesa fissa
     misurerebbe il proprio cronometro invece di quello del gioco. */
  /* ⚠️ LA CHIAVE DELLA SCENA SI FISSA QUI. Una consegna riuscita apre spesso la CATENA («ricevi e tira»): quando
     la scena finisce ne e' gia' partita un'altra, e «la chiave piu' alta» dell'anello e' quella nuova, con meno di
     8 fotogrammi — misurato: 6 consegne su 8 «senza finestra misurabile» per questo. */
  await sleep(300);
  const sk0 = await chiaveScena();
  await fineScena();
  /* CONSEGNA CONCATENATA: se la scena successiva parte subito («ricevi e tira»), il pallone e' atterrato
     sul cambio di scena e la finestra d'arrivo e' vuota per costruzione (misurato: 0 fotogrammi). Non e' un
     pallone orfano: e' raccolto dalla catena. Si conta a parte e non vale per la copertura. */
  if (/^hl_(intro|move|choose)$/.test(String(await fase()))) { catene++; if (VERB) console.log(`     concatenata: la scena successiva parte sull'atterraggio`); continue; }
  await sleep(250);

  const r = await misura(sk0);
  if (r && r.mdMin != null) { r.gi = ctx.gi; righe.push(r); if (VERB) console.log(`     ${r.n} fotogrammi · piu' vicino al pallone: ${r.mdMin.toFixed(1)}u (a fine scena ${r.mdFin.toFixed(1)}u)`); }
  else if (r && r.inVolo) { inVolo++; if (VERB) console.log(`     scena chiusa con l'arco in volo`); }
  else { misureVuote++; if (VERB) console.log('     nessuna finestra misurabile: ' + (r ? r.why : 'nessuna risposta')); }
}
const secReali = (Date.now() - T0) / 1000;
if (!MIRATO) console.log(`flusso vero: ${partite} partita/e · ${scene} scene · ${senzaAssist} senza destinatario promesso · ${catene} concatenate · ${inVolo} chiuse con l'arco in volo · ${misureVuote} senza finestra misurabile · ${righe.length} consegne in ${secReali.toFixed(0)} s (${(scene / Math.max(1, secReali / 60)).toFixed(2)} scene/min reale)`);
const res464 = await page.evaluate(() => window.__CPM_RES464 || 0).catch(() => 0);
await b.close(); srv.close();

if (!righe.length) { console.log('❌ nessuna consegna misurata: il guardiano e\' cieco, non verde'); process.exit(2); }
if (!MIRATO && righe.length < PAVIMENTO) { console.log(`❌ solo ${righe.length} consegne misurate (pavimento ${PAVIMENTO}): il guardiano e' cieco, non verde`); process.exit(2); }
const utili = righe.filter(r => r.mdMin != null);
if (!utili.length) { console.log('❌ nessuna finestra d\'azione utilizzabile: il guardiano e\' cieco'); process.exit(2); }
/* una finestra in cui NESSUNO e' arrivato ma che copre meno di 1,5 s di scena non dimostra un orfano: la scena si
   e' chiusa prima (flusso vero) — dichiarata, non giudicata. Chi e' arrivato prima della chiusura vale sempre. */
const tronche = utili.filter(r => r.mdMin > VICINO && r.scenaMs < 1500);
for (const r of tronche) console.log(`  · gi${r.gi}: finestra di soli ${r.scenaMs} ms di scena senza arrivo — NON giudicata`);
const giudicate = utili.filter(r => !tronche.includes(r));
if (giudicate.length < PAVIMENTO) { console.log(`❌ solo ${giudicate.length} consegne giudicabili (pavimento ${PAVIMENTO}): il guardiano e' cieco, non verde`); process.exit(2); }
const orfane = giudicate.filter(r => r.mdMin > VICINO);
console.log(`\n=== ${utili.length} consegne misurate su ${partite} partita/e (soglia «ai piedi»: ${VICINO}u) ===`);
for (const r of utili) console.log(`  ${r.mdMin <= VICINO ? '✅' : tronche.includes(r) ? '·' : '❌'} gi${r.gi} · dopo la consegna, il piu' vicino arriva a ${r.mdMin.toFixed(1)}u (${r.nDopo} fotogrammi, ${r.scenaMs} ms di scena · a fine finestra ${r.mdFin.toFixed(1)}u)`);
const q = a => { const x = a.slice().sort((m, n) => m - n); return x[x.length >> 1]; };
console.log(`\ndistanza d'arrivo mediana: ${q(utili.map(r => r.mdMin)).toFixed(1)}u · peggiore ${Math.max(...utili.map(r => r.mdMin)).toFixed(1)}u`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
console.log(`ramo di ripiego 7.464 raggiunto ${res464} volta/e`);
if (process.env.CPM_NO464) {
  if (!res464) { console.log('❌ PROVA DEL ROSSO NON ESERCITATA: nessuna scena e\' entrata nel ramo che __CPM_NO464 spegne (ripiego 7.464). Un verde qui non prova niente.'); process.exit(2); }
  if (!orfane.length) { console.log(`❌ PROVA DEL ROSSO NON DISCRIMINA: il ramo e' stato raggiunto ${res464} volta/e ma senza la rete nessuna consegna resta orfana. La leva 7.464 e' superata.`); process.exit(2); }
}
if (orfane.length) {
  console.log(`\n❌ FAIL — ${orfane.length}/${giudicate.length} consegne in cui, dopo l'atterraggio, NESSUNO arriva sul pallone:`);
  for (const r of orfane) console.log(`   · gi${r.gi}: il piu' vicino si ferma a ${r.mdMin.toFixed(1)} unita'`);
  console.log('   e\' il «pallone che viaggia da solo» (codice 008).');
  process.exit(1);
}
console.log('\n✅ PASS — dopo ogni consegna qualcuno arriva davvero sul pallone.');
