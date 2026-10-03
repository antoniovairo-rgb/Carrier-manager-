#!/usr/bin/env node
/* [7.999.118 guardiano — collaudo PO-191 «eroe in posa sbagliata (gamba alzata)» nella premiazione 3D]
   La clip del sollevamento (mx-victory) si congela a un punto fisso. Testimone __CPM_CER476.mani: clipT (punto della clip), pL/pR
   (quota dei piedi sul piano dell'eroe) e lY/rY (mani). MISURATO: in piedi da fermo i piedi stanno a 0,12-0,16; al 34% (prima) l'eroe
   e' a meta' salto, al 45% e' in piedi con le braccia tese.
   VERDE → congelato a ≥0,43, piedi ≤0,24, mani ≥2,0 sopra i piedi. ROSSO (__CPM_NO_POSA191) → congelato a ≤0,36. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_POSA191 = 1; }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'Posa191' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' }));
  await p.waitForFunction(() => !!window.__CPM_CER425, null, { timeout: 60000 }).catch(() => {});
  const info = await p.evaluate(() => window.__CPM_CER425); const i = info.beats.indexOf('lift'); const t0 = info.beatsD.slice(0, i).reduce((a, x) => a + x, 0);
  let w = null, prev = -1, fermo = 0;
  for (let k = 0; k < 20 && fermo < 2; k++) {/* la clip avanza di aDt*1,4 a fotogramma: si aspetta che smetta di crescere, riportando la cerimonia a meta' sollevamento */
    await p.evaluate(t => { window.__CPM_CER476 = []; window.__CPM_CERT_SET = t; }, t0 + info.beatsD[i] * 0.4); await sleep(3000);
    const W = (await p.evaluate(() => window.__CPM_CER476 || [])).filter(x => x.beat === 'lift' && x.mani && x.mani.clipT != null);
    if (W.length) { w = W[W.length - 1]; if (Math.abs(w.mani.clipT - prev) < 0.005) fermo++; else fermo = 0; prev = w.mani.clipT; } }
  await p.close();
  if (!w) return { campione: false };
  return { campione: true, clipT: w.mani.clipT, piedi: Math.max(w.mani.pL, w.mani.pR), mani: +Math.min(w.mani.lY - w.hero.y, w.mani.rY - w.hero.y).toFixed(2) };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_POSA191):', JSON.stringify(r));
const ok = v.campione && v.clipT >= 0.43 && v.piedi <= 0.24 && v.mani >= 2.0 && r.campione && r.clipT <= 0.36;
await b.close(); srv.close();
console.log(ok ? '✅ posa-sollevamento-191 verde (e il rosso si vede)' : '❌ posa-sollevamento-191 ROSSO'); process.exit(ok ? 0 : 1);
