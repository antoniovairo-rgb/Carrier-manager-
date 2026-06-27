/* AI VISION REVIEW — RUNNER (LIVE_MATCH_QA_SPEC 3.9, AI_VISION_REVIEW.md)
   Pipeline completa: .env → provider (registry) → Playwright (cattura multi-fase per
   highlight) → VisionReviewEngine → report HTML + ai-vision.json → cleanup.
   SECONDO LIVELLO: non blocca la CI (exit 0). Con --strict esce !=0 su FAIL/BLOCKED.
   Esecuzione: (npm run ai-vision) — richiede un provider attivo (es. Ollama locale).
   Senza provider raggiungibile → skip pulito (report "SKIPPED"), nessun errore. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, openMatch, installCdnRoutes, ROOT } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';
import { loadEnv, getConfig } from './lib/vision/config.mjs';
import { createLogger } from './lib/vision/logger.mjs';
import { createProvider } from './lib/vision/registry.mjs';
import './lib/vision/providers/index.mjs'; // side-effect: registra i provider
import { VisionReviewEngine } from './lib/vision/engine.mjs';
import { captureHighlight } from './lib/vision/capture.mjs';
import { writeVisionReport } from './lib/vision/report.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out', 'vision');
const CACHE_DIR = path.join(HERE, 'out', 'vision', 'cache');
const STRICT = process.argv.includes('--strict');

(async () => {
  loadEnv(HERE);
  const config = getConfig();
  const logger = createLogger(config.logLevel, { provider: config.provider });
  const gameVersion = (fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').match(/GAME_VERSION="([^"]+)"/) || [])[1] || '?';
  const meta = { generatedAt: new Date().toISOString(), gameVersion };

  let provider;
  try { provider = createProvider(config.provider, config, logger); }
  catch (e) { logger.error('provider non creabile', { msg: String(e.message || e) }); console.error('❌ ' + e.message); process.exit(STRICT ? 1 : 0); return; }

  const engine = new VisionReviewEngine(config, provider, logger, CACHE_DIR);

  // health-check: se il provider è giù, skip pulito (nessuna sessione browser sprecata)
  const health = await engine.healthCheck();
  logger.info('healthCheck', { ok: health.ok, detail: health.detail });
  if (!health.ok) {
    const review = { skipped: true, reason: health.detail, provider: provider.name, model: engine._modelName(), results: [] };
    const { htmlPath } = writeVisionReport(OUT, review, meta);
    console.log(`⏭️  AI Vision SKIP — ${health.detail}`);
    console.log(`report → ${path.relative(ROOT, htmlPath)}`);
    process.exit(0); return;
  }

  const situations = loadSituations();
  const total = situations.length;
  const maxH = Math.max(1, config.maxHighlights);
  const step = Math.max(1, Math.floor(total / maxH));
  const indices = []; for (let i = 0; i < total && indices.length < maxH; i += step) indices.push(i);

  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  let review;
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
    await installCdnRoutes(page);
    await openMatch(page, port);
    logger.info('match pronto', { total, willCapture: indices });

    const highlights = [];
    for (const gi of indices) {
      const shots = await captureHighlight(page, gi, OUT);
      const sit = situations[gi] || {};
      highlights.push({ id: `gi${gi}`, context: { gi, text: sit.text, intent: sit.intent || null }, images: shots });
      logger.info('catturato', { gi, phases: shots.length });
    }
    review = await engine.review(highlights);
  } finally {
    // CLEANUP: chiude browser (Chromium) e server → libera le risorse
    await browser.close(); srv.close();
  }

  const { htmlPath, decision } = writeVisionReport(OUT, review, meta);
  if (review.skipped) console.log(`⏭️  AI Vision SKIP — ${review.reason}`);
  else console.log(`AI Vision: decisione ${decision} · quality medio ${review.avgQuality} · verdetti ${JSON.stringify(review.verdicts)} · ${review.perf.totalMs}ms`);
  console.log(`report → ${path.relative(ROOT, htmlPath)}`);

  const bad = !review.skipped && (decision === 'FAIL');
  process.exit(STRICT && bad ? 1 : 0);
})().catch(e => { console.error('FATAL ai-vision-review:', e && e.stack || e); process.exit(STRICT ? 1 : 0); });
