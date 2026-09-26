#!/usr/bin/env node
/* [7.999.23] GUARDIANO — IL FILTRANTE INTERCETTATO NON TORNA INDIETRO (collaudo PO, SIT #25 «Filtrante per il centravanti!»,
   esito intercetto: «codice 014 palla flipper», «codice 012 verticalizzazione all'indietro»). Misurato: il taglio avveniva dopo
   2-4 u (appena il 25% della linea) e poi l'assestamento riportava il pallone verso x<=10, ~9 u all'indietro. Ora il taglio e'
   fra il 45% e l'85% della linea e il pallone si assesta dove l'ha fermato l'intercettore. Due filtranti intercettati e due in fuorigioco (stesso scivolamento
   misurato, 8 u), forzati a corpi 3D spenti: verde se in nessuno il pallone arretra di piu' di 3 u dal punto piu' avanzato raggiunto e se avanza di almeno 6 u
   prima del taglio. CPM_ROSSO=1 → __CPM_NO_FILTR23: deve tornare l'arretramento. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const E = []; page.on('pageerror', e => E.push(e.message));
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_FILTR23 = null; if (r) window.__CPM_NO_FILTR23 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Filtr23' }); await sleep(3000);
const runs = [];
for (const kind of ['intercepted', 'intercepted', 'offside', 'offside']) {
  await page.waitForFunction(() => { try { const a = window.__CPM_ARC; return !a || (!a.pa && !(a.arc && a.arc.length)); } catch (e) { return true; } }, { timeout: 6000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_FORCE_SIT(25, true)); await sleep(800);
  const x0 = await page.evaluate(() => window.__CPM_STATE().ball.x);
  await page.evaluate(kind => { window.__CPM_FROZEN = false; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = kind; window.__CPM_RESOLVE(0); }, kind);
  const xs = [x0]; const dbg = []; for (let i = 0; i < 32; i++) { await sleep(120); const s = await page.evaluate(() => { const s = window.__CPM_STATE(); return { x: s.ball.x, y: s.ball.y, own: s.ball.owner ?? s.owner ?? null, f: window.__CPM_FILTR23 }; }); xs.push(s.x); dbg.push([+s.x.toFixed(1), s.f]); } if (process.env.DBG) console.log(JSON.stringify(dbg));
  const mx = Math.max(...xs), last = xs[xs.length - 1];
  runs.push({ kind, x0: +x0.toFixed(1), avanti: +(mx - x0).toFixed(1), indietro: +(mx - last).toFixed(1) });
  await sleep(2500);
}
await b.close(); srv.close();
console.log(JSON.stringify(runs), 'errori pagina', E.length);
const peggio = Math.max(...runs.map(r => r.indietro)), corto = Math.min(...runs.map(r => r.avanti));
if (ROSSO) { const ok = peggio > 3; console.log(ok ? `✅ ROSSO come atteso: senza il 7.999.23 il pallone arretra di ${peggio} u` : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const fails = []; if (peggio > 3) fails.push(`il pallone arretra di ${peggio} u dopo l'intercetto`); if (corto < 6) fails.push(`taglio troppo presto: avanza solo ${corto} u`); if (E.length) fails.push('errori di pagina: ' + E[0]);
console.log(fails.length ? '❌ FAIL filtrante-intercetto\n  ' + fails.join('\n  ') : '✅ PASS filtrante-intercetto'); process.exit(fails.length ? 1 : 0);
