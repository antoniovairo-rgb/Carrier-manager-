#!/usr/bin/env node
/* SONDA (non-gate, giro 116 PO-322) — gli asset che il gioco VERO richiede sono tutti nella dist ridotta?
   Gioca una partita sul SORGENTE a GLB ACCESO (come l'utente), registra ogni richiesta a /assets/ e controlla
   che il file esista in dist/ (costruita da tools/build-dist.mjs). Esce 1 se ne manca anche uno.
   Nota: CH38 (footballer*.glb, anim-*.glb in radice) e' escluso dalla dist di proposito dal giro 39 —
   se la partita lo chiede, e' elencato a parte (il gioco ha il ripiego procedurale). */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const DIST = path.resolve('../../dist'); const MS = +(process.env.CPM_MS || 70000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const req = new Set(); page.on('request', r => { const m = r.url().match(/\/assets\/([^?#]+)/); if (m) req.add(decodeURIComponent(m[1])); });
await page.addInitScript(() => { window.__CPM_GLB = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'DistProbe' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 901, policy: 'seeded', tickMs: 300 }));
await sleep(MS);
const ch38 = /^(footballer[a-z-]*\.glb|anim-[a-z-]+\.glb)$/;
const mancanti = [], ch = [];
for (const f of [...req].sort()) if (!fs.existsSync(path.join(DIST, 'assets', f))) (ch38.test(f) ? ch : mancanti).push(f);
console.log(`asset richiesti dalla partita: ${req.size} · presenti in dist: ${req.size - mancanti.length - ch.length} · CH38 (escluso di proposito): ${ch.length} · MANCANTI: ${mancanti.length}`);
mancanti.forEach(f => console.log('  MANCA ' + f)); ch.slice(0, 3).forEach(f => console.log('  (ch38) ' + f));
await b.close(); srv.close(); process.exit(mancanti.length ? 1 : 0);
