#!/usr/bin/env node
/* [7.999.46 sonda — 001 in partita NATURALE: «all'apertura il pallone non e' ai piedi di nessuno dei nostri»]
   Partita naturale col pilota automatico (partita CPM_NOME, deterministica per nome). Per la scena CPM_GI (o per tutte) registra
   ogni 120 ms, dall'ingresso in hl_intro a 1,5 s dopo la scelta: fase, eroe, pallone (coordinate di gioco), scrittore del pallone
   (ultimo campione __CPM_WS38) e la zona dichiarata dalla scena. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOME = process.env.CPM_NOME || 'Stacco2', GI = process.env.CPM_GI != null ? +process.env.CPM_GI : null, MS = +(process.env.CPM_MS || 150000);
const WS = ["—","scena","arco","inseguitore","portatore","addosso","palo","respinta","ricevente-cross","ricevente-pass","consegna","buildup-aereo","buildup-fine","buildup-volo","testa","avvicinamento","esito"];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_REC = 1; window.__CPM_WS38_REC = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
await openMatch(page, port, { skipLoadAll: true, name: NOME });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now(); let rec = null, dopo = 0; const scene = [];
while (Date.now() - t0 < MS) {
  const r = await page.evaluate(() => { try { const ph = window.__CPM_PHASE(); const s = window.__CPM_STATE(); const q = window.__CPM_CURSIT && window.__CPM_CURSIT(); const W = window.__CPM_WS38 || []; const w = W[W.length - 1]; if (W.length > 200) W.splice(0, W.length - 20);
    const sit = q && window.__CPM_SITS ? window.__CPM_SITS[q.gi] : null;
    return { ph, h: s.hero ? [s.hero.x, s.hero.y] : null, bl: s.ball ? [s.ball.x, s.ball.y] : null, gi: q ? q.gi : null, t: q ? q.t : '', ws: w ? w[1] : null, zona: sit && sit.startZone ? sit.startZone : null, clock: s.clock }; } catch (e) { return null; } }).catch(() => null);
  if (!r) { await sleep(120); continue; }
  if (r.ph === 'hl_intro' && !rec) rec = { gi: null, min: r.clock, fr: [] };
  if (rec) { rec.gi = r.gi; rec.t = r.t; rec.zona = r.zona; const d = (r.h && r.bl) ? +Math.hypot(r.h[0] - r.bl[0], (r.h[1] - r.bl[1]) * 0.68).toFixed(1) : null; rec.fr.push(`${r.ph.replace('hl_', '')}:E(${r.h})B(${r.bl})d${d}:${WS[r.ws] || r.ws}`);
    if (r.ph === 'hl_result' || r.ph === 'playing') dopo++;
    if (dopo > 12) { scene.push(rec); if (GI == null || rec.gi === GI) { console.log(`\n=== gi${rec.gi} «${rec.t}» ${rec.min}' zona ${JSON.stringify(rec.zona)}`); console.log(rec.fr.join('\n')); if (GI != null) break; } rec = null; dopo = 0; } }
  if (r.ph === 'ended') break;
  await sleep(120);
}
await b.close(); srv.close();
console.log(`\nscene registrate: ${scene.map(s => 'gi' + s.gi + '@' + s.min).join(' ')}`);
