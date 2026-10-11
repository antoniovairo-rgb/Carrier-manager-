import fs from 'node:fs';
const R = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map(JSON.parse);
const FAM = { post: /tiro:post|palo/, saved: /tiro:saved|parata/, blocked: /tiro:blocked|murato/, wide: /tiro:fuori/, goal: /tiro:goal|gol/ };
let n = 0, ok = 0, bad = []; const byFam = {};
for (const r of R) for (const x of r.res) {
  if (!x.fam || !FAM[x.fam]) continue; n++;
  const ev = (x.ev || []).join(' ');
  const coer = FAM[x.fam].test(ev);
  byFam[x.fam] = byFam[x.fam] || { n: 0, ok: 0 }; byFam[x.fam].n++; if (coer) byFam[x.fam].ok++;
  if (coer) ok++; else bad.push(`k${r.k} hl${x.hl} «${x.ovl}» [${x.fam}] motore: ${ev}`);
}
console.log('scene con riquadro di tiro:', n, '· coerenti con il motore:', ok, '· incoerenti:', bad.length);
console.log(JSON.stringify(byFam));
bad.slice(0, 10).forEach(b => console.log('  ' + b));
