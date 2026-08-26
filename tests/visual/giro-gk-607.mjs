/* [7.607.0 STRUMENTO] IL PORTIERE FA GIRO GIRO TONDO? Misura della rotazione dell'imbardata.
   COLLAUDO PO: «il portiere a volte fa giro giro tondo». MISURATO alla nascita: portiere di casa 3,2
   GIRI COMPLETI al minuto, ospite 4,7, picchi ~600 gradi/s. Una trottola.
   CAUSA (vedi teleball-607): il portiere insegue con lo sguardo un pallone che si TELETRASPORTA — 4
   salti su 5 atterrano sul punto del rinvio dal fondo (94,50), piazzato all'istante dalla riga di out.
   ⚠️ UN'IPOTESI GIA' CADUTA, per chi riprende: NON e' il facing di animOne che segue le micro-correzioni
   (provato a legarlo alla velocita' vera: 3,2 -> 3,2, nessun effetto, revocato). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_GKY = { home: [], away: [] };
  setInterval(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players) return;
    const G = window.__CPM_GKY; if (G.home.length > 1400) return;
    for (const p of st.players) { if (!p || !p.gk || p.ry == null) continue;
      (p.team === 'home' ? G.home : G.away).push(+p.ry.toFixed(3)); }
  } catch (_e) {} }, 150); });
await openMatch(page, port, { skipLoadAll: true, name: 'Gy' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(150000);
const G = await page.evaluate(() => window.__CPM_GKY || null);
await b.close(); srv.close();
const stat = (a, nome) => {
  if (a.length < 10) { console.log(`  ${nome}: pochi campioni (${a.length})`); return; }
  let giri = 0, acc = 0, maxV = 0, inv = 0, pd = null;
  for (let i = 1; i < a.length; i++) {
    let d = a[i] - a[i-1]; while (d > Math.PI) d -= 2*Math.PI; while (d < -Math.PI) d += 2*Math.PI;
    const v = Math.abs(d) / 0.15; if (v > maxV) maxV = v;
    acc += Math.abs(d); if (pd != null && d * pd < 0 && Math.abs(d) > 0.05) inv++; if (Math.abs(d) > 0.05) pd = d;
  }
  giri = acc / (2*Math.PI);
  const sec = a.length * 0.15;
  console.log(`  ${nome}: ${a.length} campioni (${sec.toFixed(0)} s) · rotazione totale ${giri.toFixed(1)} GIRI COMPLETI (${(giri/(sec/60)).toFixed(1)} giri/min) · velocita' max ${(maxV*57.3).toFixed(0)} gradi/s · inversioni ${inv}`);
};
console.log('\n=== IL PORTIERE FA GIRO GIRO TONDO? ===\n');
stat(G.home, 'portiere di CASA  ');
stat(G.away, 'portiere OSPITE   ');
console.log("\n  (un portiere vero ruota qualche grado per seguire l'azione: piu' di 1-2 giri completi al minuto e' una trottola.)");
