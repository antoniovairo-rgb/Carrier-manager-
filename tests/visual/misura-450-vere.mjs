#!/usr/bin/env node
/* [giro 450 PO-669] SONDA — il salto d'INGRESSO della costruzione in PARTITA VERA (non forzata).
   provino → playing → highlight reattivi in coda → scelta → risoluzione; per ogni scena misura il
   passo del pallone fra l'ultimo fotogramma senza costruzione e il primo con (tl 0→1), come
   buildup-sync. Nessun __CPM_PRESENT: e' il gioco con cpmtest+cine, quello che il PO non vede;
   CPM_PRESENT=1 lo arma. CPM_SCENES=10. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const TARGET = +(process.env.CPM_SCENES || 10);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(pr => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_REC = true; if (pr) window.__CPM_PRESENT = 1; }, !!process.env.CPM_PRESENT);
await openMatch(page, port, { skipLoadAll: true }); await sleep(700);
const salti = [];
for (let round = 0; round < TARGET * 4 && salti.length < TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; }).catch(() => false);
  if (!inPlay) { await sleep(700); continue; }
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const got = await page.waitForFunction(() => { try { const s = window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; } }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!got) continue;
  await sleep(300);
  await page.evaluate(() => window.__CPM_REC_DRAIN());
  try { await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)); } catch (e) { continue; }
  await sleep(2600);
  const fr = await page.evaluate(() => window.__CPM_REC_DRAIN());
  const i = fr.findIndex((f, j) => j > 0 && f.tl === 1 && fr[j - 1].tl !== 1);
  if (i < 0) { console.log('  · scena senza costruzione'); continue; }
  const a = fr[i - 1], c = fr[i], d = Math.hypot(c.b[0] - a.b[0], c.b[1] - a.b[1]);
  salti.push(d);
  console.log(`  ${d > 3 ? '❌' : '✅'} sk ${c.sk} · ingresso ${d.toFixed(1)}u in ${c.t - a.t}ms · tk ${c.tk}`);
  await page.waitForFunction(() => { try { return window.__CPM_STATE().phase === 'playing'; } catch (e) { return false; } }, { timeout: 20000 }).catch(() => {});
}
await b.close(); srv.close();
console.log(`\nscene ${salti.length} · ingressi oltre 3u: ${salti.filter(x => x > 3).length} · max ${salti.length ? Math.max(...salti).toFixed(1) : '-'}u`);
