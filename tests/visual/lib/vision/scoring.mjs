/* AI VISION REVIEW — SCORING (AI_VISION_REVIEW.md §QUALITY SCORE / §ANALISI AI)
   Da un set di punteggi-dimensione (0-100) calcola: Quality Score complessivo (0-100),
   verdict (PASS/WARNING/FAIL), Severity e Priority. Confidence arriva dal modello.
   Pesi espliciti e sommanti a 1 → score deterministico e spiegabile. */

// dimensioni valutate (coerenti con prompts.mjs)
export const DIMENSIONS = [
  'footballIntelligence', 'ballTracking', 'animationQuality', 'replayQuality',
  'cameraQuality', 'commentaryConsistency', 'highlightCompleteness', 'postHighlight',
  'fluidity', 'physics', 'npcBehaviour', 'visualQuality',
];

export const WEIGHTS = {
  footballIntelligence: 0.18, ballTracking: 0.10, animationQuality: 0.12, replayQuality: 0.08,
  cameraQuality: 0.10, commentaryConsistency: 0.06, highlightCompleteness: 0.10, postHighlight: 0.06,
  fluidity: 0.06, physics: 0.06, npcBehaviour: 0.04, visualQuality: 0.04,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const VERDICT_RANK = { PASS: 0, WARNING: 1, FAIL: 2, BLOCKED: 3 };

export function qualityScore(scores) {
  let sum = 0, wsum = 0;
  for (const d of DIMENSIONS) {
    const v = scores && typeof scores[d] === 'number' ? clamp(scores[d], 0, 100) : null;
    if (v == null) continue;
    sum += v * WEIGHTS[d]; wsum += WEIGHTS[d];
  }
  return wsum > 0 ? +(sum / wsum).toFixed(1) : null;
}

export function deriveVerdict(score) {
  if (score == null) return 'BLOCKED';
  if (score >= 75) return 'PASS';
  if (score >= 50) return 'WARNING';
  return 'FAIL';
}

// finale = il più severo tra verdict del modello e verdict derivato dallo score (conservativo)
export function reconcileVerdict(modelVerdict, derived) {
  const a = VERDICT_RANK[modelVerdict] != null ? modelVerdict : derived;
  return VERDICT_RANK[a] >= VERDICT_RANK[derived] ? a : derived;
}

export function severity(verdict, score) {
  if (verdict === 'BLOCKED') return 'unknown';
  if (verdict === 'FAIL') return score != null && score < 30 ? 'critical' : 'high';
  if (verdict === 'WARNING') return 'medium';
  return 'low';
}

export function priority(severity, confidence) {
  const conf = typeof confidence === 'number' ? confidence : 50;
  if (severity === 'critical') return 'P0';
  if (severity === 'high') return conf >= 60 ? 'P1' : 'P2';
  if (severity === 'medium') return conf >= 60 ? 'P2' : 'P3';
  if (severity === 'unknown') return 'P2';
  return 'P3';
}

// aggrega l'output grezzo del modello (già parsato a JSON) in un verdetto strutturato completo
export function aggregate(parsed) {
  const scores = (parsed && parsed.scores) || {};
  const score = qualityScore(scores);
  const derived = deriveVerdict(score);
  const verdict = reconcileVerdict(parsed && parsed.verdict, derived);
  const sev = severity(verdict, score);
  return {
    qualityScore: score,
    confidence: parsed && typeof parsed.confidence === 'number' ? clamp(parsed.confidence, 0, 100) : null,
    verdict, severity: sev, priority: priority(sev, parsed && parsed.confidence),
    derivedVerdict: derived, modelVerdict: (parsed && parsed.verdict) || null,
  };
}
