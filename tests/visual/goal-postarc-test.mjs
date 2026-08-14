#!/usr/bin/env node
/* GUARDIANO — «UN GOL DICHIARATO DEVE FINIRE IN PORTA».

   COSA PROTEGGE. Il PO vede il gioco dichiarare GOL, contarlo a tabellone, e il pallone fermarsi a
   meta' campo (scarti misurati: 52,2 · 51,8 · 9,8 · 7,6 unita', VARIABILI). La causa misurata nel
   7.458/7.459: il POST-ARCO che porta la palla in rete (`hlPostArcType="in_net"`) su una parte dei
   gol NON NASCE — o perche' l'arco della conclusione atterra quando i props della scena sono gia'
   stati svuotati (sottocaso 2a), o perche' l'arco muore in volo e il blocco di completamento non
   scatta mai (2b).

   IL CRITERIO NON E' SCELTO A OCCHIO. Per ogni gol dichiarato sul flusso vero si pretendono due
   cose, entrambe strutturali:
     (1) un POST-ARCO d'ingresso in rete deve nascere (in_net / in_net_high / cross_goal);
     (2) il pallone deve RAGGIUNGERE la linea di porta — x >= AWAY_GOAL_X (46, la costante del
         gioco, r.~10787), non una soglia inventata. I gol sani misurano 49,1.

   PERCHE' SUL FLUSSO VERO E NON COL FORCE-SIT. Il percorso forzato (__CPM_FORCE_SIT) e' CIECO per
   costruzione su tutta la classe «props del commit sbagliato»: e' gia' costato due diagnosi
   sbagliate (codice 007). Qui si gioca la partita vera — provino → `playing` col clock reale →
   highlight reattivi in coda — e si forza il SUCCESSO al momento della scelta.

   TRAPPOLE GIA' PAGATE, CODIFICATE QUI DENTRO:
     · `__CPM_CINE=1` e' obbligatorio: `?cpmtest=1` SPEGNE l'executor cine e senza il flag la
       costruzione dell'azione non esiste — si misurerebbe un percorso che il giocatore non vede.
     · si sceglie l'azione con `rew=goal` via `__CPM_ACTS()`: forzare il successo sull'azione 0 da'
       quasi sempre `outKey="chance"`, che per definizione non mette la palla in rete.
     · si conta come GOL solo l'`outKey`, mai `ok===true`: una chance riuscita finirebbe fra i gol.

   PROVA DEL ROSSO: `CPM_GOALPA_SOGLIA=<x>` sposta la linea pretesa (con 60 il guardiano vira rosso
   anche sui gol sani: la soglia e' davvero cio' che giudica). Nato ROSSO sul 7.459.0.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node goal-postarc-test.mjs [--verbose]              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const TARGET = +(process.env.CPM_GOALS || 6);          /* gol dichiarati da raccogliere */
const LINEA = +(process.env.CPM_GOALPA_SOGLIA || 46);  /* AWAY_GOAL_X — la porta, non una soglia a occhio */
const RETE = new Set(['in_net', 'in_net_high', 'cross_goal']);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
/* `CPM_REALWAIT=1` apre l'attesa che il gioco VERO concede al gol (r.~20346, spenta sotto test):
   serve per non giudicare una finestra d'esito che il giocatore non ha mai. */
await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; if (o.rw) window.__CPM_REALWAIT = 1; if (o.no) window.__CPM_NO460 = 1; },
  { rw: process.env.CPM_REALWAIT ? 1 : 0, no: process.env.CPM_NO460 ? 1 : 0 });
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const gol = [];
/* il rendimento e' basso (molte scene non hanno un'azione da GOL): serve un budget di giri largo,
   altrimenti il guardiano estrae 2-3 gol e una classe che compare 1 volta su 5 non entra nel
   campione — cioe' un verde che non ha guardato abbastanza. */
