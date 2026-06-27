import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadEnv, getConfig } from '../../lib/vision/config.mjs';

test('config: getConfig default = ollama, niente hardcode fuori da qui', () => {
  const c = getConfig({});
  assert.equal(c.provider, 'ollama');
  assert.equal(c.ollama.baseUrl, 'http://localhost:11434');
  assert.equal(c.ollama.model, 'qwen2.5vl');
  assert.equal(c.timeout, 60000);
  assert.equal(c.maxRetry, 3);
  assert.equal(c.maxImages, 6);
  assert.equal(c.enableCache, true);
});

test('config: env sovrascrive i default (provider-agnostic)', () => {
  const c = getConfig({ VISION_PROVIDER: 'anthropic', OLLAMA_MODEL: 'llava', OLLAMA_TIMEOUT: '12345', VISION_ENABLE_CACHE: 'false', ANTHROPIC_API_KEY: 'k' });
  assert.equal(c.provider, 'anthropic');
  assert.equal(c.ollama.model, 'llava');
  assert.equal(c.ollama.timeout, 12345);
  assert.equal(c.enableCache, false);
  assert.equal(c.anthropic.apiKey, 'k');
});

test('config: loadEnv parsa .env e NON sovrascrive variabili già presenti', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmenv-'));
  fs.writeFileSync(path.join(dir, '.env'), '# commento\nCPMTEST_NEW=alpha\nCPMTEST_EXIST=fromfile\n\nVISION_MAX_IMAGES=9\n');
  process.env.CPMTEST_EXIST = 'preset';
  const r = loadEnv(dir);
  assert.equal(r.loaded, true);
  assert.equal(process.env.CPMTEST_NEW, 'alpha');
  assert.equal(process.env.CPMTEST_EXIST, 'preset'); // non sovrascritta
  assert.equal(process.env.VISION_MAX_IMAGES, '9');
  delete process.env.CPMTEST_NEW; delete process.env.CPMTEST_EXIST; delete process.env.VISION_MAX_IMAGES;
});

test('config: loadEnv senza file = no-op', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmenv2-'));
  assert.equal(loadEnv(dir).loaded, false);
});
