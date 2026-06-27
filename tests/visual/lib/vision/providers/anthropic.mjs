/* AI VISION REVIEW — AnthropicVisionProvider (Claude vision)
   Secondo provider, dimostra che aggiungerne uno = nuova classe + registrazione,
   zero modifiche al Core Engine. Proxy-aware (HTTPS_PROXY via undici). */
import { VisionProvider, VisionError } from '../provider.mjs';
import { registerProvider } from '../registry.mjs';

let _dispatcher, _tried = false;
async function dispatcher() {
  if (_tried) return _dispatcher; _tried = true;
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) { try { const { ProxyAgent } = await import('undici'); _dispatcher = new ProxyAgent(proxy); } catch (_e) { /* fetch diretto */ } }
  return _dispatcher;
}

export class AnthropicVisionProvider extends VisionProvider {
  get name() { return 'anthropic'; }
  _cfg() { return (this.config && this.config.anthropic) || {}; }

  async healthCheck() {
    const { apiKey, model } = this._cfg();
    if (!apiKey) return { ok: false, detail: 'ANTHROPIC_API_KEY non impostata' };
    return { ok: true, detail: `anthropic configurato (modello ${model})` };
  }

  async analyze({ images, prompt, signal }) {
    const { baseUrl, apiKey, model, version } = this._cfg();
    if (!apiKey) throw new VisionError('ANTHROPIC_API_KEY mancante', 'offline', {});
    const content = [
      ...(images || []).map(im => ({ type: 'image', source: { type: 'base64', media_type: im.mime || 'image/png', data: im.base64 } })),
      { type: 'text', text: prompt },
    ];
    const opts = {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': version || '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: 'user', content }] }),
      signal,
    };
    const d = await dispatcher(); if (d) opts.dispatcher = d;
    let res;
    try { res = await fetch(`${baseUrl}/v1/messages`, opts); }
    catch (e) { if (e.name === 'AbortError') throw new VisionError('timeout Anthropic', 'timeout', {}); throw new VisionError(`Anthropic offline: ${e.message || e}`, 'offline', {}); }
    if (res.status === 404) throw new VisionError(`modello "${model}" inesistente`, 'model_missing', { model });
    if (!res.ok) throw new VisionError(`Anthropic HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`, 'api', { status: res.status });
    const j = await res.json();
    const text = (j.content || []).map(c => c.text || '').join('');
    if (!text) throw new VisionError('risposta Anthropic vuota', 'invalid_response', {});
    return { text, model, usage: j.usage };
  }
}

registerProvider('anthropic', (config, logger) => new AnthropicVisionProvider(config, logger));
