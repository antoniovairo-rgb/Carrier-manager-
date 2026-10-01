#!/usr/bin/env node
/* [7.999.101 GUARDIANO rilievo Codex 26-D, decisione PO «rigore sempre, resto nel tetto»] La regola delle scene in piu' (rigore,
   punizione, cross nati da un'origine del motore) e' scenaExtraAmmessa(rigore, numHL), la funzione che il gioco usa nel punto
   d'inserimento. Verde: punizione/cross ammessi a 7 scene e respinti a 8; rigore ammesso a 8 e respinto a 9. Statico: il punto
   d'inserimento chiama la funzione. CPM_RED=1 → __CPM_NO_TETTO101: tutto ammesso (il caso di Codex con 10 scene) → deve FALLIRE. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const usa = /scenaExtraAmmessa\(!!\(_oc26\.origine/.test(fs.readFileSync('../../src/15-live-match.jsx', 'utf8'));
const srv = await startServer(); const b = await launchBrowser(); const page = await b.newPage(); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_TETTO101 = 1; }, RED);
await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Tetto101' }); await sleep(300);
const T = await page.evaluate(() => ({ p7: scenaExtraAmmessa(false, 7), p8: scenaExtraAmmessa(false, 8), p9: scenaExtraAmmessa(false, 9), r8: scenaExtraAmmessa(true, 8), r9: scenaExtraAmmessa(true, 9), r10: scenaExtraAmmessa(true, 10) }));
await b.close(); srv.close();
console.log(`punto d'inserimento usa la regola: ${usa} · punizione/cross a 7/8/9 scene: ${T.p7}/${T.p8}/${T.p9} · rigore a 8/9/10: ${T.r8}/${T.r9}/${T.r10}`);
const ok = usa && T.p7 && !T.p8 && !T.p9 && T.r8 && !T.r9 && !T.r10;
if (RED) { const r = T.p8 || T.r9; console.log(r ? '✅ ROSSO come atteso: senza tetto passano le scene oltre 8' : '❌ il rosso non riproduce'); process.exit(r ? 0 : 1); }
console.log(ok ? '✅ PASS tetto-scene' : '❌ FAIL tetto-scene'); process.exit(ok ? 0 : 1);
