#!/usr/bin/env node
/* [7.999.17] GUARDIANO — IL VOTO NON SI GONFIA COL VOLUME (collaudo PO «voto assurdo»: 8,4 senza gol). 300 partite del motore
   senza grafica: fra le gare in cui l'eroe non segna, quelle con voto >= 8 devono essere meno dell'1%; la pagella media della rosa
   resta fra 6 e 7. CPM_ROSSO=1 → __CPM_NO_VOTO16 (volume senza tetto): torna oltre il 3%. */
import '../../prototipo/partita-vera/motore-v2.js'; import '../../prototipo/partita-vera/partita.js';
const ROSSO = process.env.CPM_ROSSO === '1'; globalThis.window = ROSSO ? { __CPM_NO_VOTO16: 1 } : {};
const N = 300; let senza = 0, alti = 0, tutti = [];
for (let s = 1; s <= N; s++) { const P = globalThis.creaPartita({ registra: false, v2: true, seed: 5000 + s, casa: { sigla: 'OSP', forza: 72 }, ospite: { sigla: 'EROE', forza: 78 }, eroeLato: 'away', eroe: { nome: 'EROE', ovr: 82 } });
  P.tuttaSubito(); const pg = P.motore.pagelle(); const e = pg.find(x => x.eroe); tutti.push(...pg.map(x => x.voto));
  const gE = P.stato.eventi.filter(x => x.t === 'gol' && x.chi && x.chi.eroe).length; if (gE === 0) { senza++; if (e.voto >= 8) alti++; } }
const quota = 100 * alti / Math.max(1, senza), media = tutti.reduce((a, b) => a + b, 0) / tutti.length;
console.log(`partite senza gol dell'eroe ${senza} · voto >= 8 in ${alti} (${quota.toFixed(1)}%) · pagella media della rosa ${media.toFixed(2)}`);
if (ROSSO) { console.log(quota > 3 ? '✅ ROSSO come atteso: senza tetto il volume porta voti da 8 senza gol' : '❌ il rosso non riproduce'); process.exit(quota > 3 ? 0 : 1); }
const ok = senza >= 100 && quota < 1 && media >= 6 && media <= 7;
console.log(ok ? '✅ PASS voto-volume' : '❌ FAIL voto-volume'); process.exit(ok ? 0 : 1);
