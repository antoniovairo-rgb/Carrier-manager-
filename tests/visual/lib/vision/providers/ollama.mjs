/* AI VISION REVIEW — OllamaVisionProvider (PRIMO provider, locale e gratuito)
   Implementa il contratto VisionProvider per Ollama (http://localhost:11434).
   Nessun riferimento a Ollama esiste fuori da questo file (Open/Closed). */
import { VisionProvider, VisionError } from '../provider.mjs';
import { registerProvider } from '../registry.mjs';

// proxy-aware solo per endpoint non-locali (Ollama Cloud su https://ollama.com passa dal proxy)
let _dispatcher, _tried = false;
async function dispatcher(baseUrl) {
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(baseUrl)) return undefined; // locale: niente proxy
  if (_tried) return _dispatcher; _tried = true;
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) { try { const { ProxyAgent } = await import('undici'); _dispatcher = new ProxyAgent(proxy); } catch (_e) { /* fetch diretto */ } }
  return _dispatcher;
}

export class OllamaVisionProvider extends VisionProvider {
  get name() { return 'ollama'; }
  _cfg() { return (this.config && this.config.ollama) || {}; }
  _headers() {
    const h = { 'content-type': 'application/json' };
    const { apiKey } = this._cfg();
    if (apiKey) h.Authorization = `Bearer ${apiKey}`; // Ollama Cloud
    return h;
  }

  async healthCheck() {
    const { baseUrl, model, apiKey } = this._cfg();
    try {
      const d = await dispatcher(baseUrl);
      const opts = { method: 'GET', headers: this._headers() }; if (d) opts.dispatcher = d;
      const res = await fetch(`${baseUrl}/api/tags`, opts);
      if (res.status === 401 || res.status === 403) return { ok: false, detail: `auth Ollama rifiutata (HTTP ${res.status}) — API key non valida?` };
      if (!res.ok) {
        // cloud: alcuni deployment non espongono /api/tags → se c'è una key, considera il server raggiungibile (lo conferma analyze)
        if (apiKey) return { ok: true, detail: `ollama cloud raggiungibile (tags HTTP ${res.status}); modello "${model}" verificato in analyze` };
        return { ok: false, detail: `HTTP ${res.status} su ${baseUrl}/api/tags` };
      }
      const j = await res.json();
      const models = (j.models || []).map(m => m.name || m.model).filter(Boolean);
      const present = models.some(n => n === model || n.split(':')[0] === String(model).split(':')[0]);
      if (!present) {
        if (apiKey) return { ok: true, detail: `ollama cloud up; modello "${model}" non in /api/tags (disponibili: ${models.join(', ') || 'n/d'}) — verificato in analyze`, models };
        return { ok: false, detail: `modello "${model}" non installato (disponibili: ${models.join(', ') || 'nessuno'}) — esegui: ollama pull ${model}`, models };
      }
      return { ok: true, detail: `ollama up, modello ${model} disponibile`, models };
    } catch (e) {
      return { ok: false, detail: `Ollama non raggiungibile su ${baseUrl} (${e.message || e})${apiKey ? '' : " — avvia 'ollama serve'"}` };
    }
  }

  async analyze({ images, prompt, signal }) {
    const { baseUrl, model } = this._cfg();
    const body = {
      model,
      messages: [{ role: 'user', content: prompt, images: (images || []).map(im => im.base64) }],
      stream: false,
      format: 'json', // Ollama: forza output JSON
      options: { temperature: 0 }, // deterministico (Determinism First)
    };
    let res;
    try {
      const d = await dispatcher(baseUrl);
      const opts = { method: 'POST', headers: this._headers(), body: JSON.stringify(body), signal }; if (d) opts.dispatcher = d;
      res = await fetch(`${baseUrl}/api/chat`, opts);
    } catch (e) {
      if (e.name === 'AbortError') throw new VisionError('timeout Ollama', 'timeout', { baseUrl });
      throw new VisionError(`Ollama offline: ${e.message || e}`, 'offline', { baseUrl });
    }
    if (res.status === 404) throw new VisionError(`modello "${model}" inesistente`, 'model_missing', { model });
    if (!res.ok) throw new VisionError(`Ollama HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`, 'api', { status: res.status });
    let j;
    try { j = await res.json(); } catch (e) { throw new VisionError('risposta Ollama non JSON', 'invalid_response', {}); }
    const text = (j && j.message && j.message.content) || '';
    if (!text) throw new VisionError('risposta Ollama vuota', 'invalid_response', {});
    return { text, model, usage: { evalCount: j.eval_count, promptEvalCount: j.prompt_eval_count } };
  }
}

registerProvider('ollama', (config, logger) => new OllamaVisionProvider(config, logger));