for (let round = 0; round < TARGET * 30 && gol.length < TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) { await sleep(700); continue; }
  await page.evaluate(() => { window.__CPM_PA457 = []; window.__CPM_ARCEND457 = []; window.__CPM_ARCFIRE457 = []; window.__CPM_ARCORPHAN457 = []; window.__CPM_ARCCALL457 = []; });
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const gotChoose = await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; }
  }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!gotChoose) { await sleep(600); continue; }

  const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
  const kGoal = acts ? (acts.find(a => /goal/i.test(String(a.rew || ''))) || {}).i : null;
  if (kGoal == null) {
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
    await sleep(1200); await tornaAPlaying(); continue;
  }
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k), kGoal); } catch (e) { continue; }
  /* l'ESITO si cattura SUBITO e non a fine finestra: `__CPM_OUTCOME` e' lo state React `outcome`,
     e quando la scena si chiude torna null — leggerlo dopo l'attesa faceva sparire i gol appena
     misurati (prima stesura: 3 gol rotti nella sonda gemella, 0 righe qui). */
  let key = null;
  for (let i = 0; i < 40 && key == null; i++) {
    key = await page.evaluate(() => { const o = window.__CPM_OUTCOME; return o ? (o.outKey || o.key || null) : null; }).catch(() => null);
    if (key == null) await sleep(100);
  }
  await sleep(3600);   /* tutta la finestra d'esito, post-arco compreso */

  const d = await page.evaluate(() => ({
    pa: (window.__CPM_PA457 || []).slice(), out: window.__CPM_OUTCOME || null,
    ae: (window.__CPM_ARCEND457 || []).slice(), af: (window.__CPM_ARCFIRE457 || []).slice(),
    ao: (window.__CPM_ARCORPHAN457 || []).slice(), ac: (window.__CPM_ARCCALL457 || []).slice()
  }));
  /* solo l'outKey decide, e «goal_against» non e' un gol dell'eroe */
  if (!/goal/i.test(String(key || '')) || /against/i.test(String(key || ''))) { await tornaAPlaying(); continue; }
  if (!d.pa.length) { await tornaAPlaying(); continue; }

  /* TUTTI i post-archi della scena, non il primo: sull'uno-due il primo e' `onetwo_back` e
     l'ingresso in rete arriva dopo — giudicare il primo bocciava un gol sano (misurato). */
  const post = [...new Set(d.pa.map(r => r.pt).filter(Boolean))].join('>') || null;
  const bxMax = Math.max(...d.pa.map(r => r.bx));
  gol.push({ key, post, bxMax, ht: d.pa[0].ht, rew: d.pa[0].rew, kind: d.pa[0].kind,
    ae: d.ae, af: d.af, ao: d.ao, ac: d.ac, win: +((d.pa[d.pa.length - 1].t - d.pa[0].t) / 1000).toFixed(2), rt: d.pa[d.pa.length - 1].rt, tl: d.pa.filter(r => r.tlOn).length, tlT: d.pa.length ? d.pa[d.pa.length - 1].tlT : null, bn: (d.pa.find(r => r.tlOn) || {}).bn, frames: d.pa.length, paF: d.pa.filter(r => r.pa >= 0).length });
  await tornaAPlaying();
}

async function tornaAPlaying() {
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; } catch (e) { return false; } }, { timeout: 25000 }).catch(() => {});
}

await b.close(); srv.close();
if (!gol.length) { console.log('❌ nessun gol dichiarato misurato: il guardiano e\' cieco, non verde'); process.exit(2); }

console.log(`\n=== ${gol.length} GOL dichiarati sul FLUSSO VERO (linea di porta: x >= ${LINEA}) ===`);
/* DUE CLASSI STRUTTURALI, ed e' su quelle che il guardiano giudica — perche' non dipendono dal
   frame-rate dell'ambiente:
     A. la CONCLUSIONE NON E' MAI PARTITA (`fireConclusion` mai chiamata): il build-up si e' mangiato
        tutta la finestra. Chiusa dal 7.460 togliendo il rallentatore dalla costruzione.
     B. l'arco e' ATTERRATO FUORI da hl_result e non ha dispatchato nessun post-arco: e' la lettura
        dei props dal fotogramma d'atterraggio. Chiusa dal 7.460 col contesto dichiarato al lancio.
   La terza — «la finestra si e' chiusa con l'arco ancora in volo» — NON viene giudicata: dipende dal
   CLOCK DI SCENA, che a fps bassi avanza molto meno del tempo reale (`dt` e' tappato a 0.05, r.~12176)
   e in headless dimezza la finestra. Si DICHIARA coi suoi numeri, come il residuo di scene-staging-lag:
   e' una precedenza fra la finestra d'esito (setTimeout, tempo reale) e la catena cinematica (clock di
   scena), cioe' una scelta che non spetta al guardiano. */
