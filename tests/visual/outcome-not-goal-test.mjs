#!/usr/bin/env node
/* GUARDIANO SPECULARE — «UN ESITO CHE NON E' GOL NON DEVE FINIRE IN RETE».

   Il `goal-postarc` protegge una meta' della famiglia «esito dichiarato != 3D»: il gol dichiarato che
   non arriva in porta. Il taccuino del PO ha appena portato l'ALTRA META', e con la misura gia' fatta
   dal detector di bordo:
     · #150 «l'esito dichiarato e' CHANCE ma la palla e' finita IN RETE»
     · #31  «l'esito dichiarato e' RECOVERY ma la palla e' finita IN RETE»
     · #33  «l'esito dichiarato e' GOAL_AGAINST ma la palla non e' mai arrivata in porta (si e' fermata
             a 18,6 unita') — arco/post-arco vivi per 37 fotogrammi»
   Le prime due sono un gol MOSTRATO che non e' stato dichiarato; la terza e' il gol subito che non si
   vede. Sono la stessa rottura del patto fra ESITO e SCENA, presa dai due lati opposti.

   COSA PRETENDE, per ogni azione risolta sul flusso VERO:
     (a) esito che NON e' un gol (chance · recovery · intercept · miss · nothing) ⇒ il pallone non
         raggiunge MAI la linea di porta avversaria (x >= 46, la costante del gioco) e nessun post-arco
         d'ingresso in rete nasce;
     (b) esito `goal_against` ⇒ il pallone raggiunge la PROPRIA porta (x <= -46): un gol subito che si
         ferma a meta' campo e' lo stesso difetto, girato.

   Stesse trappole del gemello, e sono qui apposta: `__CPM_CINE=1` obbligatorio (senza, si misura un
   percorso che il giocatore non vede); l'esito si legge SUBITO dopo la risoluzione (`__CPM_OUTCOME` e'
   uno stato React e torna null a scena chiusa); si aspetta l'USCITA da `hl_result`, mai un tempo fisso.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node outcome-not-goal-test.mjs [--verbose]           */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const TARGET = +(process.env.CPM_N || 14);            /* azioni non-gol da raccogliere */
/* [7.478.0 — IL CRITERIO ERA SBAGLIATO DUE VOLTE, e va scritto prima del resto]
   (1) LA X. `AWAY_GOAL_X`=46 e' la rete interna, NON la linea di porta: il piano dei pali sta a
       `_GLX`=48,6 (r.~11269). Con 46 il guardiano bocciava palloni che la linea non l'avevano nemmeno
       raggiunta — gi50 si ferma a 47,0.
   (2) I PALI. «Finita IN RETE» e' una porta, non una x: un cross che esce sul fondo LARGO attraversa la
       linea ed e' calcio normale. Misurato sulle tre scene rosse: i campioni oltre la linea hanno z da
       -18,4 a +32,3 e i pali stanno a +-3,35 (la costante con cui il gioco stesso clampa l'ingresso in
       rete, r.~12985) — ZERO palloni dentro la porta. Il rosso era del criterio, non del gioco.
   Cio' che la misura ha trovato DAVVERO e' un'altra cosa, e ora e' la seconda pretesa di questo file:
   la palla LOGICA usciva dal campo (103,5 su 0..100) e la mesh la seguiva a 56,6, cioe' dentro i
   cartelloni (53,2). Il 7.478 mette il fondo campo; `CPM_NO478D=1` lo toglie (prova del rosso). */
const LINEA = 48.6, LINEA_MIA = -48.6;                /* _GLX: piano dei pali, non la rete interna */
const PALI = 3.35;                                    /* mezza porta: oltre la linea DENTRO i pali = rete */
const FUORI = 50;                                     /* mezzo campo in unita' Three: oltre = fuori dal rettangolo */
const inRete_ = (pa, mia) => pa.some(r => (mia ? r.bx <= LINEA_MIA : r.bx >= LINEA) && Math.abs(r.bz) <= PALI);
const fuoriCampo = pa => pa.filter(r => Math.abs(r.bx) > FUORI);
const RETE = new Set(['in_net', 'in_net_high', 'cross_goal']);
const NONGOL = new Set(['chance', 'recovery', 'intercept', 'miss', 'nothing', 'save']);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
/* `CPM_REALWAIT=1` apre l'attesa che il gioco VERO concede al gol (r.~20346, spenta sotto test):
   serve per non giudicare una finestra d'esito che il giocatore non ha mai. */
