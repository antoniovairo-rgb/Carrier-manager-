#!/usr/bin/env node
/* [7.999.119 guardiano — collaudo PO-191 «giocatori che attraversano il palco»]
   Cerimonia di campionato forzata coi corpi GLB; col gancio __CPM_CERT_SET si visita ogni momento (10%, 50%, 85%). Il testimone
   __CPM_CER476.corpi da' ogni corpo (tranne l'eroe) nel riferimento del palco rettangolare: si contano i campioni con un corpo
   dentro l'impronta (corpo 6,4x2,8 o gradino 7,4x3,8) a quota sotto 0,2, cioe' DENTRO il solido.
   MISURATO prima: un compagno e un avversario dentro per tutta la cerimonia (67+67). VERDE → 0. ROSSO (__CPM_NO_PALCO191B) → ≥10. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_PALCO191B = 1; }, rosso);
await openMatch(p, port, { skipLoadAll: true, name: 'Corpi191' });
await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
await p.evaluate(() => { window.__CPM_CER476 = []; window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' }); });
await p.waitForFunction(() => !!window.__CPM_CER425, null, { timeout: 60000 }).catch(() => {});
const info = await p.evaluate(() => window.__CPM_CER425); let acc = 0;
for (let i = 0; i < info.beats.length; i++) { for (const f of [0.1, 0.5, 0.85]) { await p.evaluate(t => { window.__CPM_CERT_SET = t; }, acc + info.beatsD[i] * f); await sleep(2500); } acc += info.beatsD[i]; }
const W = (await p.evaluate(() => window.__CPM_CER476 || [])).filter(w => w.corpi);
const dentro = { c: { corpo: 0, gradino: 0 }, o: { corpo: 0, gradino: 0 } }, esempi = [];
for (const w of W) for (const [sq, lx, lz, y] of w.corpi) { const ax = Math.abs(lx), az = Math.abs(lz);
  const z = (ax < 3.2 && az < 1.4) ? 'corpo' : ((ax < 3.7 && az < 1.9) ? 'gradino' : null); if (z && y < 0.2) { dentro[sq][z]++; if (esempi.length < 6) esempi.push({ beat: w.beat, t: w.t, sq, lx, lz, y }); } }
await p.close(); return { campioni: W.length, dentro: dentro.c.corpo + dentro.c.gradino + dentro.o.corpo + dentro.o.gradino, esempio: esempi[0] || null };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_PALCO191B):', JSON.stringify(r));
const ok = v.campioni >= 30 && v.dentro === 0 && r.dentro >= 10;
await b.close(); srv.close();
console.log(ok ? '✅ palco-corpi-191 verde (e il rosso si vede)' : '❌ palco-corpi-191 ROSSO'); process.exit(ok ? 0 : 1);
