#!/usr/bin/env node
/* 7.538 — CENSIMENTO DELLE NASCITE: per ogni situation si misura DOVE nasce la palla (coord. gioco,
   porta attaccata a x=100). Le scene che aprono oltre x88 sono già dentro l'area: qualunque cosa
   accada dopo non può somigliare a un'azione, perché manca l'antefatto. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; });
await openMatch(page, port, { name: 'Nasc' });
await sleep(400);
const N = +(process.env.CPM_N || 185);
const rows = [];
for (let gi = 0; gi < N; gi++) {
  try {
    await forceSituation(page, gi, { settle: 220, choose: false });
    const r = await page.evaluate(() => { const s = window.__CPM_STATE(); return { x: s.ball ? s.ball.x : null, ht: s.hlType || null }; });
    if (r.x != null) rows.push({ gi, x: r.x, ht: r.ht });
  } catch (e) { /* scena non forzabile: si salta */ }
}
await b.close(); srv.close();
const inArea = rows.filter(r => r.x >= 88);
const trequarti = rows.filter(r => r.x >= 70 && r.x < 88);
const lontane = rows.filter(r => r.x < 70);
console.log(`scene misurate: ${rows.length}`);
console.log(`  nascono DENTRO L'AREA (x>=88): ${inArea.length} (${Math.round(inArea.length / rows.length * 100)}%)`);
console.log(`  nascono in trequarti (70-88):  ${trequarti.length} (${Math.round(trequarti.length / rows.length * 100)}%)`);
console.log(`  nascono più lontano (<70):     ${lontane.length} (${Math.round(lontane.length / rows.length * 100)}%)`);
console.log(`\nle più estreme (palla a meno di 6u dalla porta all'apertura):`);
rows.filter(r => r.x >= 94).sort((a, c) => c.x - a.x).slice(0, 14).forEach(r => console.log(`  gi${String(r.gi).padStart(3)} · x ${r.x.toFixed(1)}`));
