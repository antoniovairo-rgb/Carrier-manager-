#!/usr/bin/env node
/* ============================================================================
   CPM — QUICK GATE (~1.5-2 min): gate LEGGERO per iterare veloce.
   ----------------------------------------------------------------------------
   NON sostituisce `validate-situations` (gate completo 12/12, obbligatorio prima
   del push). È un controllo rapido di NON-REGRESSIONE durante lo sviluppo:
     • campiona ~26 Situations (1 ogni 7) per i check di stato pre-risoluzione
       (initial-state · orientation · visual · movements · golden)
     • determinism sul campione · final-state su ~12 · timeline · data-coherence
   Salta i sampler lenti (post-highlight · motion · ball-motion · perf · ai-vision).
   Riusa harness + gli stessi checks/*.mjs del gate completo → zero duplicazione di logica.
   GLB OFF (come il gate completo): valida la LOGICA, non la resa.
   Exit code != 0 se un check campionato fallisce.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, openMatch, forceSituation, freeze, unfreeze, canvasShot, stateSig, sleep, frameState, waitBallSettle, ROOT, installCdnRoutes } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';
import initialState from './checks/initial-state.mjs';
import orientation from './checks/orientation.mjs';
import visual from './checks/visual.mjs';
import movements from './checks/movements.mjs';
import golden from './checks/golden.mjs';
import finalState from './checks/final-state.mjs';
import determinism from './checks/determinism.mjs';
import dataCoherence from './checks/data-coherence.mjs';
import timelineCheck from './checks/timeline.mjs';

const SIT_CHECKS = [initialState, orientation, visual, movements, golden];
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN = path.join(HERE, 'golden-sigs.json');
const SIT_STEP = 7;   // 1 Situation ogni 7 → ~26 campioni
const FS_STEP = 16;   // final-state ~12 campioni

(async () => {
  const t0 = Date.now();
  const gameVersion = (fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').match(/GAME_VERSION="([^"]+)"/) || [])[1] || '?';
  const situations = loadSituations();
  const goldenBase = fs.existsSync(GOLDEN) ? JSON.parse(fs.readFileSync(GOLDEN, 'utf8')) : null;
  if (!goldenBase) { console.log('quick-gate: golden-sigs.json assente → esegui prima il gate completo'); process.exit(2); }

  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error' && !/BABEL|in-browser Babel/.test(m.text())) consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  const agg = {}; for (const c of [...SIT_CHECKS, finalState, determinism, timelineCheck, dataCoherence]) agg[c.id] = { id: c.id, title: c.title, issues: [], warnings: [] };
  const sigs = {};

  try {
    await page.addInitScript(() => { window.__CPM_GLB = false; });
    const { total } = await openMatch(page, port);
    const sitIdx = []; for (let gi = 0; gi < total; gi += SIT_STEP) sitIdx.push(gi);
    console.log(`quick-gate · ${total} Situations · campione ${sitIdx.length} · gameVersion ${gameVersion}`);

    // 1) check di stato pre-risoluzione sul campione
    for (const gi of sitIdx) {
      const sit = situations[gi] || { text: '?', type: 'off', actions: [] };
      const state = await forceSituation(page, gi, { settle: 600, choose: true });
      const moves = await page.evaluate(() => window.__CPM_MOVES);
      const sig = stateSig(state); sigs[gi] = sig;
      for (const chk of SIT_CHECKS) {
        const r = chk.run({ sit, state, sig, moves, goldenBase: goldenBase[gi] || null });
        for (const msg of (r.issues || [])) agg[chk.id].issues.push({ gi, msg });
        for (const msg of (r.warnings || [])) agg[chk.id].warnings.push({ gi, msg });
      }
    }

    // 2) determinismo: ri-cattura un sotto-campione e confronta le firme
    const detSample = sitIdx.filter((_, i) => i % 2 === 0);
    const recapture = async (gi) => stateSig(await forceSituation(page, gi, { settle: 550, choose: true }));
    const detRes = await determinism.run({ pass1: sigs, recapture, sampleIndices: detSample });
    agg.determinism.issues.push(...detRes.issues.map(msg => ({ gi: null, msg })));

    // 3) final-state + timeline su ~12 campioni (passata force+resolve isolata)
    const fsSample = []; for (let gi = 0; gi < total; gi += FS_STEP) fsSample.push(gi);
    await page.evaluate(() => window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET());
    for (const gi of fsSample) {
      const sit = situations[gi] || { text: '?', type: 'off', actions: [] };
      await forceSituation(page, gi, { settle: 550, choose: true });
      await page.evaluate(() => window.__CPM_RESOLVE(0));
      await sleep(700); const outcome = await page.evaluate(() => window.__CPM_OUTCOME);
      /* [7.343.0] stessa attesa del gate completo, ma dall'helper condiviso: qui il poll era DUPLICATO
         riga per riga, quindi ogni taratura andava fatta due volte (e una delle due si dimenticava). */
      await waitBallSettle(page, { maxMs: 9000, quietMs: 700, pollMs: 110 });
      let fstate = await frameState(page);
      const r = finalState.run({ sit, outcome, finalState: fstate });
      for (const msg of (r.issues || [])) agg['final-state'].issues.push({ gi, msg });
      for (const msg of (r.warnings || [])) agg['final-state'].warnings.push({ gi, msg });
      await sleep(250);
    }
    try {
      const timeline = await page.evaluate(() => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []));
      const tlRes = timelineCheck.run({ timeline, situations });
      agg['timeline'].issues.push(...tlRes.issues.map(msg => ({ gi: null, msg })));
      agg['timeline'].warnings.push(...tlRes.warnings.map(msg => ({ gi: null, msg })));
    } catch (e) { agg['timeline'].issues.push({ gi: null, msg: 'errore timeline: ' + (e && e.message || e) }); }

    if (consoleErrors.length) agg.visual.issues.push(...consoleErrors.slice(0, 8).map(msg => ({ gi: null, msg: 'console error: ' + msg })));
  } catch (e) {
    agg.visual.issues.push({ gi: null, msg: 'FATAL: ' + (e && e.stack || e) });
  } finally {
    await browser.close(); srv.close();
  }

  // data-coherence: child process node (veloce, fuori dal browser)
  try { const dc = await dataCoherence.run(); agg['data-coherence'].issues.push(...dc.issues.map(msg => ({ gi: null, msg }))); }
  catch (e) { agg['data-coherence'].issues.push({ gi: null, msg: 'errore suite analitica: ' + e.message }); }

  const cats = [...SIT_CHECKS, finalState, determinism, timelineCheck, dataCoherence];
  let ok = true;
  console.log(`\n=== QUICK GATE (campione) · ${gameVersion} ===`);
  for (const c of cats) {
    const a = agg[c.id]; const pass = a.issues.length === 0; if (!pass) ok = false;
    console.log(`  ${pass ? '✅' : '❌'} ${c.id.padEnd(16)} ${pass ? 'OK' : a.issues.length + ' issue'}${a.warnings.length ? ' · ' + a.warnings.length + ' warn' : ''}`);
    if (!pass) for (const i of a.issues.slice(0, 4)) console.log(`        ${i.gi != null ? '#' + i.gi + ' ' : ''}${i.msg}`);
  }
  console.log(`\n${ok ? '✅ QUICK PASS' : '❌ QUICK FAIL'} · ${((Date.now() - t0) / 1000).toFixed(0)}s · ⚠️ campione ridotto — il gate COMPLETO (validate-situations) resta obbligatorio prima del push`);
  process.exit(ok ? 0 : 1);
})();
