/* [giro 237] tabella prima/dopo da out/t237/tempi.jsonl (ultima corsa per coppia guardiano/braccio) */
import fs from 'node:fs';
const R = {}; for (const l of fs.readFileSync('out/t237/tempi.jsonl', 'utf8').split('\n').filter(Boolean)) { const r = JSON.parse(l); (R[r.g] = R[r.g] || {})[r.braccio] = r; }
const mm = s => s == null ? '—' : (s >= 60 ? `${Math.floor(s / 60)}′${String(s % 60).padStart(2, '0')}″` : `${s}″`);
const es = r => r ? (r.code === 0 ? 'verde' : 'ROSSO (' + r.code + ')') : '—';
const righe = Object.entries(R).sort((a, b) => ((b[1].prima || {}).s || 0) - ((a[1].prima || {}).s || 0));
let tp = 0, td = 0; console.log('| Guardiano | Prima (Babel nel browser) | Dopo (pagina tradotta) | Δ | Pagine aperte | Esito prima | Esito dopo |\n|---|---|---|---|---|---|---|');
for (const [g, x] of righe) { const p = x.prima, d = x.dopo; if (p && d) { tp += p.s; td += d.s; }
  console.log(`| ${g} | ${mm(p && p.s)} | ${mm(d && d.s)} | ${p && d ? Math.round(100 * (d.s - p.s) / p.s) + '%' : '—'} | ${d ? d.pagine : (p ? p.pagine : '—')} | ${es(p)} | ${es(d)} |`); }
console.log(`| **Totale (coppie complete)** | **${mm(tp)}** | **${mm(td)}** | **${tp ? Math.round(100 * (td - tp) / tp) + '%' : '—'}** | | | |`);
