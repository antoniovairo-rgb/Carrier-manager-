#!/usr/bin/env node
/* [7.999.39 sonda — taccuino PO su 7.999.34: SALTO del pallone, codice 001 apertura, 007 camera, «esito intercept ma IN RETE»]
   Le note del PO nascono in partite VERE: la scena si apre dal pallone del gioco, non dalla messa in scena forzata (sulle scene
   forzate #152/#64/#81/#38 il rilevatore non accende ne' SALTO ne' 001 ne' 007). Qui si gioca come camera-step-census-test
   (partite vere, coda reattiva), GLB configurabile, e a ogni scena chiusa si fa girare il rilevatore VERO del taccuino
   (__CPM_DRAFTNOTE) stampando le sue righe con la situazione e l'esito. Sola lettura.
   CPM_GLB=0 per il regime veloce · CPM_DT60=1 dt del telefono · CPM_SCENES · CPM_BUDGET_MS · CPM_AZ=0|rnd */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const SCENE_TARGET = +(process.env.CPM_SCENES || 20), BUDGET_MS = +(process.env.CPM_BUDGET_MS || 540000);
const GLB = process.env.CPM_GLB !== '0', DT60 = process.env.CPM_DT60 === '1', AZ = process.env.CPM_AZ || 'rnd';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.addInitScript(o => { if (!o.glb) window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; if (o.dt60) window.__CPM_DT60 = 1; try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {} }, { glb: GLB, dt60: DT60 });
await openMatch(page, port, { skipLoadAll: true }); await sleep(GLB ? 3000 : 700);
let scene = 0, secchi = 0, partite = 1; const conta = {}; const t0run = Date.now(); let k2 = 0;
while (scene < SCENE_TARGET && Date.now() - t0run < BUDGET_MS) {
  const ph = await matchPhase(page);
  if (ph === 'ended' || ph === 'ceremony' || ph === 'shootout' || (ph == null && ++secchi >= 12)) { secchi = 0; partite++; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(GLB ? 3000 : 700); } catch (e) { break; } continue; }
  if (ph == null) { await sleep(700); continue; } secchi = 0;
  if (ph === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => { try { return window.__CPM_PHASE() === 'hl_choose'; } catch (e) { return false; } }, null, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }
  const ai = AZ === 'rnd' ? (k2++ % 3) : +AZ;
  const risolto = await page.evaluate(a => { try { return window.__CPM_RESOLVE(a) || window.__CPM_RESOLVE(0); } catch (e) { return false; } }, ai).catch(() => false);
  await sleep(700); const ctx1 = await page.evaluate(() => { try { return window.__CPM_BUGCTX ? window.__CPM_BUGCTX() : null; } catch (e) { return null; } }).catch(() => null);
  await page.waitForFunction(() => { try { return window.__CPM_PHASE() !== 'hl_result' && !/^hl/.test(window.__CPM_PHASE()); } catch (e) { return true; } }, null, { timeout: DT60 ? 60000 : 30000 }).catch(() => {});
  scene++; await sleep(200);
  const r = await page.evaluate((C) => { const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); if (!snap || !snap.samples || !snap.samples.length) return null;
    const ks = snap.samples.map(s => s.sk).filter(k => k != null && k >= 0); if (!ks.length) return null; const k = Math.max(...ks);
    const ctx = C ? { ...C, sceneKey: k } : { sceneKey: k };
    let txt = ''; try { txt = window.__CPM_DRAFTNOTE(snap, ctx) || ''; } catch (e) { txt = 'ERR ' + e.message; }
    return { k, n: snap.samples.filter(s => s.sk === k).length, sit: ctx.sit || null, gi: ctx.gi, out: ctx.out || null, act: ctx.act || null, txt }; }, ctx1).catch(() => null);
  if (!r) continue;
  const righe = String(r.txt).split('\n').map(l => l.trim()).filter(l => /codice \d|SALTO|IN RETE|uscita dal campo|bugiard/.test(l));
  for (const l of righe) { const c = (l.match(/codice \d{3}/) || [l.match(/SALTO|IN RETE/) ? l.match(/SALTO|IN RETE/)[0] : 'altro'])[0]; conta[c] = (conta[c] || 0) + 1; }
  console.log(`scena ${scene} · gi ${r.gi} · ${JSON.stringify(r.sit || '').slice(0, 50)} · «${String(r.act || ai).slice(0, 40)}» · esito ${r.out} · campioni ${r.n}`);
  righe.forEach(l => console.log('      ' + l.slice(0, 260)));
}
await b.close(); srv.close();
console.log(`\n=== TACCUINO SU PARTITE VERE: ${scene} scene, ${partite} partita/e · GLB ${GLB ? 'ON' : 'OFF'}${DT60 ? ' · dt 1/60' : ''} ===`);
for (const [c, n] of Object.entries(conta).sort()) console.log(`  ${c.padEnd(14)} ${n}/${scene}`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
