/* AI VISION REVIEW — CONFIG (LIVE_MATCH_QA_SPEC 3.9/3.13, AI_VISION_REVIEW.md)
   Tutto configurabile via .env: provider, URL, modello, timeout, retry, immagini, cache, log.
   NIENTE hardcode nel Core Engine: i default vivono qui e sono sovrascrivibili da env/.env.
   Loader .env dependency-free (non sovrascrive variabili già presenti in process.env). */
import fs from 'node:fs';
import path from 'node:path';

export function loadEnv(rootDir) {
  const file = path.join(rootDir, '.env');
  if (!fs.existsSync(file)) return { loaded: false, file };
  const txt = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const lineRaw of txt.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (key && !(key in process.env)) { process.env[key] = val; n++; }
  }
  return { loaded: true, file, count: n };
}

const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const bool = (v, d) => (v == null ? d : !/^(0|false|no|off)$/i.test(String(v)));

// Config provider-agnostica: il blocco specifico (ollama/anthropic/…) è isolato per chiave provider.
export function getConfig(env = process.env) {
  const provider = env.VISION_PROVIDER || 'ollama';
  return Object.freeze({
    provider,
    // parametri generici (validi per ogni provider)
    maxImages: num(env.VISION_MAX_IMAGES, num(env.OLLAMA_MAX_IMAGES, 6)),
    timeout: num(env.VISION_TIMEOUT, num(env.OLLAMA_TIMEOUT, 60000)),
    maxRetry: num(env.VISION_MAX_RETRY, num(env.OLLAMA_MAX_RETRY, 3)),
    enableCache: bool(env.VISION_ENABLE_CACHE, bool(env.OLLAMA_ENABLE_CACHE, true)),
    logLevel: env.VISION_LOG_LEVEL || env.OLLAMA_LOG_LEVEL || 'info',
    maxHighlights: num(env.VISION_MAX_HIGHLIGHTS, 6),
    promptFile: env.VISION_PROMPT_FILE || null,
    // [BL-19 · VIDEO CONTINUO] modalità di cattura: 'frames' = 5 fasi statiche (default) ·
    //   'video' = burst denso e ORDINATO dei fotogrammi della conclusione (filmstrip) → l'AI giudica il MOVIMENTO
    //   (fluidità, continuità della traiettoria, tempi esito↔3D, niente scatti/teleport). Prompt dedicato, schema invariato.
    visionMode: /^video$/i.test(env.VISION_MODE || '') ? 'video' : 'frames',
    videoFrames: Math.max(3, Math.min(16, num(env.VISION_VIDEO_FRAMES, 10))),   // quanti fotogrammi nel filmstrip (cap 16 per costo/token)
    videoIntervalMs: Math.max(40, num(env.VISION_VIDEO_INTERVAL, 110)),          // passo di campionamento tra i frame
    // blocchi per-provider (nessun valore hardcoded nel Core Engine)
    ollama: {
      baseUrl: env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: env.OLLAMA_MODEL || 'qwen2.5vl',
      apiKey: env.OLLAMA_API_KEY || '', // Ollama Cloud (https://ollama.com): Bearer token; locale: vuoto
      timeout: num(env.OLLAMA_TIMEOUT, num(env.VISION_TIMEOUT, 60000)),
    },
    anthropic: {
      baseUrl: env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
      apiKey: env.ANTHROPIC_API_KEY || env.CPM_VISION_API_KEY || '',
      model: env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
      version: env.ANTHROPIC_VERSION || '2023-06-01',
    },
    openai: {
      baseUrl: env.OPENAI_BASE_URL || 'https://api.openai.com',
      apiKey: env.OPENAI_API_KEY || '',
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    gemini: {
      baseUrl: env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com',
      apiKey: env.GEMINI_API_KEY || '',
      model: env.GEMINI_MODEL || 'gemini-1.5-flash',
    },
  });
}

export const PROMPT_VERSION = 'v2';
