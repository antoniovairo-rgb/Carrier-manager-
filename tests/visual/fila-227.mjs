#!/usr/bin/env node
/* [7.999.160 guardiano — PO-227 «nella fila da fermi i bambini continuano a correre» (collaudatrice giro 7: 22/22 bambini con jog a peso 1,00 da fermi). Testimone __CPM_FILA227 (letture dei bambini fermi e di quelli fermi con corsa >0,3). VERDE: corsa da fermi <=10% su almeno 100 letture. ROSSO (__CPM_NO_FILA227): >=80%. Derivato da fila-206 (stesso salvataggio e stesso walkout forzato). Uso: node fila-227.mjs
   ORIGINE fila-206: [7.999.128 guardiano — PO-206 «all'ingresso in campo i giocatori corrono sul posto quando sono in fila» (momento: schierati a centrocampo)]
   La clip «idle» dei corpi (10,2 s) piega le ginocchia di 40-55 gradi quasi ogni secondo: in fila sembra una corsa sul posto. Nel walkout
   l'idle deve restare nella finestra calma 0-1 s (escursione gambe al massimo 11 gradi). Testimone __CPM_WALK197 (campo it = tempo della
   clip idle), su TUTTO il walkout (fino a 90 s reali, non i primi 12). VERDE: almeno il 95% delle letture dei corpi fermi dentro 0-1,05 s.
   ROSSO (__CPM_NO_FILA206): almeno il 30% fuori. Uso: node fila-206.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; if (r) window.__CPM_NO_FILA227 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
  let visto = false; const t0 = Date.now();
  while (Date.now() - t0 < 90000) { await sleep(500); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph !== 'walkout') { if (visto) break; continue; } visto = true; }
  const K = await page.evaluate(() => window.__CPM_FILA227 || null);
  await ctx.close(); return { pm, visto, ...(K || {}), quota: K && K.fermi ? +(K.fermiCorsa / K.fermi).toFixed(3) : null };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_FILA227):', JSON.stringify(r));
const ok = v.fermi >= 100 && v.quota <= 0.10 && r.fermi >= 100 && r.quota >= 0.80;
await b.close(); srv.close();
console.log(ok ? '✅ fila-227 verde (e il rosso si vede)' : '❌ fila-227 ROSSO'); process.exit(ok ? 0 : 1);
