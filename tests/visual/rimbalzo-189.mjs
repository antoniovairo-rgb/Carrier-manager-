#!/usr/bin/env node
/* [7.999.112 guardiano — collaudo PO-189 «a ogni caricamento del campo fa uno strano rimbalzo, come se si ridimensionasse»]
   MISURATO a 412x915: il campo 2D si disegnava a tutta altezza finche' il motore non dava il tabellino; alla comparsa della striscia
   alta il margine superiore del disegno (t12) passava da 0 a 74 px e il campo si restringeva di colpo.
   VERDE → dal primo disegno in poi il margine superiore non cambia piu' di 3 px (stessa finestra del rosso, almeno 25 s: sotto carico i disegni sono pochi e ne servono 8).
   ROSSO (__CPM_NO_RIMB189) → il salto si vede (≥ 30 px). Uso: node rimbalzo-189.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
/* [giro 50 PO-271] Il braccio rosso era cieco (margine 0 px fermo, nessun salto): misurato, oggi il tabellino del motore arriva
   ~25 s dopo il primo disegno del campo (sonda: striscia assente da 19,5 s a 45,2 s dall'apertura, poi 0 → 73 px), cioe' DOPO la
   finestra fissa di 14 s. La finestra ora e' a evento: si osserva finche' la striscia alta e' comparsa da 3 s (tetto 60 s), e il
   braccio verde osserva per la stessa durata del rosso. */
async function braccio(rosso, durata) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { if (r) window.__CPM_NO_RIMB189 = 1; window.__L189 = [];
    const f = () => { const q = window.__CPM_CAMPO19; if (q && q.t12 != null) window.__L189.push(q.t12); requestAnimationFrame(f); }; requestAnimationFrame(f); }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'R189' }); const t0 = Date.now(); let tS = null;
  if (durata == null) { while (Date.now() - t0 < 60000) { await sleep(500); const s = await p.evaluate(() => !!document.querySelector('[data-cpm="striscia918"]') && (window.__L189 || []).length > 0); if (s && tS == null) tS = Date.now(); if (tS != null && Date.now() - tS >= 3000) break; } }
  else await sleep(durata);
  const dur = Date.now() - t0; const L = await p.evaluate(() => window.__L189); await p.close();
  return { n: L.length, primo: L[0], min: Math.min(...L), max: Math.max(...L), dur, striscia: tS != null ? tS - t0 : null };
}
const r = await braccio(true), v = await braccio(false, Math.max(25000, r.dur));
console.log(`VERDE: ${v.n} disegni · margine alto primo ${v.primo} px, min ${v.min}, max ${v.max}`);
console.log(`ROSSO (__CPM_NO_RIMB189): ${r.n} disegni · margine alto primo ${r.primo} px, min ${r.min}, max ${r.max} · striscia a ${r.striscia} ms · osservati ${r.dur} ms`);
const ok = v.n >= 8 && v.max - v.min <= 3 && v.min > 20 && r.max - r.min >= 30;
await b.close(); srv.close();
console.log(ok ? '✅ rimbalzo-189 verde (e il rosso si vede)' : '❌ rimbalzo-189 ROSSO'); process.exit(ok ? 0 : 1);
