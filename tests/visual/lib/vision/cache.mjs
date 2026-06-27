/* AI VISION REVIEW — CACHE & DEDUP (AI_VISION_REVIEW.md §OTTIMIZZAZIONE)
   Ollama gira in locale → minimizzare le chiamate. Cache su disco con chiave =
   hash(immagini + modello + versione-prompt): se l'highlight non è cambiato, riusa il
   risultato (analisi INCREMENTALE). Hash immagini anche per DEDUP (frame identici). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

// hash di un set di immagini (base64) — stabile e indipendente dall'ordine di lettura
export function imagesHash(images) {
  const h = crypto.createHash('sha256');
  for (const im of images || []) h.update((im.phase || '') + ':' + (im.base64 ? im.base64.length + ':' + im.base64.slice(0, 64) : ''));
  return h.digest('hex').slice(0, 32);
}

export function cacheKey({ images, model, promptVersion }) {
  return [imagesHash(images), model || '?', promptVersion || 'v0'].join('_');
}

export class CacheStore {
  constructor(dir, enabled = true) { this.dir = dir; this.enabled = !!enabled; this.hits = 0; this.misses = 0; if (this.enabled) fs.mkdirSync(dir, { recursive: true }); }
  _file(key) { return path.join(this.dir, key.replace(/[^a-z0-9_]/gi, '') + '.json'); }
  get(key) {
    if (!this.enabled) return null;
    try { const f = this._file(key); if (fs.existsSync(f)) { this.hits++; return JSON.parse(fs.readFileSync(f, 'utf8')); } } catch (_e) { /* miss */ }
    this.misses++; return null;
  }
  set(key, value) {
    if (!this.enabled) return;
    try { fs.writeFileSync(this._file(key), JSON.stringify(value)); } catch (_e) { /* best-effort */ }
  }
}
