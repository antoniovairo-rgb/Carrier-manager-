import fs from 'node:fs';
const files = process.argv.slice(2);
const recs = files.flatMap(f => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)));
const EXP = { lunge: 'kick', slide: 'tackle' };
const rows = [];
for (const r of recs) for (const s of (r.scene || [])) {
  const g = (s.res && s.res.defGesto) || null; const fr = s.frames || [];
  const dur = fr.filter(f => f.ph !== 'hl_intro' && f.ph !== 'int' && !/^int/.test(f.ph || ''));
  const pool = dur.length ? dur : fr;
  let pk = pool[0] || {}; for (const f of pool) if ((f.gw || 0) > (pk.gw || 0)) pk = f;
  const fromIntro = fr.filter(f => f.ph === 'hl_intro' && f.gName).map(f => f.gName);
  const clipAny = [...new Set(pool.map(f => f.gName).filter(Boolean))];
  rows.push({ k: r.k, hl: s.hl, min: s.min, dif: s.dif, g, key: s.res && s.res.key, ok: s.res && s.res.ok, ovl: s.res && s.res.outKind,
    gName: pk.gName || null, gw: pk.gw ?? null, dPk: pk.d ?? null, dmin: Math.min(...fr.filter(f => f.d != null).map(f => f.d)),
    exp: g ? (EXP[g] ?? null) : null, ok2: g && EXP[g] ? (pk.gName === EXP[g]) : null, clipAny, introClip: [...new Set(fromIntro)].join('|') || null, nDur: dur.length });
}
const cnt = (a, f) => a.reduce((n, x) => n + (f(x) ? 1 : 0), 0);
const med = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? s[(s.length - 1) >> 1] : null; };
const dec = rows.filter(r => r.g === 'lunge' || r.g === 'slide');
console.log('scene difensive:', rows.length, '· partite:', new Set(rows.map(r => r.k)).size, '· gesto deciso lunge/slide:', dec.length, '(lunge', cnt(dec, r => r.g === 'lunge') + ', slide', cnt(dec, r => r.g === 'slide') + ')');
console.log('clip al picco (fasi di scelta/esito):', JSON.stringify(dec.reduce((o, r) => (o[r.gName] = (o[r.gName] || 0) + 1, o), {})));
console.log('clip attesa al picco (lunge→kick, slide→tackle):', cnt(dec, r => r.ok2), '/', dec.length, '· senza clip al picco:', cnt(dec, r => !r.gName));
console.log('residuo di intro (clip della scena precedente) presente:', cnt(dec, r => r.introClip), '/', dec.length);
console.log('distanza al picco: mediana', med(dec.map(r => r.dPk)), '· entro 4 u:', cnt(dec, r => r.dPk != null && r.dPk <= 4), '· con clip attesa mediana', med(dec.filter(r => r.ok2).map(r => r.dPk)), '· senza clip mediana', med(dec.filter(r => !r.gName).map(r => r.dPk)));
console.log('distanza minima scena: mediana', med(dec.map(r => r.dmin)));
for (const r of rows) console.log([r.k, r.hl, r.g, r.gName, r.gw && +r.gw.toFixed(2), r.dPk, r.dmin, r.exp, r.ok2, r.key, r.ovl, 'intro=' + r.introClip, r.nDur].join('\t'));
if (process.env.OUTJSON) fs.writeFileSync(process.env.OUTJSON, JSON.stringify(rows, null, 1));
