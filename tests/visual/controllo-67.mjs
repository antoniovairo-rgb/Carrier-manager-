#!/usr/bin/env node
/* [7.999.66 guardiano — taccuino PO #56 «012 verticalizzazione all'indietro»] Nel tiro dal limite col terzo uomo (EDGE_SHOT) il tocco di
   preparazione riportava l'eroe tre unita' indietro prima del tiro. Si legge la costruzione vera (__CPM_TLSEG) su gi56 e gi27.
   VERDE → il tratto «control» va verso la porta (to.x >= from.x); ROSSO (__CPM_NO_CTRL67) → almeno un tratto va indietro.
   Uso: node controllo-67.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso) {
  const out = [];
  for (const gi of [56, 27]) {
    const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC = 1; if (r) window.__CPM_NO_CTRL67 = 1; }, rosso);
    await openMatch(page, port, { skipLoadAll: true, name: 'Ctrl67' }); await sleep(1200);
    await page.evaluate(g => { window.__CPM_FORCE_SIT(g, true); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(600); await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); }); await sleep(2500);
    const T = await page.evaluate(() => window.__CPM_TLSEG || null); await page.close();
    const c = T && T.seg ? T.seg.find(s => s.tag === 'control') : null;
    out.push({ gi, dx: c ? +(c.to[0] - c.from[0]).toFixed(1) : null });
  }
  return out;
}
const v = await giro(false), r = await giro(true);
console.log('VERDE', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_CTRL67)', JSON.stringify(r));
const okV = v.every(x => x.dx != null && x.dx >= 0), okR = r.some(x => x.dx != null && x.dx < 0);
await b.close(); srv.close();
console.log(okV ? '✅ il tocco di preparazione va verso la porta' : '❌ tocco di preparazione all\'indietro');
console.log(okR ? '✅ il rosso __CPM_NO_CTRL67 riproduce il passo indietro' : '❌ il rosso non si distingue');
process.exit(okV && okR ? 0 : 1);
