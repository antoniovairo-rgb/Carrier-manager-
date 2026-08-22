#!/usr/bin/env node
/* MISURA — QUANTO DEL «PALLONE LENTO» E' IL FRAME RATE, E QUANTO IL GIOCO.
   Il 7.545 ha osservato la mesh del pallone a ~15 u/s a scatti, con un tetto dichiarato di 34 u/s
   (r.13156: _step = min(dd, min(dd*5.2+2.2, 34) * aDt)). Il sospetto era il tetto di spostamento del
   7.498 — SBAGLIATO: quel tetto e' per RIGA di cronaca, non per tick.
   La causa vera e' il cap di `dt` a 0,05s (r.12898): sotto i 20 fps il clock di scena avanza meno del
   tempo reale e tutto cio' che si muove a velocita' rallenta. Il 7.460 lo aveva gia' dichiarato:
   «su un telefono lento e' lo stesso identico meccanismo, non e' solo un artefatto di misura».
   Questa sonda misura INSIEME il frame rate e la velocita' del pallone, e stima quanto del rallentamento
   sparirebbe a 60 fps. Non giudica: misura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_FPS = []; window.__CPM_VEL = [];
  let n = 0, t0 = performance.now(), capped = 0;
  const raf = () => { n++; const now = performance.now();
    const d = now - (window.__CPM_LASTF || now); window.__CPM_LASTF = now;
    if (d > 50) capped++;                        /* fotogrammi oltre il cap di dt (0,05s) */
    if (now - t0 >= 1000) { window.__CPM_FPS.push({ fps: n, capped }); n = 0; capped = 0; t0 = now; }
    requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  let prev = null, pt = null;
  setInterval(() => { try { const q = window.__CPM_BALL3 && window.__CPM_BALL3(); if (!q || !q.m) return;
    const now = performance.now();
    if (prev && pt && now > pt) { const d = Math.hypot(q.m.x - prev.x, q.m.y - prev.y);
      const dd = Math.hypot(q.t.x - prev.x, q.t.y - prev.y);
      if (dd > 6) window.__CPM_VEL.push(+(d / ((now - pt) / 1000)).toFixed(1)); }
    prev = q.m; pt = now; } catch (_e) {} }, 60);
});
await openMatch(page, port, { skipLoadAll: true, name: 'Fp' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now();
while (Date.now() - t0 < 400000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
const { fps, vel } = await page.evaluate(() => ({ fps: window.__CPM_FPS || [], vel: window.__CPM_VEL || [] }));
await page.close(); srv.close(); await b.close();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : 0; };
const f = fps.map(x => x.fps), cap = fps.map(x => x.capped);
console.log('\n=== IL PALLONE LENTO: FRAME RATE O GIOCO? ===\n');
console.log(`  frame rate            mediana ${med(f)} fps · min ${Math.min(...f)} · max ${Math.max(...f)}   (${fps.length} secondi)`);
console.log(`  fotogrammi oltre 50ms mediana ${med(cap)}/s   <- questi subiscono il cap di dt`);
console.log(`  velocita' del pallone mediana ${med(vel)} u/s · p90 ${med(vel) && [...vel].sort((a, b) => a - b)[Math.floor(vel.length * 0.9)]} · max ${Math.max(...vel)}   (${vel.length} campioni in avvicinamento)`);
console.log(`  tetto dichiarato      34 u/s`);
const perso = med(f) < 20 ? (1 - med(f) / 20) : 0;
console.log(`\n  a ${med(f)} fps il clock di scena perde circa il ${(perso * 100).toFixed(0)}% del tempo reale (cap dt=0,05s)`);
console.log(perso > 0.15 ? '  >> parte del rallentamento e\' AMBIENTE DI MISURA — ma lo stesso meccanismo morde su un telefono lento.'
                         : '  >> il frame rate NON spiega il rallentamento: la causa e\' nel gioco.');
