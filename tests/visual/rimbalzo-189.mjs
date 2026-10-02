#!/usr/bin/env node
/* [7.999.112 guardiano — collaudo PO-189 «a ogni caricamento del campo fa uno strano rimbalzo, come se si ridimensionasse»]
   MISURATO a 412x915: il campo 2D si disegnava a tutta altezza finche' il motore non dava il tabellino; alla comparsa della striscia
   alta il margine superiore del disegno (t12) passava da 0 a 74 px e il campo si restringeva di colpo.
   VERDE → dal primo disegno in poi il margine superiore non cambia piu' di 3 px nei primi 14 s.
   ROSSO (__CPM_NO_RIMB189) → il salto si vede (≥ 30 px). Uso: node rimbalzo-189.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { if (r) window.__CPM_NO_RIMB189 = 1; window.__L189 = [];
    const f = () => { const q = window.__CPM_CAMPO19; if (q && q.t12 != null) window.__L189.push(q.t12); requestAnimationFrame(f); }; requestAnimationFrame(f); }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'R189' }); await sleep(14000);
  const L = await p.evaluate(() => window.__L189); await p.close();
  return { n: L.length, primo: L[0], min: Math.min(...L), max: Math.max(...L) };
}
const v = await braccio(false), r = await braccio(true);
console.log(`VERDE: ${v.n} disegni · margine alto primo ${v.primo} px, min ${v.min}, max ${v.max}`);
console.log(`ROSSO (__CPM_NO_RIMB189): ${r.n} disegni · margine alto primo ${r.primo} px, min ${r.min}, max ${r.max}`);
const ok = v.n >= 8 && v.max - v.min <= 3 && v.min > 20 && r.max - r.min >= 30;
await b.close(); srv.close();
console.log(ok ? '✅ rimbalzo-189 verde (e il rosso si vede)' : '❌ rimbalzo-189 ROSSO'); process.exit(ok ? 0 : 1);
