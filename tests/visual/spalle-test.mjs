#!/usr/bin/env node
/* [7.999.21] GUARDIANO — SPALLE NON SPIOVENTI (collaudo PO: «spalle troppo spioventi, sproporzionate rispetto al corpo»). Corpi
   CGTrader accesi, scena forzata: pendenza fra base del collo e attacco delle braccia, misurata a ogni fotogramma sulle ossa animate
   (__CPM_SPALLE21). Verde: mediana <= 28 gradi. CPM_ROSSO=1 → __CPM_NO_SPALLE21 (misurato 37,5). Provino fotografico:
   node tests/visual/provino-spalle.mjs → tests/character-lab/spalle/provino.png */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_SPALLE21 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Spalle21' }); await sleep(12000);
await page.evaluate(() => { window.__CPM_SPALLE21 = []; window.__CPM_FORCE_SIT(0, false); }); await sleep(6000);
const v = await page.evaluate(() => (window.__CPM_SPALLE21 || []).slice().sort((a, c) => a - c));
await b.close(); srv.close();
const med = v.length ? v[v.length >> 1] : null;
console.log(`fotogrammi ${v.length} · pendenza collo-spalla mediana ${med} gradi`);
if (med == null) { console.log('❌ sonda cieca: nessun corpo CGTrader misurato'); process.exit(2); }
if (ROSSO) { const ok = med > 32; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.21 le spalle spiovono' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
console.log(med <= 28 ? '✅ PASS spalle' : '❌ FAIL spalle'); process.exit(med <= 28 ? 0 : 1);
