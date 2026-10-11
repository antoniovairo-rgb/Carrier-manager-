import fs from 'node:fs';
const R = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map(JSON.parse);
let all = 0; const A = [], B = [];
for (const r of R) { const cast = r.cast || [];
  for (const x of r.res) { all++; const c = cast.find(c => c.hl === x.hl) || {};
    const base = { k: r.k, hl: x.hl, min: c.min, occ: c.tipo, label: x.label, tipo: x.tipo, ok: x.ok, key: x.key, fam: x.fam, ovl: x.ovl, ev: x.ev, outKind: x.outKind,
      txt: (r.txt || []).filter(t => c.min != null && Math.abs(t.m - c.min) <= 1).map(t => ({ m: t.m, txt: t.txt, pd: t.pd })) };
    if (c.tipo === 'cross') A.push(base);
    if (x.tipo === 'cross' || /traversone|cross|pennell|palla in area/i.test(x.label || '')) B.push(base); } }
console.log('partite', R.length, '· scene', all, '· OCCASIONE cross (cast tipo cross)', A.length, 'non riuscite', A.filter(a => !a.ok).length);
console.log('· AZIONE cross dell eroe (tipo cross o etichetta cross/traversone/palla in area)', B.length, 'non riuscite', B.filter(b => !b.ok).length);
console.log('errori', R.filter(r => r.err).length);
const OUT = process.env.OUTD || '.';
fs.writeFileSync(OUT + '/cross-occ.json', JSON.stringify(A, null, 1)); fs.writeFileSync(OUT + '/cross-act.json', JSON.stringify(B, null, 1));
for (const a of A) console.log(`k${a.k} hl${a.hl} m${a.min} | ${a.label} → ${a.key}${a.ok ? '' : ' (NON riuscita)'} | riquadro «${a.ovl}» [${a.fam}] | motore ${a.ev.join(' ')} | cronaca: ${a.txt.map(t => t.m + ' ' + t.txt.slice(0, 120) + ' [' + t.pd + ']').join(' ▸ ') || '-'}`);
