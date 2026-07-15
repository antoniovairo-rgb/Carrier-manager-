/* AI VISION REVIEW — SCORING STORICO (BL-19, ROADMAP Phase 2/5 · KPI «Confidence Score medio · benchmark evolutivi»)
   Persiste una riga COMPATTA per ogni run DELIBERATA (npm run ai-vision) in ai-vision-history.json → abilita il
   TREND della qualità percettiva tra build (dashboard intelligente / benchmark evolutivi). Additivo, harness-only:
   scrive un solo file accanto ad ai-vision.json/index.html, non tocca il gate. Le run SKIPPED (provider giù) non
   inquinano lo storico. Cap a HISTORY_MAX run (rolling). Nessun Date.now interno: il timestamp arriva da meta. */
import fs from 'node:fs';
import path from 'node:path';

const HISTORY_FILE = 'ai-vision-history.json';
const HISTORY_MAX = 200;

// riga compatta di storico da una review completata (non-skipped)
export function makeRecord(review, meta = {}, decision = null) {
  return {
    ts: meta.generatedAt || null,
    gameVersion: meta.gameVersion || null,
    provider: review.provider || null,
    model: review.model || null,
    promptVersion: review.promptVersion || null,
    avgQuality: typeof review.avgQuality === 'number' ? review.avgQuality : null,
    verdicts: review.verdicts || {},
    count: (review.results || []).length,
    decision: decision || null,
  };
}

export function readHistory(dir) {
  try {
    const raw = fs.readFileSync(path.join(dir, HISTORY_FILE), 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_e) { return []; }
}

// appende la riga della run corrente (skip se review.skipped o record vuoto) e ritorna lo storico aggiornato
export function appendHistory(dir, review, meta = {}, decision = null) {
  const prior = readHistory(dir);
  if (review && review.skipped) return prior;              // provider giù → niente dato reale, non inquinare
  const rec = makeRecord(review, meta, decision);
  if (rec.avgQuality == null && rec.count === 0) return prior; // nulla di misurabile
  const next = [...prior, rec].slice(-HISTORY_MAX);
  try { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, HISTORY_FILE), JSON.stringify(next, null, 2)); } catch (_e) {}
  return next;
}

// trend derivato dallo storico (già comprensivo della run corrente): delta vs precedente, best/worst/mean, sparkline
export function computeTrend(history) {
  const runs = (history || []).filter(h => h && typeof h.avgQuality === 'number');
  if (!runs.length) return null;
  const qs = runs.map(r => r.avgQuality);
  const cur = runs[runs.length - 1];
  const prev = runs.length >= 2 ? runs[runs.length - 2] : null;
  const best = Math.max(...qs), worst = Math.min(...qs);
  const mean = +(qs.reduce((s, v) => s + v, 0) / qs.length).toFixed(1);
  const delta = prev ? +(cur.avgQuality - prev.avgQuality).toFixed(1) : null;
  return {
    current: cur.avgQuality,
    previous: prev ? prev.avgQuality : null,
    delta,                                   // >0 = migliorato · <0 = peggiorato · null = prima run
    dir: delta == null ? 'first' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
    best, worst, mean, runs: runs.length,
    spark: qs.slice(-24),                    // ultime 24 run per la sparkline
  };
}
