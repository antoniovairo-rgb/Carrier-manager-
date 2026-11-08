#!/usr/bin/env node
/* [giro 125] analisi dei file di distanze-125.mjs → tabelle markdown. Uso: node distanze-125-analisi.mjs acceso.json spento.json [glb...] */
import fs from 'node:fs';
const M_U = 1.05; /* metri per unita': x -50..50 = 105 m (stima dichiarata) */
const REAL = { header: 16.5, shot: 30, volley: 25, default: 30 };
function righe(file) { const d = JSON.parse(fs.readFileSync(file)); const out = [];
  for (const p of d.partite) { const byS = {};
    for (const c of p.cont) { const i = c.sk % 10000; (byS[i] = byS[i] || []).push(c); }
    for (const i of Object.keys(byS)) { const L = byS[i]; const c = L.find(x => !x.bg && x.act) || L.find(x => x.act) || L[0];
      const s = p.sit[i] || {}; const r = (p.R || []).find(x => x.hl === +i) || {};
      const t = String(s.t || ''); const lab = String(r.label || '');
      const orig = /angolo|corner/i.test(t + lab) ? 'angolo' : /cross|traversone|dalla fascia|dal fondo|palla in area|sul secondo palo|sul primo palo/i.test(t + lab) ? 'cross' : /contropiede|ripartenza|lancio/i.test(t + lab) ? 'contropiede' : /punizione|rigore/i.test(t + lab) ? 'piazzato' : 'azione';
      const gesto = (c.act || c.tipo || '?') + (r.variante ? ':' + r.variante : '');
      out.push({ file, sk: p.sk, sd: p.sd, i: +i, min: null, titolo: t, label: lab, origine: orig, tipo: c.tipo, act: c.act, variante: r.variante || '', gesto, gx: c.gx, z: c.z, dPorta: +(c.gx * M_U).toFixed(1), dCentro: +(Math.hypot(c.gx, c.z) * M_U).toFixed(1), db: c.db, bg: c.bg, a: c.a, key: r.key, ok: r.ok, glb: c.glb }); } }
  return out; }
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : null; };
export function tabella(R, chiave, soglia) { const G = {}; for (const r of R) (G[chiave(r)] = G[chiave(r)] || []).push(r);
  let o = '| gruppo | n | mediana m | p90 m | max m | oltre soglia | % oltre |\n|---|---|---|---|---|---|---|\n';
  for (const k of Object.keys(G).sort((a, b) => G[b].length - G[a].length)) { const d = G[k].map(r => r.dCentro); const s = soglia(k, G[k][0]); const ov = d.filter(x => x > s).length;
    o += `| ${k} | ${d.length} | ${q(d, .5)} | ${q(d, .9)} | ${Math.max(...d)} | >${s} m | ${(100 * ov / d.length).toFixed(0)}% (${ov}) |\n`; } return o; }
if (process.argv[1].endsWith('distanze-125-analisi.mjs')) { for (const f of process.argv.slice(2)) { const R = righe(f); fs.writeFileSync(f.replace('.json', '.righe.json'), JSON.stringify(R));
  console.log('## ' + f + ' · scene con contatto ' + R.length); console.log(tabella(R, r => r.act || r.tipo, k => (k === 'header' ? REAL.header : REAL.default))); } }
