/* [STRUMENTO] IL REPARTO E' DAVVERO FERMO? — codice 006 del taccuino PO, risegnalato sul 7.695.
   Il 7.685 ha dato ai fermi un respiro di 0,30 unita' e l'ha misurato (0,00 -> 0,39). Il PO lo vede
   ancora fermo. Prima di toccare altro: si GUARDA una fase di lettura con i GLB accesi — il mondo in
   cui gioca lui — e si misura quanto si muovono i corpi VERI (gli avatar GLB), non i procedurali che
   con i GLB accesi sono nascosti. E' la stessa trappola del 7.665: misuravo i fantasmi. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
import fs from 'node:fs';
const dir = 'out/reparto006'; fs.mkdirSync(dir, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true;
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {} });
await openMatch(page, port, { skipLoadAll: true, name: 'Rp' });
await sleep(1200);
let fatte = 0;
for (let k = 0; k < 40 && fatte < 3; k++) {
  const ph = await matchPhase(page);
  if (ph === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose'; } catch (e) { return false; } }, { timeout: 25000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(500); continue; }
  /* due campioni a 1,2s di distanza DENTRO la lettura: quanto si e' mosso ciascun corpo? */
  const leggi = () => page.evaluate(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players) return null;
    return st.players.map(p => ({ x: p.x, y: p.y, wy: p.worldY, ry: p.ry }));
  } catch (e) { return null; } });
  const a = await leggi(); await sleep(1200); const b2 = await leggi();
  await page.screenshot({ path: `${dir}/lettura-${fatte}.png` });
  if (a && b2 && a.length === b2.length) {
    const d = a.map((p, i) => Math.hypot(p.x - b2[i].x, p.y - b2[i].y));
    const dr = a.map((p, i) => Math.abs((p.ry || 0) - (b2[i].ry || 0)));
    const fermi = d.filter(v => v < 0.05).length;
    const ord = d.slice().sort((x, y) => x - y);
    console.log(`  scena ${fatte + 1}: corpi ${d.length} · spostamento mediano ${ord[ord.length >> 1].toFixed(3)}u · max ${Math.max(...d).toFixed(2)}u · fermi(<0,05u) ${fermi}/${d.length} · rotazione max ${Math.max(...dr).toFixed(3)} rad`);
  }
  fatte++;
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  await sleep(1500);
}
await b.close(); srv.close();
console.log(`\n  scatti in ${dir}\n`);
