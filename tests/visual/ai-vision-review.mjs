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
import { captureHighlight, captureHighlightSequence } from './lib/vision/capture.mjs';
import { writeVisionReport } from './lib/vision/report.mjs';
import { appendHistory, readHistory, computeTrend, makeRecord } from './lib/vision/history.mjs';

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

    const videoMode = config.visionMode === 'video';
    logger.info('modalità cattura', { mode: config.visionMode, ...(videoMode ? { frames: config.videoFrames, intervalMs: config.videoIntervalMs } : {}) });
    const highlights = [];
    /* [7.480.0 collaudo PO] UN HIGHLIGHT CHE NON SI CATTURA NON UCCIDE LA REVIEW. Misurato sulla macchina
       del PO: `page.screenshot` e' andato in timeout sul secondo highlight e l'intero run e' morto FATAL,
       buttando via il primo che era gia' stato catturato — e senza produrre nessun report. Un revisore
       percettivo e' un livello che DEGRADA: se una scena non si lascia fotografare, si annota e si va
       avanti con le altre. Se non se ne cattura nessuna, allora si', il run non ha niente da dire. */
    const saltati = [];
    for (const gi of indices) {
      let shots = null;
      try {
        shots = videoMode
          ? await captureHighlightSequence(page, gi, OUT, { frames: config.videoFrames, intervalMs: config.videoIntervalMs })
          : await captureHighlight(page, gi, OUT);
      } catch (e) {
        const msg = String((e && e.message) || e).split('\n')[0].slice(0, 160);
        logger.warn('cattura fallita — highlight saltato', { gi, msg });
        console.log(`⚠️  gi${gi}: cattura fallita (${msg}) — salto e proseguo`);
        saltati.push({ gi, msg });
        continue;
      }
      if (!shots || !shots.length) { saltati.push({ gi, msg: 'nessun fotogramma' }); continue; }
      const sit = situations[gi] || {};
      // [VIDEO CONTINUO] context.mode='video' → l'Engine sceglie il prompt MOVIMENTO (filmstrip ordinato)
      highlights.push({ id: `gi${gi}`, context: { gi, text: sit.text, intent: sit.intent || null, esito: shots.esito || null, ...(videoMode ? { mode: 'video' } : {}) }, images: shots });
      logger.info('catturato', { gi, frames: shots.length });
    }
    if (saltati.length) console.log(`⚠️  ${saltati.length}/${indices.length} highlight non catturati: ${saltati.map(s => 'gi' + s.gi).join(', ')}`);
    if (!highlights.length) {
      review = { skipped: true, reason: `nessun highlight catturato (${saltati.length} falliti: ${saltati.map(s => `gi${s.gi} ${s.msg}`).join(' · ')})`, provider: provider.name, model: engine._modelName(), results: [] };
    } else {
      review = await engine.review(highlights);
      if (saltati.length) review.saltati = saltati;
    }
  } finally {
    // CLEANUP: chiude browser (Chromium) e server → libera le risorse
    await browser.close(); srv.close();
  }

  // [BL-19] SCORING STORICO: trend calcolato su (storico prior + run corrente) per il report, POI persiste la run.
  if (!review.skipped) {
    const decisionNow = (review.verdicts && (review.verdicts.FAIL || review.verdicts.BLOCKED)) ? 'FAIL' : (review.verdicts && review.verdicts.WARNING) ? 'WARNING' : 'PASS';
    review.trend = computeTrend([...readHistory(OUT), makeRecord(review, meta, decisionNow)]);
  }
  const { htmlPath, decision } = writeVisionReport(OUT, review, meta);
  if (!review.skipped) appendHistory(OUT, review, meta, decision);
  if (review.skipped) console.log(`⏭️  AI Vision SKIP — ${review.reason}`);
  else {
    console.log(`AI Vision: decisione ${decision} · quality medio ${review.avgQuality} · verdetti ${JSON.stringify(review.verdicts)} · ${review.perf.totalMs}ms`);
    if (review.trend) console.log(`  trend: ${review.trend.dir === 'first' ? 'prima run' : (review.trend.delta > 0 ? '+' : '') + review.trend.delta + ' vs precedente'} · best ${review.trend.best} · worst ${review.trend.worst} · ${review.trend.runs} run`);
  }
  console.log(`report → ${path.relative(ROOT, htmlPath)}`);

  const bad = !review.skipped && (decision === 'FAIL');
  process.exit(STRICT && bad ? 1 : 0);
})().catch(e => { console.error('FATAL ai-vision-review:', e && e.stack || e); process.exit(STRICT ? 1 : 0); });
