// Primo punto di scarto fra due giri nel registro __CPM_EV (senza ts) e nel calendario HL.
import fs from 'node:fs';
const js = (v) => JSON.parse(v.slice(v.indexOf('[')));
const rd = (f) => { const l = fs.readFileSync(`out-giro3/${f}.log`, 'utf8').split('\n'); const g = (k) => l.find(x => x.startsWith('GIRO3:' + k + ' ')) || ''; return { ev: js(g('ev')), tl: js(g('timeline')), hl: JSON.parse(g('hl').slice(9)).hlTimes }; };
const [p, q] = process.argv.slice(2);
const a = rd(p), b = rd(q);
const sa = a.ev.map(e => JSON.stringify(e)), sb = b.ev.map(e => JSON.stringify(e));
let i = 0; while (i < sa.length && i < sb.length && sa[i] === sb[i]) i++;
console.log(`${p} vs ${q}: registro eventi, voci identiche prima dello scarto = ${i} (lunghezze ${sa.length}/${sb.length})`);
for (let k = Math.max(0, i - 1); k < Math.min(i + 2, sa.length); k++) console.log(`  ${p}[${k}] ${sa[k]?.slice(0, 260)}`);
for (let k = Math.max(0, i - 1); k < Math.min(i + 2, sb.length); k++) console.log(`  ${q}[${k}] ${sb[k]?.slice(0, 260)}`);
console.log(`  calendario HL ${p}: ${a.hl}`); console.log(`  calendario HL ${q}: ${b.hl}`);
