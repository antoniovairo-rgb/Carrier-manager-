#!/usr/bin/env node
/* [7.999.21] GUARDIANO — SPALLE NON SPIOVENTI (collaudo PO: «spalle troppo spioventi, sproporzionate rispetto al corpo»). Corpi
   CGTrader accesi, scena forzata: pendenza fra base del collo e attacco delle braccia, misurata a ogni fotogramma sulle ossa animate
   (__CPM_SPALLE21). Verde: mediana <= 28 gradi. CPM_ROSSO=1 → __CPM_NO_SPALLE21 (misurato 37,5). Provino fotografico:
   node tests/visual/provino-spalle.mjs → tests/character-lab/spalle/provino.png */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const giro = async (flags) => { const pg = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(pg);
  await pg.addInitScript(f => { window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; }, flags);
  await openMatch(pg, port, { skipLoadAll: true, name: 'Spalle21' }); await sleep(12000);
  await pg.evaluate(() => { window.__CPM_SPALLE21 = []; window.__CPM_BRACCIO22 = []; window.__CPM_FORCE_SIT(0, false); }); await sleep(6000);
  const r = await pg.evaluate(() => ({ s: (window.__CPM_SPALLE21 || []).slice().sort((a, c) => a - c), b: (window.__CPM_BRACCIO22 || []).slice().sort((a, c) => a - c) })); await pg.close(); return r; };
const mid = a => a.length ? a[a.length >> 1] : null;
/* [7.999.22] le braccia: stessa apertura del corpo SENZA correzione delle spalle (collaudo PO «braccia troppo alte, a T») */
const orig = await giro(['__CPM_NO_SPALLE21']);
const R = await giro(ROSSO ? ['__CPM_NO_SPALLE21_X', '__CPM_NO_BRACCIA22'] : []);
const v = ROSSO ? R.s : R.s; const bOrig = mid(orig.b), bOra = mid(R.b);
await page.close(); await b.close(); srv.close();
console.log(`apertura del braccio (gradi dalla verticale): originale ${bOrig} · ora ${bOra}`);
if (ROSSO) { const ok = bOra != null && bOrig != null && bOra - bOrig > 10; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.22 le braccia si alzano a T' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
if (bOra == null || bOrig == null || Math.abs(bOra - bOrig) > 6) { console.log('❌ FAIL spalle: le braccia non hanno l\'apertura originale'); process.exit(1); }
const med = v.length ? v[v.length >> 1] : null;
console.log(`fotogrammi ${v.length} · pendenza collo-spalla mediana ${med} gradi`);
if (med == null) { console.log('❌ sonda cieca: nessun corpo CGTrader misurato'); process.exit(2); }
if (ROSSO) { const ok = med > 32; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.21 le spalle spiovono' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
console.log(med <= 28 ? '✅ PASS spalle' : '❌ FAIL spalle'); process.exit(med <= 28 ? 0 : 1);