await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; if (o.n477) window.__CPM_NO477 = 1; if (o.rw) window.__CPM_REALWAIT = 1; if (o.no) window.__CPM_NO460 = 1; if (o.n1) window.__CPM_NO461 = 1; if (o.n478d) window.__CPM_NO478D = 1;/* [7.478.0] toglie il fondo campo: prova del rosso del clamp */ },
  { rw: process.env.CPM_REALWAIT ? 1 : 0, no: process.env.CPM_NO460 ? 1 : 0, n1: process.env.CPM_NO461 ? 1 : 0, n477: process.env.CPM_NO477 ? 1 : 0, n478d: process.env.CPM_NO478D ? 1 : 0 });
/* ⚠️ DUE PERCORSI, E IL PERCHE'. Il flusso VERO (default) e' l'unico che vede la classe «props del
   commit sbagliato», ma il suo rendimento e' ballerino: due passate hanno dato 3 righe e poi ZERO —
   un guardiano che a volte non guarda niente non e' un guardiano. Con `CPM_FORCE=1` si forza scena e
   azione: molto piu' veloce e deterministico, e per QUESTA domanda e' adeguato — «l'arco punta la
   porta anche quando l'esito non e' un gol?» e' una relazione fra esito e traiettoria, non una
   questione di staging. Il percorso vero resta il default, e resta quello che decide. */
if (process.env.CPM_FORCE) {
  await openMatch(page, port);
  await sleep(700);
  /* `CPM_ONLY=50,55,80` restringe il campione a scene NOMINATE: serve per la domanda «e' il gioco o la
     sonda?», che si risponde solo confrontando la stessa scena in SEQUENZA e da SOLA. */
  const SIT = process.env.CPM_ONLY
    ? process.env.CPM_ONLY.split(',').map(v => +v.trim()).filter(v => v >= 0)
    : (await page.evaluate(() => { const o = []; for (let i = 0; i < SITUATIONS.length; i++) o.push(i); return o; })).filter((_, i) => i % 5 === 0).slice(0, 40);
  const out = [];
  for (const gi of SIT) {
    /* ⚠️ ISOLAMENTO FRA SCENE. Senza, la scena nuova nasce mentre l'arco della precedente e' ancora in
       volo e il testimone raccoglie code altrui: misurato, gi50 risultava con la palla a x 47 mentre
       la stessa scena, provata da sola, si ferma a 30,9 con bersaglio d'arco 36,1. Era la sonda, non
       il gioco — e senza questo controllo avrei "corretto" un difetto che non esisteva. */
    await page.waitForFunction(() => { try { const a = window.__CPM_ARC; return !a || (!a.pa && !(a.arc && a.arc.length)); } catch (e) { return true; } }, { timeout: 6000 }).catch(() => {});
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
    if (!ok) continue;
    await sleep(600);
    const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
    const kNo = acts ? (acts.find(a => !/goal/i.test(String(a.rew || ''))) || {}).i : null;
    if (kNo == null) continue;
    await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_PA457 = []; window.__CPM_FORCE_OUTCOME = 'success'; });
    try { await page.evaluate(k => window.__CPM_RESOLVE(k), kNo); } catch (e) { continue; }
    let key = null;
    for (let i = 0; i < 25 && key == null; i++) { key = await page.evaluate(() => { const o = window.__CPM_OUTCOME; return o ? (o.outKey || o.key || null) : null; }).catch(() => null); if (key == null) await sleep(80); }
    await sleep(2600);
    const pa = await page.evaluate(() => (window.__CPM_PA457 || []).slice());
    if (!pa.length || !key) continue;
    if (!NONGOL.has(String(key)) && String(key) !== 'goal_against') continue;
    out.push({ gi, key, post: [...new Set(pa.map(r => r.pt).filter(Boolean))].join('>') || null,
      bxMax: Math.max(...pa.map(r => r.bx)), bxMin: Math.min(...pa.map(r => r.bx)), ht: pa[0].ht,
      rete: inRete_(pa, false), reteMia: inRete_(pa, true), fuori: fuoriCampo(pa).length,
      fuoriMax: fuoriCampo(pa).length ? Math.max(...fuoriCampo(pa).map(r => Math.abs(r.bx))) : 0 });
  }
  await b.close(); srv.close();
  if (!out.length) { console.log('❌ percorso forzato: nessuna azione non-gol raccolta — cieco'); process.exit(2); }
  /* ⚠️ IL GIUDICE E' IL PALLONE, non il nome del post-arco. La prima stesura bocciava qualunque scena in
     cui nascesse un post-arco d'ingresso in rete: ma dopo il rimedio gi15 nasce con `cross_goal` e la
     palla si ferma a 40,9 — non entra, e il giocatore vede una palla che non entra. La nota del PO dice
     «la palla e' finita IN RETE»: la posizione della palla e' il criterio, il tipo di post-arco resta
     stampato come contesto (e segnalato come sospetto), non come condanna. */
  const male = out.filter(r => (NONGOL.has(r.key) && r.rete) || (r.key === 'goal_against' && !r.reteMia));
  const usciti = out.filter(r => r.fuori > 0);
  const sospetti = out.filter(r => NONGOL.has(r.key) && !r.rete && r.post && r.post.split('>').some(p => RETE.has(p)));
  console.log(`\n=== ${out.length} azioni NON da gol (percorso FORZATO) ===`);
  for (const r of out) console.log(`  ${male.includes(r) || r.fuori ? '❌' : '✅'} gi${String(r.gi).padStart(3)} ${String(r.key).padEnd(13)} ${String(r.ht || '').padEnd(11)} · palla da x ${r.bxMin.toFixed(1)} a ${r.bxMax.toFixed(1)} · ${r.rete ? 'DENTRO I PALI' : 'mai fra i pali'}${r.fuori ? ` · FUORI CAMPO ${r.fuoriMax.toFixed(1)}` : ''} · post-arco ${r.post || '—'}`);
  if (sospetti.length) console.log(`\n⚠️  ${sospetti.length} scene nascono con un post-arco d'ingresso in rete pur non essendo gol, ma la palla NON entra: ${sospetti.map(r => 'gi' + r.gi + ' (' + r.post + ', max x ' + r.bxMax.toFixed(1) + ')').join(' · ')}`);
  if (usciti.length) console.log(`\n❌ ${usciti.length} scene con il pallone FUORI DAL RETTANGOLO (la piu' lontana a x ${Math.max(...usciti.map(r => r.fuoriMax)).toFixed(1)}, il campo finisce a ${FUORI}): ${usciti.map(r => 'gi' + r.gi).join(' · ')}`);
  if (male.length) { console.log(`\n❌ ${male.length}/${out.length} esiti in disaccordo col campo — la palla arriva dove l'esito dice di no.`); process.exit(1); }
  if (usciti.length) process.exit(1);
  console.log('\n✅ PASS (percorso forzato) — nessun esito non-gol finisce in rete, nessun pallone fuori dal rettangolo');
  process.exit(0);
}
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const righe = [];
let secchi = 0, partite = 1;
/* il rendimento e' basso (molte scene non hanno un'azione da GOL): serve un budget di giri largo,
   altrimenti il guardiano estrae 2-3 gol e una classe che compare 1 volta su 5 non entra nel
   campione — cioe' un verde che non ha guardato abbastanza. */
