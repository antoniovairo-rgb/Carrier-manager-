#!/usr/bin/env node
/* [7.999.11] GUARDIANO — LA VERSIONE PUBBLICATA SUL SITO GIOCA (collaudo PO «si riavvia in background»: il sito serve ora la build
   precompilata, tools/build-dist.mjs --web). Il gate e i guardiani girano sul sorgente: questo prova che la build precompilata porta
   in campo la stessa partita — carriera nuova, partita, orologio che avanza, almeno un highlight, zero errori di pagina — e misura
   la memoria JS contro il sorgente. Prerequisito: `node tools/build-dist.mjs --web`. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
import fs from 'fs'; import path from 'path';
const DW = path.resolve('../../dist-web');
if (!fs.existsSync(path.join(DW, 'index.html'))) { console.log('❌ manca dist-web: eseguire node tools/build-dist.mjs --web'); process.exit(2); }
fs.copyFileSync(path.join(DW, 'index.html'), path.join(DW, 'CARRIER-MANAGER-AV.html'));/* openMatch apre l'indirizzo storico */
const b = await launchBrowser(); const out = {};
for (const [nome, root] of [['precompilata', DW], ['sorgente', null]]) {
  const srv = root ? await startServer(root) : await startServer(); const port = srv.address().port;
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Pubblicata' });
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 9, policy: 'seeded', tickMs: 300 }));
  let maxMin = 0, fasi = new Set(); const t0 = Date.now();
  while (Date.now() - t0 < 90000) { await sleep(700); const ph = await matchPhase(page); if (ph) fasi.add(ph); const c = await page.evaluate(() => { try { return window.__CPM_STATE ? (window.__CPM_STATE().clock | 0) : 0; } catch (e) { return 0; } }); maxMin = Math.max(maxMin, c); if (ph === 'ended') break; }
  const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable'); await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
  const r = await cdp.send('Performance.getMetrics'); const heap = ((r.metrics.find(x => x.name === 'JSHeapUsedSize') || {}).value || 0) / 1048576;
  out[nome] = { maxMin, hl: [...fasi].some(f => /^hl_/.test(f)), errs: errs.slice(0, 3), heap: +heap.toFixed(0) };
  console.log(`${nome}: minuto raggiunto ${maxMin}' · highlight ${out[nome].hl ? 'si' : 'no'} · errori ${errs.length} · memoria JS in partita ${out[nome].heap} MB`);
  await page.close(); srv.close();
}
await b.close();
const P = out.precompilata, fails = [];
if (P.maxMin < 20) fails.push(`la partita sulla versione pubblicata non avanza (minuto ${P.maxMin})`);
if (P.errs.length) fails.push('errori di pagina sulla versione pubblicata: ' + P.errs.join(' | '));
if (P.heap > out.sorgente.heap) fails.push(`la versione pubblicata usa piu' memoria del sorgente (${P.heap} contro ${out.sorgente.heap} MB)`);
console.log(fails.length ? '❌ FAIL dist-web-partita\n  ' + fails.join('\n  ') : '✅ PASS dist-web-partita'); process.exit(fails.length ? 1 : 0);
