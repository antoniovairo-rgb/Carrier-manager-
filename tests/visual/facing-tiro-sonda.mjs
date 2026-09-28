#!/usr/bin/env node
/* [7.999.45 sonda — taccuino PO SIT #3 «Dribbling portiere», miss_easy: «il corpo al tentativo di tiro e' nella direzione sbagliata,
   non verso la porta»] Per ogni caso gi:azione:esito (pagina nuova, corpi accesi) legge __CPM_TIRO34 e, al fotogramma in cui parte
   l'arco del pallone, misura l'angolo fra la direzione del corpo (rotazione dell'avatar) e (a) la porta avversaria (x 48,6, z 0),
   (b) la direzione in cui parte il pallone. Convenzione del corpo calibrata sulla corsa: si stampa anche l'angolo fra corpo e moto.
   CPM_CASI=3:1:fail,0:0:success */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const CASI = (process.env.CPM_CASI || '3:1:fail,3:1:success,0:0:success,12:0:success').split(',').map(x => x.split(':'));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ang = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); if (d > Math.PI) d = 2 * Math.PI - d; return +(d * 180 / Math.PI).toFixed(0); };
for (const [gs, as, es] of CASI) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TIRO34_REC = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Facing45' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, +gs);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(([a, e]) => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(a); }, [+as, es]);
  let n = -1; for (let i = 0; i < 60; i++) { await sleep(600); const m = await page.evaluate(() => (window.__CPM_TIRO34 && window.__CPM_TIRO34.f.length) || 0); if (m > 20 && m === n) break; n = m; }
  const W = await page.evaluate(() => window.__CPM_TIRO34 || null); await page.close();
  if (!W) { console.log(`gi${gs}/${as}/${es}: testimone vuoto`); continue; }
  const F = W.f; const ia = F.findIndex(x => x.arc === 1);
  /* calibrazione: nei fotogrammi di corsa (v>3) direzione del moto contro rotazione, con le due convenzioni possibili */
  const cal = []; for (let i = 1; i < F.length; i++) { const p = F[i - 1], c = F[i]; if (c.v > 3 && c.hx != null && p.hx != null) { const mv = Math.atan2(c.hx - p.hx, c.hz - p.hz); cal.push(ang(c.ry, mv)); } }
  cal.sort((x, y) => x - y); const calMed = cal.length ? cal[cal.length >> 1] : null;
  if (ia < 1) { console.log(`gi${gs}/${as}/${es}: l'arco non parte (calibrazione corpo-moto mediana ${calMed}°)`); continue; }
  const ic = F.findIndex(x => x.arc === 1 && x.aT >= 0); const fa = F[ia]; const f = ic >= 0 ? F[ic] : F[ia]; let ie = ia; for (let i = ia; i < F.length && F[i].arc === 1; i++) ie = i; const nx = F[ie];
  const traccia = F.slice(0, ia + 1).filter((x, i) => i % 8 === 0).map(x => `${x.t.toFixed(1)}s:(${x.hx},${x.hz})${x.g || ''}`).join(' ');
  const porta = Math.atan2(48.6 - f.hx, 0 - f.hz); const volo = Math.atan2(nx.pb[0] - f.pb[0], nx.pb[2] - f.pb[2]);
  console.log(`gi${gs}/az${as}/${es}: all'armo dell'arco corpo↔porta ${ang(fa.ry, Math.atan2(48.6 - fa.hx, 0 - fa.hz))}° · al CONTATTO (t ${f.t}) eroe (${f.hx},${f.hz}) gesto ${f.g} · corpo↔porta ${ang(f.ry, porta)}° · corpo↔volo ${ang(f.ry, volo)}° · volo↔porta ${ang(volo, porta)}° · calibrazione corpo↔moto in corsa mediana ${calMed}° su ${cal.length} · palla fine arco (${nx.pb[0]},${nx.pb[2]})`);
  if (process.env.CPM_TRACCIA) console.log('   eroe: ' + traccia);
}
await b.close(); srv.close();
