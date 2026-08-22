#!/usr/bin/env node
/* 7.544 — CHI FA BALLARE L'ASSE OTTICO (codice 007, 11 note del PO su due release).
   Il taccuino automatico del PO non dice solo «traballa»: NOMINA gli scrittori dell'ultima passata e conta
   quante passate girano per fotogramma. Messi in fila, i suoi numeri mostrano una correlazione netta —
   4,6 passate/fotogramma → 30,6 inversioni/s · 1,1 passate → 3,0 inversioni/s.
   Il 7.521 aveva gia' messo il rimedio giusto: «UN arbitro a valle di TUTTE le passate», inerzia EMA sui
   sei bersagli. Ma l'ordine del codice dice un'altra cosa: l'arbitro sta alla riga ~17245 e la rete
   `vista-reale` gira alla ~17302, cioe' DOPO — e nelle scene peggiori del PO `vista-reale` e' proprio lo
   scrittore dell'ultima passata (56%, 55%, 35%, 29%).
   Qui si misurano i DUE testimoni gia' presenti in produzione: OSC521 = il bersaglio dopo le passate ma
   PRIMA del rendering; OSC521B = l'asse RESO, dopo lerp e reti post-lerp. Se il primo e' calmo e il
   secondo balla, l'arbitro non ha l'ultima parola e il rimedio e' spostarla, non smorzare di piu'. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GI = (process.env.CPM_GI || '29,145,164,72,130,84').split(',').map(Number);
const SEC = +(process.env.CPM_SEC || 6);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO566 = 1; }, !!process.env.CPM_ROSSO);
await openMatch(page, port, { name: 'Cam' });
await sleep(500);
const righe = [];
for (const gi of GI) {
  await forceSituation(page, gi, { settle: 600, choose: true });
  await page.evaluate(() => { window.__CPM_OSC521 = { att: {} }; window.__CPM_OSC521B = { att: {} }; window.__CPM_TOCC = 1; });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await sleep(SEC * 1000);
  const r = await page.evaluate(() => {
    const a = window.__CPM_OSC521 || {}, c = window.__CPM_OSC521B || {};
    const top = (o) => Object.entries(o || {}).sort((x, y) => y[1] - x[1]).slice(0, 2).map(([k, v]) => `${k} ×${v}`).join(' · ');
    return { fA: a.f || 0, flA: a.flips || 0, ampA: a.amp || 0, fB: c.f || 0, flB: c.flips || 0, ampB: c.amp || 0, attB: top(c.att) };
  });
  const sA = r.fA ? (r.flA / SEC) : 0, sB = r.fB ? (r.flB / SEC) : 0;
  righe.push({ gi, sA, sB, ampB: r.ampB, attB: r.attB, fB: r.fB });
  console.log(`gi${String(gi).padStart(3)} · bersaglio ${sA.toFixed(1)} inv/s → asse RESO ${sB.toFixed(1)} inv/s · ampiezza max ${(r.ampB * 180 / Math.PI).toFixed(1)}° · ${r.fB} fotogrammi`);
  if (r.attB) console.log(`        passaggi di mano più frequenti all'inversione: ${r.attB}`);
}
await b.close(); srv.close();
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const A = med(righe.map(q => q.sA)), B = med(righe.map(q => q.sB));
console.log(`\nMEDIANA su ${righe.length} scene — bersaglio ${A.toFixed(1)} inv/s · asse RESO ${B.toFixed(1)} inv/s`);
console.log(B > A * 1.4 ? `→ l'oscillazione NASCE A VALLE dell'arbitro d'inerzia (x${(B / (A || 1)).toFixed(1)}): il rimedio è dargli l'ultima parola, non smorzare di più`
  : `→ bersaglio e asse reso oscillano insieme: il tremore nasce PRIMA dell'arbitro`);