for (let round = 0; round < TARGET * 30 && righe.length < TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) {
    /* UNA PARTITA DA SOLA RENDE 1-3 GOL e poi finisce: il campione restava troppo piccolo perche' una
       classe che compare a intermittenza ci entrasse, e un guardiano che non riesce a virare rosso su
       richiesta non e' un guardiano. Quando la partita non torna piu' in `playing` se ne apre un'altra. */
    if (++secchi >= 12) { secchi = 0; partite++; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } }
    else await sleep(700);
    continue;
  }
  secchi = 0;
  await page.evaluate(() => { window.__CPM_PA457 = []; window.__CPM_ARCEND457 = []; window.__CPM_ARCFIRE457 = []; window.__CPM_ARCORPHAN457 = []; window.__CPM_ARCCALL457 = []; window.__CPM_WAIT461 = []; window.__CPM_CONT461 = []; });
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const gotChoose = await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; }
  }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!gotChoose) { await sleep(600); continue; }

  /* si sceglie un'azione il cui premio NON e' un gol: e' li' che vive il difetto del PO */
  const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
  const kNo = acts ? (acts.find(a => !/goal/i.test(String(a.rew || ''))) || {}).i : null;
  if (kNo == null) {
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
    await sleep(1200); await tornaAPlaying(); continue;
  }
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k), kNo); } catch (e) { continue; }
  /* l'ESITO si cattura SUBITO e non a fine finestra: `__CPM_OUTCOME` e' lo state React `outcome`,
     e quando la scena si chiude torna null — leggerlo dopo l'attesa faceva sparire i gol appena
     misurati (prima stesura: 3 gol rotti nella sonda gemella, 0 righe qui). */
  let key = null;
  for (let i = 0; i < 40 && key == null; i++) {
    key = await page.evaluate(() => { const o = window.__CPM_OUTCOME; return o ? (o.outKey || o.key || null) : null; }).catch(() => null);
    if (key == null) await sleep(100);
  }
  /* ⚠️ TRAPPOLA PAGATA: la prima stesura aspettava 3,6s FISSI e poi fotografava. Dal 7.461 la scena dura
     quanto le serve, quindi quel `sleep` misurava LA PROPRIA finestra di osservazione e non quella del
     gioco — «finestra d'esito 3,46s» era il mio cronometro, e i gol dichiarati rotti erano scene ancora
     VIVE che nessuno aveva chiuso (`chiCHIUDE: nessun handleContinue registrato`, `uscita: mai uscita da
     hl_result`). Si aspetta che la scena finisca DAVVERO. */
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
  await sleep(300);

  const d = await page.evaluate(() => ({
    pa: (window.__CPM_PA457 || []).slice(), out: window.__CPM_OUTCOME || null,
    ae: (window.__CPM_ARCEND457 || []).slice(), af: (window.__CPM_ARCFIRE457 || []).slice(),
    ao: (window.__CPM_ARCORPHAN457 || []).slice(), ac: (window.__CPM_ARCCALL457 || []).slice(), wt: (window.__CPM_WAIT461 || []).slice(), ct: (window.__CPM_CONT461 || []).slice()
  }));
  if (!d.pa.length || !key) { await tornaAPlaying(); continue; }
  if (!NONGOL.has(String(key)) && String(key) !== 'goal_against') { await tornaAPlaying(); continue; }

  const post = [...new Set(d.pa.map(r => r.pt).filter(Boolean))].join('>') || null;
  const bxMax = Math.max(...d.pa.map(r => r.bx));
  const bxMin = Math.min(...d.pa.map(r => r.bx));
  righe.push({ key, post, bxMax, bxMin, ht: d.pa[0].ht, rew: d.pa[0].rew,
    rete: inRete_(d.pa, false), reteMia: inRete_(d.pa, true),
    fuori: fuoriCampo(d.pa).length, fuoriMax: fuoriCampo(d.pa).length ? Math.max(...fuoriCampo(d.pa).map(r => Math.abs(r.bx))) : 0 });
  await tornaAPlaying();
}

