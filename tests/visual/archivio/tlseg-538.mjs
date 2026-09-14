#!/usr/bin/env node
/* 7.538 — IL PIANO DELL'AZIONE. Sulle scene che nascono già in area (censimento nascite-538) si legge la
   timeline VERA costruita da buildHLTimeline (__CPM_TLSEG, test-only; richiede __CPM_CINE=1 perché
   ?cpmtest=1 spegne l'executor cine — trappola pagata nel 7.457, e la scena resta in hl_choose finché
   non si RISOLVE: senza la risoluzione l'executor non parte e la sonda legge null su tutto). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GI = [6, 77, 166, 50, 76, 96, 175, 0, 128, 137, 12, 145];
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; window.__CPM_CINE = 1; });
await openMatch(page, port, { name: 'Tls' });
await sleep(500);
for (const gi of GI) {
  await page.evaluate(() => { try { window.__CPM_TLSEG = null; } catch (e) {} });
  await forceSituation(page, gi, { settle: 700, choose: true });
  const ap = await page.evaluate(() => { const s = window.__CPM_STATE(); return s.ball ? { x: +s.ball.x.toFixed(1), y: +s.ball.y.toFixed(1) } : null; });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  let t = null;
  for (let k = 0; k < 24; k++) { await sleep(200); t = await page.evaluate(() => window.__CPM_TLSEG); if (t) break; }
  const ty = await page.evaluate(() => { const q = window.__CPM_GESTURE && window.__CPM_GESTURE(); return q ? q.hlType : null; });
  if (!t) { console.log(`gi${String(gi).padStart(3)} · ${ty} · apertura x${ap ? ap.x : '?'} · NESSUNA TIMELINE`); continue; }
  console.log(`gi${String(gi).padStart(3)} · ${ty} · apertura x${ap ? ap.x : '?'} · key=${t.k} · buildN=${t.n} · segmenti=${t.seg.length}`);
  for (const g of t.seg) console.log(`        ${g.tag}/${g.kind} [${g.f == null ? '-' : g.f}→${g.t == null ? '-' : g.t}] ${g.from ? '(' + (+g.from[0]).toFixed(0) + ',' + (+g.from[1]).toFixed(0) + ')' : ''}→${g.to ? '(' + (+g.to[0]).toFixed(0) + ',' + (+g.to[1]).toFixed(0) + ')' : ''} ${g.dur != null ? (+g.dur).toFixed(2) + 's' : ''}`);
}
await b.close(); srv.close();
