#!/usr/bin/env node
/* CROSS-VALIDATION (C4 / #34, LIVE_MATCH_QA_SPEC cap. 16) — incrocia i DUE livelli QA sullo stesso
   highlight: il GATE geometrico (out/validate/run-summary.json) e l'AI VISION perceptual
   (out/vision/ai-vision.json). Evidenzia le DIVERGENZE: gate PASS ma AI WARNING/FAIL = problema
   percettivo che il gate (a soglie geometriche) non coglie; gate FAIL ma AI PASS = problema
   geometrico che la percezione non nota. Informativo (exit 0): una sola fonte non decide.
   Run: npm run cross-validate  (richiede un run del gate + un run AI Vision recenti) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const gate = read(path.join(HERE, 'out', 'validate', 'run-summary.json'));
const vision = read(path.join(HERE, 'out', 'vision', 'ai-vision.json'));

if (!gate) { console.log('⏭️  cross-validate: manca out/validate/run-summary.json — esegui prima `npm run validate-situations`'); process.exit(0); }
if (!vision || vision.skipped || !(vision.results || []).length) { console.log('⏭️  cross-validate: manca/saltato out/vision/ai-vision.json — esegui prima `npm run ai-vision`'); process.exit(0); }

// gi con almeno un fallimento nel gate (geometrico)
const gateFailGi = new Set((gate.failures || []).filter(f => f.gi != null).map(f => f.gi));
const RANK = { PASS: 0, WARNING: 1, FAIL: 2, BLOCKED: 3 };

console.log('=== CROSS-VALIDATION  Gate (geometrico) ↔ AI Vision (perceptual) ===');
console.log(`gate: ${gate.outcome || (gate.counts && gate.counts.failures === 0 ? 'PASS' : 'FAIL')} (${(gate.counts && gate.counts.failures) || 0} failure) · AI Vision: ${vision.avgQuality} medio, ${JSON.stringify(vision.verdicts)}`);
let diverge = 0, agree = 0;
for (const r of vision.results) {
  const g = gateFailGi.has(r.gi) ? 'FAIL' : 'PASS';
  const ai = r.verdict || 'BLOCKED';
  const d = (g === 'PASS' && RANK[ai] >= 1) ? '⚠️ AI segnala (gate non vede)'
    : (g === 'FAIL' && RANK[ai] === 0) ? '⚠️ gate segnala (AI non vede)'
      : '✓ concordi';
  if (d.startsWith('⚠️')) diverge++; else agree++;
  console.log(`  gi${String(r.gi).padEnd(3)} gate=${g.padEnd(4)} AI=${(ai).padEnd(7)} q=${r.qualityScore}  ${d}`);
}
console.log(`\nconcordi ${agree} · divergenti ${diverge}`);
console.log(diverge ? '→ le divergenze indicano dove un livello copre ciò che l\'altro non vede (cap. 16: nessuna fonte decide da sola).' : '→ i due livelli concordano sugli highlight campionati.');
process.exit(0);
