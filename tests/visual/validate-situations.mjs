#!/usr/bin/env node
/* ============================================================================
   CPM — QUALITY GATE: VALIDAZIONE AUTOMATICA DI TUTTE LE SITUATIONS
   ----------------------------------------------------------------------------
   Comando unico (npm run validate-situations) che, per ogni Situation:
     • la forza in modo DETERMINISTICO (seeded RNG + __CPM_RESEED(gi) + dt=0 freeze)
     • cattura stato (__CPM_STATE), firma deterministica e screenshot canvas (artifact)
     • esegue i CHECK MODULARI (checks/*.mjs): stato iniziale, orientamento/senso
       tattico, visivo, golden (firma) + globali: determinismo, coerenza dati (suite analitica)
   Produce report HTML+JSON e ritorna exit code != 0 se un solo check fallisce.

   Flag:  --update-golden   (ri)genera la baseline (golden-sigs.json)
          --shots           salva screenshot di TUTTE le Situations (default: campione+fallite)
   Estendibile: aggiungere un file in checks/ e importarlo nell'array.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, openMatch, forceSituation, freeze, unfreeze, canvasShot, samplePostHighlight, sampleMotion, sampleBallPath, stateSig, sigStr, sleep, frameState, waitBallSettle, ROOT, installCdnRoutes } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';
import { writeReports } from './report.mjs';
import { collectFailures } from './lib/failure-collector.mjs';
import { appendHistory as appendGateHistory, computeTrend as gateTrend } from './lib/gate-history.mjs';
import { measurePerf, measureLeak } from './lib/perf-monitor.mjs';
import { writeReplayTrace } from './lib/replay-trace.mjs';
import { runAiVision, visionEnabled } from './lib/ai-vision.mjs';
import initialState from './checks/initial-state.mjs';
import orientation from './checks/orientation.mjs';
import visual from './checks/visual.mjs';
import movements from './checks/movements.mjs';
import golden from './checks/golden.mjs';
import finalState from './checks/final-state.mjs';
import postHighlight from './checks/post-highlight.mjs';
import determinism from './checks/determinism.mjs';
import dataCoherence from './checks/data-coherence.mjs';
import timelineCheck from './checks/timeline.mjs';
import motion from './checks/motion.mjs';
import ballMotion from './checks/ball-motion.mjs';
import bgCoherence from './checks/bg-coherence.mjs';
import liveSmoke from './checks/live-smoke.mjs';

const SIT_CHECKS = [initialState, orientation, visual, movements, golden]; // pre-risoluzione
const FINAL_CHECKS = [finalState];                                          // post-risoluzione azione
const GLOBAL_CHECKS = [determinism, postHighlight, dataCoherence, timelineCheck, motion, ballMotion, bgCoherence, liveSmoke]; // global
const SEED = '0x9e3779b9 (mulberry32) + __CPM_RESEED(gi)';
const UPDATE_GOLDEN = process.argv.includes('--update-golden');
const SHOTS_ALL = process.argv.includes('--shots');

const HERE = path.dirname(fileURLToPath(import.meta.url)); // tests/visual (dir dell'orchestratore)
const OUT = path.join(HERE, 'out', 'validate');
const SHOT_DIR = path.join(OUT, 'shots');
const GOLDEN = path.join(HERE, 'golden-sigs.json');

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const gameVersion = (fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').match(/GAME_VERSION="([^"]+)"/) || [])[1] || '?';
  const situations = loadSituations();
  const goldenBase = fs.existsSync(GOLDEN) ? JSON.parse(fs.readFileSync(GOLDEN, 'utf8')) : null;

  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error' && !/BABEL|in-browser Babel/.test(m.text())) consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  const sitResults = []; const sigs = {}; let perf = null; const replayRefs = []; let aiVision = null;
  /* [7.343.0] CRONOMETRO PER FASE — il gate dura ~25 minuti e nessuno sapeva dove finissero: qualunque
     ottimizzazione sarebbe stata a naso. `T('nome')` chiude la fase precedente e apre la nuova; il
     riepilogo finisce a schermo e in run-summary.json (campo `timings`). Costo: due Date.now(). */
  const TIM = {}; let _tPrev = Date.now(), _tName = 'boot';
  const T = (name) => { const n = Date.now(); TIM[_tName] = (TIM[_tName] || 0) + (n - _tPrev); _tPrev = n; _tName = name; };
  const agg = {}; for (const c of [...SIT_CHECKS, ...FINAL_CHECKS, ...GLOBAL_CHECKS]) agg[c.id] = { id: c.id, title: c.title, scope: c.scope, issues: [], warnings: [], info: {} };

  try {
    // GLB OFF nel gate: il gioco usa i personaggi GLB (CH38) di DEFAULT, ma il gate valida la LOGICA
    // deterministica (stato/decisioni/movimento/golden) sul renderer procedurale — veloce e affidabile.
    // (Il gate è comunque gate-blind alla RESA; i 22 skinnati in software-GL sono troppo lenti per il
    // campionamento `motion`.) La resa GLB si valida coi frame flag-ON + collaudo dal vivo.
    await page.addInitScript(() => { window.__CPM_GLB = false; });
    const { total } = await openMatch(page, port);
    console.log(`match pronto · ${total} Situations · gameVersion ${gameVersion}`);

    /* [7.661.0] WARM-UP dichiarato — due rossi da 'avvio freddo' (golden htx 37.3 sul gate 7.660,
       initial-state palla a 53u sul gate 7.661) sono caduti SEMPRE sulla PRIMA forzatura dopo il
       load (gi 0) e MAI sulle ricatture (il check determinism ri-forza gi 0 e combacia con la
       baseline; prova appaiata fuori gate: 12/12 pulite). La prima forzatura paga compile/JIT/
       texture del primo ingresso in scena: una forzatura di riscaldamento SCARTATA prima del giro
       toglie quel tempo dal metro SENZA toccare nessuna banda — i check misurano esattamente
       cio' che misuravano, su uno stato che ha avuto il tempo di essere costruito. */
    await forceSituation(page, 0, { settle: 1200, choose: true });

    T('situations (191 × force+check+shot)');
    for (let gi = 0; gi < total; gi++) {
      const sit = situations[gi] || { text: '?', type: 'off', actions: [] };
      const issues = [], warnings = [];
      const collect = (chk, r) => {
        for (const msg of (r.issues || [])) { issues.push({ check: chk.id, msg }); agg[chk.id].issues.push({ gi, msg }); }
        for (const msg of (r.warnings || [])) { warnings.push({ check: chk.id, msg }); agg[chk.id].warnings.push({ gi, msg }); }
      };

      // 1) setup deterministico al framing interattivo (choose) + cap movimenti live
      const state = await forceSituation(page, gi, { settle: 600, choose: true });
      const moves = await page.evaluate(() => window.__CPM_MOVES);
      const sig = stateSig(state); sigs[gi] = sig;
      for (const chk of SIT_CHECKS) collect(chk, chk.run({ sit, state, sig, moves, goldenBase: goldenBase ? goldenBase[gi] : null }));

      // 2) screenshot deterministico (freeze breve). NIENTE risoluzione qui: i suoi timer
      //    asincroni (auto-advance/chaining) inquinerebbero il setup della Situation successiva
      //    (golden/possesso). La cat 6 gira in una passata dedicata e isolata, più sotto.
      await freeze(page); const buf = await canvasShot(page); await unfreeze(page);

      let shotInitial = null;
      if (SHOTS_ALL || issues.length || warnings.length || gi < 10) { const fn = `sit_${String(gi).padStart(3, '0')}.png`; fs.writeFileSync(path.join(SHOT_DIR, fn), buf); shotInitial = 'shots/' + fn; }
      sitResults.push({ gi, text: sit.text, type: sit.type || 'off', intent: sit.intent || null, hashInitial: sigStr(sig), shotInitial, shotFinal: null, issues, warnings });
      if ((gi + 1) % 40 === 0) console.log(`  …${gi + 1}/${total}`);
    }

    T('determinism');
    // GLOBALE: determinismo — ri-cattura un campione e confronta le firme (esatte)
    const sample = []; for (let gi = 0; gi < situations.length; gi += 12) sample.push(gi);
    const recapture = async (gi) => stateSig(await forceSituation(page, gi, { settle: 550, choose: true }));
    const detRes = await determinism.run({ pass1: sigs, recapture, sampleIndices: sample });
    agg.determinism.issues.push(...detRes.issues.map(msg => ({ gi: null, msg }))); agg.determinism.info = detRes.info;

    T('final-state (risoluzione azione)');
    // CAT 6 — passata dedicata e ISOLATA sullo stato finale (campione): risolve l'azione,
    // cattura l'esito presto (prima dell'auto-advance) e la palla a regime, con buffer tra le iterazioni
    // per evitare il bleed dei timer di risoluzione. FORCE_SIT azzera il chaining → indici stabili.
    const fsSample = []; for (let gi = 0; gi < situations.length; gi += 8) fsSample.push(gi); // ~23 Situations
    const fsSettle = [];
    await page.evaluate(() => window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET()); // LMQP-2: timeline pulita per la passata force+resolve
    for (const gi of fsSample) {
      const sit = situations[gi] || { text: '?', type: 'off', actions: [] };
      await forceSituation(page, gi, { settle: 550, choose: true });
      await page.evaluate(() => window.__CPM_RESOLVE(0));
      await sleep(700); const outcome = await page.evaluate(() => window.__CPM_OUTCOME);
      // stato finale a PALLA FERMA: l'arco di conclusione (es. gol dopo dribbling/build-up) può durare oltre un wait fisso →
      // catturare troppo presto dà un FALSO POSITIVO (palla ancora a metà azione, es. gi=40 @gx=38.6). Poll fino a settle stabile.
      /* [7.343.0] L'attesa e' la stessa (palla ferma, a terra, prima di giudicare lo stato finale) ma il
         campionamento e' leggero: `waitBallSettle` legge SOLO la palla ogni 110 ms e chiede quiete per una
         FINESTRA DI TEMPO. Prima si usava `frameState` (due rAF + stato completo dei 22, ~530 ms a lettura)
         preteso 6 volte DI FILA: misurati 6 item su 10 al limite dei 9 s, 225 s = il 33% dell'intero gate
         speso ad aspettare. Lo stato completo si cattura UNA volta, quando la palla si e' fermata. */
      const _st343 = await waitBallSettle(page, { maxMs: 9000, quietMs: 700, pollMs: 110 });
      fsSettle.push(_st343);
      let fstate = await frameState(page);
      const sr = sitResults[gi];
      for (const chk of FINAL_CHECKS) {
        const r = chk.run({ sit, outcome, finalState: fstate });
        for (const msg of (r.issues || [])) { agg[chk.id].issues.push({ gi, msg }); if (sr) sr.issues.push({ check: chk.id, msg }); }
        for (const msg of (r.warnings || [])) { agg[chk.id].warnings.push({ gi, msg }); if (sr) sr.warnings.push({ check: chk.id, msg }); }
      }
      await sleep(300); // buffer: auto-advance concluso prima della prossima force
    }
    agg['final-state'].info = { sampled: fsSample.length };
    console.log(`final-state: campione ${fsSample.length} Situations risolte`);

    {const _n=fsSettle.length||1,_to=fsSettle.filter(x=>!x.settled).length;
     console.log(`final-state: assestamento palla · media ${Math.round(fsSettle.reduce((a,x)=>a+x.ms,0)/_n)}ms · ${_to}/${_n} al limite`);}
    T('timeline');
    // TIMELINE (LMQP-2) — legge il bus eventi raccolto nella passata force+resolve e valida il backbone narrativo
    try {
      const timeline = await page.evaluate(() => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []));
      const tlRes = timelineCheck.run({ timeline, situations });
      agg['timeline'].issues.push(...tlRes.issues.map(msg => ({ gi: null, msg })));
      agg['timeline'].warnings.push(...tlRes.warnings.map(msg => ({ gi: null, msg })));
      agg['timeline'].info = tlRes.info;
      const _b = tlRes.info.baseline || {}; const _cov = tlRes.info.coverage || {};
      console.log(`timeline: ${tlRes.info.events} eventi · ${tlRes.info.resolved} risolti · ${tlRes.info.paired} coerenti · baseline ${_b.mode}${_b.drift ? ' DRIFT=' + _b.drift : ''} · intents ${(_cov.intents || []).length} types ${(_cov.hlTypes || []).length}`);
    } catch (e) { agg['timeline'].issues.push({ gi: null, msg: 'errore timeline check: ' + (e && e.message || e) }); }

    T('bg-coherence');
    // BG-COHERENCE (B) — lint statico della cronaca di sfondo: la scritta a schermo deve combaciare con l'azione del testo
    try {
      const bg = await page.evaluate(() => (window.__CPM_BG || []));
      const bgRes = bgCoherence.run({ bg });
      agg['bg-coherence'].issues.push(...bgRes.issues.map(msg => ({ gi: null, msg })));
      agg['bg-coherence'].warnings.push(...bgRes.warnings.map(msg => ({ gi: null, msg })));
      agg['bg-coherence'].info = bgRes.info;
      const _ba = bgRes.info.byArc || {};
      console.log(`bg-coherence: ${bgRes.info.entries} voci · ${bgRes.info.withAt} con at · archi ${JSON.stringify(_ba)} · ${bgRes.issues.length} issue`);
    } catch (e) { agg['bg-coherence'].issues.push({ gi: null, msg: 'errore bg-coherence check: ' + (e && e.message || e) }); }

    T('post-highlight');
    // POST-HIGHLIGHT — campiona la traiettoria (camera/palla/giocatori) su un set vario di Situations
    const phIdx = [0, 2, 30, 60, 79, 120].filter(gi => gi < situations.length);
    const D = (a, b) => Math.hypot(a.x - b.x, (a.z != null ? a.z : a.y) - (b.z != null ? b.z : b.y));
    const phSamples = [];
    for (const gi of phIdx) {
      const POLL = 110;
      const s = await samplePostHighlight(page, gi, { windowMs: 1100, pollMs: POLL });
      let maxCam = 0, maxBall = 0, movers = 0, scartati = 0, coppie = 0;
      for (let i = 1; i < s.frames.length; i++) {
        const f0 = s.frames[i - 1], f1 = s.frames[i];
        /* [7.502.0] NON SI GIUDICA SU UNA COPPIA MAL SPAZIATA. `maxCam` e' una DISTANZA fra due campioni:
           se il poll e' stato ritardato (contesa di CPU, GC, headless sotto carico) la stessa camera che
           scorre liscia produce un numero piu' grande, e il check lo chiama «cambio inquadratura brusco».
           E' successo davvero: tre rossi su cinque passate dal 7.500, ogni volta su una SCENA DIVERSA
           (gi79 36,7 · gi0 39,8, soglia 30) e col fingerprint che tornava identico alla baseline appena
           la passata riusciva. Le coppie con intervallo oltre il doppio del nominale si SCARTANO — e si
           contano, perche' una misura che ha buttato via meta' dei campioni deve dirlo. */
        const dt = (f0.t != null && f1.t != null) ? (f1.t - f0.t) : POLL;
        if (dt > POLL * 2.2) { scartati++; continue; }
        coppie++;
        /* [7.504.0] UN SALTO DENTRO LO STACCO NERO E' REGIA, NON UN DIFETTO. gi79 falliva a 36,7-38,4 in
           modo ricorrente: e' lo snap drammatico che il gioco arma APPOSTA sotto `setCutFx` (7.471 — «un
           teletrasporto della camera deve stare dentro uno stacco»). Il censimento del pallone (F1a) ha la
           stessa regola: attribuisce e marca `mask`. Qui: se uno dei due campioni della coppia sta dentro
           un nero vivo (`__CPM_CUTLIVE`), il salto di camera non si giudica. Il salto SCOPERTO resta un
           issue, ed e' l'unico che il giocatore vede davvero. */
        const _mascherata = !!(f0.cut || f1.cut);
        if (f0.cam && f1.cam && !_mascherata) maxCam = Math.max(maxCam, Math.hypot(f1.cam.x - f0.cam.x, f1.cam.y - f0.cam.y, f1.cam.z - f0.cam.z));
        if (f0.ball && f1.ball) maxBall = Math.max(maxBall, D(f0.ball, f1.ball));
        if (f0.players && f1.players) { let mv = 0; for (let p = 0; p < f0.players.length; p++) if (f1.players[p] && Math.hypot(f1.players[p].x - f0.players[p].x, f1.players[p].y - f0.players[p].y) > 0.8) mv++; movers = Math.max(movers, mv); }
      }
      phSamples.push({ gi, durMs: s.durMs, maxCam, maxBall, movers, scartati, coppie });
      try { replayRefs.push(writeReplayTrace(OUT, s)); } catch (_e) { /* trace best-effort, non blocca il gate */ }
      await sleep(300);
    }
    const phRes = postHighlight.run({ samples: phSamples });
    agg['post-highlight'].issues.push(...phRes.issues.map(msg => ({ gi: null, msg })));
    agg['post-highlight'].warnings.push(...phRes.warnings.map(msg => ({ gi: null, msg })));
    agg['post-highlight'].info = phRes.info;
    console.log(`post-highlight: campione ${phSamples.length} Situations`);

    T('motion');
    // MOTION (B2) — off-ball liveness (No Dead Players, AC-081-090): campiona le posizioni MESH durante
    // la fase ATTIVA (hl_choose, off-ball AI in moto) su un set vario di Situations.
    /* [7.550.0] DODICI campioni invece di sei: la regola di giudizio ora e' una QUOTA, e una quota su sei
       campioni non significa niente. Il costo e' ~14s in piu' sul gate. */
    /* [7.596.0 — IL GUARDIANO SI ROMPEVA DA SOLO, e la prova e' incontrovertibile] `motion` e' andato in
       rosso tre volte in una giornata, e l'ultima su codice di gioco BYTE-IDENTICO a un run verde: il
       commit conteneva solo una sonda nuova, che il rituale non esegue nemmeno. Non e' quindi una
       regressione del gioco, e' lo strumento.
       L'aritmetica lo spiega. Il verdetto e' una QUOTA su otto scene con soglia al 34%: due scene valgono
       25%, tre valgono 37,5% — fra i due valori non c'e' niente, quindi la soglia significa in realta'
       «al massimo due scene su otto», e una sola scena al limite ribalta l'esito. E le scene al limite ci
       sono: la distanza minima misurata su gi96 vale 26,2 m in un run e 29,7 in un altro, contro una
       soglia di 24. Con dodici campioni il gate ballava di 12,5 punti per una scena.
       LA RIPARAZIONE NON ALLENTA NULLA: stessa soglia, stesso criterio, PIU' CAMPIONI. Ventiquattro
       situations invece di dodici portano la granularita' della quota da 12,5 a ~4 punti, e una scena al
       limite non decide piu' da sola. Costa una decina di secondi sul gate.
       ⚠️ E' la terza volta oggi che un conteggio con SOGLIA su pochi campioni mi inganna: aveva gia'
       inventato un miglioramento nel 7.591 e un difetto nel 7.594. La lezione, scritta anche li': una
       quota su pochi campioni non e' una misura, e' un'estrazione. */
    const motIdx = [0, 2, 8, 14, 20, 26, 30, 36, 44, 52, 60, 66, 71, 79, 84, 90, 96, 104, 110, 116, 120, 128, 134, 140].filter(gi => gi < situations.length);
    const motSamples = [];
    for (const gi of motIdx) { motSamples.push(await sampleMotion(page, gi, { settle: 500, pollMs: 100, windowMs: 1900 })); await sleep(150); }// finestra 1000→1900: il movimento è stato rallentato ~45% (5.47.9→5.47.16, cap 20→11 u/s) → serve una finestra di osservazione più ampia per misurare la liveness in modo stabile su software-GL (~5fps), specie sulle situation quasi-statiche
    const motRes = motion.run({ samples: motSamples });
    agg['motion'].issues.push(...motRes.issues.map(msg => ({ gi: null, msg })));
    agg['motion'].warnings.push(...motRes.warnings.map(msg => ({ gi: null, msg })));
    agg['motion'].info = motRes.info;
    console.log(`motion: campione ${motSamples.length} · alive ${motSamples.map(s => s.alive + '/' + s.players).join(' ')}`);

    T('ball-motion');
    // BALL-MOTION (#41) — progressione/no-boomerang sulle azioni offensive: campiona la x della palla.
    const ballIdx = [0, 8, 17, 30, 43, 60, 63, 72, 88, 120, 132, 153, 163].filter(gi => gi < situations.length);
    const ballSamples = [];
    for (const gi of ballIdx) { ballSamples.push(await sampleBallPath(page, gi, { settle: 450, pollMs: 90, windowMs: 1100 })); await sleep(150); }
    const bmRes = ballMotion.run({ samples: ballSamples });
    agg['ball-motion'].issues.push(...bmRes.issues.map(msg => ({ gi: null, msg })));
    agg['ball-motion'].warnings.push(...bmRes.warnings.map(msg => ({ gi: null, msg })));
    agg['ball-motion'].info = bmRes.info;
    console.log(`ball-motion: ${bmRes.info.checked} azioni offensive · minBackStep ${Math.min(...ballSamples.map(s => s.maxBackStep))}`);

    T('perf-monitor');
    // LMQP-8: PERFORMANCE MONITOR (warn-only) — render-loop attivo su una situation animata
    try {
      await forceSituation(page, 0, { settle: 500, choose: true });
      perf = await measurePerf(page, { frameWindowMs: 1000 });
      const leak = await measureLeak(page).catch(() => null); // [BL-12] warn-only: slope heap + canvas zombie
      if (leak) { perf.leak = leak; perf.warnings.push(...leak.warnings); }
      console.log(`perf: ${perf.frames.fps}fps (avg ${perf.frames.avgMs}ms · p95 ${perf.frames.p95Ms}ms)` + (perf.heap ? ` · heap ${perf.heap.usedMB}MB` : '') + (perf.nav && perf.nav.loadMs != null ? ` · load ${perf.nav.loadMs}ms` : '') + (leak ? ` · leak-slope ${leak.slopeMBs}MB/s · canvas ${leak.canvases}` : ''));
    } catch (e) { perf = { error: String(e && e.message || e), warnings: [] }; console.log('perf: misura non disponibile (' + perf.error + ')'); }

    T('live-smoke');
    // LIVE-SMOKE (F1 · ARC-1a, 5.76.0) — partita REALE su pagina pulita: nessuna situation forzata,
    // clock vero, coda reattiva armata via hook → esercita il path del tick `playing` (dove viveva BLK-1).
    try {
      const sPage = await browser.newPage({ viewport: { width: 900, height: 900 } });
      await installCdnRoutes(sPage);
      const sErrs = []; sPage.on('pageerror', e => sErrs.push(e.message));
      await sPage.addInitScript(() => { window.__CPM_GLB = false; });
      await openMatch(sPage, port, { skipLoadAll: true }); // provino → phase "playing" col clock reale
      const grab = () => sPage.evaluate(() => ({ p: window.__CPM_PROBE ? window.__CPM_PROBE() : null, n: window.__CPM_NUMHL ? window.__CPM_NUMHL() : null }));
      const g0 = await grab();
      await sPage.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
      await sleep(6000);
      const g1 = await grab();
      const lsRes = liveSmoke.run({ p0: g0.p, p1: g1.p, numHL0: g0.n, numHL1: g1.n, errors: sErrs });
      agg['live-smoke'].issues.push(...lsRes.issues.map(msg => ({ gi: null, msg })));
      agg['live-smoke'].warnings.push(...lsRes.warnings.map(msg => ({ gi: null, msg })));
      agg['live-smoke'].info = lsRes.info;
      console.log(`live-smoke: clock ${lsRes.info.clockFrom}'→${lsRes.info.clockTo}' · numHL ${lsRes.info.numHL0}→${lsRes.info.numHL1} · fase ${lsRes.info.phase} · ${lsRes.info.errors} pageerror`);
      await sPage.close();
    } catch (e) { agg['live-smoke'].issues.push({ gi: null, msg: 'errore live-smoke: ' + (e && e.message || e) }); }

    if (consoleErrors.length) agg.visual.issues.push(...consoleErrors.slice(0, 10).map(msg => ({ gi: null, msg: 'console error: ' + msg })));
  } catch (e) {
    agg.visual.issues.push({ gi: null, msg: 'FATAL: ' + (e && e.stack || e) });
  } finally {
    await browser.close(); srv.close();
  }

  // GLOBALE: coerenza dati (suite analitica) — child process, fuori dal browser
  try { const dc = await dataCoherence.run(); agg['data-coherence'].issues.push(...dc.issues.map(msg => ({ gi: null, msg }))); agg['data-coherence'].info = dc.info; }
  catch (e) { agg['data-coherence'].issues.push({ gi: null, msg: 'errore suite analitica: ' + e.message }); }

  // golden baseline: genera/aggiorna se richiesto o assente
  let goldenNote = '';
  if (UPDATE_GOLDEN || !goldenBase) {
    fs.writeFileSync(GOLDEN, JSON.stringify(sigs, null, 0));
    goldenNote = goldenBase ? 'golden AGGIORNATA' : 'golden CREATA (prima esecuzione)';
    agg.golden.issues = []; // alla generazione non c'è regressione
    for (const s of sitResults) s.issues = s.issues.filter(i => i.check !== 'golden');
  }

  // AI VISION REVIEW (secondo livello, NON blocca la CI) — attivo solo con CPM_VISION_API_KEY
  try {
    const aiSamples = sitResults.filter(s => s.shotInitial).slice(0, 6).map(s => ({ gi: s.gi, shot: s.shotInitial, text: s.text, intent: s.intent }));
    aiVision = await runAiVision(OUT, aiSamples, { max: 6 });
    if (aiVision.skipped) console.log(`ai-vision: skip (${aiVision.reason})`);
    else console.log(`ai-vision: ${aiVision.count} frame · verdicts ${JSON.stringify(aiVision.verdicts)} · readability ${aiVision.avg.readability}`);
  } catch (e) { aiVision = { skipped: true, reason: 'errore: ' + (e && e.message || e) }; console.log('ai-vision: ' + aiVision.reason); }

  const categories = [...SIT_CHECKS, ...FINAL_CHECKS, ...GLOBAL_CHECKS].map(c => {
    const a = agg[c.id];
    const fmt = i => (i.gi != null ? `#${i.gi} ` : '') + i.msg;
    return { id: c.id, title: c.title, scope: c.scope, pass: a.issues.length === 0, issues: a.issues.map(fmt), warnings: a.warnings.map(fmt), info: a.info };
  });

  T('report');
  {const tot=Object.values(TIM).reduce((a,b)=>a+b,0)||1;
   console.log('\n⏱  dove vanno i minuti del gate:');
   Object.entries(TIM).sort((a,b)=>b[1]-a[1]).filter(([,ms])=>ms>500)
     .forEach(([k,ms])=>console.log(`   ${String(Math.round(ms/1000)).padStart(4)}s  ${String(Math.round(ms*100/tot)).padStart(3)}%  ${k}`));
   console.log(`   ${String(Math.round(tot/1000)).padStart(4)}s  100%  TOTALE\n`);}
  const meta = { generatedAt: new Date().toISOString(), timings: TIM, gameVersion, seed: SEED, total: sitResults.length, maxJitterBits: agg.determinism.info.diverged === 0 ? 0 : `${agg.determinism.info.diverged} divergenze`, goldenNote, performance: perf, replay: replayRefs, aiVision };
  // LMQP-7: pacchetto di fallimento compatto/machine-readable (CI + Dashboard + regression history)
  const runSummary = collectFailures(OUT, { meta, categories, situations: sitResults });
  // BL-20: REGRESSION HISTORY — accumula il fingerprint del gate build-to-build (deriva/regressione tracciata)
  const gateHist = appendGateHistory(OUT, runSummary);
  const gTrend = gateTrend(gateHist);
  // LMQP-9: il report HTML riceve il summary normalizzato per la Dashboard
  const { ok, htmlPath, failCats } = writeReports(OUT, { meta, categories, situations: sitResults, runSummary, gateTrend: gTrend });

  console.log('\n=== QUALITY GATE — VALIDAZIONE SITUATIONS ===');
  console.log(`gameVersion ${gameVersion} · ${sitResults.length} Situations`);
  /* [7.213.0] guardia anti-«verde a vuoto»: se la passata principale muore (es. timeout di caricamento) i check
     per-situation non girano su NULLA e stampano tutti ✅ — a colpo d'occhio sembra un gate passato. Va detto forte. */
  if (!sitResults.length) console.log('  ⚠️  NESSUNA SITUATION ESAMINATA — i check per-situation qui sopra sono VUOTI, non verdi (vedi il FATAL)');
  for (const c of categories) console.log(`  ${c.pass ? '✅' : '❌'} ${c.id.padEnd(16)} ${c.pass ? 'OK' : c.issues.length + ' issue'}${c.warnings.length ? ' · ' + c.warnings.length + ' warn' : ''}`);
  if (goldenNote) console.log(`  📸 ${goldenNote}`);
  console.log(`report HTML → ${path.relative(ROOT, htmlPath)}`);
  console.log(`run-summary → ${path.relative(ROOT, path.join(OUT, 'run-summary.json'))} · fingerprint ${runSummary.fingerprint} · ${runSummary.counts.failures} failure`);
  if (gTrend) {
    const s = gTrend.regressed ? '🔴 REGRESSIONE (pulita → rotta)' : gTrend.recovered ? '🟢 riparata (rotta → pulita)' : gTrend.fpChanged ? `↔ fingerprint cambiato (Δfailure ${gTrend.failDelta > 0 ? '+' : ''}${gTrend.failDelta})` : `stabile (streak ${gTrend.cleanStreak} run pulite)`;
    console.log(`gate-history → ${gTrend.runs} run · ${s}`);
  }
  console.log(ok ? '\n✅ PASS' : `\n❌ FAIL — ${failCats.map(c => c.id).join(', ')}`);
  process.exit(ok ? 0 : 1);
})();
