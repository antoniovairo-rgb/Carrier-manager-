#!/usr/bin/env node
/* [giro 103] GUARDIANO «al passaggio volo→conduzione il pallone non scatta» (scena3d-96 D11, pc-gi64-parata: 3,5u in 0,05 s, scrittori
   «buildup-volo+testa» nello stesso fotogramma — il residuo dichiarato dal 7.515). La colla di conduzione recuperava in UN fotogramma il
   ritardo del volo (tappato a 48 u/s dal giro 96a); ora, se il pallone e' fra 1,5 e 6u dal piede, lo raggiunge a 48 u/s.
   Nel flusso il caso e' raro (1 scena su ~31 nelle corse del giro 103), quindi il guardiano lo rende deterministico: col gancio di sola
   prova __CPM_G103LAG=3 il primo fotogramma di ogni colla finge il pallone 3u indietro e il testimone __CPM_G103C registra il passo
   applicato e il tetto (48·dt). Scene di costruzione forzate (CPM_G103_SCENE), GLB spento.
     verde: ogni passo <= tetto + 0,01 (il pallone arriva a velocita' da pallone), almeno 3 colle misurate;
     rosso __CPM_NO_G103C: almeno un passo >= 2,5u (lo scatto di prima).
   Uso: node colla-103.mjs  [CPM_ARMI=verde,rosso] [CPM_G103_SCENE=18,16,63,31,13,3,30,128,15,64,100,89] */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import('./lib/harness.mjs');
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const SCENE = (process.env.CPM_G103_SCENE || '18,16,63,31,13,3,30,128,15,64,100,89').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const fase = p => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const R = {};
for (const arm of ARMI) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_G103LAG = 3; if (r) window.__CPM_NO_G103C = 1; }, arm === 'rosso');
  await openMatch(page, port, { name: 'Colla Centotre' });
  for (const gi of SCENE) {
    await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; window.__CPM_FORCE_OUTCOME = 'success'; });
    if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false)) continue;
    const t0 = Date.now(); while (Date.now() - t0 < 15000 && (await fase(page)) !== 'hl_choose') await sleep(150);
    await page.evaluate(() => window.__CPM_RESOLVE(0)).catch(() => false);
    const s0 = await page.evaluate(() => window.__CPM_SCENET || 0); const t1 = Date.now();
    while (Date.now() - t1 < 60000) { const ds = (await page.evaluate(() => window.__CPM_SCENET || 0)) - s0; if (ds > 6) break; await sleep(250); }
  }
  R[arm] = await page.evaluate(() => window.__CPM_G103C || []); await ctx.close();
  const L = R[arm]; const oltre = L.filter(x => x.passo > x.tetto + 0.01), grandi = L.filter(x => x.passo >= 2.5);
  console.log(`${arm.toUpperCase()} colle misurate ${L.length} · passo massimo ${L.length ? Math.max(...L.map(x => x.passo)).toFixed(2) : '-'} u · oltre il tetto ${oltre.length} · passi >= 2,5u ${grandi.length}`);
}
await browser.close(); srv.close();
const g = [];
if (R.verde) { if (R.verde.length < 3) g.push(`verde cieco: ${R.verde.length} colle`); if (R.verde.some(x => x.passo > x.tetto + 0.01)) g.push('verde: passo oltre la velocita\' da pallone'); }
if (R.rosso) { if (!R.rosso.length) g.push('rosso cieco: nessuna colla'); else if (!R.rosso.some(x => x.passo >= 2.5)) g.push('rosso: lo scatto non si vede'); }
if (g.length) { console.log('✗ colla-103 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✓ colla-103 VERDE' + (R.rosso ? ' (e il rosso si vede)' : ''));
