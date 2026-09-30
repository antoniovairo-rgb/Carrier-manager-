#!/usr/bin/env node
/* [7.999.72 guardiano — taccuino PO #110 «Faccio il velo e attacco» → tiro MURATO, codice 111 «portiere fuori tempo»]
   Dopo un tiro murato il pallone si assestava a AWAY_GOAL_X-7 (x 39, dentro l'area): da un muro a x 21 risaliva di 17u verso
   la porta col portiere immobile. VERDE → nella scena 110 (esito forzato fallito, GLB-ON) il pallone finisce a meno di 3u
   OLTRE il punto del muro (misurato: torna a x 18). ROSSO (__CPM_NO_MURO70) → risale di oltre 10u. Uso: node muro-70.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; if (r) window.__CPM_NO_MURO70 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Muro70' }); await sleep(1200);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_FORCE_SIT(110, true); window.__CPM_FROZEN = false; });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); });
  await sleep(9000);
  const r = await page.evaluate(() => { const s = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); const sm = (s && (s.samples || s)) || [];
    const L = sm.slice(-120); let bx = null, fin = null; for (const q of L) { if ((q.ws | 0) === 2) bx = +q.x; if (bx != null) fin = +q.x; }
    const tl = (window.__CPM_TIMELINE && window.__CPM_TIMELINE() || []).filter(e => e.type === 'ActionResolved').slice(-1)[0] || null;
    return { muro: bx, fine: fin, key: tl && tl.key }; });
  await page.close(); return r;
}
const v = await braccio(false), r = await braccio(true);
const d = x => (x.muro == null || x.fine == null) ? null : +(x.fine - x.muro).toFixed(1);
console.log(`VERDE: muro a x ${(+v.muro).toFixed(1)} · pallone finisce a x ${(+v.fine).toFixed(1)} (Δ ${d(v)}) · esito ${v.key}`);
console.log(`ROSSO (__CPM_NO_MURO70): muro a x ${(+r.muro).toFixed(1)} · pallone finisce a x ${(+r.fine).toFixed(1)} (Δ ${d(r)})`);
const ok = d(v) != null && d(r) != null && d(v) < 3 && d(r) > 10;
await b.close(); srv.close();
console.log(ok ? '✅ muro-70 verde (e il rosso si vede)' : '❌ muro-70 ROSSO'); process.exit(ok ? 0 : 1);
