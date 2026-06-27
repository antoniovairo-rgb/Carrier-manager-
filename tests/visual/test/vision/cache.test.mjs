import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { imagesHash, cacheKey, sha256, CacheStore } from '../../lib/vision/cache.mjs';

test('cache: imagesHash stabile e deduplicante', () => {
  const a = [{ phase: 'main', base64: 'AAAA' }];
  const b = [{ phase: 'main', base64: 'AAAA' }];
  const c = [{ phase: 'main', base64: 'BBBB' }];
  assert.equal(imagesHash(a), imagesHash(b));
  assert.notEqual(imagesHash(a), imagesHash(c));
});

test('cache: cacheKey include modello e versione prompt', () => {
  const imgs = [{ phase: 'main', base64: 'AAAA' }];
  assert.notEqual(cacheKey({ images: imgs, model: 'm1', promptVersion: 'v1' }), cacheKey({ images: imgs, model: 'm2', promptVersion: 'v1' }));
  assert.notEqual(cacheKey({ images: imgs, model: 'm1', promptVersion: 'v1' }), cacheKey({ images: imgs, model: 'm1', promptVersion: 'v2' }));
});

test('cache: store get/set + contatori hit/miss', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmcache-'));
  const store = new CacheStore(dir, true);
  assert.equal(store.get('k1'), null); // miss
  store.set('k1', { v: 42 });
  assert.deepEqual(store.get('k1'), { v: 42 }); // hit
  assert.equal(store.hits, 1); assert.equal(store.misses, 1);
});

test('cache: disabilitata = bypass totale', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpmcache2-'));
  const store = new CacheStore(dir, false);
  store.set('k', { v: 1 });
  assert.equal(store.get('k'), null);
});

test('cache: sha256 deterministico', () => {
  assert.equal(sha256(Buffer.from('x')), sha256(Buffer.from('x')));
});
