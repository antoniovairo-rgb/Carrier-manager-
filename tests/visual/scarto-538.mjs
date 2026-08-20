#!/usr/bin/env node
/* 7.538 — LO SCARTO D'APERTURA. Il piano (buildHLTimeline) e la PALLA all'apertura sono la stessa cosa?
   Sulle scene «ferme» il piano esiste (tlseg-538) e parte a 76-86; se la palla si apre a 97 il difetto non
   è il piano ma DOVE NASCE il pallone. Qui si misurano insieme: palla, eroe, primo e ultimo punto del piano. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GI = [6, 77, 50, 76, 96, 175, 0, 12, 145, 3, 18, 33, 60, 110];
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; window.__CPM_CINE = 1; });
await openMatch(page, port, { name: 'Scar' });
await sleep(500);
console.log('gi   · palla@apertura · eroe   · piano da → a          · scarto palla-piano');
for (const gi of GI) {
  await page.evaluate(() => { try { window.__CPM_TLSEG = null; } catch (e) {} });
  await forceSituation(page, gi, { settle: 700, choose: true });
  const ap = await page.evaluate(() => { const s = window.__CPM_STATE(); return { b: s.ball ? [+s.ball.x.toFixed(1), +s.ball.y.toFixed(1)] : null, h: s.hero ? [+s.hero.x.toFixed(1), +s.hero.y.toFixed(1)] : null }; });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  let t = null;
  for (let k = 0; k < 24; k++) { await sleep(200); t = await page.evaluate(() => window.__CPM_TLSEG); if (t) break; }
  const s0 = t && t.seg[0] && t.seg[0].from, s1 = t && t.seg[t.seg.length - 1] && t.seg[t.seg.length - 1].to;
  const sc = (ap.b && s0) ? Math.hypot(ap.b[0] - s0[0], ap.b[1] - s0[1]) : null;
  console.log(`gi${String(gi).padStart(3)} · ${ap.b ? ('(' + ap.b[0] + ',' + ap.b[1] + ')').padEnd(14) : '?'.padEnd(14)} · ${ap.h ? ('(' + ap.h[0] + ',' + ap.h[1] + ')').padEnd(14) : '?'.padEnd(14)} · ${t ? ('(' + s0[0].toFixed(0) + ',' + s0[1].toFixed(0) + ') → (' + s1[0].toFixed(0) + ',' + s1[1].toFixed(0) + ')').padEnd(22) : 'nessun piano'.padEnd(22)} · ${sc != null ? sc.toFixed(1) + 'u' : '-'}`);
}
await b.close(); srv.close();
