#!/usr/bin/env node
/* [7.999.61 guardiano — collaudo PO «altezza e posizione tra pagelle e statistiche differenti»] Partita 2D a 412x915, pannello
   aperto: si misura il riquadro (data-cpm="linguette918") su Statistiche e su Pagelle. VERDE: stessa posizione e stessa altezza.
   ROSSO __CPM_NO_PANNELLO61: l'altezza torna a dipendere dal contenuto e le due viste differiscono. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const b = await launchBrowser();
const esiti = {};
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { if (r) window.__CPM_NO_PANNELLO61 = 1; }, rosso);
  await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Pannello' });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(1500);
  await page.evaluate(() => { const bt = document.querySelector('[data-cpm="linguette918"] button[aria-label="Mostra"]'); if (bt) bt.click(); }); await sleep(500);
  const r = {};
  for (const t of ['Statistiche', 'Pagelle']) {
    await page.evaluate(t => { const p = document.querySelector('[data-cpm="linguette918"]'); const bt = p && [...p.querySelectorAll('button')].find(x => x.textContent.trim() === t); if (bt) bt.click(); }, t); await sleep(500);
    r[t] = await page.evaluate(() => { const p = document.querySelector('[data-cpm="linguette918"]'); if (!p) return null; const q = p.getBoundingClientRect(); return { top: Math.round(q.top), h: Math.round(q.height) }; });
  }
  console.log(rosso ? 'ROSSO' : 'VERDE', JSON.stringify(r)); esiti[rosso ? 'r' : 'v'] = r;
  await page.close();
}
await b.close(); srv.close();
const ug = r => r && r.Statistiche && r.Pagelle && r.Statistiche.h > 100 && Math.abs(r.Statistiche.top - r.Pagelle.top) <= 2 && Math.abs(r.Statistiche.h - r.Pagelle.h) <= 2;
const okTop = !!(esiti.v && esiti.v.Statistiche && esiti.v.Statistiche.top >= 320);/* [7.999.64 PO «posizione troppo alta»] a 412x915 porta e area avversaria finiscono a ~320: il pannello aperto parte sotto */
console.log(okTop ? '✅ il pannello aperto parte sotto porta e area avversaria (top ' + esiti.v.Statistiche.top + ')' : '❌ il pannello copre porta/area avversaria');
const okV = ug(esiti.v) && okTop, okR = esiti.r && !ug(esiti.r);
console.log(okV ? '✅ Statistiche e Pagelle: stessa posizione e stessa altezza' : '❌ pannello diverso fra le due viste');
console.log(okR ? '✅ il rosso __CPM_NO_PANNELLO61 riproduce la differenza' : '❌ il rosso non si distingue');
process.exit(okV && okR ? 0 : 1);
