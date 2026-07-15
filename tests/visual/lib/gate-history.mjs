/* QUALITY GATE — REGRESSION HISTORY (BL-20, ROADMAP Phase 5 · «Acceptance + Regression come step CI»)
   Persiste una riga COMPATTA per ogni run del gate in gate-history.json → abilita il TREND della REGRESSIONE
   tra build (il fingerprint 00001505 = insieme vuoto di fallimenti; qualsiasi altro = deriva). È il gemello
   di lib/vision/history.mjs ma per il GATE STRUTTURALE invece che percettivo. Additivo, harness-only: scrive
   un solo file accanto a run-summary.json, non tocca l'esito del gate. Cap a HISTORY_MAX run (rolling).
   Nessun Date.now interno: il timestamp arriva da summary.generatedAt (deterministico per i test). */
import fs from 'node:fs';
import path from 'node:path';

const HISTORY_FILE = 'gate-history.json';
const HISTORY_MAX = 200;

// riga compatta di storico da un run-summary del Failure Collector
export function makeRecord(summary) {
  const c = summary.counts || {};
  return {
    ts: summary.generatedAt || null,
    gameVersion: summary.gameVersion || null,
    seed: summary.seed != null ? summary.seed : null,
    total: summary.total != null ? summary.total : null,
    ok: !!summary.ok,
    fingerprint: summary.fingerprint || null,
    failures: c.failures != null ? c.failures : (summary.failures || []).length,
    checksFailed: c.checksFailed != null ? c.checksFailed : null,
    warnings: c.warnings != null ? c.warnings : null,
  };
}

export function readHistory(dir) {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(dir, HISTORY_FILE), 'utf8'));
    return Array.isArray(arr) ? arr : [];
  } catch (_e) { return []; }
}

// appende la riga della run corrente e ritorna lo storico aggiornato (rolling cap)
export function appendHistory(dir, summary) {
  const prior = readHistory(dir);
  if (!summary || typeof summary.fingerprint !== 'string') return prior; // niente di misurabile
  const next = [...prior, makeRecord(summary)].slice(-HISTORY_MAX);
  try { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, HISTORY_FILE), JSON.stringify(next, null, 2)); } catch (_e) {}
  return next;
}

// trend derivato dallo storico (già comprensivo della run corrente): deriva del fingerprint + regressione
export function computeTrend(history) {
  const runs = (history || []).filter(h => h && typeof h.fingerprint === 'string');
  if (!runs.length) return null;
  const cur = runs[runs.length - 1];
  const prev = runs.length >= 2 ? runs[runs.length - 2] : null;
  const fpChanged = prev ? cur.fingerprint !== prev.fingerprint : false;
  const failDelta = prev ? (cur.failures - prev.failures) : null;
  // REGRESSIONE = una run pulita (prev.ok) che ora fallisce (cur !ok) → il segnale che la CI deve gridare
  const regressed = !!(prev && prev.ok && !cur.ok);
  // RIPARATA = una run rotta ora tornata pulita
  const recovered = !!(prev && !prev.ok && cur.ok);
  const cleanStreak = (() => { let n = 0; for (let i = runs.length - 1; i >= 0; i--) { if (runs[i].ok) n++; else break; } return n; })();
  return {
    current: cur.fingerprint,
    previous: prev ? prev.fingerprint : null,
    fpChanged,                        // il fingerprint è cambiato dall'ultima run (nuovo insieme di fallimenti)
    failDelta,                        // >0 = più fallimenti · <0 = meno · null = prima run
    regressed,                        // pulita → rotta (ALERT per la CI)
    recovered,                        // rotta → pulita
    ok: cur.ok,
    cleanStreak,                      // run consecutive pulite (fino a quella corrente)
    runs: runs.length,
    spark: runs.slice(-24).map(r => (r.ok ? 1 : 0)),  // ultime 24 run (1=verde, 0=rosso) per la sparkline
  };
}
