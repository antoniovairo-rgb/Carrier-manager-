#!/usr/bin/env node
/* [7.999.27] GUARDIANO — IL RIGORE DELL'EROE E' UNA SCENA (scelta PO «rigore sempre, punizione se da tiro»). Misurato prima: 0 rigori e
   0 punizioni fra le scene di 6 partite vere, perche' il motore li calciava senza scena. Partita vera col pilota automatico; dopo 15 s si
   chiede al motore un rigore con l'eroe battitore (la stessa richiesta `chiedi.piazzato` che il gioco usa per i piazzati). Verde se entro
   40 s si apre una scena di RIGORE. CPM_ROSSO=1 → __CPM_NO_PIAZ27: il motore calcia da solo, nessuna scena di rigore. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const E = []; page.on('pageerror', e => E.push(e.message));
await page.addInitScript(([r, n98]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_PIAZ27 = 1; if (n98) window.__CPM_NO_ORIG98 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, [ROSSO, !!process.env.CPM_NO98]);
await openMatch(page, port, { skipLoadAll: true, name: 'Rigore27' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2727, policy: 'seeded', tickMs: 300 }));
let chiesto = false, scena = null, tentativi = 0; const t0 = Date.now(); let tC = 0;
/* fino a 4 tentativi: se durante l'attesa del battitore parte un'altra scena, alla ripresa il motore azzera il piazzato in sospeso
   (comportamento preesistente di `riprendi`) e la richiesta va rifatta a gioco fermo */
while (Date.now() - t0 < 300000 && !scena) {
  const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), f: (() => { try { const S = window.__CPM_MOTORE_OBJ()._S; return S.fermo ? S.fermo.kind : null; } catch (e) { return null; } })(), c: (() => { try { return window.__CPM_CURSIT && window.__CPM_CURSIT(); } catch (e) { return null; } })() })).catch(() => ({}));
  if (r.ph === 'ended') break;
  if (r.ph && r.ph.startsWith('hl_') && r.c && r.c.intent === 'penalty' && chiesto) { scena = r.c; break; }
  if (r.ph === 'playing' && tentativi < 4 && Date.now() - t0 > 15000 && r.f !== 'pen' && (!tC || Date.now() - tC > 8000)) {
    chiesto = await page.evaluate(() => { try { window.__CPM_MOTORE_OBJ().chiedi.piazzato({ kind: 'pen', x: 89, y: 50, lato: 'home', batt: 21, hold: 6 }); return true; } catch (e) { return false; } });
    if (chiesto) { tentativi++; tC = Date.now(); } }
  await sleep(200);
}
await b.close(); srv.close();
console.log(`rigore chiesto al motore: ${chiesto} (tentativi ${tentativi}) · scena di rigore aperta: ${scena ? '«' + scena.t + '»' : 'no'} · errori pagina ${E.length}`);
if (ROSSO) { const ok = chiesto && !scena; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.27 il rigore lo calcia il motore, nessuna scena' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const fails = []; if (!chiesto) fails.push('rigore non chiesto (motore non raggiungibile)'); if (!scena) fails.push('nessuna scena di rigore entro 40 s'); if (E.length) fails.push('errori di pagina: ' + E[0]);
console.log(fails.length ? '❌ FAIL piazzati-eroe\n  ' + fails.join('\n  ') : '✅ PASS piazzati-eroe'); process.exit(fails.length ? 1 : 0);
