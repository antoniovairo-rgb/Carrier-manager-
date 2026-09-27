#!/usr/bin/env node
/* [7.999.33 guardiano — collaudo PO «i colpi di testa non sono sincronizzati con la velocita' del cross, salta troppo presto»]
   Per N scene di testa (pagina nuova ciascuna, corpo CGTrader, costruzione accesa) legge il testimone __CPM_TESTA33 e misura:
   t_incontro = istante di minima distanza pallone-testa · t_picco = istante di massima quota della testa · scarto = t_picco - t_incontro
   (negativo = salta prima che arrivi il pallone) · quota della testa all'incontro sopra quella da fermo. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const CASI = (process.env.CPM_CASI || '7:0,55:0,86:0,90:0,76:2').split(',').map(x => x.split(':').map(Number));
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [];
for (const [gi, ai] of CASI) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TESTA33_REC = 1; if (r) window.__CPM_NO_TESTA33 = 1; }, RED);
  await openMatch(page, port, { skipLoadAll: true, name: 'Testa33' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => { window.__CPM_TESTA33 = null; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(a => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, ai);
  let n = -1; for (let i = 0; i < 80; i++) { await sleep(600); const m = await page.evaluate(() => (window.__CPM_TESTA33 && window.__CPM_TESTA33.f.length) || 0); if (m > 20 && m === n) break; n = m; }
  const W = await page.evaluate(() => window.__CPM_TESTA33 || null); await page.close();
  if (process.env.CPM_DUMP && W) (await import('node:fs')).writeFileSync(process.env.CPM_DUMP + '-gi' + gi + '.json', JSON.stringify(W.f));
  if (!W || W.f.length < 10) { out.push({ gi, ai, err: 'testimone vuoto', f: W && W.f.length }); console.log(JSON.stringify(out[out.length - 1])); continue; }
  const F = W.f, h0 = Math.min(...F.slice(0, 5).map(x => x.hy));
  let im = 0; F.forEach((x, i) => { if (x.d < F[im].d) im = i; });
  let ip = 0; F.forEach((x, i) => { if (x.hy > F[ip].hy) ip = i; });
  const r = { gi, ai, fotogrammi: F.length, t_incontro: F[im].t, dMin: F[im].d, t_picco: F[ip].t, scarto: +(F[ip].t - F[im].t).toFixed(2), saltoAlPicco: +(F[ip].hy - h0).toFixed(2), saltoAllIncontro: +(F[im].hy - h0).toFixed(2), gestoAllIncontro: F[im].g, gestoAlPicco: F[ip].g };
  out.push(r); console.log(JSON.stringify(r));
}
await b.close(); srv.close();
const ok = out.filter(r => r.scarto != null); console.log('scarto medio', (ok.reduce((a, r) => a + r.scarto, 0) / Math.max(1, ok.length)).toFixed(2), 's su', ok.length, 'scene');
/* [7.999.33] GIUDIZIO: il picco dello stacco coincide col contatto (entro 0,15 s), il pallone arriva alla testa (entro 0,4 u),
   il salto e' umano (al massimo 1,0 u; prima 2,2-2,5). Rosso: CPM_RED=1 → __CPM_NO_TESTA33 → torna lo scarto di +0,5 s → FALLISCE. */
const err = []; const okk = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
okk(ok.length >= 4, `scene di testa misurate: ${ok.length}`);
for (const r of ok) { okk(Math.abs(r.scarto) <= 0.15, `gi${r.gi}: picco del salto al contatto (scarto ${r.scarto} s)`); okk(r.dMin <= 0.4, `gi${r.gi}: il pallone arriva alla testa (${r.dMin} u)`); okk(r.saltoAlPicco <= 1.0, `gi${r.gi}: salto umano (${r.saltoAlPicco} u)`); }
if (err.length) { console.log('\nTESTA TEMPISMO: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nTESTA TEMPISMO: PASS'); process.exit(0);
