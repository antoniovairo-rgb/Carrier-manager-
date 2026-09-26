#!/usr/bin/env node
/* [7.999.19] GUARDIANO — IL CAMPO 2D NON FINISCE SOTTO LE STATISTICHE BREVI (collaudo PO: «il campo 2d sovrascrive in parte le
   statistiche brevi, non vedo i numeri»). Sul telefono del PO le linguette Statistiche/Pagelle stanno a meta' schermo: il margine
   in basso superava mezzo campo e una sicura azzerava anche il margine in alto. Partita 2D in corso su tre altezze di schermo:
   verde se la linea di fondo in alto sta sempre sotto la striscia delle statistiche. CPM_ROSSO=1 → __CPM_NO_CAMPO19. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const righe = [];
for (const [w, h] of [[412, 915], [390, 844], [360, 740]]) {
  const page = await b.newPage({ viewport: { width: w, height: h } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_CAMPO19 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Campo19' });
  let c = null; for (let i = 0; i < 40 && !c; i++) { await sleep(500); c = await page.evaluate(() => window.__CPM_CAMPO19 || null); }
  await sleep(1500); c = await page.evaluate(() => window.__CPM_CAMPO19 || null);
  const li = await page.evaluate(() => { const l = document.querySelector('[data-cpm="linguette918"]'); return l ? Math.round(l.getBoundingClientRect().top) : null; });
  righe.push({ w, h, ...c, linguette: li }); await page.close();
}
await b.close(); srv.close();
for (const r of righe) console.log(`  ${r.w}x${r.h}: linea di fondo a ${r.porta}px · striscia statistiche finisce a ${r.stat}px · linguette a ${r.linguette}px · margini ${r.t12}/${r.b12} su ${r.H}`);
const sotto = righe.filter(r => r.porta == null || r.stat == null || r.porta < r.stat);
if (ROSSO) { console.log(sotto.length ? '✅ ROSSO come atteso: con la sicura vecchia il campo finisce sotto le statistiche' : '⚠️ il rosso non riproduce in headless (le linguette qui non stanno a meta\')'); process.exit(0); }
/* [7.999.22 collaudo PO «campo 2D inizializzato piccolo»] con le linguette a meta' schermo il campo NON si schiaccia sopra di loro */
const schiacciati = righe.filter(r => r.linguette != null && r.linguette < r.H * 0.9 && r.b12 > r.H * 0.25);
if (!ROSSO && schiacciati.length) { console.log('❌ FAIL campo-striscia: campo schiacciato sopra le linguette su ' + schiacciati.map(r => r.w + 'x' + r.h).join(', ')); process.exit(1); }
console.log(sotto.length ? '❌ FAIL campo-striscia: ' + sotto.map(r => r.w + 'x' + r.h).join(', ') : '✅ PASS campo-striscia'); process.exit(sotto.length ? 1 : 0);
