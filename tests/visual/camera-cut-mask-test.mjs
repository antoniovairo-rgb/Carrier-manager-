#!/usr/bin/env node
/* GUARDIANO — «LA CAMERA SALTA» (codice 007), direttiva PO: «e' gravissimo, non e' tollerabile».

   COSA SI E' CAPITO. Il 7.456 aveva cercato il difetto come TREMOLIO — il passo della camera fra due
   fotogrammi — e si era arreso dichiarandolo non riproducibile in headless («la camera qui si muove al
   massimo di 1,6u»). Era la misura sbagliata: un TELETRASPORTO non e' un passo grande, e' un `set()`.
   Nel render-loop c'e' UN SOLO punto in cui la camera si sposta di colpo — `camera.position.set(...)`
   dentro `if(_cutSnap||_sceneCut)` — e quella riga non ha frame-rate: la geometria del salto e' la
   stessa a 8 fps e a 60. Misurata li', si riproduce headless senza fatica.

   COSA MISURA. Ogni volta che quel `set()` sta per partire, il testimone `__CPM_CAM471` registra:
   quanto e' LONTANO il bersaglio dalla camera attuale (`d`, unita'), se in quell'istante c'e' uno
   STACCO NERO vivo che lo mascheri (`mask`) e da cosa e' armato lo snap (`src`: apertura di scena o
   esito drammatico). Un salto grande NON mascherato e' il difetto: il giocatore lo vede.

   VIOLAZIONE = `d >= SOGLIA` con `mask` falso e senza attesa (`held` falso).

   PROVA DEL ROSSO: `CPM_NO471=1` rimette il comportamento precedente (nessuna attesa, nessuna
   richiesta di stacco) — con quello il guardiano deve diventare rosso, altrimenti non sta guardando
   niente.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node camera-cut-mask-test.mjs [--verbose]              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const SCENE_TARGET = +(process.env.CPM_SCENES || 22);
/* 6 unita' = poco piu' della meta' campo in larghezza percepita a questa focale. Il censimento
   (`camera-step-census-test.mjs`) aveva misurato la banda SANA del movimento continuo a 2,07u di passo
   massimo: sopra 6 non si e' piu' nella banda del movimento, si e' in un altro punto del campo. */
const SOGLIA = +(process.env.CPM_SNAP || 6);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(n => {
  window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
  if (n) window.__CPM_NO471 = 1;   /* prova del rosso: nessuna attesa, nessuno stacco richiesto */
}, process.env.CPM_NO471 ? 1 : 0);
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const snaps = [];
let secchi = 0, scene = 0;
for (let round = 0; round < SCENE_TARGET * 4 && scene < SCENE_TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) {
    if (++secchi >= 12) { secchi = 0; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } }
    else await sleep(700);
    continue;
  }
  secchi = 0;
  await page.evaluate(() => { window.__CPM_CAM471 = []; window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; }
  }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  /* ⚠️ si aspetta l'USCITA dalla scena, non un tempo fisso: una sonda che dorme N secondi e poi
     fotografa misura il proprio cronometro (lezione 7.460). */
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
  await sleep(300);
  const w = await page.evaluate(() => (window.__CPM_CAM471 || []).slice());
  for (const r of w) snaps.push(r);
  scene++;
}
await b.close(); srv.close();

if (!snaps.length) { console.log('❌ nessuno snap di camera osservato: il guardiano e\' cieco, non verde'); process.exit(2); }
const grandi = snaps.filter(s => s.d >= SOGLIA);
const viol = grandi.filter(s => !s.mask && !s.held);
const perSrc = {};
for (const s of snaps) { const k = s.src || '?'; (perSrc[k] = perSrc[k] || { n: 0, g: 0, nudi: 0, dmax: 0 }); perSrc[k].n++; if (s.d >= SOGLIA) perSrc[k].g++; if (s.d >= SOGLIA && !s.mask && !s.held) perSrc[k].nudi++; if (s.d > perSrc[k].dmax) perSrc[k].dmax = s.d; }
console.log(`\n=== ${snaps.length} snap di camera su ${scene} scene (soglia ${SOGLIA}u) ===`);
for (const k of Object.keys(perSrc)) {
  const v = perSrc[k];
  console.log(`  ${k.padEnd(6)} · ${v.n} snap · ${v.g} oltre soglia · ${v.nudi} NUDI (senza stacco) · salto max ${v.dmax.toFixed(1)}u`);
}
if (VERB) for (const s of grandi.slice(0, 40)) console.log(`   ${s.d}u · ${s.src} · ${s.ph}/${s.kind} · mask=${s.mask} · atteso=${s.held}`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

if (viol.length) {
  console.log(`\n❌ FAIL — ${viol.length} teletrasporti di camera oltre ${SOGLIA}u SENZA stacco che li mascheri.`);
  console.log(`   il peggiore: ${Math.max(...viol.map(v => v.d)).toFixed(1)}u (${viol[0].src}, ${viol[0].kind || '—'})`);
  process.exit(1);
}
console.log(`\n✅ PASS — ${grandi.length} salti oltre soglia, tutti dentro uno stacco (o rimandati fino al nero).`);