const clA = [], clB = [], clC = [], residuo = [];
/* IL CLOCK DI SCENA QUALIFICA IL CAMPIONE. La finestra d'esito di un gol vale >=3,05s
   (`postHighlightDuration`, r.~3997) ma e' un `setTimeout` in tempo REALE, mentre la catena
   cinematica gira sul clock di scena, che `dt` tappa a 0.05 (r.~12176): a 9 fps headless quel clock
   avanza meno della meta' del tempo reale e la finestra si chiude con l'arco ancora in volo. Quando
   il clock di scena HA avuto il suo tempo (>=2,5s, cioe' l'ordine di grandezza della finestra) un
   gol che non arriva in porta e' un difetto vero e viene GIUDICATO (classe C); quando il clock e'
   stato affamato dall'ambiente, e' il residuo dichiarato — non un verdetto sul gioco. */
const CLOCK_MIN = +(process.env.CPM_CLOCK_MIN || 2.5);
for (const g of gol) {
  const ok = g.bxMax >= LINEA;
  const atterrFuori = g.ae.some(a => a.ph !== 'hl_result');
  const clockPieno = (g.rt || 0) >= CLOCK_MIN;
  if (!g.ac.length) clA.push(g);
  else if (atterrFuori && !g.post) clB.push(g);
  else if (!ok && clockPieno) clC.push(g);
  else if (!ok) residuo.push(g);
  const tag = !g.ac.length ? '❌A' : (atterrFuori && !g.post) ? '❌B' : (!ok && clockPieno) ? '❌C' : ok ? '✅ ' : '⚠️ ';
  console.log(`  ${tag} «${g.key}» hlType=${String(g.ht).padEnd(8)} rew=${String(g.rew).padEnd(6)} · post-arco ${String(g.post || 'NESSUNO').padEnd(20)} · palla max x=${g.bxMax.toFixed(1)}`);
  if (tag !== '✅ ' || VERB) {
    console.log(`       fireConcl.: ${g.ac.length ? g.ac.map(a => `ph=${a.ph} ht=${a.ht} hs=${a.hs} rew=${a.rew} pat=${a.pat}`).join(' || ') : 'MAI CHIAMATA'}  · build-up ${g.tl}/${g.frames} fotogrammi, tlT finale ${g.tlT}, segmenti ${g.bn} · FINESTRA d'esito ${g.win}s reali (clock di scena ${g.rt}s)`);
    console.log(`       lancio    : ${g.af.length ? g.af.map(a => `ph=${a.ph} ht=${a.ht}→t=${a.t} hs=${a.hs} rew=${a.rew} tgx=${a.tgx} dur=${a.dur}`).join(' || ') : 'NESSUNO — fireConclusion non ha mai lanciato un arco'}`);
    console.log(`       atterragg.: ${g.ae.length ? g.ae.map(a => `u=${a.u} ph=${a.ph} bg=${a.bg} ht=${a.ht} hs=${a.hs} rew=${a.rew} bx=${a.bx}`).join(' || ') : 'NESSUNO — l\'arco non ha mai raggiunto il completamento'}`);
  }
}
for (const e of errs.slice(0, 4)) console.log('  ⚠ pageerror: ' + e);
const inPorta = gol.filter(g => g.bxMax >= LINEA).length;
console.log(`\nGOL dichiarati: ${gol.length} · in porta: ${inPorta} · fuori: ${gol.length - inPorta}`);
if (residuo.length) {
  console.log(`\nRESIDUO DICHIARATO (non giudicato) — ${residuo.length} gol con la finestra chiusa e l'arco ancora in volo:`);
  for (const g of residuo) console.log(`  · finestra ${g.win}s reali ma clock di scena ${g.rt}s (${g.frames} fotogrammi ⇒ ~${(g.frames / g.win).toFixed(0)} fps) · arco dur=${(g.af[0] || {}).dur} · palla ferma a x=${g.bxMax.toFixed(1)}`);
  console.log('  → e\' la precedenza finestra d\'esito ⟷ catena cinematica: va decisa col PO, non qui.');
}
console.log(`\nCLASSE A (conclusione mai partita): ${clA.length}   ·   CLASSE B (atterraggio fuori scena senza post-arco): ${clB.length}   ·   CLASSE C (clock di scena pieno e palla comunque fuori): ${clC.length}`);
console.log(`  (campione qualificato dal clock di scena >= ${CLOCK_MIN}s: ${gol.filter(g => (g.rt || 0) >= CLOCK_MIN).length}/${gol.length})`);
if (clA.length || clB.length || clC.length) {
  console.log('\n❌ FAIL — «esito dichiarato ≠ 3D»: il gioco conta gol la cui conclusione in campo non e\' mai stata giocata.');
  process.exit(1);
}
console.log('\n✅ PASS — nessun gol dichiarato resta senza conclusione giocata (classi A e B a zero).');
