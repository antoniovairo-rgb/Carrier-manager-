#!/usr/bin/env node
/* [7.999.116 guardiano — collaudo PO-191 «la premiazione 3D: eroe in posa sbagliata e che vola sopra il palco»]
   Cerimonia di campionato forzata coi corpi GLB; col gancio __CPM_CERT_SET si salta all'inizio del sollevamento (fine di consegna +
   capitano) e si registra il testimone __CPM_CER476. Per ogni campione si calcola cosa c'e' sotto i piedi dell'eroe nel riferimento del
   palco rettangolare (corpo 1,05 · gradino 0,28 · prato 0) e si conta quando la sua quota supera quel piano di oltre 0,15 («vola»).
   MISURATO prima: quota 1,05 col prato sotto i piedi. VERDE → 0 campioni in volo su almeno 20. ROSSO (__CPM_NO_PALCO191) → almeno 1. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const sotto = (w) => { const P = w.podio; if (!P) return 0; const dx = w.hero.x - P.x, dz = w.hero.z - P.z;
  if (!P.rett) return Math.hypot(dx, dz) < 1.7 ? 1.05 : 0; const c = Math.cos(P.rot), s = Math.sin(P.rot), lx = Math.abs(dx * c - dz * s), lz = Math.abs(dx * s + dz * c);
  return (lx < 3.2 && lz < 1.4) ? 1.05 : ((lx < 3.7 && lz < 1.9) ? 0.28 : 0); };
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_PALCO191 = 1; }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'Palco191' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(() => { window.__CPM_CER476 = []; window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' }); });
  await sleep(3000);
  const info = await p.evaluate(() => window.__CPM_CER425 || null);
  const i = info ? info.beats.indexOf('lift') : -1; const t0 = i > 0 ? info.beatsD.slice(0, i).reduce((a, x) => a + x, 0) : 6.8;
  await p.evaluate(t => { window.__CPM_CER476 = []; window.__CPM_CERT_SET = t; }, t0 - 0.1); await sleep(9000);
  const W = (await p.evaluate(() => window.__CPM_CER476 || [])).filter(w => w.beat === 'lift' && w.podio);
  await p.close();
  const volo = W.filter(w => w.hero.y - sotto(w) > 0.15);
  return { campioni: W.length, inVolo: volo.length, esempio: volo[0] ? { y: volo[0].hero.y, sotto: sotto(volo[0]) } : null, sulCorpo: W.filter(w => sotto(w) === 1.05 && Math.abs(w.hero.y - 1.05) < 0.2).length };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_PALCO191):', JSON.stringify(r));
const ok = v.campioni >= 20 && v.inVolo === 0 && v.sulCorpo >= 5 && r.inVolo >= 1;
await b.close(); srv.close();
console.log(ok ? '✅ premiazione-palco-191 verde (e il rosso si vede)' : '❌ premiazione-palco-191 ROSSO'); process.exit(ok ? 0 : 1);
