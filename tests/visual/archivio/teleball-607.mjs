/* [7.607.0 STRUMENTO] I TELETRASPORTI DEL PALLONE, fotogramma per fotogramma.
   COLLAUDO PO: «il pallone si muove come se fosse calamitato da qualcosa ma non ci sono portatori».
   MISURATO alla nascita: 2,5 teletrasporti al minuto (>10 u in un fotogramma), TUTTI in gioco vivo, e
   4 su 5 atterrano su (94,50) — il punto del RINVIO DAL FONDO, che la riga di out piazza all'istante
   con setBallPos invece di far viaggiare il pallone (o coprire il salto con uno stacco).
   E' anche la causa della trottola del portiere (giro-gk-607): dopo ogni salto si rigira di 180 gradi
   per guardare il pallone. Il rimedio e' il pattern del 7.559 (l'arbitro PORTA il pallone sul punto)
   applicato al rinvio — non scritto: prima va misurato quante interruzioni passano di li'. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_TB = [];
  const loop = () => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE();
    if (st && st.ball) { const T = window.__CPM_TB;
      if (T.length < 8000) T.push({ t: performance.now(), x: st.ball.x, y: st.ball.y, ph: st.phase }); }
  } catch (_e) {} requestAnimationFrame(loop); };
  requestAnimationFrame(loop); });
await openMatch(page, port, { skipLoadAll: true, name: 'Tb' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(120000);
const T = await page.evaluate(() => window.__CPM_TB || []);
await b.close(); srv.close();
const salti = [];
for (let i = 1; i < T.length; i++) {
  const d = Math.hypot(T[i].x - T[i-1].x, T[i].y - T[i-1].y);
  const dt = (T[i].t - T[i-1].t) / 1000; if (dt <= 0 || dt > 1) continue;
  if (d > 10) salti.push({ d: +d.toFixed(0), da: `(${T[i-1].x.toFixed(0)},${T[i-1].y.toFixed(0)})`, a: `(${T[i].x.toFixed(0)},${T[i].y.toFixed(0)})`, ph: T[i].ph });
}
const sec = (T[T.length-1].t - T[0].t) / 1000;
console.log(`fotogrammi ${T.length} in ${sec.toFixed(0)} s`);
console.log(`TELETRASPORTI del pallone (>10 u in un fotogramma): ${salti.length}  (${(salti.length/(sec/60)).toFixed(1)} al minuto)`);
const perPh = {}; for (const s of salti) perPh[s.ph] = (perPh[s.ph] || 0) + 1;
console.log('per fase:', JSON.stringify(perPh));
console.log('i primi 10:');
for (const s of salti.slice(0, 10)) console.log(`  ${s.d}u  ${s.da} -> ${s.a}  [${s.ph}]`);
