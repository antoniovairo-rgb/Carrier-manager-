/* CHECK 8 — REPORT COMPLETO (HTML + JSON)
   Per ogni Situation: id, seed, hash iniziale/finale, screenshot, issues per categoria,
   motivazione dei fallimenti. Più un riepilogo per categoria e l'esito globale. */
import fs from 'node:fs';
import path from 'node:path';

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function writeReports(outDir, data) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(data, null, 2));

  const { meta, categories, situations } = data;
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
<h2>Riepilogo categorie (quality gate)</h2>
<table><thead><tr><th>id</th><th>controllo</th><th>esito</th><th>scope</th><th>info</th><th>#issue</th><th>#warn</th></tr></thead><tbody>${catRows}</tbody></table>
<h2>Dettaglio per Situation</h2>
<table><thead><tr><th>#</th><th>testo</th><th>tipo</th><th>dHash</th><th>screenshot</th><th>problemi</th></tr></thead><tbody>${sitRows}</tbody></table>
</body></html>`;
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  return { ok, htmlPath: path.join(outDir, 'index.html'), failCats, failSits };
}