async function tornaAPlaying() {
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; } catch (e) { return false; } }, { timeout: 25000 }).catch(() => {});
}

await b.close(); srv.close();
if (!righe.length) { console.log('❌ nessuna azione non-gol raccolta: il guardiano e\' cieco, non verde'); process.exit(2); }
const inRete = righe.filter(r => NONGOL.has(r.key) && r.rete);
const subitiCorti = righe.filter(r => r.key === 'goal_against' && !r.reteMia);
const usciti = righe.filter(r => r.fuori > 0);
console.log(`\n=== ${righe.length} azioni NON da gol, sul flusso vero ===`);
for (const r of righe) {
  const male = (NONGOL.has(r.key) && r.rete) || (r.key === 'goal_against' && !r.reteMia) || r.fuori > 0;
  console.log(`  ${male ? '❌' : '✅'} ${String(r.key).padEnd(13)} ${String(r.ht || '').padEnd(11)} · palla da x ${r.bxMin.toFixed(1)} a ${r.bxMax.toFixed(1)} · post-arco ${r.post || '—'}`);
}
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (inRete.length || subitiCorti.length || usciti.length) {
  if (inRete.length) console.log(`\n❌ ${inRete.length} esiti NON da gol con la palla DENTRO I PALI oltre la linea.`);
  if (usciti.length) console.log(`❌ ${usciti.length} scene con il pallone FUORI DAL RETTANGOLO (la piu' lontana a x ${Math.max(...usciti.map(r => r.fuoriMax)).toFixed(1)}, il campo finisce a ${FUORI}).`);
  if (subitiCorti.length) console.log(`❌ ${subitiCorti.length} gol SUBITI in cui la palla non arriva alla propria porta (la piu' corta si ferma a x ${Math.max(...subitiCorti.map(r => r.bxMin)).toFixed(1)}).`);
  process.exit(1);
}
console.log('\n✅ PASS — cio' + String.fromCharCode(39) + ' che il gioco dichiara e cio' + String.fromCharCode(39) + ' che il campo mostra dicono la stessa cosa');
