/* AI VISION REVIEW — ADATTATORE per il quality gate (LIVE_MATCH_QA_SPEC 3.9)
   Il gate fa un controllo AI di SECONDO LIVELLO (non blocca mai la CI) riusando il
   FRAMEWORK provider-based in lib/vision/ (nessuna logica duplicata, DEVELOPMENT_RULES).
   Analizza gli screenshot già catturati dal gate (fase 'main'); senza provider attivo
   (es. Ollama non in ascolto) → skip pulito, gate invariato.
   La pipeline COMPLETA multi-fase è il runner standalone `ai-vision-review.mjs`. */
import path from 'node:path';
import { getConfig } from './vision/config.mjs';
import { createProvider, hasProvider } from './vision/registry.mjs';
import './vision/providers/index.mjs'; // side-effect: registra i provider
import { VisionReviewEngine } from './vision/engine.mjs';
import { createLogger } from './vision/logger.mjs';

export function visionEnabled() {
  const c = getConfig();
  return hasProvider(c.provider);
}

export async function runAiVision(outDir, samples, { max = 6 } = {}) {
  const config = getConfig();
  const logger = createLogger('warn', { provider: config.provider });
  let provider;
  try { provider = createProvider(config.provider, config, logger); }
  catch (e) { return { skipped: true, reason: String(e.message || e), provider: config.provider }; }

  const engine = new VisionReviewEngine(config, provider, logger, path.join(outDir, 'vision-cache'));
  const health = await engine.healthCheck();
  if (!health.ok) return { skipped: true, reason: health.detail, provider: provider.name, model: engine._modelName() };

  const highlights = (samples || []).slice(0, max).filter(s => s.shot).map(s => ({
    id: 'gi' + s.gi, context: { gi: s.gi, text: s.text, intent: s.intent },
    images: [{ phase: 'main', path: path.join(outDir, s.shot), rel: s.shot }],
  }));
  return engine.review(highlights);
}
