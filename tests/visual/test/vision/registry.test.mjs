import test from 'node:test';
import assert from 'node:assert/strict';
import { registerProvider, createProvider, listProviders, hasProvider, _resetRegistry } from '../../lib/vision/registry.mjs';
import { VisionProvider } from '../../lib/vision/provider.mjs';

test('registry: register/create/list (Open/Closed)', () => {
  _resetRegistry();
  class P extends VisionProvider { get name() { return 'x'; } }
  registerProvider('x', (c, l) => new P(c, l));
  assert.ok(hasProvider('x'));
  assert.deepEqual(listProviders(), ['x']);
  const inst = createProvider('x', {}, null);
  assert.equal(inst.name, 'x');
});

test('registry: provider sconosciuto → errore esplicito', () => {
  _resetRegistry();
  assert.throws(() => createProvider('nope', {}, null), /provider sconosciuto/);
});

test('registry: tutti i provider documentati si auto-registrano', async () => {
  _resetRegistry();
  await import('../../lib/vision/providers/index.mjs');
  for (const name of ['ollama', 'anthropic', 'openai', 'gemini']) assert.ok(hasProvider(name), `manca ${name}`);
});
