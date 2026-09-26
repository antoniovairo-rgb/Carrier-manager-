#!/usr/bin/env node
/* [7.999.19] GUARDIANO — NELLA ROVESCIATA L'EROE DA' LE SPALLE ALLA PORTA (appunti PO: «Rovesciata al contrario»). La clip
   mx-scissor-kick cade all'indietro e manda la palla dietro le spalle (provino-clip: bacino da z -0,02 a -0,32); durante il gesto
   il corpo veniva girato VERSO il tiro, come per un tiro normale. Corpi CGTrader accesi, scena «Rovesciata spettacolare!» forzata,
   azione «Rovesciata!». Verde: angolo fra il fronte del corpo e la direzione del tiro >= 150 gradi durante la clip.
   CPM_ROSSO=1 → __CPM_NO_ROV19: il corpo guarda il tiro (angolo piccolo). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_ROV19 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Rov19' }); await sleep(8000);
const letture = [];
for (let giro = 0; giro < 3 && !letture.some(x => x.t > 0.5); giro++) {
  await page.evaluate(() => { window.__CPM_ROV19 = null; window.__CPM_FORCE_SIT(1, true); }); await sleep(900);
  await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
  const t0 = Date.now(); while (Date.now() - t0 < 5000) { const r = await page.evaluate(() => window.__CPM_ROV19); if (r) letture.push(r); await sleep(120); }
  await sleep(2500);
}
await b.close(); srv.close();
const utili = letture.filter(x => x.t > 0.5 && x.t < 1.6);
const med = utili.length ? utili.map(x => x.spalle).sort((a, c) => a - c)[utili.length >> 1] : null;
console.log(`letture durante la rovesciata ${utili.length} · angolo fra fronte del corpo e direzione del tiro, mediana ${med} gradi`);
if (med == null) { console.log('❌ sonda cieca: la clip della rovesciata non e\' partita'); process.exit(2); }
if (ROSSO) { const ok = med < 60; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.19 il corpo guarda la porta' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
console.log(med >= 150 ? '✅ PASS rovesciata-spalle' : '❌ FAIL rovesciata-spalle'); process.exit(med >= 150 ? 0 : 1);
