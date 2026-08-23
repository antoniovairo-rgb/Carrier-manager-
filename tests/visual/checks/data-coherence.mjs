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
    /* [7.554.0 collaudo PO «una marea di run failed»] IL FALSO VERDE PIU' PERICOLOSO DELLA MISSIONE.
       Questo check leggeva `situations_validation.json` DOPO aver lanciato la suite analitica — ma senza
       cancellarlo prima. Se la suite moriva (FATAL, timeout, crash) il file RESTAVA quello del giro
       precedente, e il check leggeva 0 fallimenti: verde. In CI, dove il checkout e' pulito e il file non
       c'e', lo stesso identico codice andava in FAIL. MISURATO il 23 agosto: il JSON sulla macchina di
       sviluppo era del 17 agosto — SEI GIORNI prima — e per sei giorni il gate locale ha detto ✅ leggendo
       una risposta vecchia mentre GitHub diceva ❌. Ora il file si cancella PRIMA: se la suite non lo
       riscrive, il check lo dice invece di ereditare un verde. */
    try { fs.rmSync(tmpJson, { force: true }); } catch {}
    const res = spawnSync(process.execPath, [tmpHarness], { encoding: 'utf8', timeout: 120000 });
    const out = (res.stdout || '') + (res.stderr || '');
    let info = { raw: out.split('\n').filter(l => /clean:|FAIL:|scores|coverage|coerenza|catalogo/.test(l)).join(' | ') };
    let fails = 0;
    try {
      const j = JSON.parse(fs.readFileSync(tmpJson, 'utf8'));
      fails = (j.fails || 0) + (j.catFails || 0);
      /* [7.213.0] le GUARDIE DI CONSISTENZA della suite (il modello analitico rispecchia il motore reale?)
         venivano lette solo dal report .md: se una falliva, il gate restava verde e il modello poteva
         divergere in silenzio dal sorgente — esattamente il rischio che quelle guardie esistono per coprire.
         Ora una guardia rotta è un FAIL del check. */
      const gBad = (Array.isArray(j.guards) ? j.guards : []).filter(g => !g.ok);
      fails += gBad.length;
      info = { clean: j.clean, warns: j.warns, fails: j.fails, catFails: j.catFails, guardsFailed: gBad.length, scores: j.scores };
      for (const g of gBad) issues.push(`guardia di consistenza fallita: ${g.name} — il modello analitico non rispecchia più il motore (aggiorna la guardia o correggi il sorgente)`);
      /* [7.554.0] IL MESSAGGIO ERA ILLEGGIBILE. `w.issues` non e' un elenco di stringhe ma di OGGETTI, e la
         join stampava «[object Object]»: dieci fallimenti tutti uguali e nessuno che dicesse cosa non va.
         Un guardiano che non si riesce a leggere non protegge nessuno — e' la lezione della giornata, qui
         applicata al testo del suo stesso referto. */
      const _leggi = x => typeof x === 'string' ? x
        : (x && typeof x === 'object') ? (x.msg || x.why || x.code || x.name || JSON.stringify(x)) : String(x);
      if (fails > 0 && Array.isArray(j.worst)) for (const w of j.worst.slice(0, 10)) issues.push(`[${w.si}/${w.ai}] ${w.sit}: ${(w.issues || []).map(_leggi).join('; ')}`);
    } catch {
      const m = out.match(/FAIL:\s*(\d+)/); fails = m ? +m[1] : (res.status === 0 ? 0 : 1);
      if (fails > 0) issues.push('suite analitica: ' + (info.raw || 'fallimenti rilevati'));
    }
    return { pass: fails === 0, issues, info };
  }
};
