/* AI VISION REVIEW — VisionProvider (interfaccia, LIVE_MATCH_QA_SPEC 3.9)
   Contratto UNICO con cui il VisionReviewEngine comunica. Il Core Engine NON conosce
   nessun provider concreto (Open/Closed): per aggiungere Anthropic/OpenAI/Gemini basta
   una nuova sottoclasse + registrazione, zero modifiche al Core.

   Una sottoclasse DEVE implementare:
     get name(): string
     async healthCheck(): { ok:boolean, detail?:string }       // provider+modello raggiungibili?
     async analyze({ images, prompt, context, signal }): { text:string, usage?, model? }
       · images: [{ phase, base64, mime }]   · prompt: string   · signal: AbortSignal (timeout)
       · ritorna il TESTO grezzo del modello (l'Engine fa parsing/scoring, provider-agnostic). */
export class VisionProvider {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger || { debug() {}, info() {}, warn() {}, error() {} };
  }
  get name() { throw new Error('VisionProvider.name non implementato'); }
  // eslint-disable-next-line no-unused-vars
  async healthCheck() { throw new Error(`${this.name}: healthCheck() non implementato`); }
  // eslint-disable-next-line no-unused-vars
  async analyze(_req) { throw new Error(`${this.name}: analyze() non implementato`); }
}

// errore tipizzato per distinguere i fallimenti gestiti dall'Engine (retry/fallback)
export class VisionError extends Error {
  constructor(message, kind = 'unknown', meta = {}) { super(message); this.name = 'VisionError'; this.kind = kind; this.meta = meta; }
}
// kind: 'offline' | 'timeout' | 'model_missing' | 'api' | 'invalid_response' | 'unknown'
