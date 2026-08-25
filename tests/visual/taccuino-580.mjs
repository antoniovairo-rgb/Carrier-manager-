#!/usr/bin/env node
/* SONDA — IL TACCUINO DEGLI APPUNTI C'E' ANCORA? (collaudo PO «non c'e' piu' il taccuino per gli appunti»)
   Il taccuino e' il tasto ⚠️ nell'intestazione della partita: mette in pausa e apre la nota precompilata.
   Vive dietro `devToolsOn()`, che legge `cpm-devtools` dal dispositivo — quindi «non c'e' piu'» puo'
   voler dire due cose diverse: il tasto non viene piu' COSTRUITO (difetto), oppure l'interruttore degli
   strumenti di collaudo e' spento su quel telefono (impostazione). Questa sonda separa i due casi:
   guarda il DOM con l'interruttore ACCESO e con l'interruttore SPENTO, e stampa cosa trova. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = [];
for (const acceso of [true, false]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 120)));
  await page.addInitScript(a => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-devtools', a ? '1' : '0'); } catch (_e) {} }, acceso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Tc' });
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) { await sleep(1000); if ((await matchPhase(page)) === 'playing') break; }
  await sleep(1500);
  const n = await page.evaluate(() => document.querySelectorAll('button[title*="Segna un\'azione sbagliata"]').length);
  out.push({ acceso, n, err: errors.length ? errors[0] : null });
  await page.close();
}
await b.close(); srv.close();
console.log('\n=== IL TACCUINO DEGLI APPUNTI (tasto ⚠️ nell\'intestazione della partita) ===\n');
for (const o of out) console.log('  strumenti di collaudo ' + (o.acceso ? 'ACCESI ' : 'SPENTI ') + ' →  tasti trovati nel DOM: ' + o.n + (o.err ? '  ·  pageerror: ' + o.err : ''));
const ok = out[0].n === 1 && out[1].n === 0;
console.log('\n' + (ok
  ? "✓ PASS — il taccuino esiste e dipende SOLO dall'interruttore: acceso c'e', spento non c'e'.\n  Quindi «non c'e' piu'» sul dispositivo significa interruttore spento (Profilo → 🐞 Strumenti di collaudo), non un difetto."
  : "✘ FAIL — il taccuino NON si comporta come dovrebbe: acceso " + out[0].n + ", spento " + out[1].n) + '\n');
process.exit(ok ? 0 : 1);
