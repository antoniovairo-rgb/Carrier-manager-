import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { VisionReviewEngine } from '../../lib/vision/engine.mjs';
import { VisionProvider, VisionError } from '../../lib/vision/provider.mjs';
import { DIMENSIONS } from '../../lib/vision/scoring.mjs';

// immagine fittizia su disco (l'Engine la legge e la base64-encoda; il mock la ignora)
function tmpImage() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmimg-'));
  const p = path.join(dir, 'f.png'); fs.writeFileSync(p, Buffer.from([1, 2, 3, 4, 5]));
  return p;
}
function tmpCacheDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'cpmecache-')); }
const goodJson = () => JSON.stringify({ situationRecognition: { recognized: 'tiro in porta', matchesExpected: true }, scores: Object.fromEntries(DIMENSIONS.map(d => [d, 80])), confidence: 75, errors: [], warnings: [], suggestions: ['x'], rootCause: '', verdict: 'PASS' });
const cfg = over => ({ provider: 'mock', maxRetry: 3, timeout: 500, enableCache: true, promptFile: null, mock: { model: 'mock-1' }, ...over });

class MockProvider extends VisionProvider {
  constructor(c, l, behavior) { super(c, l); this.behavior = behavior; this.calls = 0; }
  get name() { return 'mock'; }
  async healthCheck() { return this.behavior.health || { ok: true }; }
  async analyze() { this.calls++; return this.behavior.analyze(this.calls); }
}
const hl = () => ({ id: 'h1', context: { gi: 0, text: 'tiro', intent: 'shot' }, images: [{ phase: 'main', path: tmpImage() }] });

test('engine: analisi valida → verdict+score+confidence', async () => {
  const p = new MockProvider(cfg(), null, { analyze: () => ({ text: goodJson() }) });
  const eng = new VisionReviewEngine(cfg(), p, null, tmpCacheDir());
  const out = await eng.review([hl()]);
  assert.equal(out.skipped, false);
  assert.equal(out.results.length, 1);
  assert.equal(out.results[0].verdict, 'PASS');
  assert.equal(out.results[0].qualityScore, 80);
  assert.equal(out.results[0].confidence, 75);
  assert.equal(out.provider, 'mock');
  assert.equal(out.model, 'mock-1');
});

test('engine: cache incrementale → seconda review NON richiama il provider', async () => {
  const dir = tmpCacheDir();
  const item = hl();
  const p1 = new MockProvider(cfg(), null, { analyze: () => ({ text: goodJson() }) });
  await new VisionReviewEngine(cfg(), p1, null, dir).review([item]);
  assert.equal(p1.calls, 1);
  const p2 = new MockProvider(cfg(), null, { analyze: () => { throw new Error('non deve essere chiamato'); } });
  const out2 = await new VisionReviewEngine(cfg(), p2, null, dir).review([item]);
  assert.equal(p2.calls, 0); // servito dalla cache su disco
  assert.equal(out2.results[0].cached, 'disk');
});

test('engine: retry su errore transitorio poi successo', async () => {
  const p = new MockProvider(cfg(), null, { analyze: (n) => { if (n < 3) throw new VisionError('giù', 'offline'); return { text: goodJson() }; } });
  const eng = new VisionReviewEngine(cfg({ enableCache: false }), p, null, tmpCacheDir());
  const out = await eng.review([hl()]);
  assert.equal(out.results[0].verdict, 'PASS');
  assert.equal(p.calls, 3);
  assert.equal(out.results[0].attempts, 3);
});

test('engine: errore PERMANENTE (model_missing) → no retry, BLOCKED + failurePackage', async () => {
  const p = new MockProvider(cfg(), null, { analyze: () => { throw new VisionError('manca modello', 'model_missing'); } });
  const eng = new VisionReviewEngine(cfg({ enableCache: false }), p, null, tmpCacheDir());
  const out = await eng.review([hl()]);
  assert.equal(p.calls, 1); // nessun retry su errore permanente
  assert.equal(out.results[0].verdict, 'BLOCKED');
  assert.equal(out.results[0].failurePackage.kind, 'model_missing');
});

test('engine: risposta non-JSON → BLOCKED invalid_response', async () => {
  const p = new MockProvider(cfg(), null, { analyze: () => ({ text: 'non sono json' }) });
  const eng = new VisionReviewEngine(cfg({ enableCache: false }), p, null, tmpCacheDir());
  const out = await eng.review([hl()]);
  assert.equal(out.results[0].verdict, 'BLOCKED');
  assert.equal(out.results[0].failurePackage.kind, 'invalid_response');
});

test('engine: provider offline (healthCheck ko) → skip, NON blocca', async () => {
  const p = new MockProvider(cfg(), null, { health: { ok: false, detail: 'offline' }, analyze: () => ({ text: goodJson() }) });
  const eng = new VisionReviewEngine(cfg(), p, null, tmpCacheDir());
  const out = await eng.review([hl()]);
  assert.equal(out.skipped, true);
  assert.equal(p.calls, 0);
});
