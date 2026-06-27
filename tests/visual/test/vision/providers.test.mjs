import test from 'node:test';
import assert from 'node:assert/strict';
import { OllamaVisionProvider } from '../../lib/vision/providers/ollama.mjs';
import { VisionError } from '../../lib/vision/provider.mjs';

const cfg = { ollama: { baseUrl: 'http://127.0.0.1:1', model: 'qwen2.5vl', timeout: 1000 } };

test('ollama: healthCheck offline → {ok:false} senza lanciare', async () => {
  const p = new OllamaVisionProvider(cfg, null);
  const h = await p.healthCheck();
  assert.equal(h.ok, false);
  assert.match(h.detail, /non raggiungibile/);
});

test('ollama: analyze offline → VisionError kind offline', async () => {
  const p = new OllamaVisionProvider(cfg, null);
  await assert.rejects(
    () => p.analyze({ images: [{ phase: 'main', base64: 'AAAA' }], prompt: 'x' }),
    (e) => { assert.ok(e instanceof VisionError); assert.equal(e.kind, 'offline'); return true; },
  );
});

test('ollama: name = "ollama"', () => {
  assert.equal(new OllamaVisionProvider(cfg, null).name, 'ollama');
});
