/* AI VISION REVIEW — GeminiVisionProvider (FUTURE provider, predisposto)
   Registrato e pronto: per attivarlo basta implementare analyze() (generateContent vision)
   — nessuna modifica al Core Engine. Oggi healthCheck segnala "non implementato". */
import { VisionProvider, VisionError } from '../provider.mjs';
import { registerProvider } from '../registry.mjs';

export class GeminiVisionProvider extends VisionProvider {
  get name() { return 'gemini'; }
  async healthCheck() {
    const cfg = (this.config && this.config.gemini) || {};
    if (!cfg.apiKey) return { ok: false, detail: 'GEMINI_API_KEY non impostata (provider predisposto, non ancora implementato)' };
    return { ok: false, detail: 'GeminiVisionProvider predisposto ma analyze() non ancora implementato' };
  }
  async analyze() { throw new VisionError('GeminiVisionProvider: analyze() non ancora implementato', 'unknown', {}); }
}

registerProvider('gemini', (config, logger) => new GeminiVisionProvider(config, logger));
