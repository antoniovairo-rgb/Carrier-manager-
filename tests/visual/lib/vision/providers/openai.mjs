/* AI VISION REVIEW — OpenAIVisionProvider (Chat Completions vision)
   [BL-19] analyze() implementato (pattern anthropic.mjs): immagini base64 come data-URL
   in content multimodale. Proxy-aware (HTTPS_PROXY via undici). Nessuna modifica al Core Engine. */
import { VisionProvider, VisionError } from '../provider.mjs';
import { registerProvider } from '../registry.mjs';

let _dispatcher, _tried = false;
async function dispatcher() {
  if (_tried) return _dispatcher; _tried = true;
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) { try { const { ProxyAgent } = await import('undici'); _dispatcher = new ProxyAgent(proxy); } catch (_e) { /* fetch diretto */ } }
  return _dispatcher;
}

export class OpenAIVisionProvider extends VisionProvider {
  get name() { return 'openai'; }
  _cfg() { return (this.config && this.config.openai) || {}; }

  async healthCheck() {
    const { apiKey, model } = this._cfg();
    if (!apiKey) return { ok: false, detail: 'OPENAI_API_KEY non impostata' };
    return { ok: true, detail: `openai configurato (modello ${model})` };
  }

  async analyze({ images, prompt, signal }) {
    const { baseUrl, apiKey, model } = this._cfg();
    if (!apiKey) throw new VisionError('OPENAI_API_KEY mancante', 'offline', {});
    const content = [
      ...(images || []).map(im => ({ type: 'image_url', image_url: { url: `data:${im.mime || 'image/png'};base64,${im.base64}` } })),
      { type: 'text', text: prompt },
    ];
    const opts = {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: 'user', content }] }),
      signal,
    };
    const d = await dispatcher(); if (d) opts.dispatcher = d;
    let res;
    try { res = await fetch(`${baseUrl}/v1/chat/completions`, opts); }
    catch (e) { if (e.name === 'AbortError' || e.name === 'TimeoutError') throw new VisionError('timeout OpenAI', 'timeout', {}); throw new VisionError(`OpenAI offline: ${e.message || e}`, 'offline', {}); }
    if (res.status === 404) throw new VisionError(`modello "${model}" inesistente`, 'model_missing', { model });
    if (!res.ok) throw new VisionError(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`, 'api', { status: res.status });
    const j = await res.json();
    const text = (((j.choices || [])[0] || {}).message || {}).content || '';
    if (!text) throw new VisionError('risposta OpenAI vuota', 'invalid_response', {});
    return { text, model, usage: j.usage };
  }
}

registerProvider('openai', (config, logger) => new OpenAIVisionProvider(config, logger));
