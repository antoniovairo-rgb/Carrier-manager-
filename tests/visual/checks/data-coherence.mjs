/* CHECK 3 (dati) — COERENZA LOGICA/TATTICA via SUITE ANALITICA ESISTENTE (no duplicazione)
   Riusa tests/situations-3d-validation.js (537 combo: classificazione HL, traiettorie,
   sincronizzazione, far/near post, cutback, 1v1, completezza esito, realism score).
   Lo esegue come child process con i path patchati su file temporanei e ne raccoglie l'esito. */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, __dirname } from '../lib/harness.mjs';

export default {
  id: 'data-coherence',
  title: 'Coerenza logica/tattica (suite analitica)',
  scope: 'global',
  async run() {
    const issues = [];
    const harness = path.join(ROOT, 'tests', 'situations-3d-validation.js');
    if (!fs.existsSync(harness)) return { pass: true, issues: ['suite analitica non trovata — skip'], info: { skipped: true } };
    const tmpDir = path.join(__dirname, '..', 'out', '_analytic');
    fs.mkdirSync(tmpDir, { recursive: true });
    const tmpJson = path.join(tmpDir, 'situations_validation.json');
    const tmpMd = path.join(tmpDir, 'report.md');
    // patcha i 3 path hardcoded (/home/user/...) verso file locali
    let src = fs.readFileSync(harness, 'utf8');
    src = src.replace(/const HTML=['"][^'"]+['"];/, `const HTML=${JSON.stringify(path.join(ROOT, 'CARRIER-MANAGER-AV.html'))};`)
             .replace(/'\/home\/user\/Carrier-manager-\/docs\/SITUATIONS_VALIDATION_REPORT\.md'/g, JSON.stringify(tmpMd))
             .replace(/'\/home\/user\/Carrier-manager-\/docs\/situations_validation\.json'/g, JSON.stringify(tmpJson));
    const tmpHarness = path.join(tmpDir, '_analytic.cjs');
    fs.writeFileSync(tmpHarness, src);
    const res = spawnSync(process.execPath, [tmpHarness], { encoding: 'utf8', timeout: 120000 });
    const out = (res.stdout || '') + (res.stderr || '');
    let info = { raw: out.split('\n').filter(l => /clean:|FAIL:|scores|coverage|coerenza|catalogo/.test(l)).join(' | ') };
    let fails = 0;
    try {
      const j = JSON.parse(fs.readFileSync(tmpJson, 'utf8'));
      fails = (j.fails || 0) + (j.catFails || 0);
      info = { clean: j.clean, warns: j.warns, fails: j.fails, catFails: j.catFails, scores: j.scores };
      if (fails > 0 && Array.isArray(j.worst)) for (const w of j.worst.slice(0, 10)) issues.push(`[${w.si}/${w.ai}] ${w.sit}: ${(w.issues || []).join('; ')}`);
    } catch {
      const m = out.match(/FAIL:\s*(\d+)/); fails = m ? +m[1] : (res.status === 0 ? 0 : 1);
      if (fails > 0) issues.push('suite analitica: ' + (info.raw || 'fallimenti rilevati'));
    }
    return { pass: fails === 0, issues, info };
  }
};
