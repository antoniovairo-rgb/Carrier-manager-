#!/usr/bin/env node
/* [7.999.150 PO-030/PO-022 Passo 6, strato 5] GUARDIANO in node delle MANOVRE VERE: 24 partite del motore sulle configurazioni vere
   della vissuta S12 (fixtures/cfg-202-s12.json). MISURATO prima dell'intervento (48 partite, 306 occasioni dell'eroe): nessuna occasione
   a centrocampo, il 91,8% dopo almeno un passaggio della stessa squadra (media 2,7), uno-due nel 21% (37% fra le linee).
   VERDE: l'occasione porta il suo preludio (gli ultimi passaggi veri) in almeno l'85% dei casi, e almeno il 10% e' uno-due.
   ROSSO (__CPM_NO_P6M): nessun preludio. In entrambi i bracci gol e tiri IDENTICI: il preludio e' una lettura, non sposta i sorteggi.
   Uso: node manovre-150.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
const braccio = (W) => {
  const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W);
  const o = { occ: 0, prel: 0, unodue: 0, gol: 0, tiri: 0 };
  for (let s = 0; s < CFG.length; s++) {
    const c0 = CFG[s]; const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: ((c0.seed >>> 0) ^ 150) >>> 0 }));
    const on = (evs) => { for (const e of evs || []) {
      if (e.t === 'gol') o.gol++; else if (e.t === 'tiro') o.tiri++;
      else if (e.t === 'occasione_eroe') { o.occ++; const P = e.preludio || []; if (P.length) o.prel++;
        for (let i = 0; i + 1 < P.length; i++) if (P[i].da && P[i + 1].a && P[i].da.i === P[i + 1].a.i && P[i].a && P[i + 1].da && P[i].a.i === P[i + 1].da.i) { o.unodue++; break; } } } };
    const B = 22; for (let m = 1; m <= 46; m++) for (let b = 0; b < B; b++) on(M.tick({ min: Math.min(m, 45), dt: 1 / B, dec: true }));
    M.chiedi.riprendi({ centro: true, lato: 'away' }); for (let m = 46; m <= 93; m++) for (let b = 0; b < B; b++) on(M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true }));
  }
  return o;
};
const V = braccio(undefined), R = braccio({ __CPM_NO_P6M: true });
console.log('VERDE', JSON.stringify(V)); console.log('ROSSO (__CPM_NO_P6M)', JSON.stringify(R));
const g = [];
if (!(V.occ >= 50 && V.prel / V.occ >= 0.85)) g.push('verde: preludio su ' + V.prel + ' di ' + V.occ + ' occasioni (serve 85%)');
if (!(V.unodue / Math.max(1, V.occ) >= 0.10)) g.push('verde: uno-due ' + V.unodue + ' su ' + V.occ + ' (serve 10%)');
if (R.prel !== 0) g.push('rosso: preludio presente anche spento (' + R.prel + ')');
if (V.gol !== R.gol || V.tiri !== R.tiri || V.occ !== R.occ) g.push('determinismo: gol/tiri/occasioni diversi fra i bracci ' + JSON.stringify([V.gol, R.gol, V.tiri, R.tiri, V.occ, R.occ]));
if (g.length) { console.log('❌ manovre-150'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ manovre-150 verde (preludio ${(100 * V.prel / V.occ).toFixed(1)}%, uno-due ${(100 * V.unodue / V.occ).toFixed(1)}%, e il rosso si vede)`);
