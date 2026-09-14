#!/usr/bin/env node
/* 7.538 — perché la timeline non nasce: si legge hlType/hlVariant/fase delle scene in esame. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GI = [6, 77, 166, 50, 76, 96, 175, 0, 128, 137, 12, 145];
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; window.__CPM_CINE = 1; });
await openMatch(page, port, { name: 'Tlt' });
await sleep(400);
console.log('cine acceso?', await page.evaluate(() => !!window.__CPM_CINE));
for (const gi of GI) {
  await page.evaluate(() => { try { window.__CPM_TLSEG = null; } catch (e) {} });
  await forceSituation(page, gi, { settle: 500, choose: true });
  const rows = [];
  for (let k = 0; k < 8; k++) {
    const g = await page.evaluate(() => { const q = window.__CPM_GESTURE && window.__CPM_GESTURE(); return { t: q && q.hlType, v: q && q.hlVariant, ph: q && q.phase, tl: !!window.__CPM_TLSEG }; });
    rows.push(`${g.ph}/${g.t}${g.tl ? '+TL' : ''}`);
    await sleep(400);
  }
  const t = await page.evaluate(() => window.__CPM_TLSEG);
  console.log(`gi${String(gi).padStart(3)} · ${rows.join(' ')} · TLSEG=${t ? t.seg.length + ' seg' : 'null'}`);
}
await b.close(); srv.close();
