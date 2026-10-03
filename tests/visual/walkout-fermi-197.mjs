#!/usr/bin/env node
/* [7.999.115 guardiano — collaudo PO-197 «i giocatori corrono sul posto, non sono in modalita' idle nel prepartita»]
   Walkout forzato coi corpi GLB, testimone __CPM_WALK197 (velocita' vera e peso della clip di corsa di ogni corpo).
   Si conta, ogni 0,5 s per 12 s, quanti corpi hanno la corsa sopra 0,3 mentre si muovono a meno di 0,5 u/s («corsa sul posto»).
   MISURATO prima della correzione: 5 corpi per 5 s di fila. VERDE → somma dei campioni ≤ 1/3 del rosso e al massimo 2 per campione.
   ROSSO (__CPM_NO_FERMI197) → somma ≥ 15. Uso: node walkout-fermi-197.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_WALK197 = {}; window.__CPM_WALKTEST74 = 1; if (r) window.__CPM_NO_FERMI197 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
  let somma = 0, picco = 0, corpi = 0, inWalk = 0;
  for (let k = 0; k < 24; k++) { await sleep(500);
    const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: Object.values((window.__CPM_WALK197 || {}).c || {}) }));
    if (r.ph !== 'walkout') continue; inWalk++; corpi = Math.max(corpi, r.c.length);
    const n = r.c.filter(x => x.run != null && x.run > 0.3 && x.sp < 0.5).length; somma += n; picco = Math.max(picco, n); }
  await ctx.close(); return { pm, inWalk, corpi, somma, picco };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_FERMI197):', JSON.stringify(r));
const ok = v.corpi >= 20 && v.inWalk >= 16 && r.somma >= 15 && v.somma <= r.somma / 3 && v.picco <= 2;
await b.close(); srv.close();
console.log(ok ? '✅ walkout-fermi-197 verde (e il rosso si vede)' : '❌ walkout-fermi-197 ROSSO'); process.exit(ok ? 0 : 1);
