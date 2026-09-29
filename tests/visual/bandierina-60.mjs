#!/usr/bin/env node
/* [7.999.60 guardiano — taccuino PO #76/#6 «001 apertura scena, la palla rimbalza prima del tiro»] Sul flusso VERO (autoplay,
   origini dichiarate dal motore, 7.999.26) si leggono i voli d'origine delle scene dell'eroe (__CPM_ORIG26). MISURATO prima: l'angolo
   partiva da (78,76) con volo di 0 unita' e nessuno calciava i cross ('calcia: 0').
   VERDE: ogni angolo parte dalla bandierina (x >= 96, y <= 3 o >= 97), ogni cross ha il crossatore che calcia.
   ROSSO (--rosso, __CPM_NO_BANDIERINA60): torna il difetto — angolo lontano dalla bandierina o cross senza crossatore.
   Due partite (semi 7101 e 7202; quante scene d'origine escono varia fra i giri, si giudica ognuna). Uso: node bandierina-60.mjs  ·  node bandierina-60.mjs --rosso */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const rosso = process.argv.includes('--rosso');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const O = [];
for (const [nome, seed] of [['Orig A', 7101], ['Orig B', 7202]]) {
  const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO_BANDIERINA60 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  const t0 = Date.now(); while (Date.now() - t0 < 170000) { await sleep(3000); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; }
  O.push(...(await page.evaluate(() => window.__CPM_ORIG26 || [])));
  await page.close();
}
await b.close(); srv.close();
O.forEach(x => console.log(JSON.stringify(x)));
const ang = O.filter(x => x.kind === 'angolo'), cr = O.filter(x => x.kind !== 'angolo');
const angOk = ang.filter(x => x.da[0] >= 96 && (x.da[1] <= 3 || x.da[1] >= 97)).length, calcia = O.filter(x => x.calcia === 1).length;
console.log(`angoli ${ang.length} (dalla bandierina ${angOk}) · cross ${cr.length} · con chi calcia ${calcia}/${O.length}`);
if (!rosso) { const ok = O.length >= 1 && angOk === ang.length && calcia === O.length;/* le scene variano fra giri: si giudica cio' che c'e' */ console.log(ok ? '✅ angoli dalla bandierina, ogni cross ha chi calcia' : '❌ origini dei cross incoerenti'); process.exit(ok ? 0 : 1); }
else { const ok = O.length >= 1 && (angOk < ang.length || calcia < O.length); console.log(ok ? '✅ il rosso __CPM_NO_BANDIERINA60 riproduce il difetto' : '❌ il rosso non si distingue'); process.exit(ok ? 0 : 1); }
