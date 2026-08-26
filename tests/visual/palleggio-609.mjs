/* [7.609.0 STRUMENTO] IL PORTATORE PALLEGGIA?
   COLLAUDO PO: «in cronaca ora sembra il portatore di palla spesso palleggia».
   MISURATO alla nascita, in gioco vivo col pallone AI PIEDI di qualcuno (entro 2 u, 1487 campioni):
   l'altezza del pallone si INVERTE 16,5 volte al minuto e arriva fino a 3,44 u — sopra la testa —
   col 3% dei campioni sopra il ginocchio. Un portatore vero tiene la palla a terra.
   LETTURA, dichiarata come ipotesi e non come causa provata: i saltelli hanno il passo delle giocate
   della cronaca (22-26 cambi di piede al minuto, trame-594) — ogni «passaggio» della catena lancia un
   archetto che sale e scende ACCANTO al portatore incollato, e l'insieme legge come un palleggio.
   Se e' cosi', il rimedio non e' qui: e' il possesso come sequenza di passaggi fra uomini NOMINATI
   (la strada gia' scritta nella nota 7.539.1) — un passaggio vero parte da un uomo e arriva a un
   ALTRO, non sale e scende sul posto. Questa sonda e' il metro con cui giudicare quel lavoro. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PL = [];
  const loop = () => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE();
    if (st && st.ball && st.ball.heldBy && st.phase === 'playing') { const P = window.__CPM_PL;
      if (P.length < 6000) P.push({ t: performance.now(), wy: st.ball.worldY, d: st.ball.heldBy.dist });
    }
  } catch (_e) {} requestAnimationFrame(loop); };
  requestAnimationFrame(loop); });
await openMatch(page, port, { skipLoadAll: true, name: 'Pl' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(120000);
const P = await page.evaluate(() => window.__CPM_PL || []);
await b.close(); srv.close();
const conPort = P.filter(p => p.d <= 2);
console.log(`campioni in gioco vivo: ${P.length} · con portatore entro 2 u: ${conPort.length}`);
if (conPort.length < 30) { console.log('pochi campioni: NON GIUDICABILE'); process.exit(1); }
let su = 0, giu = 0, inv = 0, pd = null, maxY = 0, alto = 0;
for (let i = 1; i < conPort.length; i++) {
  const d = conPort[i].wy - conPort[i-1].wy;
  if (conPort[i].wy > maxY) maxY = conPort[i].wy;
  if (conPort[i].wy > 1.2) alto++;
  if (Math.abs(d) > 0.05) { if (pd != null && d * pd < 0) inv++; pd = d; if (d > 0) su++; else giu++; }
}
const sec = (conPort[conPort.length-1].t - conPort[0].t) / 1000;
console.log(`col pallone AI PIEDI: altezza massima ${maxY.toFixed(2)} u · sopra 1,2 u (ginocchio) nel ${(alto/conPort.length*100).toFixed(0)}% dei campioni`);
console.log(`rimbalzi (inversioni su/giu' dell'altezza): ${inv} in ${sec.toFixed(0)} s = ${(inv/(sec/60)).toFixed(1)} al minuto`);
console.log('(un portatore vero tiene la palla a terra: rimbalzi frequenti col pallone ai piedi = il palleggio del PO)');
