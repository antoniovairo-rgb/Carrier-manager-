#!/usr/bin/env node
/* [7.999.115 guardiano — collaudo PO-197 «i giocatori corrono sul posto, non sono in modalita' idle nel prepartita»]
   Walkout forzato coi corpi GLB, testimone __CPM_WALK197 (velocita' vera e peso della clip di corsa di ogni corpo).
   Si conta quanti corpi hanno la corsa sopra 0,3 mentre si muovono a meno di 0,5 u/s («corsa sul posto»).
   [giro 58] IL CAMPIONAMENTO E' SUL TEMPO DI SCENA, non sul tempo reale. MISURATO sulla base 7.999.171: in headless coi corpi GLB il
   tempo di scena dell'ingresso (walkT, letto dal testimone __CPM_WALK245) scorre a ~0,15 s per secondo reale, e i 12 s reali della
   prima stesura coprivano ~2 s di un ingresso da 38,5 s: nessuno era ancora arrivato, verde e rosso davano entrambi 0 e il guardiano
   era rosso per cecita'. Ora un campione ogni 0,5 s di SCENA per tutto l'ingresso (fino a WALK_DUR, __CPM_WALKDUR245), i due bracci
   in parallelo; vale per qualunque durata dell'ingresso (38,5 s sulla base, 24 s col giro 54). Copertura < 90% = cieco = rosso.
   VERDE → somma ≤ 1/3 del rosso e al massimo 2 per campione. ROSSO (__CPM_NO_FERMI197) → somma ≥ SOGLIA_ROSSO.
   Uso: node walkout-fermi-197.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SOGLIA_ROSSO = 15, PASSO = 0.5, TETTO_REALE = +(process.env.CPM_WF_TETTO || 600) * 1000;
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_WALK197 = {}; window.__CPM_WALK245 = []; window.__CPM_WALKTEST74 = 1; if (r) window.__CPM_NO_FERMI197 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_WALK245 = []; window.__CPM_WALK197 = {}; return window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT(); });
  let somma = 0, picco = 0, corpi = 0, campioni = 0, prossimo = PASSO, wt = 0, dur = null, uscita = 'tetto'; const t0 = Date.now(), serie = [];
  while (Date.now() - t0 < TETTO_REALE) { await sleep(300);
    const r = await page.evaluate(() => { const w = window.__CPM_WALK245; const t = (Array.isArray(w) && w.length) ? w[w.length - 1].t : null; if (Array.isArray(w)) w.length = 0;/* il testimone cresce a ogni fotogramma: si tiene solo l'ultimo tempo di scena */
      return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), t, dur: window.__CPM_WALKDUR245, c: Object.values((window.__CPM_WALK197 || {}).c || {}) }; });
    if (r.dur != null) dur = r.dur; if (r.t != null) wt = Math.max(wt, r.t);
    if (r.ph !== 'walkout') { uscita = 'fine-ingresso'; break; }
    if (r.t == null || r.t < prossimo) continue;
    prossimo = Math.floor(r.t / PASSO) * PASSO + PASSO; campioni++; corpi = Math.max(corpi, r.c.length);
    const n = r.c.filter(x => x.run != null && x.run > 0.3 && x.sp < 0.5).length; somma += n; picco = Math.max(picco, n); if (n) serie.push(+r.t.toFixed(1) + ':' + n); }
  await ctx.close();
  const copertura = dur ? Math.min(1, wt / (dur - 0.3)) : 0;
  return { pm, dur, scena: +wt.toFixed(1), copertura: +copertura.toFixed(2), reale_s: Math.round((Date.now() - t0) / 1000), uscita, campioni, corpi, somma, picco, serie: serie.join(' ') };
}
const [v, r] = await Promise.all([braccio(false), braccio(true)]);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_FERMI197):', JSON.stringify(r));
const cieco = [v, r].some(x => x.copertura < 0.9 || x.corpi < 20 || x.campioni < 16);
const ok = !cieco && r.somma >= SOGLIA_ROSSO && v.somma <= r.somma / 3 && v.picco <= 2;
await b.close(); srv.close();
console.log(cieco ? '❌ walkout-fermi-197 CIECO (copertura dell\'ingresso < 90% o pochi corpi/campioni)' : ok ? '✅ walkout-fermi-197 verde (e il rosso si vede)' : '❌ walkout-fermi-197 ROSSO'); process.exit(ok ? 0 : 1);
