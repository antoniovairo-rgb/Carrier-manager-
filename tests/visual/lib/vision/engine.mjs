/* AI VISION REVIEW — VisionReviewEngine (CORE, LIVE_MATCH_QA_SPEC 3.9)
   Orchestratore provider-AGNOSTIC: comunica ESCLUSIVAMENTE con un VisionProvider
   (healthCheck + analyze). Nessun codice specifico di provider qui dentro (Open/Closed).
   Responsabilità: prompt, cache+dedup+incrementale, timeout, retry/backoff, fallback,
   scoring, severity/priority, perf, logging strutturato, Failure Package.
   NON blocca MAI la CI: è secondo livello (l'esito è informativo). */
import fs from 'node:fs';
import { buildPrompt, parseModelJson } from './prompts.mjs';
import { aggregate } from './scoring.mjs';
import { CacheStore, cacheKey } from './cache.mjs';
import { PROMPT_VERSION } from './config.mjs';

const TRANSIENT = new Set(['offline', 'timeout', 'api']);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function readImages(images) {
  return (images || []).map(im => ({ phase: im.phase, mime: im.mime || 'image/png', base64: fs.readFileSync(im.path).toString('base64') }));
}

export class VisionReviewEngine {
  constructor(config, provider, logger, cacheDir) {
    this.config = config;
    this.provider = provider; // SOLO l'interfaccia VisionProvider
    this.log = logger || { debug() {}, info() {}, warn() {}, error() {} };
    this.cache = new CacheStore(cacheDir, config.enableCache);
    this._dedup = new Map(); // imagesHash -> result (dedup intra-run)
  }

  async healthCheck() { return this.provider.healthCheck(); }

  async _analyzeWithRetry(images, prompt, context) {
    const maxRetry = Math.max(1, this.config.maxRetry || 1);
    const timeout = this.config.timeout || 60000;
    let lastErr = null;
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), timeout);
      const t0 = Date.now();
      try {
        const out = await this.provider.analyze({ images, prompt, context, signal: ac.signal });
        clearTimeout(timer);
        return { out, attempts: attempt, providerMs: Date.now() - t0 };
      } catch (e) {
        clearTimeout(timer);
        lastErr = e;
        const kind = e && e.kind ? e.kind : 'unknown';
        this.log.warn(`analyze tentativo ${attempt}/${maxRetry} fallito`, { kind, msg: String(e.message || e) });
        if (!TRANSIENT.has(kind) || attempt === maxRetry) break; // permanente o ultimo tentativo → stop
        await sleep(Math.min(8000, 500 * Math.pow(2, attempt - 1))); // backoff
      }
    }
    throw lastErr || new Error('analyze fallito');
  }

  async reviewHighlight(hl) {
    const t0 = Date.now();
    const images = readImages(hl.images);
    // [VIDEO CONTINUO] il prompt cambia con la modalità → distingui la cache frames vs video (le immagini già differiscono)
    const pv = PROMPT_VERSION + (hl.context && hl.context.mode === 'video' ? '-video' : '');
    const key = cacheKey({ images, model: this._modelName(), promptVersion: pv });

    // dedup intra-run + cache su disco (analisi incrementale: highlight non cambiato → riuso)
    if (this._dedup.has(key)) { this.log.info('dedup hit', { id: hl.id }); return { ...this._dedup.get(key), id: hl.id, cached: 'dedup' }; }
    const cached = this.cache.get(key);
    if (cached) { this.log.info('cache hit', { id: hl.id }); const r = { ...cached, id: hl.id, cached: 'disk' }; this._dedup.set(key, r); return r; }

    const prompt = buildPrompt(hl.context, { promptFile: this.config.promptFile });
    let result;
    try {
      const { out, attempts, providerMs } = await this._analyzeWithRetry(images, prompt, hl.context);
      const parsed = parseModelJson(out.text);
      if (!parsed) {
        result = this._blocked(hl, 'invalid_response', 'risposta non parsabile a JSON', { attempts, raw: String(out.text).slice(0, 200) });
      } else {
        const agg = aggregate(parsed);
        result = {
          id: hl.id, gi: hl.context && hl.context.gi, situation: hl.context && hl.context.text,
          intent: hl.context && hl.context.intent,
          recognized: parsed.situationRecognition || null,
          scores: parsed.scores || {},
          errors: parsed.errors || [], warnings: parsed.warnings || [], suggestions: parsed.suggestions || [],
          rootCause: parsed.rootCause || '',
          ...agg, attempts, providerMs, totalMs: Date.now() - t0, cached: false,
          images: (hl.images || []).map(i => ({ phase: i.phase, file: i.rel || i.path })),
        };
        this.log.info('highlight valutato', { id: hl.id, verdict: agg.verdict, score: agg.qualityScore, confidence: agg.confidence, ms: result.totalMs });
      }
    } catch (e) {
      // Failure Package: errore persistente → verdict BLOCKED (mai blocca la CI)
      result = this._blocked(hl, (e && e.kind) || 'unknown', String(e.message || e), { totalMs: Date.now() - t0 });
      this.log.error('highlight BLOCKED', { id: hl.id, kind: result.failurePackage.kind, msg: result.failurePackage.message });
    }
    this.cache.set(key, result);
    this._dedup.set(key, result);
    return result;
  }

  _blocked(hl, kind, message, extra = {}) {
    return {
      id: hl.id, gi: hl.context && hl.context.gi, situation: hl.context && hl.context.text,
      intent: hl.context && hl.context.intent,
      verdict: 'BLOCKED', qualityScore: null, confidence: null, severity: 'unknown', priority: 'P2',
      scores: {}, errors: [message], warnings: [], suggestions: [], rootCause: message,
      failurePackage: { kind, message, ...extra, images: (hl.images || []).map(i => ({ phase: i.phase, file: i.rel || i.path })) },
      cached: false,
    };
  }

  _modelName() {
    const p = this.config.provider;
    return (this.config[p] && this.config[p].model) || 'unknown';
  }

  async review(highlights) {
    const t0 = Date.now();
    const health = await this.healthCheck();
    if (!health.ok) {
      this.log.warn('provider non disponibile → skip (non blocca la CI)', { provider: this.provider.name, detail: health.detail });
      return { skipped: true, reason: health.detail, provider: this.provider.name, model: this._modelName(), results: [] };
    }
    const results = [];
    for (const hl of highlights) results.push(await this.reviewHighlight(hl));

    const scored = results.filter(r => typeof r.qualityScore === 'number');
    const avg = scored.length ? +(scored.reduce((s, r) => s + r.qualityScore, 0) / scored.length).toFixed(1) : null;
    const verdicts = results.reduce((m, r) => { m[r.verdict] = (m[r.verdict] || 0) + 1; return m; }, {});
    const perf = {
      totalMs: Date.now() - t0,
      providerMsAvg: scored.length ? Math.round(results.reduce((s, r) => s + (r.providerMs || 0), 0) / results.length) : null,
      cacheHits: this.cache.hits, cacheMisses: this.cache.misses, count: results.length,
    };
    return {
      skipped: false, provider: this.provider.name, model: this._modelName(),
      promptVersion: PROMPT_VERSION, avgQuality: avg, verdicts, results, perf,
    };
  }
}
