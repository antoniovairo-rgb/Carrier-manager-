#!/usr/bin/env node
/* [7.999.117 guardiano — collaudo PO-191 «trofeo davanti / non in mano» nella premiazione 3D]
   Cerimonia di campionato forzata coi corpi GLB, salto a meta' del sollevamento (__CPM_CERT_SET). Il testimone __CPM_CER476.mani da'
   nello stesso fotogramma la quota della coppa e delle due mani: si misura lo scarto fra il punto di presa (manici, 0,14 x scala 0,62
   sopra la base) e il punto medio delle mani. MISURATO prima: 0,45 (coppa staccata sopra le mani).
   VERDE → scarto mediano ≤ 0,20 e la coppa non copre il volto (__CPM_PREM24.faccia = 0). ROSSO (__CPM_NO_COPPA191) → scarto ≥ 0,35. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_COPPA191 = 1; }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'Coppa191' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' })); await sleep(3000);
  await p.waitForFunction(() => !!window.__CPM_CER425, null, { timeout: 60000 }).catch(() => {}); const info = await p.evaluate(() => window.__CPM_CER425 || null); const i = info ? info.beats.indexOf('lift') : -1;
  const t0 = i > 0 ? info.beatsD.slice(0, i).reduce((a, x) => a + x, 0) + info.beatsD[i] * 0.45 : 8.5;
  await p.evaluate(t => { window.__CPM_CER476 = []; window.__CPM_PREM24 = {}; window.__CPM_CERT_SET = t; }, t0); await sleep(8000);
  const W = (await p.evaluate(() => window.__CPM_CER476 || [])).filter(w => w.beat === 'lift' && w.mani && w.hero.y > 0.9);
  const faccia = await p.evaluate(() => (window.__CPM_PREM24 || {}).faccia);
  await p.close();
  const sc = W.map(w => Math.abs((w.mani.tY + 0.14 * 0.62) - (w.mani.lY + w.mani.rY) / 2));
  return { campioni: W.length, scarto: med(sc) != null ? +med(sc).toFixed(2) : null, faccia };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_COPPA191):', JSON.stringify(r));
const ok = v.campioni >= 10 && v.scarto <= 0.20 && !(v.faccia > 0) && r.campioni >= 10 && r.scarto >= 0.35;
await b.close(); srv.close();
console.log(ok ? '✅ coppa-mani-191 verde (e il rosso si vede)' : '❌ coppa-mani-191 ROSSO'); process.exit(ok ? 0 : 1);
