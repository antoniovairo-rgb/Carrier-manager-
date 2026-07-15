/* AI VISION REVIEW — GeminiVisionProvider (generateContent vision)
   [BL-19] analyze() implementato (pattern anthropic.mjs): immagini come inline_data base64
   nelle parts di generateContent. Proxy-aware (HTTPS_PROXY via undici). Nessuna modifica al Core Engine. */
import { VisionProvider, VisionError } from '../provider.mjs';
import { registerProvider } from '../registry.mjs';

let _dispatcher, _tried = false;
async function dispatcher() {
  if (_tried) return _dispatcher; _tried = true;
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) { try { const { ProxyAgent } = await import('undici'); _dispatcher = new ProxyAgent(proxy); } catch (_e) { /* fetch diretto */ } }
  return _dispatcher;
}

export class GeminiVisionProvider extends VisionProvider {
  get name() { return 'gemini'; }
  _cfg() { return (this.config && this.config.gemini) || {}; }

  async healthCheck() {
    const { apiKey, model } = this._cfg();
    if (!apiKey) return { ok: false, detail: 'GEMINI_API_KEY non impostata' };
    return { ok: true, detail: `gemini configurato (modello ${model})` };
  }

  async analyze({ images, prompt, signal }) {
    const { baseUrl, apiKey, model } = this._cfg();
    if (!apiKey) throw new VisionError('GEMINI_API_KEY mancante', 'offline', {});
    const parts = [
      ...(images || []).map(im => ({ inline_data: { mime_type: im.mime || 'image/png', data: im.base64 } })),
      { text: prompt },
    ];
    const opts = {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { maxOutputTokens: 800 } }),
      signal,
    };
    const d = await dispatcher(); if (d) opts.dispatcher = d;
    let res;
    try { res = await fetch(`${baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent`, opts); }
    catch (e) { if (e.name === 'AbortError' || e.name === 'TimeoutError') throw new VisionError('timeout Gemini', 'timeout', {}); throw new VisionError(`Gemini offline: ${e.message || e}`, 'offline', {}); }
    if (res.status === 404) throw new VisionError(`modello "${model}" inesistente`, 'model_missing', { model });
    if (!res.ok) throw new VisionError(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`, 'api', { status: res.status });
    const j = await res.json();
    const text = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('');
    if (!text) throw new VisionError('risposta Gemini vuota', 'invalid_response', {});
    return { text, model, usage: j.usageMetadata };
  }
}

registerProvider('gemini', (config, logger) => new GeminiVisionProvider(config, logger));
