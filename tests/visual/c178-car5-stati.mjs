#!/usr/bin/env node
/* Collaudo carriera 178 n.5 — controlli di coerenza sui salvataggi di fine stagione (s1.json.gz, s2.json.gz, ...). */
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib'; import { fileURLToPath } from 'node:url';
const DD = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/collaudi/dati-carriera-178-5');
const files = fs.readdirSync(DD).filter(f => /^s\d+\.json\.gz$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
const righe = [];
for (const f of files) {
  const st = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DD, f))));
  const raw = st['cpm-v3']; if (!raw) { righe.push(`${f}: nessun cpm-v3`); continue; }
  const p = JSON.parse(raw).player || JSON.parse(raw);
  const mh = p.matchHistory || []; const stag = mh.filter(m => m.season === p.season - 1 || m.season === p.season);
  const sumG = mh.reduce((a, m) => a + (m.goals || 0), 0), sumA = mh.reduce((a, m) => a + (m.assists || 0), 0);
  const hist = (p.history || []).map(h => `S${h.season}:${h.goals}g/${h.assists}a/${h.matches}p`).join(' ');
  const tm = (p.teammates || []).slice(0, 3).map(t => t.name + '@' + (t.club || t.clubId || '?')).join(',');
  righe.push(`| ${f} | S${p.season} W${p.week} età ${p.age} | ${p.club && p.club.n} (${p.club && p.club.lg}) | ovr ${p.ovr} | stag g${p.goals} a${p.assists} p${p.matches} | carriera g${p.totalGoals} a${p.totalAssists} p${p.totalMatches} | mh ${mh.length} (somma g${sumG} a${sumA}) | storia ${hist} | ct ${JSON.stringify(p.contract)} | bank ${p.bankBalance} | trofei ${(p.trophies || []).length} | compagni ${tm} |`);
}
console.log(righe.join('\n'));
