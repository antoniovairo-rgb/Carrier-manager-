#!/usr/bin/env node
/* [7.999.62 guardiano — taccuino PO #78 «punizione fuori: il portiere non si tuffa»] Dal 5.83.0 il portiere non reagiva ai tiri
   fuori, compresa la punizione che esce di poco. Ora sul piazzato vicino ai pali (e sul rigore fuori) si tuffa, corto.
   VERDE → sulle punizioni «Bordata potente» uscite (percorso vero handleSetPiece, GLB-ON) il portiere monta gk_dive;
   ROSSO → con __CPM_NO_FKGK62 le stesse uscite non hanno alcun gesto del portiere (il guardiano deve accorgersene).
   Uso: node punizione-fuori-62.mjs   ·   CPM_ROSSO=1 per il solo braccio rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; if (r) window.__CPM_NO_FKGK62 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'FKW' + (rosso ? 'R' : 'V') }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const fuori = [];
  for (let k = 0; k < 16 && fuori.length < 2; k++) {
    await page.evaluate(() => { window.__CPM_SP3 = []; window.__CPM_GKACT = {}; window.__CPM_FORCE_SIT(13, true); window.__CPM_FROZEN = false; });
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(600);
    await page.evaluate(() => window.__CPM_SETPIECE('fk_power'));
    await sleep(3500);
    const r = await page.evaluate(() => ({ e: ((window.__CPM_SP3 || []).slice(-1)[0] || {}).dopo, g: (window.__CPM_GKACT || {}).last || null }));
    if (r.e === 'wide') fuori.push(r.g);
  }
  await page.close(); return fuori;
}
let ok = true;
if (!process.env.CPM_ROSSO) {
  const v = await braccio(false);
  console.log(`VERDE: ${v.length} punizioni fuori · gesti del portiere ${JSON.stringify(v)}`);
  if (!v.length || v.some(g => g !== 'gk_dive')) { ok = false; console.log('✗ verde fallito'); }
}
const r = await braccio(true);
console.log(`ROSSO (__CPM_NO_FKGK62): ${r.length} punizioni fuori · gesti del portiere ${JSON.stringify(r)}`);
if (!r.length || r.some(g => g === 'gk_dive')) { ok = false; console.log('✗ il rosso non mostra il difetto: il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ punizione-fuori-62 verde (e il rosso si vede)' : '❌ punizione-fuori-62 ROSSO'); process.exit(ok ? 0 : 1);
