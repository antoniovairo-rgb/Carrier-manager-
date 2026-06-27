/* LMQP-7 — FAILURE COLLECTOR (LIVE_MATCH_QA_SPEC cap. 3.6)
   Produce un PACCHETTO DI FALLIMENTO compatto e machine-readable (run-summary.json)
   a partire dall'aggregato del gate. È la sorgente normalizzata per:
     · CI    → un solo JSON con tutto l'azionabile (check rosso, situation, intent, screenshot, seed)
     · Dashboard (LMQP-9) → griglia di stato + tabella errori
     · Regression history → fingerprint stabile per dedup/trend
   Additivo: scrive solo un file accanto a report.json/index.html, non tocca il gate. */
import fs from 'node:fs';
import path from 'node:path';

// fingerprint deterministico (no Date/random): firma dell'INSIEME di chiavi di fallimento {check#gi}.
//   Stabile a parità di run → due run con gli stessi fallimenti hanno lo stesso fingerprint (dedup/trend).
function fingerprint(keys) {
  let h = 5381 >>> 0;
  for (const k of keys.slice().sort()) {
    for (let i = 0; i < k.length; i++) h = (((h << 5) + h) ^ k.charCodeAt(i)) >>> 0;
  }
  return ('00000000' + h.toString(16)).slice(-8);
}

export function collectFailures(outDir, data) {
  const { meta, categories, situations } = data;
  // mappa gi -> dettaglio situation (testo/intent/screenshot) per arricchire ogni fallimento
  const byGi = {};
  for (const s of (situations || [])) byGi[s.gi] = s;

  const failures = [];
  for (const c of categories) {
    for (const raw of (c.issues || [])) {
      // c.issues sono già stringhe formattate "#gi msg" o "msg"; ricaviamo gi se presente
      const m = /^#(\d+)\s+([\s\S]*)$/.exec(raw);
      const gi = m ? Number(m[1]) : null;
      const msg = m ? m[2] : raw;
      const sit = gi != null ? byGi[gi] : null;
      failures.push({
        check: c.id, scope: c.scope, gi, msg,
        situation: sit ? sit.text : null,
        intent: sit ? (sit.intent || null) : null,
        shot: sit ? (sit.shotInitial || sit.shotFinal || null) : null,
      });
    }
  }

  // coverage dal check timeline (LMQP-4/6), se disponibile
  const tl = categories.find(c => c.id === 'timeline');
  const coverage = tl && tl.info && tl.info.coverage ? tl.info.coverage : null;
  const baseline = tl && tl.info ? tl.info.baseline : null;

  const checks = categories.map(c => ({
    id: c.id, scope: c.scope, pass: c.pass,
    issues: (c.issues || []).length, warnings: (c.warnings || []).length,
  }));

  const fp = fingerprint(failures.map(f => `${f.check}#${f.gi}`));
  const summary = {
    ok: failures.length === 0,
    generatedAt: meta.generatedAt,
    gameVersion: meta.gameVersion,
    seed: meta.seed,
    total: meta.total,
    fingerprint: fp,
    counts: {
      checks: checks.length,
      checksFailed: checks.filter(c => !c.pass).length,
      failures: failures.length,
      warnings: checks.reduce((n, c) => n + c.warnings, 0),
    },
    checks,
    coverage,
    baseline,
    performance: meta.performance || null,
    replay: meta.replay || null,
    failures,
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'run-summary.json'), JSON.stringify(summary, null, 2));
  return summary;
}
