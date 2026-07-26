#!/usr/bin/env node
/* [7.204.0 direttiva PO «sembra davvero una partita di calcio»] PROBE sulla CONTINUITÀ TERRITORIALE della
   selezione. Il picker delle situations conosceva punteggio, minuto, momentum e possesso — ma non DOVE fosse
   il pallone: il momento successivo poteva nascere sessanta metri più in là di dove l'azione era appena
   finita. Ora la distanza fra il punto in cui il gioco si è fermato e l'inizio della situation pesa sulla
   selezione (preferenza morbida, mai un filtro).
   Verifica, chiamando la funzione VERA su tutto il pool:
     (A) con la palla nelle retrovie la distanza media dell'azione successiva CALA rispetto a ignorare la palla;
     (B) idem con la palla in area avversaria (l'effetto non è un bias verso una metà campo, ma verso la palla);
     (C) NON è un filtro: le transizioni lunghe restano possibili (il pool resta ricco);
     (D) determinismo: stesso seed e stesso contesto → stessa scelta. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await page.waitForFunction(() => typeof window.__CPM_SELECT === 'function' && !!window.__CPM_SITS, null, { timeout: 30000 });

const res = await page.evaluate(() => {
  const sel = window.__CPM_SELECT, S = window.__CPM_SITS || [];
  const P = { ovr: 78, stats: { tiro: 80, passaggio: 78, 'velocità': 79, fisico: 76 }, club: { id: 'sal' }, history: [] };
  const cen = s => (s && s.startZone && s.startZone.x) ? (s.startZone.x[0] + s.startZone.x[1]) / 2 : 50;
  const run = (ballX, n) => {
    let sum = 0, far = 0, uniq = new Set();
    for (let i = 0; i < n; i++) {
      const o = { scoreCtx: 'drawing', clock: 40, momentum: 50, possession: 50 };
      if (ballX != null) o.ballX = ballX;
      const r = sel([...S], 1, P, (i * 7919 + 13) >>> 0, o);
      if (!r || !r[0]) continue;
      const d = Math.abs(cen(r[0]) - (ballX == null ? 50 : ballX));
      sum += d; if (d > 35) far++; uniq.add(r[0].text);
    }
    return { avg: +(sum / n).toFixed(1), farPct: +(far / n * 100).toFixed(1), uniq: uniq.size };
  };
  const deep = { withBall: run(22, 240), blind: (() => { /* riferimento: stessa misura ignorando la palla */
    let sum = 0; const S2 = [...S];
    for (let i = 0; i < 240; i++) { const r = sel(S2, 1, P, (i * 7919 + 13) >>> 0, { scoreCtx: 'drawing', clock: 40, momentum: 50, possession: 50 }); if (r && r[0]) sum += Math.abs(cen(r[0]) - 22); }
    return { avg: +(sum / 240).toFixed(1) };
  })() };
  const high = { withBall: run(88, 240), blind: (() => {
    let sum = 0; const S2 = [...S];
    for (let i = 0; i < 240; i++) { const r = sel(S2, 1, P, (i * 7919 + 13) >>> 0, { scoreCtx: 'drawing', clock: 40, momentum: 50, possession: 50 }); if (r && r[0]) sum += Math.abs(cen(r[0]) - 88); }
    return { avg: +(sum / 240).toFixed(1) };
  })() };
  const a = sel([...S], 1, P, 4242, { scoreCtx: 'drawing', clock: 40, ballX: 30 })[0];
  const b = sel([...S], 1, P, 4242, { scoreCtx: 'drawing', clock: 40, ballX: 30 })[0];
  return { deep, high, det: !!a && !!b && a.text === b.text };
});

console.log(`palla nelle retrovie (x=22): distanza media dell'azione successiva ${res.deep.withBall.avg} (senza la palla nel contesto: ${res.deep.blind.avg}) · oltre mezzo campo ${res.deep.withBall.farPct}% · situations distinte ${res.deep.withBall.uniq}`);
console.log(`palla in area avversaria (x=88): distanza media ${res.high.withBall.avg} (senza: ${res.high.blind.avg}) · oltre mezzo campo ${res.high.withBall.farPct}% · situations distinte ${res.high.withBall.uniq}`);

if (!(res.deep.withBall.avg < res.deep.blind.avg - 1.5)) issues.push(`(A) con la palla nelle retrovie la continuità non migliora: ${res.deep.withBall.avg} contro ${res.deep.blind.avg}`);
if (!(res.high.withBall.avg < res.high.blind.avg - 1.5)) issues.push(`(B) con la palla in area la continuità non migliora: ${res.high.withBall.avg} contro ${res.high.blind.avg}`);
if (res.deep.withBall.uniq < 25 || res.high.withBall.uniq < 25) issues.push(`(C) la varietà è collassata (${res.deep.withBall.uniq}/${res.high.withBall.uniq} situations distinte): il peso si comporta da filtro`);
if (res.deep.withBall.farPct < 2) issues.push('(C) le transizioni lunghe sono sparite del tutto: nel calcio esistono');
if (!res.det) issues.push('(D) selezione non deterministica a parità di seed e contesto');

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ CONTINUITÀ TERRITORIALE OK (l\'azione riprende vicino a dove si è fermata, senza perdere varietà né transizioni lunghe)');
process.exit(issues.length ? 1 : 0);
