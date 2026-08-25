#!/usr/bin/env node
/* SONDA — IL REPERTORIO DELLA CRONACA SI RISCRIVE DA SOLO DURANTE LA PARTITA?

   SOSPETTO (aliasing): la riga di cronaca dichiara la destinazione del pallone in `ev.bpos`, e il motore
   assegna `ballTargetRef.current = ev.bpos` — PER RIFERIMENTO, non per copia. Poi il motore del possesso
   muove quel bersaglio SUL POSTO (`_t.x = _t.x + ...`). Se l'oggetto e' lo stesso del repertorio, ogni
   deriva riscrive la destinazione DICHIARATA della riga, per il resto della partita e per tutte le
   partite successive nella stessa sessione.

   Come si vede in chiaro: si fotografa `window.__CPM_BG` (il repertorio) PRIMA della partita e DOPO, e
   si stampa riga per riga quale `bpos` e' cambiato. Il repertorio e' una costante letterale: se cambia,
   qualcuno l'ha mutato. Non e' un guardiano: misura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true, name: 'Rp' });
const prima = await page.evaluate(() => (window.__CPM_BG || []).map(e => ({ txt: String(e.txt || '').slice(0, 44), ef: e.ef || null, x: e.bpos ? e.bpos.x : null, y: e.bpos ? e.bpos.y : null })));
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now();
while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
const dopo = await page.evaluate(() => (window.__CPM_BG || []).map(e => ({ x: e.bpos ? e.bpos.x : null, y: e.bpos ? e.bpos.y : null })));
await b.close(); srv.close();

console.log('\n=== IL REPERTORIO DELLA CRONACA CAMBIA DURANTE LA PARTITA? ===\n');
console.log('  righe nel repertorio: ' + prima.length + '  ·  di cui con una destinazione dichiarata: ' + prima.filter(r => r.x != null).length + '\n');
const mossi = [];
for (let i = 0; i < prima.length; i++) {
  const a = prima[i], z = dopo[i] || {};
  if (a.x == null) continue;
  const d = Math.hypot((z.x ?? a.x) - a.x, (z.y ?? a.y) - a.y);
  if (d > 0.01) mossi.push({ i, a, z, d });
}
if (!mossi.length) console.log('  ✔ NESSUNA riga cambiata: il repertorio e\' rimasto la costante che dichiara di essere.\n');
else {
  console.log('  ✘ RIGHE RISCRITTE: ' + mossi.length + ' su ' + prima.filter(r => r.x != null).length + '\n');
  mossi.sort((p, q) => q.d - p.d).slice(0, 14).forEach(m => {
    console.log('    ' + (m.a.ef ? ('[' + m.a.ef + '] ') : '') + m.a.txt);
    console.log('        dichiarava (' + m.a.x + ',' + m.a.y + ')  ora dichiara (' + (+m.z.x).toFixed(1) + ',' + (+m.z.y).toFixed(1) + ')   spostata di ' + m.d.toFixed(1) + 'u');
  });
  const g = mossi.filter(m => /goal$/.test(String(m.a.ef || '')));
  console.log('\n  fra queste, righe di GOL riscritte: ' + g.length + (g.length ? '  ← la riga che dichiara la porta non dichiara piu\' la porta' : ''));
}
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
