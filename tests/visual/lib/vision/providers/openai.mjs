/* AI VISION REVIEW — OpenAIVisionProvider (FUTURE provider, predisposto)
   Registrato e pronto: per attivarlo basta implementare analyze() (Chat Completions vision)
   — nessuna modifica al Core Engine. Oggi healthCheck segnala "non implementato". */
import { VisionProvider, VisionError } from '../provider.mjs';
import { registerProvider } from '../registry.mjs';

export class OpenAIVisionProvider extends VisionProvider {
  get name() { return 'openai'; }
  async healthCheck() {
    const cfg = (this.config && this.config.openai) || {};
    if (!cfg.apiKey) return { ok: false, detail: 'OPENAI_API_KEY non impostata (provider predisposto, non ancora implementato)' };
    return { ok: false, detail: 'OpenAIVisionProvider predisposto ma analyze() non ancora implementato' };
  }
  async analyze() { throw new VisionError('OpenAIVisionProvider: analyze() non ancora implementato', 'unknown', {}); }
}

registerProvider('openai', (config, logger) => new OpenAIVisionProvider(config, logger));
