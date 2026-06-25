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
import { startServer, launchBrowser, openMatch, forceSituation, freeze, unfreeze, canvasShot, samplePostHighlight, stateSig, sigStr, sleep, ROOT, installCdnRoutes } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';
import { writeReports } from './report.mjs';
import initialState from './checks/initial-state.mjs';
import orientation from './checks/orientation.mjs';
import visual from './checks/visual.mjs';
import movements from './checks/movements.mjs';
import golden from './checks/golden.mjs';
import finalState from './checks/final-state.mjs';
import postHighlight from './checks/post-highlight.mjs';
import determinism from './checks/determinism.mjs';
import dataCoherence from './checks/data-coherence.mjs';

const SIT_CHECKS = [initialState, orientation, visual, movements, golden]; // pre-risoluzione
const FINAL_CHECKS = [finalState];                                          // post-risoluzione azione
const GLOBAL_CHECKS = [determinism, postHighlight, dataCoherence];          // global
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

  const sitResults = []; const sigs = {};
  const agg = {}; for (const c of [...SIT_CHECKS, ...FINAL_CHECKS, ...GLOBAL_CHECKS]) agg[c.id] = { id: c.id, title: c.title, scope: c.scope, issues: [], warnings: [], info: {} };

  try {
    const { total } = await openMatch(page, port);
    console.log(`match pronto · ${total} Situations · gameVersion ${gameVersion}`);

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
      sitResults.push({ gi, text: sit.text, type: sit.type || 'off', hashInitial: sigStr(sig), shotInitial, shotFinal: null, issues, warnings });
      if ((gi + 1) % 40 === 0) console.log(`  …${gi + 1}/${total}`);
    }

    // GLOBALE: determinismo — ri-cattura un campione e confronta le firme (esatte)
    const sample = []; for (let gi = 0; gi < situations.length; gi += 12) sample.push(gi);
    const recapture = async (gi) => stateSig(await forceSituation(page, gi, { settle: 550, choose: true }));
    const detRes = await determinism.run({ pass1: sigs, recapture, sampleIndices: sample });
    agg.determinism.issues.push(...detRes.issues.map(msg => ({ gi: null, msg }))); agg.determinism.info = detRes.info;

    // CAT 6 — passata dedicata e ISOLATA sullo stato finale (campione): risolve l'azione,
    // cattura l'esito presto (prima dell'auto-advance) e la palla a regime, con buffer tra le iterazioni
    // per evitare il bleed dei timer di risoluzione. FORCE_SIT azzera il chaining → indici stabili.
    const fsSample = []; for (let gi = 0; gi < situations.length; gi += 8) fsSample.push(gi); // ~23 Situations
    for (const gi of fsSample) {
      const sit = situations[gi] || { text: '?', type: 'off', actions: [] };
      await forceSituation(page, gi, { settle: 550, choose: true });
      await page.evaluate(() => window.__CPM_RESOLVE(0));
      await sleep(700); const outcome = await page.evaluate(() => window.__CPM_OUTCOME);
      await sleep(750); const fstate = await page.evaluate(() => window.__CPM_STATE());
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

    // POST-HIGHLIGHT — campiona la traiettoria (camera/palla/giocatori) su un set vario di Situations
    const phIdx = [0, 2, 30, 60, 79, 120].filter(gi => gi < situations.length);
    const D = (a, b) => Math.hypot(a.x - b.x, (a.z != null ? a.z : a.y) - (b.z != null ? b.z : b.y));
    const phSamples = [];
    for (const gi of phIdx) {
      const s = await samplePostHighlight(page, gi, { windowMs: 1100, pollMs: 110 });
      let maxCam = 0, maxBall = 0, movers = 0;
      for (let i = 1; i < s.frames.length; i++) {
        const f0 = s.frames[i - 1], f1 = s.frames[i];
        if (f0.cam && f1.cam) maxCam = Math.max(maxCam, Math.hypot(f1.cam.x - f0.cam.x, f1.cam.y - f0.cam.y, f1.cam.z - f0.cam.z));
        if (f0.ball && f1.ball) maxBall = Math.max(maxBall, D(f0.ball, f1.ball));
        if (f0.players && f1.players) { let mv = 0; for (let p = 0; p < f0.players.length; p++) if (f1.players[p] && Math.hypot(f1.players[p].x - f0.players[p].x, f1.players[p].y - f0.players[p].y) > 0.8) mv++; movers = Math.max(movers, mv); }
      }
      phSamples.push({ gi, durMs: s.durMs, maxCam, maxBall, movers });
      await sleep(300);
    }
    const phRes = postHighlight.run({ samples: phSamples });
    agg['post-highlight'].issues.push(...phRes.issues.map(msg => ({ gi: null, msg })));
    agg['post-highlight'].warnings.push(...phRes.warnings.map(msg => ({ gi: null, msg })));
    agg['post-highlight'].info = phRes.info;
    console.log(`post-highlight: campione ${phSamples.length} Situations`);

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

  const categories = [...SIT_CHECKS, ...FINAL_CHECKS, ...GLOBAL_CHECKS].map(c => {
    const a = agg[c.id];
    const fmt = i => (i.gi != null ? `#${i.gi} ` : '') + i.msg;
    return { id: c.id, title: c.title, scope: c.scope, pass: a.issues.length === 0, issues: a.issues.map(fmt), warnings: a.warnings.map(fmt), info: a.info };
  });

  const meta = { generatedAt: new Date().toISOString(), gameVersion, seed: SEED, total: sitResults.length, maxJitterBits: agg.determinism.info.diverged === 0 ? 0 : `${agg.determinism.info.diverged} divergenze`, goldenNote };
  const { ok, htmlPath, failCats } = writeReports(OUT, { meta, categories, situations: sitResults });

  console.log('\n=== QUALITY GATE — VALIDAZIONE SITUATIONS ===');
  console.log(`gameVersion ${gameVersion} · ${sitResults.length} Situations`);
  for (const c of categories) console.log(`  ${c.pass ? '✅' : '❌'} ${c.id.padEnd(16)} ${c.pass ? 'OK' : c.issues.length + ' issue'}${c.warnings.length ? ' · ' + c.warnings.length + ' warn' : ''}`);
  if (goldenNote) console.log(`  📸 ${goldenNote}`);
  console.log(`report HTML → ${path.relative(ROOT, htmlPath)}`);
  console.log(ok ? '\n✅ PASS' : `\n❌ FAIL — ${failCats.map(c => c.id).join(', ')}`);
  process.exit(ok ? 0 : 1);
})();
