#!/usr/bin/env node
/* [7.999.53 guardiano — taccuino PO #3 «al tiro il corpo non guarda la porta»] Il difetto non si riproduce senza schermo
   (8-11° al contatto), quindi il gioco lo misura sul telefono: il testimone __CPM_CONT53 annota una volta per scena l'angolo
   corpo↔porta nel fotogramma del contatto, e la bozza del taccuino lo scrive. Qui si prova che la catena funziona:
   VERDE  → su un tiro forzato il testimone si riempie (angolo 0-180) e la bozza contiene «corpo↔porta al contatto»;
   ROSSO  → con __CPM_NO_CONT53 il testimone resta vuoto e la riga manca (il guardiano deve accorgersene).
   Uso: node contatto-53.mjs   ·   CPM_ROSSO=1 per la sola prova del rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO_CONT53 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Contatto53' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_CONT53 = []; window.__CPM_FORCE_SIT(3, false); window.__CPM_FROZEN = false; });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(1); });
  let cont = [];
  for (let i = 0; i < 40; i++) { await sleep(500); cont = await page.evaluate(() => (window.__CPM_CONT53 || []).slice()); if (cont.length) break; }
  await sleep(1500);
  const bozza = await page.evaluate(() => {
    const snap = window.__CPM_WATCH_SNAP ? window.__CPM_WATCH_SNAP() : null;
    const L = (window.__CPM_CONT53 || []); const sk = L.length ? L[L.length - 1].sk : (snap && snap.samples && snap.samples.length ? snap.samples[snap.samples.length - 1].sk : null);
    return typeof draftBugNote === 'function' ? draftBugNote(snap, { sceneKey: sk, intent: 'shot' }) : '(draftBugNote assente)';
  });
  await page.close();
  return { cont, bozza };
}
let ok = true;
if (!process.env.CPM_ROSSO) {
  const v = await braccio(false); const c = v.cont[v.cont.length - 1];
  console.log(`VERDE: testimone ${v.cont.length} voci${c ? ` · ultimo sk ${c.sk} tipo ${c.tipo} angolo ${c.a}° eroe (${c.x},${c.z}) glb ${c.glb}` : ''}`);
  console.log(`       bozza: ${String(v.bozza).replace(/\n/g, ' ⏎ ').slice(0, 400)}`);
  const riga = /corpo↔porta al contatto: \d+°/.test(v.bozza);
  if (!c || !(c.a >= 0 && c.a <= 180) || !riga) { ok = false; console.log('✗ verde fallito: testimone vuoto o riga assente'); }
}
const r = await braccio(true);
console.log(`ROSSO (__CPM_NO_CONT53): testimone ${r.cont.length} voci · riga nella bozza: ${/corpo↔porta/.test(r.bozza)}`);
if (r.cont.length || /corpo↔porta/.test(r.bozza)) { ok = false; console.log('✗ il rosso non spegne il testimone: il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ contatto-53 verde (e il rosso si vede)' : '❌ contatto-53 ROSSO'); process.exit(ok ? 0 : 1);
