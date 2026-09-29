#!/usr/bin/env node
/* [7.999.68 guardiano — taccuino PO #1 «Rovesciata!» mancata (codice 000, corpo↔porta 177°)] La sforbiciata si monta col nome «volley»:
   l'aggancio del pallone al piede non scattava e la clip (2,8 s) correva a ~4x, quindi il piede passava prima che il pallone partisse.
   VERDE → sulla «Rovesciata!» (gi1, GLB-ON, esito mancato) il contatto del piede e' agganciato all'osso del piede e cade con la clip a
           u 0,20-0,40 (taratura 0,29) a ridosso della partenza dell'arco.
   ROSSO (__CPM_NO_ROV69) → nessun aggancio, o clip lontana dal contatto. Uso: node rovesciata-69.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; if (r) window.__CPM_NO_ROV69 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Rov69' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const az = await page.evaluate(() => Math.max(0, (SITUATIONS[1].actions || SITUATIONS[1].acts || []).findIndex(a => /rovesciat/i.test(a.label || a.l || ''))));
  await page.evaluate(() => { window.__CPM_CGTRADER_KICK_TOUCH = null; window.__CPM_ROVESCIATA23 = null; window.__CPM_FORCE_SIT(1, true); window.__CPM_FROZEN = false; });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(a => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(a); }, az);
  await sleep(8000);
  const r = await page.evaluate(() => ({ kt: window.__CPM_CGTRADER_KICK_TOUCH || null, m: window.__CPM_ROVESCIATA23 || null }));
  await page.close(); return r;
}
let ok = true;
const buono = r => !!(r.m && r.m.montata && r.kt && /foot/i.test(String(r.kt.anchor)) && r.kt.u >= 0.2 && r.kt.u <= 0.4);
const desc = r => `montata ${r.m ? r.m.montata : 0} · aggancio ${r.kt ? r.kt.anchor : 'nessuno'} · clip u ${r.kt ? r.kt.u : '—'} (arcT ${r.kt ? r.kt.arcT : '—'})`;
if (!process.env.CPM_ROSSO) { const v = await braccio(false); console.log('VERDE: ' + desc(v)); if (!buono(v)) { ok = false; console.log('✗ verde fallito'); } }
const r = await braccio(true); console.log('ROSSO (__CPM_NO_ROV69): ' + desc(r));
if (buono(r)) { ok = false; console.log('✗ il rosso non mostra il difetto: il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ rovesciata-69 verde (e il rosso si vede)' : '❌ rovesciata-69 ROSSO'); process.exit(ok ? 0 : 1);
