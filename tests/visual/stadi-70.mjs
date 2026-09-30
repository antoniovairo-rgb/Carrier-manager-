#!/usr/bin/env node
/* [7.999.70 guardiano — stadi fase 2: fondale oltre le tribune + settori d'angolo a gradinata]
   Galleria fase 1: negli stadi piccoli meta' del quadro era cielo piatto (nessun fondale), e i settori d'angolo degli impianti
   con angoli chiusi erano CUBI col pubblico dipinto su tutte le facce («blocco a puntini»).
   VERDE → il fondale esiste (testimone __CPM_FONDALE70, tipo paese in provincia, citta' nel grande) e su un impianto con
            angoli chiusi (tedesco) i quattro settori d'angolo sono gradinate (__CPM_ANGOLI70.n = 4).
   ROSSO (__CPM_NO_FONDALE70 + __CPM_NO_ANGOLI70) → niente fondale, niente gradinate d'angolo. Uso: node stadi-70.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function leggi(caso, rosso) {
  const [tpl, cap] = caso.split(':');
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TOD = 'night'; window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; if (o.r) { window.__CPM_NO_FONDALE70 = 1; window.__CPM_NO_ANGOLI70 = 1; } }, { tpl, cap: +cap, r: rosso });
  await openMatch(page, port, { skipLoadAll: true, name: 'Stadi70' }); await sleep(1000);
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true));
  await page.waitForFunction(() => !!window.__CPM_PALI69, null, { timeout: 30000 }).catch(() => {});
  const w = await page.evaluate(() => ({ f: window.__CPM_FONDALE70 || null, a: (window.__CPM_ANGOLI70 || {}).n | 0, ok: !!window.__CPM_PALI69 }));
  await page.close(); return w;
}
let ok = true;
const casi = [['provincia:3000', 'paese', 0], ['tedesco:50000', 'citta', 4]];
for (const [c, tipo, angoli] of casi) {
  const v = await leggi(c, false), r = await leggi(c, true);
  console.log(`${c}: verde fondale ${v.f ? v.f.tipo : 'NESSUNO'} · angoli a gradinata ${v.a} | rosso fondale ${r.f ? r.f.tipo : 'nessuno'} · angoli ${r.a}${v.ok && r.ok ? '' : ' · CIECO (scena non costruita)'}`);
  if (!v.ok || !r.ok || !v.f || v.f.tipo !== tipo || v.a !== angoli || r.f || r.a !== 0) ok = false;
}
await b.close(); srv.close();
console.log(ok ? '✅ stadi-70 verde (e il rosso si vede)' : '❌ stadi-70 ROSSO'); process.exit(ok ? 0 : 1);
