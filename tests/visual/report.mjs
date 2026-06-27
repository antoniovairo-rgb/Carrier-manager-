/* CHECK 8 — REPORT COMPLETO (HTML + JSON)
   Per ogni Situation: id, seed, hash iniziale/finale, screenshot, issues per categoria,
   motivazione dei fallimenti. Più un riepilogo per categoria e l'esito globale. */
import fs from 'node:fs';
import path from 'node:path';

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function writeReports(outDir, data) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(data, null, 2));

  const { meta, categories, situations, runSummary } = data;
  const failCats = categories.filter(c => !c.pass);
  const failSits = situations.filter(s => s.issues.length);
  const ok = failCats.length === 0;

  const totWarn = categories.reduce((n, c) => n + (c.warnings ? c.warnings.length : 0), 0);
  const catRows = categories.map(c => `<tr class="${c.pass ? 'ok' : 'bad'}"><td>${esc(c.id)}</td><td>${esc(c.title)}</td><td>${c.pass ? '✅' : '❌'}</td><td>${c.scope}</td><td>${esc(JSON.stringify(c.info || {}))}</td><td>${c.issues.length}</td><td>${(c.warnings || []).length}</td></tr>`).join('');

  const sitRows = situations.map(s => {
    const w = s.warnings || [];
    const cls = s.issues.length ? 'bad' : (w.length ? 'warn' : 'ok');
    const shots = [s.shotInitial, s.shotFinal].filter(Boolean).map(f => `<a href="${esc(f)}" target="_blank"><img src="${esc(f)}" loading="lazy"></a>`).join('');
    const issues = s.issues.length ? '<ul>' + s.issues.map(i => `<li><b>${esc(i.check)}</b>: ${esc(i.msg)}</li>`).join('') + '</ul>' : '';
    const warns = w.length ? '<ul class="warn">' + w.map(i => `<li><b>${esc(i.check)}</b>: ${esc(i.msg)}</li>`).join('') + '</ul>' : '';
    const cell = (issues + warns) || '<span class="muted">—</span>';
    return `<tr class="${cls}"><td>${s.gi}</td><td>${esc(s.text)}</td><td>${esc(s.type)}</td><td><code>${esc(s.hashInitial || '')}</code></td><td>${shots}</td><td>${cell}</td></tr>`;
  }).join('');

  // ── LMQP-9: DASHBOARD — sintesi normalizzata dal run-summary (check, coverage, perf, baseline, failure) ──
  const chips = (arr) => (arr && arr.length ? arr.map(x => `<span class="chip">${esc(x)}</span>`).join('') : '<span class="muted">—</span>');
  let dashHtml = '';
  if (runSummary) {
    const rs = runSummary;
    const checkPills = (rs.checks || []).map(c => `<span class="pill ${c.pass ? 'pok' : 'pbad'}" title="${esc(c.id)}: ${c.issues} issue / ${c.warnings} warn">${c.pass ? '✅' : '❌'} ${esc(c.id)}</span>`).join('');
    const cov = rs.coverage || {};
    const perf = rs.performance && rs.performance.frames ? rs.performance : null;
    const bl = rs.baseline || {};
    const perfHtml = perf
      ? `<span class="kpi">FPS (headless)<br><b>${esc(perf.frames.fps)}</b></span>
         <span class="kpi">Frame p95<br><b>${esc(perf.frames.p95Ms)}ms</b></span>
         <span class="kpi">JS heap<br><b>${perf.heap ? esc(perf.heap.usedMB) + 'MB' : '—'}</b></span>
         <span class="kpi">Load<br><b>${perf.nav && perf.nav.loadMs != null ? esc(perf.nav.loadMs) + 'ms' : '—'}</b></span>`
      : '<span class="muted">perf non disponibile</span>';
    const blHtml = `modalità <b>${esc(bl.mode || '—')}</b>${bl.drift != null ? ` · drift <b class="${bl.drift ? 'bad' : 'good'}">${esc(bl.drift)}</b>` : ''}${bl.added != null ? ` · nuove <b>${esc(bl.added)}</b>` : ''}${bl.keys != null ? ` · firme <b>${esc(bl.keys)}</b>` : ''}`;
    const failRows = (rs.failures || []).slice(0, 60).map(f => `<tr class="bad"><td>${esc(f.check)}</td><td>${f.gi != null ? '#' + esc(f.gi) : '—'}</td><td>${esc(f.intent || '')}</td><td>${esc(f.situation || '')}</td><td>${esc(f.msg)}</td></tr>`).join('');
    const failTable = (rs.failures && rs.failures.length)
      ? `<h3>Failure (${rs.failures.length}${rs.failures.length > 60 ? ' · prime 60' : ''})</h3>
         <table><thead><tr><th>check</th><th>#</th><th>intent</th><th>situation</th><th>messaggio</th></tr></thead><tbody>${failRows}</tbody></table>`
      : '<p class="good">Nessun failure — tutti i check verdi.</p>';
    dashHtml = `<h2>LMQP Dashboard</h2>
<div class="dash">
  <div class="pills">${checkPills}</div>
  <div style="margin:10px 0">
    <span class="kpi">Esito<br><b class="${rs.ok ? 'good' : 'bad'}">${rs.ok ? 'PASS' : 'FAIL'}</b></span>
    <span class="kpi">Check falliti<br><b>${esc(rs.counts.checksFailed)}/${esc(rs.counts.checks)}</b></span>
    <span class="kpi">Failure<br><b>${esc(rs.counts.failures)}</b></span>
    <span class="kpi">Warning<br><b>${esc(rs.counts.warnings)}</b></span>
    <span class="kpi">Fingerprint<br><b><code>${esc(rs.fingerprint)}</code></b></span>
  </div>
  <h3>Performance <span class="muted">(slice headless, warn-only)</span></h3>
  <div>${perfHtml}</div>
  <h3>Decision baseline (regressione)</h3>
  <div>${blHtml}</div>
  ${(rs.replay && rs.replay.length) ? `<h3>Replay traces <span class="muted">(LMQP-10, frame-by-frame)</span></h3><div>${rs.replay.map(t => `<span class="chip">#${esc(t.gi)} · ${esc(t.frames)}f${t.durMs != null ? ' · ' + esc(t.durMs) + 'ms' : ''}</span>`).join('')}</div>` : ''}
  <h3>Coverage</h3>
  <div class="covgrid">
    <div><b>intents</b><br>${chips(cov.intents)}</div>
    <div><b>hlTypes</b><br>${chips(cov.hlTypes)}</div>
    <div><b>ballStates</b><br>${chips(cov.ballStates)}</div>
    <div><b>outcomeKeys</b><br>${chips(cov.outcomeKeys)}</div>
  </div>
  ${failTable}
</div>`;
  }

  // ── LMQP-11: REPLAY VIEWER — rigioca 2D top-down le tracce per-frame (LMQP-10) inline nel report ──
  let replayViewer = '';
  if (runSummary && runSummary.replay && runSummary.replay.length) {
    const traces = {};
    for (const t of runSummary.replay) {
      try { traces[t.gi] = JSON.parse(fs.readFileSync(path.join(outDir, t.file), 'utf8')); } catch (_e) { /* trace mancante: skip */ }
    }
    const opts = runSummary.replay.map(t => `<option value="${esc(t.gi)}">#${esc(t.gi)} · ${esc(t.frames)}f</option>`).join('');
    replayViewer = `<h2>Replay Viewer <span class="muted">(LMQP-11 · 2D top-down, palla=giallo)</span></h2>
<div class="dash">
  <select id="rvSel">${opts}</select>
  <button id="rvPlay">▶ Play</button>
  <input id="rvScrub" type="range" min="0" max="0" value="0" style="width:240px;vertical-align:middle">
  <span id="rvInfo" class="muted"></span>
  <div><canvas id="rvCanvas" width="540" height="360" style="background:#0a2415;border:1px solid #1f2937;border-radius:8px;margin-top:8px;max-width:100%"></canvas></div>
</div>
<script>
const RV=${JSON.stringify(traces)};
(function(){
  const sel=document.getElementById('rvSel'),cv=document.getElementById('rvCanvas'),ctx=cv.getContext('2d');
  const scrub=document.getElementById('rvScrub'),playBtn=document.getElementById('rvPlay'),info=document.getElementById('rvInfo');
  if(!sel||!cv)return; const W=cv.width,H=cv.height,M=24;
  const PX=gx=>M+(gx/100)*(W-2*M), PY=gy=>M+(gy/100)*(H-2*M);
  let cur=null,fi=0,playing=false;
  function load(gi){cur=RV[gi]||null;fi=0;scrub.max=cur&&cur.frames.length?cur.frames.length-1:0;scrub.value=0;draw();}
  function pitch(){ctx.fillStyle='#0a2415';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#1f5132';ctx.lineWidth=1.5;ctx.strokeRect(M,M,W-2*M,H-2*M);ctx.beginPath();ctx.moveTo(W/2,M);ctx.lineTo(W/2,H-M);ctx.stroke();ctx.beginPath();ctx.arc(W/2,H/2,28,0,7);ctx.stroke();}
  function draw(){pitch();if(!cur||!cur.frames.length){info.textContent='nessuna traccia';return;}const f=cur.frames[Math.min(fi,cur.frames.length-1)];
    if(f.players)for(const p of f.players){if(p[0]==null)continue;ctx.fillStyle='#cbd5e1';ctx.beginPath();ctx.arc(PX(p[0]),PY(p[1]),4,0,7);ctx.fill();}
    if(f.ball){const bx=f.ball.x+50,by=f.ball.z/0.68+50;ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.arc(PX(bx),PY(by),5,0,7);ctx.fill();}
    info.textContent='frame '+(fi+1)+'/'+cur.frames.length+(f.phase?(' · '+f.phase):'');}
  function tick(){if(!playing||!cur)return;fi=(fi+1)%cur.frames.length;scrub.value=fi;draw();setTimeout(()=>requestAnimationFrame(tick),140);}
  sel.onchange=()=>load(sel.value);
  scrub.oninput=()=>{playing=false;playBtn.textContent='▶ Play';fi=+scrub.value;draw();};
  playBtn.onclick=()=>{playing=!playing;playBtn.textContent=playing?'⏸ Pausa':'▶ Play';if(playing)tick();};
  load(sel.value);
})();
</script>`;
  }

  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>CPM — Validazione Situations</title>
