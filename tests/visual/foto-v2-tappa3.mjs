#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 3] FOTO della partita (strumento, non guardiano): 2D, highlight in scelta, post partita, ingresso.
   CPM_FOTO_PREF=prima|dopo · CPM_FORMATI=tel,pc · esce in docs/sviluppo/foto-v2-tappa3/ (PNG piccoli: scala 0,5). */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriPartitaV2, forzaHL, finePartita } from './lib/partita-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PREF = process.env.CPM_FOTO_PREF || 'dopo', ROSSO = !!process.env.CPM_FOTO_ROSSO;/* CPM_FOTO_ROSSO=1: tema di prima (__CPM_NO_V2), per le foto «prima» dove il markup e' lo stesso */
const FORMATI = { tel: { k: 'tel', w: 412, h: 915, touch: true }, tab: { k: 'tab', w: 820, h: 1180, touch: true }, pc: { k: 'pc', w: 1440, h: 900, touch: false } };
const SCELTI = (process.env.CPM_FORMATI || 'tel,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
const SCHERMI = (process.env.CPM_SCHERMI || 'ingresso,partita2d,highlight,post,ufficio,creazione').split(',');
const OUT = new URL('../../docs/sviluppo/foto-v2-tappa3/', import.meta.url).pathname;
const srv = await startServer(); const b = await launchBrowser();
const shot = async (page, n) => { await page.screenshot({ path: `${OUT}${PREF}-${n}.png`, scale: 'css' }); console.log('  foto', n); };
for (const f of SCELTI) {
  const errs = [];
  if (SCHERMI.includes('ingresso')) { const { ctx, page } = await apriPartitaV2(b, srv.address().port, f, { errs, ingresso: true, rosso: ROSSO }); await sleep(2500); await shot(page, 'ingresso-' + f.k); await ctx.close(); }
  if (SCHERMI.includes('partita2d') || SCHERMI.includes('highlight')) { const { ctx, page } = await apriPartitaV2(b, srv.address().port, f, { errs, rosso: ROSSO });
    if (SCHERMI.includes('partita2d')) { await sleep(1500); await shot(page, 'partita2d-' + f.k); }
    if (SCHERMI.includes('highlight')) { await forzaHL(page, +(process.env.CPM_GI || 4)); await shot(page, 'highlight-' + f.k); }
    await ctx.close(); }
  /* il post partita in una pagina sua: dopo una scena forzata la partita non finisce (modo forzato) */
  if (SCHERMI.includes('post')) { const { ctx, page } = await apriPartitaV2(b, srv.address().port, f, { errs, rosso: ROSSO }); const ok = await finePartita(page); await sleep(2000); console.log('  fine', ok); await shot(page, 'post-' + f.k); await ctx.close(); }
  if (SCHERMI.includes('ufficio')) { const { apriBancoV2 } = await import('./lib/banco-v2.mjs'); const { ctx, page } = await apriBancoV2(b, srv.address().port, f, { errs, rosso: ROSSO, prep: 'p.patrimonio303=[{s:11,w:28,v:1200000},{s:11,w:32,v:1350000},{s:11,w:36,v:1300000},{s:12,w:4,v:1500000},{s:12,w:8,v:1620000},{s:12,w:12,v:1800000}];p.bankBalance=1800000;' });
    if (page) { await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(1500); await shot(page, 'ufficio-' + f.k); await ctx.close(); } }
  if (SCHERMI.includes('creazione')) { const { installCdnRoutes } = await import('./lib/harness.mjs'); const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, ...(f.touch ? { isMobile: true, hasTouch: true } : {}) }); const page = await ctx.newPage(); await installCdnRoutes(page);
    if (ROSSO) await page.addInitScript(() => { window.__CPM_NO_V2 = true; }); await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera/.test(x.textContent || '')), null, { timeout: 90000 }); await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Nuova carriera/.test(x.textContent || '')).click()); await sleep(1800); await shot(page, 'creazione-' + f.k); await ctx.close(); }
  console.log(f.k, errs.slice(0, 3).join(' | '));
}
await b.close(); srv.close();
