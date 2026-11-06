#!/usr/bin/env node
/* [collaudo grafico 180] Dai dati dei censimenti (DATI_DIR/schermate-*.json, partita-*.json) costruisce l'elenco dei RILIEVI MISURATI, raggruppati
   per (tipo, schermata, firma), con tutti i formati/club in cui compaiono e la foto del primo caso. Scrive DATI_DIR/rilievi.json e lo stampa.
   I testi coperti dalla fascia fissa a META' scorrimento non sono difetti (si scorre); conta solo il coperto a FINE scorrimento. Non tocca src/. */
import fs from 'node:fs';
import path from 'node:path';
import { DATI_DIR } from './c180-lib.mjs';
const file = fs.readdirSync(DATI_DIR).filter(f => /^(schermate|partita)-.*\.json$/.test(f));
const G = new Map(); const mancanti = []; const errori = []; let nMis = 0;
const add = (tipo, sch, firma, caso, misura, foto) => { const k = tipo + '|' + sch + '|' + firma; let g = G.get(k); if (!g) { g = { tipo, sch, firma, casi: [], misura, foto }; G.set(k, g); } if (!g.casi.includes(caso)) g.casi.push(caso); };
for (const f of file) { const d = JSON.parse(fs.readFileSync(path.join(DATI_DIR, f)));
  for (const m of d.mancanti || []) mancanti.push(f.replace('.json', '') + ': ' + m); for (const e of (d.errs || []).slice(0, 3)) errori.push(f + ': ' + e);
  for (const [sch, per] of Object.entries(d.R || {})) for (const [caso, r] of Object.entries(per)) { nMis++;
    if (r.hs > 0) add('scorrimento orizzontale', sch, '', caso, `${r.hs} px`, r.foto);
    for (const c of r.sottoCtr || []) { const firma = `${c.testo} su ${c.fondo}`; add(c.rap < 2 ? 'contrasto illeggibile' : 'contrasto', sch, firma, caso, `«${c.t}» ${c.rap}:1 (soglia ${c.soglia}, ${c.fs}px/${c.fw}) testo ${c.testo} fondo ${c.fondo}`, r.foto); }
    for (const s of r.spezzate || []) add('parola spezzata', sch, s.parola, caso, `«${s.parola}» in «${s.testo}»`, r.foto);
    for (const t of r.tagliati || []) add('testo tagliato', sch, t.s.slice(0, 60), caso, `${t.s} ${t.k === 'x' ? 'larghezza ' + t.sw + '>' + t.cw : 'altezza ' + t.sh + '>' + t.ch}`, r.foto);
    for (const x of (r.fondo && r.fondo.coperti) || []) add('coperto a fine scorrimento', sch, x.fascia.slice(0, 30), caso, `«${x.t}» a y ${x.y} sotto la fascia «${x.fascia}» (da y ${x.fy})`, r.foto);
    for (const p of r.piccoli || []) { const mn = Math.min(p.w, p.h); if (mn < 44) add('tocco < 44 px', sch, p.s.slice(0, 60), caso, `${p.s} ${p.w}x${p.h}`, r.foto); }
    for (const v of r.v1 || []) add('resto V1', sch, `${v.bg}|${v.col}`.replace(/rgba?\(0, 0, 0, 0\)\|?/, ''), caso, `${v.s} «${v.t}» fondo ${v.bg} testo ${v.col}`, r.foto);
    for (const c of r.chiari || []) add('fondo chiaro', sch, c.bg, caso, `${c.s} «${c.t}» ${c.w}x${c.h} fondo ${c.bg}`, r.foto);
    for (const s of r.sovTesti || []) { if (/Sostieni|Idee e feedback/.test(s.a + s.b)) continue; add('testi sovrapposti', sch, s.a + '|' + s.b, caso, `«${s.a}» e «${s.b}» ${s.ox}x${s.oy} px`, r.foto); }
    for (const x of r.fuori || []) add('fuori schermo', sch, x.s.slice(0, 50), caso, `${x.s} esce di ${x.px} px`, r.foto);
    if (r.undefinedNaN) add('dato rotto (undefined/NaN)', sch, '', caso, `${r.undefinedNaN} occorrenze`, r.foto);
    if (r.sostitutivi) add('caratteri sostitutivi', sch, '', caso, `${r.sostitutivi}`, r.foto);
  } }
const R = [...G.values()].sort((a, b) => a.tipo.localeCompare(b.tipo) || a.sch.localeCompare(b.sch));
fs.writeFileSync(path.join(DATI_DIR, 'rilievi.json'), JSON.stringify({ nMis, R, mancanti, errori }, null, 1));
console.log(`misure ${nMis} · gruppi ${R.length}`); const per = {}; for (const r of R) per[r.tipo] = (per[r.tipo] || 0) + 1; console.log(per);
for (const r of R) console.log(`[${r.tipo}] ${r.sch} · ${r.casi.length} casi (${r.casi.slice(0, 6).join(',')}) · ${r.misura.slice(0, 150)} · ${r.foto}`);
console.log('\nmancanti:', mancanti); console.log('errori:', errori.slice(0, 10));
