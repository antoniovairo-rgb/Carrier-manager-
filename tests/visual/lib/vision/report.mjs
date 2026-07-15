/* AI VISION REVIEW — REPORT HTML professionale (AI_VISION_REVIEW.md §REPORT)
   Overview (provider/modello/versione), per-highlight (situation rilevata, validator
   PASS/FAIL via verdict, Quality/Confidence, errori/warning/suggerimenti, root cause,
   timeline screenshot, tempo analisi/benchmark) e decisione finale. Scrive anche ai-vision.json. */
import fs from 'node:fs';
import path from 'node:path';
import { DIMENSIONS } from './scoring.mjs';

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const vcls = v => ({ PASS: 'vpass', WARNING: 'vwarn', FAIL: 'vfail', BLOCKED: 'vblock' }[v] || 'vblock');

export function writeVisionReport(outDir, review, meta = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'ai-vision.json'), JSON.stringify({ meta, ...review }, null, 2));

  const results = review.results || [];
  const decision = review.skipped ? 'SKIPPED'
    : (review.verdicts && (review.verdicts.FAIL || review.verdicts.BLOCKED)) ? 'FAIL'
      : (review.verdicts && review.verdicts.WARNING) ? 'WARNING' : 'PASS';

  const overview = `<div class="kpis">
    <span class="kpi">Provider<br><b>${esc(review.provider)}</b></span>
    <span class="kpi">Modello<br><b>${esc(review.model)}</b></span>
    <span class="kpi">Prompt<br><b>${esc(review.promptVersion || '-')}</b></span>
    <span class="kpi">Highlight<br><b>${results.length}</b></span>
    <span class="kpi">Quality medio<br><b>${esc(review.avgQuality == null ? '-' : review.avgQuality)}</b></span>
    <span class="kpi">Verdetti<br><b>${esc(JSON.stringify(review.verdicts || {}))}</b></span>
    ${review.perf ? `<span class="kpi">Tempo totale<br><b>${esc(review.perf.totalMs)}ms</b></span><span class="kpi">Cache<br><b>${esc(review.perf.cacheHits)}/${esc(review.perf.cacheHits + review.perf.cacheMisses)}</b></span>` : ''}
  </div>`;

  // [BL-19] TREND STORICO — benchmark evolutivo della qualità percettiva tra build (sparkline dependency-free)
  const t = review.trend;
  const trendBlock = t ? (() => {
    const arrow = t.dir === 'up' ? '▲' : t.dir === 'down' ? '▼' : t.dir === 'flat' ? '▬' : '•';
    const dcls = t.dir === 'up' ? 'tup' : t.dir === 'down' ? 'tdown' : 'tflat';
    const dtxt = t.delta == null ? 'prima run' : `${t.delta > 0 ? '+' : ''}${t.delta} vs precedente`;
    const lo = t.worst, hi = t.best, span = hi - lo || 1;
    const bars = (t.spark || []).map(q => {
      const h = 6 + Math.round(((q - lo) / span) * 34);
      return `<span class="bar" style="height:${h}px" title="${esc(q)}"></span>`;
    }).join('');
    return `<div class="trend">
      <div class="thead">📈 Trend storico <span class="muted">(${esc(t.runs)} run · dedotto da ai-vision-history.json)</span></div>
      <div class="trow">
        <span class="tk">Quality medio <b class="${dcls}">${esc(t.current)} ${arrow}</b> <span class="muted">${esc(dtxt)}</span></span>
        <span class="tk muted">best <b>${esc(t.best)}</b> · worst <b>${esc(t.worst)}</b> · media <b>${esc(t.mean)}</b></span>
      </div>
      <div class="spark">${bars}</div>
    </div>`;
  })() : '';

  const card = r => {
    const dims = DIMENSIONS.map(d => `<span class="chip">${esc(d)}: <b>${r.scores && r.scores[d] != null ? esc(r.scores[d]) : '-'}</b></span>`).join('');
    const shots = (r.images || []).map(im => `<figure><img src="${esc(im.file)}" loading="lazy"><figcaption>${esc(im.phase)}</figcaption></figure>`).join('');
    const list = (title, arr, cls) => (arr && arr.length) ? `<div class="lst ${cls || ''}"><b>${title}</b><ul>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
    const fp = r.failurePackage ? `<div class="lst vfail"><b>Failure Package</b><ul><li>kind: ${esc(r.failurePackage.kind)}</li><li>${esc(r.failurePackage.message)}</li></ul></div>` : '';
    return `<div class="card ${vcls(r.verdict)}">
      <div class="chd"><span class="vbadge ${vcls(r.verdict)}">${esc(r.verdict)}</span> <b>#${esc(r.gi)}</b> ${esc(r.situation)} <span class="muted">(intent: ${esc(r.intent || '?')})</span></div>
      <div class="meta">Quality <b>${esc(r.qualityScore == null ? '-' : r.qualityScore)}</b> · Confidence <b>${esc(r.confidence == null ? '-' : r.confidence)}</b> · Severity <b>${esc(r.severity)}</b> · Priority <b>${esc(r.priority)}</b> ${r.providerMs != null ? '· ' + esc(r.providerMs) + 'ms' : ''} ${r.cached ? '· <i>cache:' + esc(r.cached) + '</i>' : ''}</div>
      ${r.recognized ? `<div class="rec">Riconosciuto: <i>${esc(r.recognized.recognized)}</i> · matchesExpected: <b>${esc(String(r.recognized.matchesExpected))}</b></div>` : ''}
      <div class="dims">${dims}</div>
      ${r.rootCause ? `<div class="rc"><b>Root cause:</b> ${esc(r.rootCause)}</div>` : ''}
      ${list('Errori', r.errors, 'vfail')}${list('Warning', r.warnings, 'vwarn')}${list('Suggerimenti', r.suggestions)}
      ${fp}
      <div class="shots">${shots}</div>
    </div>`;
  };

  const body = review.skipped
    ? `<div class="banner vwarn">⏭️ AI Vision SALTATA — ${esc(review.reason || 'provider non disponibile')} (secondo livello, non blocca la CI)</div>`
    : `<div class="banner ${vcls(decision)}">Decisione finale: ${esc(decision)} <span class="muted">— AI Vision è secondo livello, non blocca la CI</span></div>
       ${overview}
       ${trendBlock}
       ${results.map(card).join('')}`;

  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>AI Vision Review — CPM</title>
<style>
:root{color-scheme:dark}body{font:14px/1.5 system-ui,sans-serif;margin:0;padding:24px;background:#0b1020;color:#e6ebf5}
h1{margin:0 0 4px}.sub{color:#94a3b8;margin-bottom:18px}
.banner{padding:14px 18px;border-radius:12px;font-size:18px;font-weight:800;margin:10px 0 18px}
.vpass{background:#064e3b;color:#6ee7b7}.vwarn{background:#3a2f0a;color:#fcd34d}.vfail{background:#4c0519;color:#fda4af}.vblock{background:#1f2937;color:#cbd5e1}
.kpis{margin:0 0 16px}.kpi{display:inline-block;background:#111827;border:1px solid #1f2937;border-radius:8px;padding:8px 14px;margin:0 8px 8px 0}.kpi b{font-size:17px}
.card{background:#0f1629;border:1px solid #1f2937;border-left-width:5px;border-radius:10px;padding:14px 16px;margin:0 0 14px}
.card.vpass{border-left-color:#10b981}.card.vwarn{border-left-color:#f59e0b}.card.vfail{border-left-color:#ef4444}.card.vblock{border-left-color:#64748b}
.chd{font-size:15px;margin-bottom:4px}.vbadge{font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px}
.meta{color:#cbd5e1;font-size:12px;margin-bottom:6px}.rec{font-size:13px;margin-bottom:6px}.rc{margin:6px 0;color:#fcd34d}
.dims .chip{display:inline-block;font-size:11px;background:#1e293b;border-radius:6px;padding:2px 7px;margin:2px 3px 0 0}
.lst{margin:6px 0;font-size:13px}.lst ul{margin:2px 0 0;padding-left:18px}.lst.vfail li{color:#fda4af}.lst.vwarn li{color:#fcd34d}
.shots{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.shots figure{margin:0;text-align:center}.shots img{height:110px;border-radius:6px;border:1px solid #334155}.shots figcaption{font-size:10px;color:#94a3b8}
.muted{color:#64748b}
.trend{background:#0f1629;border:1px solid #1f2937;border-radius:10px;padding:12px 16px;margin:0 0 16px}
.thead{font-size:14px;font-weight:800;margin-bottom:8px}
.trow{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;margin-bottom:10px}.tk b{font-size:15px}
.tup{color:#6ee7b7}.tdown{color:#fda4af}.tflat{color:#cbd5e1}
.spark{display:flex;align-items:flex-end;gap:3px;height:44px}
.spark .bar{width:8px;background:linear-gradient(#38bdf8,#0ea5e9);border-radius:2px 2px 0 0;display:inline-block}
</style></head><body>
<h1>AI Vision Review — Live Match</h1>
<div class="sub">${esc(meta.generatedAt || '')} · gioco <b>${esc(meta.gameVersion || '?')}</b> · provider <b>${esc(review.provider)}</b>/<b>${esc(review.model)}</b></div>
${body}
</body></html>`;
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  return { htmlPath: path.join(outDir, 'index.html'), decision };
}
