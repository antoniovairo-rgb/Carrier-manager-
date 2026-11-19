#!/usr/bin/env node
/* [giro 238 PO-496] SONDA (strumento): chi batte i piazzati nel motore vero (partita vissuta, brainLive), con e senza premi del patto.
   Conta per N partite: rigori, punizioni, angoli concessi alla squadra dell'eroe e quanti ne batte l'eroe. Uso: CPM_N=40 node sonda-piazzati-238.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 40);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage(); await installCdnRoutes(page);
await openMatch(page, port, { skipLoadAll: true, name: 'Sonda238' });
await page.waitForFunction(() => typeof creaMotorePossesso === 'function', null, { timeout: 60000 });
const R = await page.evaluate((N) => {
  const corri = (premi, piaz, OFF = 0) => { const T = { pen: 0, penE: 0, foul: 0, foulE: 0, corner: 0, cornerE: 0, foulTir: 0, foulTirE: 0 };
    const P = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
    const Q = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
    const Rl = i => i===0?'GK':i<=4?'DF':i<=7?'MF':'AT';
    for (let s = 1; s <= N; s++) {
      const gio = P.map((p,i)=>({team:'home',gk:!!p[2],name:'H'+(i+1),rl:Rl(i),x:p[0],y:p[1]})).concat(Q.map((p,i)=>({team:'away',gk:!!p[2],name:'A'+(i+1),rl:Rl(i),x:p[0],y:p[1]})));
      const M = creaMotorePossesso({ v2: true, brainLive: true, seed: (s + OFF) * 7919, giocatori: gio, eroe: { name: 'EROE', x: 58, y: 50, ovr: 75, premi: premi }, forza: { home: 70, away: 70 }, lato: 'home' });
      try { if (piaz && M.chiedi.origini) M.chiedi.origini(false, 15, true); } catch (e) {}
      const E = []; for (let m = 1; m <= 90; m++) for (let k = 0; k < 22; k++) { const o = M.tick({ min: m, dt: 1 / 22, dec: true }); if (o && o.length) E.push(...o); }
      for (const e of E) { if (e.t === 'battuta' && e.chi && e.chi.team === 'home') {
          const k = e.kind === 'pen' ? 'pen' : e.kind === 'corner' ? 'corner' : e.kind === 'foul' ? 'foul' : null; if (!k) continue;
          T[k]++; if (e.chi.eroe) T[k + 'E']++; if (k === 'foul' && e.adv >= 78) { T.foulTir++; if (e.chi.eroe) T.foulTirE++; } }
        if (e.t === 'occasione_eroe' && e.origine && (e.origine.kind === 'rigore' || e.origine.kind === 'punizione')) { T['occ_' + e.origine.kind] = (T['occ_' + e.origine.kind] | 0) + 1; } }
    } return T; };
  const out = {}; for (const off of [0, 30, 60, 90]) { out['senza' + off] = corri(null, true, off); out['con' + off] = corri({ rig: true, piaz: true }, true, off); } return out;
}, N);
console.log(JSON.stringify(R, null, 1));
await b.close(); srv.close();
