#!/usr/bin/env node
/* [7.999.16] GUARDIANO — LA PRIMA SCENA NON SI BLOCCA (appunti PO 26/09 sul tap-in: «001 il pallone non e' ai piedi di nessuno dei
   nostri», «007 la camera salta»). MISURATO col profilo CPU: all'apertura del PRIMO highlight un compito unico di 2-3 s — 1,5-1,8 s di
   texImage2D (texture dei corpi CGTrader mai caricate) e 1,4 s di getProgramParameter (shader d'ombra e varianti mai compilati). In
   quel buco eroe, palla e camera arrivano in fotogrammi diversi. Corpi CGTrader accesi (niente __CPM_GLB=false), 25 s di cronaca, poi
   il tap-in forzato. Verde: prima della scena nessuna texture in attesa (<= 5) e nella scena nessun programma nuovo.
   CPM_ROSSO=1 → __CPM_NO_TEX16: centinaia di texture in attesa e programmi nuovi alla prima scena. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_TEX16 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Primo16' }); await sleep(25000);
const attesa = await page.evaluate(() => window.__CPM_TEXNEW16 ? window.__CPM_TEXNEW16().length : null);
const p0 = await page.evaluate(() => window.__CPM_PROGS16 ? window.__CPM_PROGS16().map(p => p.k) : null);
await page.evaluate(() => window.__CPM_FORCE_SIT(2, false)); await sleep(5000);
const p1 = await page.evaluate(() => window.__CPM_PROGS16 ? window.__CPM_PROGS16().map(p => p.k) : null);
await b.close(); srv.close();
const nuovi = p0 && p1 ? p1.filter(k => !p0.includes(k)).length : null;
console.log(`texture in attesa prima della scena: ${attesa} · programmi nuovi alla prima scena: ${nuovi} (prima ${p0 && p0.length}, dopo ${p1 && p1.length})`);
if (attesa == null || nuovi == null) { console.log('❌ sonda cieca: agganci __CPM_TEXNEW16/__CPM_PROGS16 assenti (corpi CGTrader non montati?)'); process.exit(2); }
if (ROSSO) { const ok = attesa > 5 && nuovi > 0; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.16 la prima scena carica texture e compila shader' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const fails = []; if (attesa > 5) fails.push(`${attesa} texture ancora da caricare`); if (nuovi > 0) fails.push(`${nuovi} programmi compilati dentro la scena`);
console.log(fails.length ? '❌ FAIL primo-highlight\n  ' + fails.join('\n  ') : '✅ PASS primo-highlight'); process.exit(fails.length ? 1 : 0);
