#!/usr/bin/env node
/* [7.999.19] GUARDIANO — NIENTE CODA DI GOLEADE (collaudo PO «risultato assurdo»: 10-0 all'86'). Motore senza grafica, come nella
   partita vissuta (occasioni dell'eroe spente), squadra dell'eroe 95 contro 50, 200 partite. Verde: sette o piu' gol in meno del 2,5%
   delle partite, scarto di 5+ sotto il 9%, e la squadra forte segna comunque piu' di 2 gol di media. CPM_ROSSO=1 → __CPM_NO_GEST19. */
import '../../prototipo/partita-vera/motore-v2.js'; import '../../prototipo/partita-vera/partita.js';
const ROSSO = process.env.CPM_ROSSO === '1', ROSSO98 = process.env.CPM_ROSSO98 === '1'; globalThis.window = ROSSO ? { __CPM_NO_GEST19: 1 } : ROSSO98 ? { __CPM_NO_G98: 1 } : {};
const crea = cfg => globalThis.creaMotoreV2({ ...cfg, occasioniV2: false });
const N = 200, r = [];
for (let s = 1; s <= N; s++) { const P = globalThis.creaPartita({ crea, registra: false, v2: true, seed: 9100 + s, casa: { sigla: 'EROE', forza: 95 }, ospite: { sigla: 'OSP', forza: 50 }, eroeLato: 'home', eroe: { nome: 'EROE', ovr: 95 } });
  P.tuttaSubito(); const g = P.stato.eventi.filter(e => e.t === 'gol'); const h = g.filter(e => e.lato === 'home').length; r.push([h, g.length - h]); }
const sette = 100 * r.filter(x => x[0] >= 7).length / N, cinque = 100 * r.filter(x => x[0] - x[1] >= 5).length / N, media = r.reduce((a, x) => a + x[0], 0) / N;
console.log(`95 contro 50, ${N} partite: 7+ gol ${sette.toFixed(1)}% · scarto 5+ ${cinque.toFixed(1)}% · gol di media ${media.toFixed(2)}`);
if (ROSSO) { const ok = sette >= 3.5; console.log(ok ? '✅ ROSSO come atteso: senza gestione del vantaggio torna la coda di goleade' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
/* [7.999.98 PO-179] secondo braccio: l'eroe nella squadra DEBOLE e fuori casa (il caso peggiore misurato), stesse soglie del primo.
   CPM_ROSSO98=1 → __CPM_NO_G98 (gradini di prima): il braccio debole deve tornare oltre il 9%. */
const r2 = []; for (let s = 1; s <= N; s++) { const P = globalThis.creaPartita({ crea, registra: false, v2: true, seed: 9300 + s, casa: { sigla: 'OSP', forza: 95 }, ospite: { sigla: 'EROE', forza: 50 }, eroeLato: 'away', eroe: { nome: 'EROE', ovr: 50 } });
  P.tuttaSubito(); const rr = P.risultato(); r2.push([rr.eroe.fatti, rr.eroe.subiti]); }
const sette2 = 100 * r2.filter(x => Math.max(x[0], x[1]) >= 7).length / N, cinque2 = 100 * r2.filter(x => Math.abs(x[0] - x[1]) >= 5).length / N;
console.log(`eroe 50 contro 95 fuori casa, ${N} partite: 7+ gol ${sette2.toFixed(1)}% · scarto 5+ ${cinque2.toFixed(1)}%`);
if (ROSSO98) { const okr = cinque2 >= 9; console.log(okr ? '✅ ROSSO98 come atteso: coi gradini di prima il caso eroe debole torna oltre il 9%' : '❌ il rosso98 non riproduce'); process.exit(okr ? 0 : 1); }
const ok = sette < 2.5 && cinque < 9 && media > 2 && sette2 < 2.5 && cinque2 < 9;
console.log(ok ? '✅ PASS goleade' : '❌ FAIL goleade'); process.exit(ok ? 0 : 1);
