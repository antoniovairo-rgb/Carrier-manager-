#!/usr/bin/env node
/* SONDA — DOPO UN GOL, LE SQUADRE TORNANO NELLE PROPRIE META'?
   COLLAUDO PO (appunti 7.584): «la ripresa del gioco dopo un gol e' disordinata, le squadre non tornano
   nelle meta' campo proprie».
   Nel calcio il calcio d'inizio ha una regola che si VEDE: ogni squadra sta nella sua meta', e solo due
   giocatori stanno nel cerchio. Se a schermo i ventidue restano sparsi dov'erano, la ripresa non si legge
   come una ripresa — e' quello che il PO descrive come «disordinata».
   COSA MISURA: durante la finestra di calcio d'inizio dichiarata dal gioco (`__CPM_HOLD().ko`), quanti
   giocatori stanno nella meta' campo SBAGLIATA. Il conteggio e' immune al frame rate: e' un numero di
   giocatori, non una frequenza. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_RIP = [];
  setInterval(() => { try {
    const h = window.__CPM_HOLD && window.__CPM_HOLD();
    /* [7.588.0] da quanto e' aperta la finestra: lo schieramento della ripresa scatta ogni tre tick di
       gioco, quindi «quanti sono fuori posto» dipende da QUANDO si guarda. Senza questo, la mediana mette
       insieme l'istante del fischio e un secondo dopo, che sono due cose diverse. */
    if (!h || !h.ko) { window.__CPM_KOT = 0; return; }
    const eta = (window.__CPM_KOT = (window.__CPM_KOT || 0) + 1);
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players) return;
    const R = window.__CPM_RIP; if (R.length > 600) return;
    let casaFuori = 0, ospFuori = 0, tot = 0, cerchio = 0;
    for (const p of st.players) {
      if (!p || p.x == null) continue; tot++;
      /* meta' campo: casa difende x<50 e deve stare sotto 50; ospiti sopra. Il cerchio e' attorno a x50. */
      if (Math.abs(p.x - 50) <= 9) cerchio++;
      if (p.team === 'home' && p.x > 52) casaFuori++;
      if (p.team === 'away' && p.x < 48) ospFuori++;
    }
    R.push({ tot, casaFuori, ospFuori, cerchio, eta });
  } catch (_e) {} }, 150);
});
await openMatch(page, port, { skipLoadAll: true, name: 'Rp' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now();
while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
const R = await page.evaluate(() => window.__CPM_RIP || []);
await b.close(); srv.close();

console.log('\n=== DOPO UN GOL, LE SQUADRE TORNANO NELLE PROPRIE META\'? ===\n');
if (!R.length) { console.log('  ⚠ nessun campione durante un calcio d\'inizio: la sonda non misura niente.\n'); process.exit(1); }
const f = R.map(o => o.casaFuori + o.ospFuori).sort((a, c) => a - c);
const q = p => f[Math.min(f.length - 1, Math.floor(p * f.length))];
console.log('  campioni durante la finestra di ripresa: ' + R.length + '  ·  giocatori in campo: ' + Math.round(R.reduce((a, o) => a + o.tot, 0) / R.length));
console.log('\n  giocatori nella META\' CAMPO SBAGLIATA durante la ripresa:');
console.log('    minimo ' + f[0] + '  ·  MEDIANA ' + q(0.5) + '  ·  terzo quarto ' + q(0.75) + '  ·  massimo ' + f[f.length - 1]);
console.log('    di cui in casa ' + (R.reduce((a, o) => a + o.casaFuori, 0) / R.length).toFixed(1) + ' in media  ·  ospiti ' + (R.reduce((a, o) => a + o.ospFuori, 0) / R.length).toFixed(1));
console.log('  giocatori dentro il cerchio di centrocampo (nel calcio sono DUE): mediana ' + R.map(o => o.cerchio).sort((a, c) => a - c)[R.length >> 1]);
{
  console.log('\n  --- QUANDO SI GUARDA, DENTRO LA FINESTRA DELLA RIPRESA ---');
  console.log('  (un campione ogni 150 ms; lo schieramento scatta ogni tre tick di gioco, cioe\' ~900 ms)');
  for (const [nome, filtro] of [['primi 450 ms', o => o.eta <= 3], ['450-900 ms', o => o.eta > 3 && o.eta <= 6], ['oltre 900 ms', o => o.eta > 6]]) {
    const g = R.filter(filtro); if (!g.length) { console.log('    ' + nome.padEnd(14) + ' nessun campione'); continue; }
    const m = g.map(o => o.casaFuori + o.ospFuori).sort((a, c) => a - c);
    const c = g.map(o => o.cerchio).sort((a, c2) => a - c2);
    console.log('    ' + nome.padEnd(14) + ' campioni ' + String(g.length).padStart(3) + '  ·  nella meta\' sbagliata (mediana) ' + m[m.length >> 1] + '  ·  nel cerchio (mediana) ' + c[c.length >> 1]);
  }
}
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
