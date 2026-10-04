#!/usr/bin/env node
/* [7.999.128 guardiano — PO-206 «all'ingresso in campo i giocatori corrono sul posto quando sono in fila» (momento: schierati a centrocampo)]
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
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_WALK197 = {}; window.__CPM_WALKTEST74 = 1; if (r) window.__CPM_NO_FILA206 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
  let fermi = 0, calmi = 0, inWalk = 0, corpi = 0; const t0 = Date.now(); let visto = false;
  while (Date.now() - t0 < 90000) { await sleep(500);
    const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: Object.values((window.__CPM_WALK197 || {}).c || {}) }));
    if (r.ph !== 'walkout') { if (visto) break; continue; } visto = true; inWalk++; corpi = Math.max(corpi, r.c.length);
    for (const x of r.c) { if (x.it == null || x.sp >= 0.5 || (x.run || 0) > 0.3) continue; fermi++; if (x.it <= 1.05) calmi++; } }
  await ctx.close(); return { pm, inWalk, corpi, fermi, calmi, quota: fermi ? +(calmi / fermi).toFixed(3) : null };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_FILA206):', JSON.stringify(r));
const ok = v.corpi >= 20 && v.inWalk >= 16 && v.fermi >= 200 && v.quota >= 0.95 && r.fermi >= 200 && r.quota <= 0.70;
await b.close(); srv.close();
console.log(ok ? '✅ fila-206 verde (e il rosso si vede)' : '❌ fila-206 ROSSO'); process.exit(ok ? 0 : 1);
