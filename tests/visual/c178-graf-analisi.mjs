/* aggrega i JSON del censimento in tabelle (stdout) */
import fs from 'node:fs'; import path from 'node:path'; import { SCRATCH } from './c178-graf-lib.mjs';
const fm = (process.env.C178_FORMATI || 'tel,tabv,tabo,pc').split(',');
const D = {}; for (const k of fm) { const p = path.join(SCRATCH, `schermate-${k}.json`); if (fs.existsSync(p)) D[k] = JSON.parse(fs.readFileSync(p)); }
const mode = process.argv[2] || 'sintesi';
const ids = [...new Set(Object.values(D).flatMap(d => Object.keys(d.R || {})))];
if (mode === 'sintesi') {
  console.log('schermata | ' + fm.join(' | '));
  for (const id of ids) console.log(id + ' | ' + fm.map(k => { const m = D[k] && D[k].R[id]; if (!m) return '—'; return `HS${m.hs} fu${m.nFuori} tg${m.nTagliati} sT${m.sovTesti.length} sR${m.sovr.length} t<40:${m.nPiccoli} med${m.gap.medV} L${m.gap.nLargoV}/${m.gap.nLargoH} S${m.gap.nStretto}`; }).join(' | '));
}
if (mode === 'dettaglio') { const k = process.argv[3], id = process.argv[4]; console.log(JSON.stringify(D[k].R[id], null, 1).slice(0, 6000)); }
if (mode === 'gap') { for (const k of fm) for (const id of ids) { const m = D[k] && D[k].R[id]; if (!m) continue; const g = m.gap; if (g.nLargoV || g.nLargoH || g.nStretto || m.sovr.length) console.log(`${k} ${id}: medV ${g.medV} largoV ${g.nLargoV} ${JSON.stringify(g.largo.slice(0, 2).map(x => x.g + ' ' + x.a + ' -> ' + x.b))} largoH ${g.nLargoH} ${JSON.stringify(g.largoH.slice(0, 2).map(x => x.g + ' ' + x.a))} stretto ${g.nStretto} ${JSON.stringify(g.stretto.slice(0, 2))} sovr ${JSON.stringify(m.sovr.slice(0, 2))}`); } }
