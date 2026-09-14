#!/usr/bin/env node
/* 7.538 — DOVE NASCE L'AZIONE. Le sei scene «ferme» (<3u di viaggio) del censimento: si guarda dove la
   palla si trova all'APERTURA, quanto dista dalla porta attaccata e dove finisce. Se nasce già in area,
   il difetto è l'apertura della scena, non la conclusione — e il rimedio è un altro. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GI = [0, 6, 77, 128, 137, 166, 12, 145];   // le sei ferme + due sane come controllo
const PORTA = 48.6;                               // piano dei pali in coordinate mondo
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; });
await openMatch(page, port, { name: 'Apert' });
await sleep(500);
for (const gi of GI) {
  await forceSituation(page, gi, { settle: 700, choose: true });
  const ap = await page.evaluate(() => { const s = window.__CPM_STATE(); return { b: s.ball, hero: s.hero ? { x: s.hero.x } : null, tit: (document.body.innerText.match(/[«"']?([^\n]{6,60})[»"']?/) || [])[0] }; });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  let fin = null; for (let k = 0; k < 20; k++) { await sleep(250); fin = await page.evaluate(() => window.__CPM_STATE().ball); }
  const dist0 = ap.b ? (PORTA - ap.b.x) : null;
  console.log(`gi${String(gi).padStart(3)} · apertura x ${String(ap.b ? ap.b.x.toFixed(1) : '?').padStart(6)} (${dist0 != null ? dist0.toFixed(1) : '?'}u dalla porta) → finale x ${String(fin ? fin.x.toFixed(1) : '?').padStart(6)} · spostamento ${fin && ap.b ? (fin.x - ap.b.x).toFixed(1) : '?'}u`);
}
await b.close(); srv.close();
