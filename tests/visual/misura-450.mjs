#!/usr/bin/env node
/* [giro 450 PO-669] SONDA — chi scrive il pallone nel fotogramma d'INGRESSO della costruzione.
   Stesso percorso di buildup-sync (force → resolve), ma registra intorno al primo fotogramma tl=1:
   i due fotogrammi del recorder, le voci del varco __CPM_BJ478 (scrittore, stacco vivo) e la fase.
   CPM_SCENE=84,91,92 · CPM_PRESENT=1 arma il teatro (stacco di scena acceso come in partita). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '83,84,91,92').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 360, height: 260 } });
await installCdnRoutes(page);
await page.addInitScript(([pr, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_BJMIN = 3; if (pr) window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G450 = 1; }, [!!process.env.CPM_PRESENT, !!process.env.CPM_NO_G450]);
await openMatch(page, port); await sleep(800);
for (const gi of SCENE) for (const k of [0, 1]) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) { }
  if (!ok) break;
  await sleep(420); await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(160);
  await page.evaluate(() => { window.__CPM_REC_DRAIN(); window.__CPM_BJ478 = []; });
  let r = false; try { r = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k); } catch (e) { }
  if (!r) continue;
  await sleep(2600);
  const fr = await page.evaluate(() => window.__CPM_REC_DRAIN());
  const bj = await page.evaluate(() => window.__CPM_BJ478 || []);
  const i = fr.findIndex((f, j) => j > 0 && f.tl === 1 && fr[j - 1].tl !== 1);
  if (i < 0) { console.log(`gi${gi}/az${k}: nessun ingresso`); continue; }
  const a = fr[i - 1], c = fr[i], d = Math.hypot(c.b[0] - a.b[0], c.b[1] - a.b[1]);
  console.log(`gi${gi}/az${k}: INGRESSO salto ${d.toFixed(1)}u in ${c.t - a.t}ms · ph ${a.ph}→${c.ph} · sk ${a.sk}→${c.sk} · arc ${a.arc}/${c.arc} pa ${a.pa}/${c.pa} · palla ${a.b}→${c.b} · eroe ${a.h}→${c.h} · tk ${c.tk}`);
  const vic = bj.filter(e => Math.abs(e.t - c.t) < 60);
  for (const e of vic) console.log(`    BJ d${e.d} src=${e.src} tutti=${e.tutti} ph=${e.ph} mask(stacco vivo)=${e.mask} nascosto=${e.nascosto} prima=${JSON.stringify(e.prima)}`);
  if (process.env.CPM_V) for (let j = Math.max(1, i - 4); j < Math.min(fr.length, i + 3); j++) console.log(`      f${j - i} t${fr[j].t} tl${fr[j].tl} ph ${fr[j].ph} b ${fr[j].b} h ${fr[j].h} tk ${fr[j].tk}`);
}
await b.close(); srv.close();
