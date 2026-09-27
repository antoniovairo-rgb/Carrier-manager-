#!/usr/bin/env node
/* [7.999.36 guardiano — collaudo PO «risultato esagerato»: Europeo, Spagna-Francia 7-1] LE OCCASIONI DELL'EROE FANNO PARTE DELLA SQUADRA.
   Al banco (motore del gioco, 90 contro 85, eroe 93, 300 partite) si imitano le scene dell'eroe della partita vissuta: quattro grandi
   occasioni da 0,35 gol attesi, ciascuna addebitata al motore (`addebita`) e risolta con un dado seedato. Verde: gol totali della squadra
   dell'eroe (motore + scene) entro 0,3 della produzione del motore senza scene; il rosso (__CPM_NO_PUNT36, scene sommate) deve superarla
   di almeno 0,9. Misura della partita vera (sonda punteggio-forte-sonda.mjs, 4 partite): 2,5 gol a partita prima, 1,5 dopo. */
import '../../prototipo/partita-vera/motore-v2.js'; import '../../prototipo/partita-vera/partita.js';
const RED = process.env.CPM_RED === '1';
const N = 300, SCENE = 4, P_SCENA = 0.35;
const gioca = (conScene, rosso) => { globalThis.window = rosso ? { __CPM_NO_PUNT36: 1 } : {}; let tot = 0, dalMotore = 0;
  for (let s = 1; s <= N; s++) { const P = globalThis.creaPartita({ crea: cfg => globalThis.creaMotoreV2({ ...cfg, occasioniV2: false }), registra: false, v2: true, seed: 5300 + s, casa: { sigla: 'ESP', forza: 90 }, ospite: { sigla: 'FRA', forza: 85 }, eroeLato: 'home', eroe: { nome: 'EROE', ovr: 93 } });
    let golScene = 0; if (conScene) { let r = (s * 2654435761) >>> 0; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
      for (let i = 0; i < SCENE; i++) { P.motore.addebita(P_SCENA); if (rnd() < P_SCENA) golScene++; } }
    P.tuttaSubito(); const g = P.stato.eventi.filter(e => e.t === 'gol' && e.lato === 'home').length; dalMotore += g; tot += g + golScene; }
  return { tot: tot / N, motore: dalMotore / N }; };
const base = gioca(false, false), verde = gioca(true, false), rosso = gioca(true, true);
console.log(`senza scene: ${base.tot.toFixed(2)} gol a partita · con scene (correzione): ${verde.tot.toFixed(2)} (motore ${verde.motore.toFixed(2)}) · con scene (rosso): ${rosso.tot.toFixed(2)} (motore ${rosso.motore.toFixed(2)})`);
if (RED) { const ok = rosso.tot - base.tot >= 0.9; console.log(ok ? '✅ ROSSO come atteso: le scene si sommano alla produzione' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const ok = Math.abs(verde.tot - base.tot) <= 0.3 && rosso.tot - base.tot >= 0.9;
console.log(ok ? '✅ PASS occasioni-squadra' : '❌ FAIL occasioni-squadra'); process.exit(ok ? 0 : 1);