<style>
:root{color-scheme:light dark}body{font:14px/1.5 system-ui,sans-serif;margin:0;padding:24px;background:#0b1020;color:#e6ebf5}
h1{margin:0 0 4px}.sub{color:#94a3b8;margin-bottom:20px}
.banner{padding:16px 20px;border-radius:12px;font-size:20px;font-weight:800;margin-bottom:20px}
.pass{background:#064e3b;color:#6ee7b7}.fail{background:#4c0519;color:#fda4af}
table{border-collapse:collapse;width:100%;margin:12px 0 28px;background:#111827;border-radius:10px;overflow:hidden}
th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #1f2937;vertical-align:top;font-size:13px}
th{background:#1e293b;position:sticky;top:0}
tr.bad{background:#2a0e16}tr.warn{background:#2a230e}tr.ok td:first-child{color:#6ee7b7}
img{height:74px;border-radius:6px;margin:2px;border:1px solid #334155}
code{font-size:11px;color:#fbbf24}.muted{color:#64748b}
ul{margin:0;padding-left:16px}li{color:#fda4af}ul.warn li{color:#fcd34d}
.kpi{display:inline-block;background:#111827;border:1px solid #1f2937;border-radius:8px;padding:8px 14px;margin:0 8px 8px 0}
.kpi b{font-size:18px}
.dash{background:#0f1629;border:1px solid #1f2937;border-radius:12px;padding:16px 18px;margin:8px 0 28px}
.dash h3{margin:16px 0 6px;font-size:14px;color:#cbd5e1}
.pills{display:flex;flex-wrap:wrap;gap:6px}
.pill{font-size:12px;font-weight:700;padding:4px 9px;border-radius:999px;border:1px solid #334155}
.pok{background:#06291e;color:#6ee7b7}.pbad{background:#3a0d16;color:#fda4af}
.chip{display:inline-block;font-size:11px;background:#1e293b;color:#cbd5e1;border-radius:6px;padding:2px 7px;margin:2px 3px 0 0}
.covgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.covgrid>div{background:#111827;border:1px solid #1f2937;border-radius:8px;padding:8px 10px}
.good{color:#6ee7b7}.bad{color:#fda4af}
</style></head><body>
<h1>CPM — Validazione automatica Situations</h1>
<div class="sub">${esc(meta.generatedAt)} · versione gioco <b>${esc(meta.gameVersion)}</b> · seed PRNG <code>${esc(meta.seed)}</code> · ${meta.total} Situations</div>
<div class="banner ${ok ? 'pass' : 'fail'}">${ok ? '✅ PASS — nessuna regressione' : `❌ FAIL — ${failCats.length} categorie, ${failSits.length} Situations con problemi`}</div>
<div>
  <span class="kpi">Situations<br><b>${meta.total}</b></span>
  <span class="kpi">Categorie OK<br><b>${categories.filter(c => c.pass).length}/${categories.length}</b></span>
  <span class="kpi">Situations senza errori<br><b>${situations.length - failSits.length}/${situations.length}</b></span>
  <span class="kpi">Warning (soft)<br><b>${totWarn}</b></span>
  <span class="kpi">Determinismo<br><b>${meta.maxJitterBits === 0 ? 'OK' : esc(meta.maxJitterBits ?? '—')}</b></span>
</div>
${dashHtml}
${replayViewer}
<h2>Riepilogo categorie (quality gate)</h2>
<table><thead><tr><th>id</th><th>controllo</th><th>esito</th><th>scope</th><th>info</th><th>#issue</th><th>#warn</th></tr></thead><tbody>${catRows}</tbody></table>
<h2>Dettaglio per Situation</h2>
<table><thead><tr><th>#</th><th>testo</th><th>tipo</th><th>dHash</th><th>screenshot</th><th>problemi</th></tr></thead><tbody>${sitRows}</tbody></table>
</body></html>`;
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  return { ok, htmlPath: path.join(outDir, 'index.html'), failCats, failSits };
}
