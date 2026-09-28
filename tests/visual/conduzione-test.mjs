#!/usr/bin/env node
/* [7.999.44 guardiano — rapporto Codex fluidita' 28/09: «piede d'appoggio in movimento durante la conduzione»]
   Per N scene (pagina nuova, build-up acceso) legge il piano della costruzione (__CPM_TLSEG) e misura la velocita' pianificata dei
   tratti di conduzione dell'eroe (HERO→HERO, distanza/durata) e la durata totale della costruzione. Il verde pretende conduzione
   <= 8,6 u/s (le gambe arrivano a 8,47: tetto cadenza 2,5 x velocita' naturale 3,39) e costruzione sotto i 6 s (tetto della scena, 7.461).
   Il braccio __CPM_COND44 e' SPENTO di default (7.999.44: si decide sul confronto GPU di Codex): senza CPM_RED lo accende, con CPM_RED=1 misura il default (11 u/s) e deve fallire. CPM_SCENE=gi,gi,... */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '38,4,12,21,79,150').split(',').map(Number);
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [];
for (const gi of SCENE) {
  const page = await b.newPage({ viewport: { width: 360, height: 260 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_CINE = 1; if (!r) window.__CPM_COND44 = 1; }, RED);
  await openMatch(page, port, { skipLoadAll: true, name: 'Cond44' }); await sleep(800);
  await page.evaluate(g => { window.__CPM_TLSEG = null; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', { timeout: 30000 }).catch(() => {});
  await sleep(500);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  let T = null; for (let i = 0; i < 20 && !T; i++) { await sleep(400); T = await page.evaluate(() => window.__CPM_TLSEG || null); }
  await page.close();
  if (!T) { console.log(`gi${gi}: nessuna costruzione`); continue; }
  const bld = T.seg.slice(0, T.n), car = bld.filter(g => g.f === 'HERO' && g.t === 'HERO' && g.from && g.to);
  const v = car.map(g => Math.hypot(g.to[0] - g.from[0], g.to[1] - g.from[1]) / (g.dur || 1e-9)).filter(x => Number.isFinite(x));
  const r = { gi, tratti: car.length, vMax: v.length ? +Math.max(...v).toFixed(2) : null, costruzione: +bld.reduce((s, g) => s + (g.dur || 0), 0).toFixed(2) };
  out.push(r); console.log(JSON.stringify(r));
}
await b.close(); srv.close();
const con = out.filter(r => r.tratti > 0);
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
ok(con.length >= 2, `scene con conduzione dell'eroe: ${con.length}/${out.length}`);
for (const r of con) { ok(r.vMax <= 8.6, `gi${r.gi}: conduzione pianificata ${r.vMax} u/s (gambe fino a 8,47)`); ok(r.costruzione <= 6, `gi${r.gi}: costruzione ${r.costruzione} s (tetto scena 6 s)`); }
if (RED) { const bad = err.some(e => /conduzione pianificata/.test(e)); console.log(bad ? '✅ ROSSO come atteso: di default l\'eroe conduce oltre il passo delle gambe' : '❌ il rosso non riproduce'); process.exit(bad ? 0 : 1); }
console.log(err.length ? `❌ FAIL conduzione (${err.length})` : '✅ PASS conduzione'); process.exit(err.length ? 1 : 0);
