#!/usr/bin/env node
/* [7.999.69 guardiano — stadi fase 2, galleria fase 1: «pali dei riflettori davanti alla tribuna centrale»] Con le torri
   «perimetrali» (comunale, spagnolo) i due pali centrali dei lati lunghi stavano a endZ-6, sui primi gradoni della tribuna
   (la tribuna occupa endZ ± endD/2), in mezzo all'inquadratura TV.
   VERDE → nessun palo perimetrale con |x| < 0,3·sideX dentro o davanti alla tribuna (|z| < endZ + endD/2).
   ROSSO (__CPM_NO_PALI69) → due pali per impianto tornano davanti. Testimone __CPM_PALI69 (posizioni vere dal costruttore).
   Uso: node pali-69.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const CASI = ['comunale:9000', 'comunale:18000', 'spagnolo:50000'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function conta(caso, rosso) {
  const [tpl, cap] = caso.split(':');
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; if (o.r) window.__CPM_NO_PALI69 = 1; }, { tpl, cap: +cap, r: rosso });
  await openMatch(page, port, { skipLoadAll: true, name: 'Pali69' }); await sleep(1000);
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true));
  await page.waitForFunction(() => !!window.__CPM_PALI69, null, { timeout: 30000 }).catch(() => {});
  const w = await page.evaluate(() => window.__CPM_PALI69 || null); await page.close();
  if (!w || w.tipo !== 'perimetrali') return { cieco: true, w };
  const davanti = w.pos.filter(([x, z]) => Math.abs(x) < 0.3 * w.sideX && Math.abs(z) < w.endZ + w.endD / 2).length;
  return { davanti, w };
}
let ok = true;
for (const c of CASI) {
  const v = await conta(c, false), r = await conta(c, true);
  console.log(`${c}: verde ${v.cieco ? 'CIECO' : v.davanti + ' pali davanti'} · rosso ${r.cieco ? 'CIECO' : r.davanti + ' pali davanti'}`);
  if (v.cieco || r.cieco || v.davanti !== 0 || r.davanti < 2) ok = false;
}
await b.close(); srv.close();
console.log(ok ? '✅ pali-69 verde (e il rosso si vede)' : '❌ pali-69 ROSSO'); process.exit(ok ? 0 : 1);
