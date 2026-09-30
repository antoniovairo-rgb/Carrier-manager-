#!/usr/bin/env node
/* [7.999.82 guardiano — BRAIN UNICO + «realismo da serie A» (decisioni PO 30/09)]
   Per ogni azione da gol delle scene (punto di partenza della scena) chiede la probabilita' al MOTORE (probEroe) per eroi con
   statistiche 70/80/88/95 contro difensori di forza 70, e stima i gol a partita con il ritmo misurato sul flusso vero
   (motore-unico: 4,3 scene a partita, ~85% di giocate da gol). VERDE: eroe da 88 fra 0,6 e 0,9 gol a partita, crescente con
   le statistiche, eroe da 95 sotto 1,1. ROSSO (CPM_ROSSO=1): la formula di prima (succRate x q sulla grande occasione) deve
   uscire dal bersaglio. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1', SCENE = 4.3, QUOTA = 0.85, OPP = 70;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const p = await b.newPage(); await installCdnRoutes(p);
await openMatch(p, port, { skipLoadAll: true, name: 'Brain82' }); await sleep(1500);
const out = {};
for (const liv of [70, 80, 88, 95]) {
  out[liv] = await p.evaluate(([liv, rosso, opp]) => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!M || !M.probEroe) return null;
    const st = { tiro: liv, tecnica: liv, passaggio: liv, dribbling: liv, 'velocità': liv, fisico: liv, 'mentalità': liv, posizionamento: liv };
    let n = 0, s = 0;
    SITUATIONS.forEach(sit => { const z = sit.startZone || sit.moveZone; if (!z) return; const x = (z.x[0] + z.x[1]) / 2, y = (z.y[0] + z.y[1]) / 2;
      if (typeof isPenaltySit === 'function' && isPenaltySit(sit)) return;/* i rigori hanno la loro via (handleRigore) */
      (sit.actions || []).forEach(a => { if (a.rew !== 'goal') return; let pr;
        if (rosso) { const rate = succRate(a, st, x, 55 + (opp - 55), null) / 100; const xg0 = M.xgPunto(x, y, null, 3); pr = Math.max(0.05, Math.min(0.8, Math.min(0.6, Math.max(0.28, 0.28 + 0.8 * xg0)) * Math.min(2, Math.max(0.5, rate / 0.45)))); }
        else { const r = M.probEroe(Object.assign(_brainIn82(a, sit, { x, y }, st, { mods: 0, mult: 1 }), { oppForza: opp })); pr = r ? r.p : NaN; }
        if (isFinite(pr)) { n++; s += pr; } }); });
    return { n, p: +(s / n).toFixed(3) }; }, [liv, ROSSO, OPP]);
}
await b.close(); srv.close();
const gol = l => out[l] ? +(SCENE * QUOTA * out[l].p).toFixed(2) : null;
for (const l of [70, 80, 88, 95]) console.log(`eroe ${l} contro difensori ${OPP}: probabilita' media ${out[l] && out[l].p} su ${out[l] && out[l].n} azioni · gol a partita stimati ${gol(l)}`);
const dentro = gol(88) >= 0.6 && gol(88) <= 0.9 && gol(95) < 1.1 && gol(70) < gol(80) && gol(80) < gol(88) && gol(88) <= gol(95);
if (ROSSO) { console.log(!dentro ? '✅ il rosso si vede: la formula di prima esce dal bersaglio serie A' : '❌ rosso CIECO'); process.exit(!dentro ? 0 : 1); }
console.log(dentro ? '✅ brain-82 verde: eroe forte nel bersaglio serie A' : '❌ brain-82 ROSSO'); process.exit(dentro ? 0 : 1);
