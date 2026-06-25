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
import { startServer, launchBrowser, openMatch, forceSituation, unfreeze, canvasShot, stateSig, sigStr, ROOT } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';
import { writeReports } from './report.mjs';
import initialState from './checks/initial-state.mjs';
import orientation from './checks/orientation.mjs';
import visual from './checks/visual.mjs';
import golden from './checks/golden.mjs';
import determinism from './checks/determinism.mjs';
import dataCoherence from './checks/data-coherence.mjs';

const SIT_CHECKS = [initialState, orientation, visual, golden];   // per-situation
const GLOBAL_CHECKS = [determinism, dataCoherence];               // global
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
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error' && !/BABEL|in-browser Babel/.test(m.text())) consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  const sitResults = []; const sigs = {};
  const agg = {}; for (const c of [...SIT_CHECKS, ...GLOBAL_CHECKS]) agg[c.id] = { id: c.id, title: c.title, scope: c.scope, issues: [], warnings: [], info: {} };

  try {
    const { total } = await openMatch(page, port);
    console.log(`match pronto · ${total} Situations · gameVersion ${gameVersion}`);

    for (let gi = 0; gi < total; gi++) {
      const sit = situations[gi] || { text: '?', type: 'off', actions: [] };
      const state = await forceSituation(page, gi, { freeze: true });
      const sig = stateSig(state); sigs[gi] = sig;
      const buf = await canvasShot(page);

      const issues = [], warnings = [];
      for (const chk of SIT_CHECKS) {
        const r = chk.run({ sit, state, sig, goldenBase: goldenBase ? goldenBase[gi] : null });
        for (const msg of (r.issues || [])) { issues.push({ check: chk.id, msg }); agg[chk.id].issues.push({ gi, msg }); }
        for (const msg of (r.warnings || [])) { warnings.push({ check: chk.id, msg }); agg[chk.id].warnings.push({ gi, msg }); }
      }
      let shotInitial = null;
      if (SHOTS_ALL || issues.length || warnings.length || gi < 10) { const fn = `sit_${String(gi).padStart(3, '0')}.png`; fs.writeFileSync(path.join(SHOT_DIR, fn), buf); shotInitial = 'shots/' + fn; }
      await unfreeze(page);
      sitResults.push({ gi, text: sit.text, type: sit.type || 'off', hashInitial: sigStr(sig), shotInitial, shotFinal: null, issues, warnings });
      if ((gi + 1) % 40 === 0) console.log(`  …${gi + 1}/${total}`);
    }

    // GLOBALE: determinismo — ri-cattura un campione e confronta le firme (esatte)
    const sample = []; for (let gi = 0; gi < situations.length; gi += 12) sample.push(gi);
    const recapture = async (gi) => { const st = await forceSituation(page, gi, { freeze: true }); await unfreeze(page); return stateSig(st); };
    const detRes = await determinism.run({ pass1: sigs, recapture, sampleIndices: sample });
    agg.determinism.issues.push(...detRes.issues.map(msg => ({ gi: null, msg }))); agg.determinism.info = detRes.info;

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

  const categories = [...SIT_CHECKS, ...GLOBAL_CHECKS].map(c => {
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
