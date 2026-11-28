#!/usr/bin/env node
/* [7.999.118 guardiano — collaudo PO-191 «eroe in posa sbagliata (gamba alzata)» nella premiazione 3D]
   La clip del sollevamento (mx-victory) si congela a un punto fisso. Testimone __CPM_CER476.mani: clipT (punto della clip), pL/pR
   (quota dei piedi sul piano dell'eroe) e lY/rY (mani). MISURATO: in piedi da fermo i piedi stanno a 0,12-0,16; al 34% (prima) l'eroe
   e' a meta' salto, al 45% e' in piedi con le braccia tese.
   VERDE → congelato a ≥0,43, piedi ≤0,24, mani ≥2,0 sopra i piedi. ROSSO (__CPM_NO_POSA191) → congelato a ≤0,36.
   [giro 443] Le mani 2,0 sono state misurate sull'eroe alto 1,86 (il seme di una carriera nuova): dal giro 431 l'eroe e' alto quanto la
   figurina (1,70) e la stessa posa porta le mani a 1,92. MISURATO: mani / statura dichiarata = 1,129 a 1,70 e a 1,86, la posa e' la
   stessa. La soglia e' la stessa proporzione: mani ≥ 2,0 × statura / 1,86 (a 1,86 vale 2,0), giudicata a due stature (vera e
   seme, __CPM_NO_G431). La statura viene dal testimone (__CPM_CER476.mani.h443): senza, «non giudicato» = rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of r) window[k] = 1; }, rosso);
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
  return { campione: true, statura: w.mani.h443 != null ? w.mani.h443 : null, clipT: w.mani.clipT, piedi: Math.max(w.mani.pL, w.mani.pR), mani: +Math.min(w.mani.lY - w.hero.y, w.mani.rY - w.hero.y).toFixed(2) };
}
const v = await braccio([]), vs = await braccio(['__CPM_NO_G431']), r = await braccio(['__CPM_NO_POSA191']);
const soglia = x => x.statura != null ? +(2.0 * x.statura / 1.86).toFixed(3) : null;
console.log('VERDE (statura vera):', JSON.stringify(v), 'soglia mani', soglia(v)); console.log('VERDE (statura del seme, __CPM_NO_G431):', JSON.stringify(vs), 'soglia mani', soglia(vs));
console.log('ROSSO (__CPM_NO_POSA191):', JSON.stringify(r));
const vok = x => x.campione && x.statura != null && x.clipT >= 0.43 && x.piedi <= 0.24 && x.mani >= soglia(x);
const ok = vok(v) && vok(vs) && r.campione && r.clipT <= 0.36;
await b.close(); srv.close();
console.log(ok ? '✅ posa-sollevamento-191 verde (e il rosso si vede)' : '❌ posa-sollevamento-191 ROSSO'); process.exit(ok ? 0 : 1);
