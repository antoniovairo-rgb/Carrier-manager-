#!/usr/bin/env node
/* [giro 249 PO-496 seguito] SONDA (strumento): chi calcia i rigori della squadra dell'eroe nel motore vero (brainLive, richiesta dei
   piazzati accesa come nel live), CON e SENZA il premio «il rigorista sei tu». Conta per N partite (default 20) i rigori della squadra,
   quanti ne batte l'eroe e quante occasioni di scena da rigore il motore offre all'eroe. Due tarature: K del gioco (0,25) e K=1 (ogni
   fallo in area e' rigore: piu' campioni, stessa regola del battitore). Uso: CPM_N=20 [CPM_ROSSO=1] node sonda-rigorista-249.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
export async function misuraRigorista(page, N, K) {
  return page.evaluate(([N, K]) => {
    if (K != null) window.__CPM_RIG190_K = K; else delete window.__CPM_RIG190_K;
    const corri = (premi) => { const T = { partite: 0, pen: 0, penEroe: 0, occScena: 0, battitori: {} };
      const P = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
      const Q = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
      const Rl = i => i===0?'GK':i<=4?'DF':i<=7?'MF':'AT';
      const NOMI = ['Rossi','Bianchi','Greco','Conti','Marino','Galli','Costa','Fontana','Ricci','Moretti'];
      for (let s = 1; s <= N; s++) { T.partite++;
        const gio = P.map((p,i)=>({team:'home',gk:!!p[2],name:NOMI[i],rl:Rl(i),x:p[0],y:p[1]})).concat(Q.map((p,i)=>({team:'away',gk:!!p[2],name:'A'+(i+1),rl:Rl(i),x:p[0],y:p[1]})));
        const M = creaMotorePossesso({ v2: true, brainLive: true, seed: s * 7919, giocatori: gio, eroe: { name: 'EROE', x: 58, y: 50, ovr: 75, premi }, forza: { home: 70, away: 70 }, lato: 'home' });
        try { if (M.chiedi.origini) M.chiedi.origini(false, 15, true); } catch (e) {}
        for (let m = 1; m <= 90; m++) for (let k = 0; k < 22; k++) { const o = M.tick({ min: m, dt: 1 / 22, dec: true }) || [];
          for (const e of o) { if (e.t === 'battuta' && e.kind === 'pen' && e.chi && e.chi.team === 'home') { T.pen++; if (e.chi.eroe) T.penEroe++; const n = e.chi.eroe ? 'EROE' : e.chi.nome; T.battitori[n] = (T.battitori[n] | 0) + 1; }
            if (e.t === 'occasione_eroe' && e.origine && e.origine.kind === 'rigore') T.occScena++; } } }
      return T; };
    return { senza: corri(null), con: corri({ rig: true, piaz: false }) };
  }, [N, K]);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const N = +(process.env.CPM_N || 20);
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const page = await b.newPage(); await installCdnRoutes(page);
  if (process.env.CPM_ROSSO) await page.addInitScript(() => { window.__CPM_NO_G249 = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Sonda249' });
  await page.waitForFunction(() => typeof creaMotorePossesso === 'function', null, { timeout: 60000 });
  const out = { K_gioco: await misuraRigorista(page, N, null), K_1: await misuraRigorista(page, N, 1) };
  console.log(JSON.stringify(out));
  await b.close(); srv.close();
}
