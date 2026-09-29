#!/usr/bin/env node
/* [7.999.64 guardiano — collaudo PO «c'e' poco da allenarsi dopo un'eliminazione dalle coppe / tornei con la nazionale»]
   Dopo un'eliminazione (o una sconfitta in Nazionale) il CT non dice «Domani in campo» e la rassegna non parla di «settimana»
   di allenamento. Si provano le due funzioni vere del gioco nella pagina:
   VERDE → coachPostMatch con {elim,nat} senza «Domani in campo»; rassegna con playerCtx.elim/nat su 60 semi senza «settiman»;
   ROSSO → con __CPM_NO_ELIM64 il CT torna a «Domani in campo», e la rassegna senza bandiere contiene «settiman» (lo strumento vede).
   Uso: node elim-64.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const srv = await startServer(); const b = await launchBrowser();
const page = await b.newPage(); await installCdnRoutes(page);
await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Elim64' });
const r = await page.evaluate(() => {
  const ct = o => coachPostMatch(false, false, 0, 0, 6, 70, o);
  const rass = (ctx, n) => { let hit = 0; for (let i = 0; i < n; i++) { const R = generateLocalPressAnalysis({ won: false, drew: false, opponent: 'Italia', homeScore: 0, awayScore: 1 }, { name: 'Vairo ' + i, club: 'Spagna', goals: 0, assists: 0, rating: 5.8 }, Object.assign({ season: 12, week: 28 + i }, ctx)); if (/settiman/i.test(JSON.stringify(R.quotes || R))) hit++; } return hit; };
  const v = { ctElimNat: ct({ elim: true, nat: true }), ctElim: ct({ elim: true }), ctNat: ct({ nat: true }), rassElim: rass({ elim: true, nat: true }, 60) + rass({ elim: true }, 60) + rass({ nat: true }, 60), rassBase: rass({}, 60) };
  window.__CPM_NO_ELIM64 = 1; v.ctRosso = ct({ elim: true, nat: true }); window.__CPM_NO_ELIM64 = 0;
  return v;
});
await b.close(); srv.close();
console.log(JSON.stringify(r, null, 1));
const okV = !/Domani in campo/.test(r.ctElimNat + r.ctElim + r.ctNat) && r.rassElim === 0;
const okR = /Domani in campo/.test(r.ctRosso) && r.rassBase > 0;
console.log(okV ? '✅ dopo eliminazione/Nazionale nessun «Domani in campo» ne\' «settimana»' : '❌ frasi da campionato dopo eliminazione/Nazionale');
console.log(okR ? '✅ il rosso __CPM_NO_ELIM64 (e la rassegna senza bandiere) mostra le frasi da campionato' : '❌ il rosso non si distingue');
process.exit(okV && okR ? 0 : 1);
