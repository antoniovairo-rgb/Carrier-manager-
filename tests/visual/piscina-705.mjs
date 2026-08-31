/* [STRUMENTO] IL TUFFO DEL PORTIERE, GUARDATO FOTOGRAMMA PER FOTOGRAMMA.
   Collaudo PO: «il portiere sembra che sta in piscina». Il tuffo ambientale (7.695) l'ho acceso e
   misurato SOLO in partenza (6/6 col testo); mai guardato come FINISCE. Qui: si aspetta una riga di
   parata, poi 6 scatti in 4 secondi — tuffo, atterraggio, rialzata — piu' la telemetria del corpo del
   portiere (posizione, rotazione z = quanto e' sdraiato) campionata a 250ms per 5s. Se resta sdraiato
   o scivola in posa orizzontale, i numeri e le foto lo dicono insieme. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const dir = 'out/piscina705'; fs.mkdirSync(dir, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Pi' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
let parPrev = 0, prese = 0;
const tele = [];
for (let k = 0; k < 900 && prese < 2; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE();
    return { c: st ? st.clock : null, par: (window.__CPM_OCC695 && window.__CPM_OCC695.parate) || 0 };
  } catch (_e) { return null; } });
  if (!r) continue;
  if (r.par > parPrev) {
    parPrev = r.par; prese++;
    const serie = [];
    for (let f = 0; f < 20; f++) {
      const t = await page.evaluate(() => { try {
        const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players) return null;
        const gks = st.players.filter(p => p.gk);
        const bl = st.ball;
        return { gks: gks.map(g => ({ team: g.team, x: g.x, y: g.y, wy: g.worldY, ry: g.ry })), bx: bl ? bl.x : null, by: bl ? bl.z : null };
      } catch (e) { return null; } });
      if (t) serie.push(t);
      if (f % 3 === 0 && f <= 15) await page.screenshot({ path: `${dir}/parata${prese}-f${f}.png` });
      await sleep(250);
    }
    tele.push(serie);
  }
  if (r.c != null && r.c >= 89) break;
}
await b.close(); srv.close();
console.log(`\n=== IL TUFFO, GUARDATO ===  parate osservate: ${tele.length}\n`);
for (let i = 0; i < tele.length; i++) {
  const S = tele[i]; if (!S.length) continue;
  /* il portiere del lato dove sta la palla (vicino a gx 0 o 100) */
  const lato = (S[0].bx || 50) > 50 ? 'away' : 'home';
  const g0 = S.map(s => (s.gks || []).find(g => g.team === lato)).filter(Boolean);
  if (!g0.length) { console.log(`  parata ${i + 1}: portiere non trovato`); continue; }
  const dx = g0.map((g, j) => j ? Math.hypot(g.x - g0[j - 1].x, g.y - g0[j - 1].y) : 0);
  const spost = dx.reduce((a, v) => a + v, 0);
  console.log(`  parata ${i + 1}: spostamento del portiere nei 5s dopo il tuffo: ${spost.toFixed(1)}u · passo max ${Math.max(...dx).toFixed(2)}u/250ms · quota worldY min ${Math.min(...g0.map(g => g.wy || 0)).toFixed(2)} max ${Math.max(...g0.map(g => g.wy || 0)).toFixed(2)}`);
}
console.log(`\n  scatti in ${dir}\n`);
