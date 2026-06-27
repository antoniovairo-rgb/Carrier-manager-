#!/usr/bin/env node
/* BUILD COMPARISON (C4 / #37, AI_VISION_REVIEW cap. 17) — confronta la qualità PERCEPITA della build
   corrente (out/vision/ai-vision.json) con una BASELINE committata (vision-baseline.json): Quality
   Delta complessivo + per-verdetto. Tolleranza per la varianza del modello (AI non perfettamente
   deterministica): un calo significativo di avgQuality = possibile REGRESSIONE percettiva (WARN).
   Secondo livello (exit 0). Rigenera baseline: `npm run vision-compare -- --update`.
   Run: npm run vision-compare  (richiede un run AI Vision recente) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, 'vision-baseline.json');
const CUR = path.join(HERE, 'out', 'vision', 'ai-vision.json');
const TOL = 8; // calo di avgQuality oltre il quale segnaliamo (varianza modello assorbita)
const UPDATE = process.argv.includes('--update');

const read = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const cur = read(CUR);
if (!cur || cur.skipped || cur.avgQuality == null) { console.log('⏭️  vision-compare: manca/saltato out/vision/ai-vision.json — esegui prima `npm run ai-vision`'); process.exit(0); }

const snap = { model: cur.model, avgQuality: cur.avgQuality, verdicts: cur.verdicts, count: (cur.results || []).length, generatedAt: new Date().toISOString() };

if (UPDATE || !fs.existsSync(BASELINE)) {
  fs.writeFileSync(BASELINE, JSON.stringify(snap, null, 2) + '\n');
  console.log(`📸 vision-baseline ${fs.existsSync(BASELINE) ? 'AGGIORNATA' : 'CREATA'} — avgQuality ${snap.avgQuality}, ${JSON.stringify(snap.verdicts)} (modello ${snap.model})`);
  process.exit(0);
}

const base = read(BASELINE);
const delta = +(cur.avgQuality - base.avgQuality).toFixed(1);
console.log('=== BUILD COMPARISON (AI Vision perceptual) ===');
console.log(`baseline: avgQuality ${base.avgQuality} ${JSON.stringify(base.verdicts)} (modello ${base.model})`);
console.log(`corrente: avgQuality ${cur.avgQuality} ${JSON.stringify(cur.verdicts)} (modello ${cur.model})`);
console.log(`Quality Delta: ${delta >= 0 ? '+' : ''}${delta}` + (base.model !== cur.model ? '  (⚠️ modello diverso → confronto non comparabile)' : ''));
if (base.model === cur.model && delta < -TOL) console.log(`⚠️  REGRESSIONE PERCEPITA: avgQuality calato di ${-delta} (> ${TOL}) — verifica gli highlight nel report`);
else if (base.model === cur.model) console.log(delta > TOL ? '✅ miglioramento percepito significativo' : '→ entro la varianza del modello (nessuna regressione)');
process.exit(0);
