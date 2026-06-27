#!/usr/bin/env node
/* D1 — REPLAY ENGINE runner (slice headless). Registra l'ARCO COMPLETO di un campione di highlight
   (choose→resolve→settle) come replay DATI per-frame + eventi, li persiste in out/validate/replay/
   full_NNN.json e ne valida COMPLETEZZA/COERENZA (AC-051..055). Auto-verificabile (probe, non render).
   Run: npm run replay   (HARD FAIL se un replay è troncato/incoerente). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, ROOT } from './lib/harness.mjs';
import { recordReplay, validateReplay } from './lib/replay.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out', 'validate', 'replay');
// campione vario per intento: insertion/shot/cross/onetwo/progression/insertion/through/recover
const SAMPLE = [0, 8, 17, 30, 60, 88, 120, 132];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  let issues = [], warnings = [], infos = [];
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
    await installCdnRoutes(page);
    await openMatch(page, port);
    for (const gi of SAMPLE.filter(g => g != null)) {
      const rep = await recordReplay(page, gi);
      // persisti il replay completo (artefatto D1)
      fs.writeFileSync(path.join(OUT, `full_${String(gi).padStart(3, '0')}.json`), JSON.stringify({ gi: rep.gi, intent: rep.intent, frameCount: rep.frameCount, durMs: rep.durMs, frames: rep.frames, events: rep.events }));
      const v = validateReplay(rep);
      issues.push(...v.issues); warnings.push(...v.warnings); infos.push(v.info);
    }
  } catch (e) {
    issues.push('FATAL: ' + (e && e.message || e));
  } finally {
    await browser.close(); srv.close();
  }

  console.log('=== D1 REPLAY ENGINE — registrazione + validazione completezza ===');
  for (const i of infos) console.log(`  gi${String(i.gi).padEnd(3)} [${(i.intent || '?').padEnd(11)}] ${i.frames} frame · ${i.durMs}ms · ${i.events} eventi · maxBallJump ${i.maxBallJump}`);
  if (warnings.length) { console.log('  warnings:'); warnings.forEach(w => console.log('   · ' + w)); }
  if (issues.length) { console.log('  ISSUE:'); issues.forEach(w => console.log('   ✗ ' + w)); }
  console.log(`\nreplay scritti → ${path.relative(ROOT, OUT)} · ${infos.length} highlight`);
  console.log(issues.length === 0 ? '✅ PASS — replay completi e coerenti' : `❌ FAIL — ${issues.length} issue`);
  process.exit(issues.length === 0 ? 0 : 1);
})();
