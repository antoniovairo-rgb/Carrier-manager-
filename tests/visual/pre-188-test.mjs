#!/usr/bin/env node
/* [7.999.111 GUARDIANO PO-188 — collaudo PO 02/10 «statistiche pre partita con sfondo troppo scuro» (seconda volta dopo la 7.937)]
   Ingresso in campo (__CPM_FORCE_WALKOUT): il vetro della scheda pre-partita deve avere opacità ≤ 0,5 e il testo un'ombra per restare
   leggibile sul prato. CPM_RED=1 → __CPM_NO_PRE188 (vetro 0,74) → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_PRE188 = 1; }, RED);
await openMatch(page, port, { skipLoadAll: true }); await sleep(800);
await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT()); await sleep(1500);
const r = await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find(d => /rgba\(24, 35, 56/.test(getComputedStyle(d).backgroundImage || ''));
  if (!el) return null; const cs = getComputedStyle(el); const a = [...cs.backgroundImage.matchAll(/rgba\(24, 35, 56, ([\d.]+)\)/g)].map(m => +m[1]); return { alfa: Math.max(...a), ombra: cs.textShadow }; });
await b.close(); srv.close();
console.log(JSON.stringify(r));
const ok = r && r.alfa <= 0.5 && r.ombra && r.ombra !== 'none';
if (RED) { console.log(!ok ? '✅ ROSSO come atteso: vetro scuro' : '❌ il rosso non riproduce'); process.exit(!ok ? 0 : 1); }
console.log(ok ? '✅ PASS pre-188' : '❌ FAIL pre-188'); process.exit(ok ? 0 : 1);
