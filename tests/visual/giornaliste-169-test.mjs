#!/usr/bin/env node
/* [7.999.99 GUARDIANO PO-169] Le giornaliste hanno il volto femminile. (1) Statico: le tre costruzioni dell'intervista in
   src/18 portano `f:giornalistaDonna(...)` e i tre punti di disegno usano giornalistaDonna. (2) Sul gioco caricato: per ogni voce di
   JOURNALIST_POOL, tolto il segno `f` (come nei salvataggi creati prima), giornalistaDonna riconosce le donne e solo loro; le
   telecroniste sono donne. CPM_RED=1 → __CPM_NO_GIORN169: senza segno le giornaliste tornano uomini → deve FALLIRE. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const src = fs.readFileSync('../../src/18-career-app.jsx', 'utf8');
const nCostr = (src.match(/f:giornalistaDonna\(/g) || []).length, nDis = (src.match(/tipo=\{giornalistaDonna\(/g) || []).length;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_GIORN169 = 1; }, RED);
await openMatch(page, port, { skipLoadAll: true, name: 'Giorn169' }); await sleep(800);
const R = await page.evaluate(() => { const out = { errati: [], donne: 0, tele: 0 };
  for (const j of JOURNALIST_POOL) { const nudo = { id: j.id, name: j.name }; const g = giornalistaDonna(nudo); if (j.f) out.donne++; if (g !== !!j.f) out.errati.push(j.name + (j.f ? ' (donna)' : ' (uomo)')); }
  for (const n of TELECRONISTE_F23) { if (giornalistaDonna({ name: n })) out.tele++; else out.errati.push(n + ' (telecronista)'); }
  out.teleTot = TELECRONISTE_F23.size; return out; });
await b.close(); srv.close();
console.log(`costruzioni col segno ${nCostr}/3 · disegni ${nDis}/3 · giornaliste riconosciute senza segno: errori ${R.errati.length} (${R.errati.join(', ')}) · telecroniste ${R.tele}/${R.teleTot}`);
const ok = nCostr === 3 && nDis === 3 && R.errati.length === 0 && R.donne > 0;
if (RED) { const r = R.errati.length > 0; console.log(r ? '✅ ROSSO come atteso: senza segno le giornaliste tornano col volto maschile' : '❌ il rosso non riproduce'); process.exit(r ? 0 : 1); }
console.log(ok ? '✅ PASS giornaliste-169' : '❌ FAIL giornaliste-169'); process.exit(ok ? 0 : 1);
