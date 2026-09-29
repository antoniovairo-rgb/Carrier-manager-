#!/usr/bin/env node
/* [7.999.57 guardiano — collaudo PO «scena sballata, l'eroe rimane freezato per un po'» (festa di fine partita)] Nella festa
   LEGGERA (niente trofeo) la clip d'esultanza dell'eroe restava in pausa al 34% — a meta' salto — per tutta la festa: il
   congelamento all'apice e' della premiazione con la coppa in mano. Coi corpi 3D accesi, durante la fase `ceremony` si campiona
   il tempo della clip mx-victory-jump dell'eroe (__CPM_ANIM_AUDIT.heroMx). VERDE: la clip avanza (mai piu' di 2 campioni di fila sullo stesso
   tempo). ROSSO __CPM_NO_FESTA57: la clip resta ferma (almeno 4 campioni di fila sullo stesso tempo). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; if (r) window.__CPM_NO_FESTA57 = 1; window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Festa2' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
  const t0 = Date.now(); let f = false;
  while (Date.now() - t0 < 480000) { f = await page.evaluate(() => !!document.querySelector('[data-cpm="festa47"]')).catch(() => false); if (f) break; await sleep(400); }
  const tempi = [];
  for (let i = 0; i < 12; i++) {
    const r = await page.evaluate(() => { const a = window.__CPM_ANIM_AUDIT && window.__CPM_ANIM_AUDIT(); const ph = window.__CPM_PHASE && window.__CPM_PHASE();
      const v = a && a.heroMx && a.heroMx.acts.find(x => /victory/.test(x)); return { ph, t: v ? (v.match(/@([\d.]+)/) || [])[1] : null }; });
    if (r.ph === 'ceremony' && r.t != null) tempi.push(r.t); await sleep(600);
  }
  await page.close();
  let fermo = 1, run = 1; for (let i = 1; i < tempi.length; i++) { run = tempi[i] === tempi[i - 1] ? run + 1 : 1; if (run > fermo) fermo = run; }
  return { festa: f, tempi, fermo };
}
const v = await braccio(false); console.log('VERDE', JSON.stringify(v));
const r = await braccio(true); console.log('ROSSO', JSON.stringify(r));
await b.close(); srv.close();
const okV = v.festa && v.tempi.length >= 6 && v.fermo <= 2, okR = r.festa && r.fermo >= 4;
console.log(okV ? '✅ nella festa l\'esultanza dell\'eroe si muove' : '❌ esultanza ferma nella festa');
console.log(okR ? '✅ il rosso __CPM_NO_FESTA57 mostra l\'eroe congelato' : '❌ il rosso non riproduce il congelamento');
process.exit(okV && okR ? 0 : 1);
