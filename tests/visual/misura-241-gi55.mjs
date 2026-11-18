#!/usr/bin/env node
/* GIRO 241 — BANCO gi55 «Stacco sul palo lontano», esito PALO chiesto (strumento, non guardiano). N esecuzioni su pagina nuova:
   per ognuna il bersaglio di partenza sorteggiato (px,pz), i due pali (libero dal portiere si/no, margine), il palo scelto, e la
   distanza minima pallone-portiere misurata sui fotogrammi (quota <= 2 u). Risponde a: «un bersaglio seminato fa evitare il portiere?»
     CPM_N=8 · CPM_ROSSO=1 (__CPM_NO_G241) · CPM_AZIONE=55:0 · CPM_KIND=post                                                      */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
import { INIT, esegui, sleep } from './lib/camera-241.mjs';
const N = +(process.env.CPM_N || 8), [gi, k] = (process.env.CPM_AZIONE || '55:0').split(':').map(Number), KIND = process.env.CPM_KIND || 'post';
const srv = await startServer(); const b = await launchBrowser(); process.env.CPM_GREZZO = '1';
let dentro = 0, giud = 0, nessunPalo = 0, unPalo = 0;
for (let i = 0; i < N; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page); await page.addInitScript(INIT);
  if (process.env.CPM_ROSSO) await page.addInitScript(() => { window.__CPM_NO_G241 = 1; });
  try { await openMatch(page, srv.address().port); await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {}); await sleep(500);
    await page.evaluate(() => { window.__CPM_G223ARC = []; });
    const r = await esegui(page, { gi, k, out: 'fail' }, { kind: KIND });
    const A = await page.evaluate(() => (window.__CPM_G223ARC || []).slice(-1)[0] || null);
    const W = (r.grezzo || []).filter(f => f.ph === 'hl_result' && f.gk && (f.arc || f.pa)); let m = 9e9, n = 0, mAll = 9e9;
    for (const f of W) { const d = Math.hypot(f.b[0] - f.gk[0], f.b[2] - f.gk[2]); if (d < mAll) mAll = d; if (f.b[1] > 2.0) continue; if (d < m) m = d; if (d < 0.7) n++; }
    if (r.giudicata && W.length >= 5) { giud++; if (n) dentro++; if (A && A.o1 === 0 && A.o2 === 0) nessunPalo++; if (A && (A.o1 || A.o2)) unPalo++; }
    console.log(`#${i + 1} esito ${r.kd} · volo ${W.length} fot · pallone-portiere min ${m > 1e8 ? '—' : m.toFixed(2)} u (a ogni quota ${mAll > 1e8 ? '—' : mAll.toFixed(2)}) ${n ? '✗ DENTRO (' + n + ' fot)' : '✓'} · ` + (A ? `calcio da (${A.sx},${A.sz}) quota ${A.sy} · sorteggio (${A.px},${A.pz}) → scelto (${A.tx},${A.tz}) · portiere (${A.gx},${A.gz}) ` + (A.o1 == null ? '· (esito non «palo»: i pali non si valutano)' : `· palo +3,66 ${A.o1 ? 'libero' : 'NO'} (margine ${A.c1}) · palo −3,66 ${A.o2 ? 'libero' : 'NO'} (margine ${A.c2})`) : 'nessun bersaglio 223 registrato') + (r.giudicata ? '' : ' · NON GIUDICATA: ' + (r.nonGiud || r.errore)));
  } catch (e) { console.log(`#${i + 1} errore ${String(e.message || e).slice(0, 120)}`); }
  await page.close().catch(() => {});
}
console.log(`\ngi${gi}k${k} ${KIND} × ${N}: giudicate ${giud} · col pallone dentro il portiere ${dentro} · con almeno un palo libero dal portiere ${unPalo} · con NESSUN palo libero ${nessunPalo}`);
await b.close(); srv.close();
