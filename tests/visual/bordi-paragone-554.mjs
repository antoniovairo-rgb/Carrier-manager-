#!/usr/bin/env node
/* IL PARAGONE DEI BORDI — lo strumento con cui si giudicherà il passo 1 della fase 7.
   Rosso e verde nello stesso processo, alternati, ≥2 giri per colore (lib/paragone.mjs).

   ⚠️ OGGI IL ROSSO NON ESISTE ANCORA. `__CPM_NO577` non è cablato nel gioco: girata adesso, questa
   sonda DEVE dire «non separati» su ogni campo — ed è la sua prima prova, perché uno strumento che
   separa due colori identici è rotto prima del codice che deve giudicare. Quando il passo 1 sarà
   scritto, la stessa sonda, senza modifiche, diventa la sua porta.

   I CAMPI, dichiarati PRIMA:
     bordo    ARRIVI del pallone sulla fascia di bordo (transizioni fuori→bordo) — oggi 1,0 a partita.
              È il numero che il passo 1 deve alzare: senza uscite non ci sono rimesse.
     largo    % di tick con |y-50|>32 (la banda in cui una rimessa è plausibile) — oggi 0,0%.
     sp       righe che aprono una palla ferma, a partita — oggi 2,0-2,3 (riferimento calcio: ≥25).
   Tutti e tre in salita: `basso:false`.

   USO:  CPM_GIRI=2 node tests/visual/bordi-paragone-554.mjs      (4 partite: ~10 minuti)              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
import { paragone, stampaParagone } from './lib/paragone.mjs';

const GIRI = +(process.env.CPM_GIRI || 2);
const ROSSO = process.env.CPM_ROSSO || '__CPM_NO577';
const MAXMS = +(process.env.CPM_MAXMS || 300000);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
let n = 0;

async function misura(rossoOn) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r, on]) => {
    window.__CPM_GLB = false; if (on) window[r] = 1;
    window.__CPM_TR = [];
    setInterval(() => { try { const q = window.__CPM_BALL3 && window.__CPM_BALL3(); if (q && q.l) window.__CPM_TR.push([q.l.x, q.l.y]); } catch (_e) {} }, 60);
  }, [ROSSO, rossoOn]);
  await openMatch(page, port, { skipLoadAll: true, name: 'Pg' + (n++) });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 9600 + n * 53);
  const t0 = Date.now();
  while (Date.now() - t0 < MAXMS) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  const d = await page.evaluate(() => ({ righe: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'), tr: window.__CPM_TR || [] }));
  await page.close();
  let bordo = 0, largo = 0, dentro = false;
  for (const [x, y] of d.tr) {
    const su = (x <= 7 || x >= 93 || y <= 9 || y >= 91);
    if (su && !dentro) bordo++;
    dentro = su;
    if (Math.abs(y - 50) > 32) largo++;
  }
  return { bordo, largo: d.tr.length ? (largo / d.tr.length) * 100 : 0, sp: d.righe.filter(r => r.sp).length };
}

const R = await paragone({ giri: GIRI, rosso: ROSSO, misura });
srv.close(); await b.close();
stampaParagone('i bordi del campo', R, {
  bordo: { nome: 'arrivi sul bordo (a partita)' },
  largo: { nome: 'tick con |y-50|>32  (%)' },
  sp:    { nome: 'palle ferme aperte (a partita)' },
});
