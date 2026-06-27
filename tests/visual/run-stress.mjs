#!/usr/bin/env node
/* ============================================================================
   CPM — STRESS / LEAK SMOKE TEST (A2-A3 / Top 100 #10 + #11, AC-121/130 parziale)
   Forza N highlight consecutivi (ciclando le 179 Situations, con resolve periodico)
   e sorveglia: (a) crash/eccezioni/console-error -> HARD FAIL; (b) crescita del JS
   heap (Chromium performance.memory) -> WARN (l'heap headless fluttua, niente FAIL).
   Verifica che il render-loop regga molti HL senza degradare. LMQP-side, zero
   modifiche al gioco. Eseguibile con: npm run stress   (CPM_STRESS_N per il conteggio)
   ============================================================================ */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const N = Number(process.env.CPM_STRESS_N || 220);     // cicli (force ~60ms l'uno → ~15-25s)
const RESOLVE_EVERY = 12;                               // ogni quanti cicli risolvere l'azione (esercita la conclusione)
const HEAP_GROWTH_WARN = 1.6;                           // warn se heap finale > 1.6x del campione di warmup
const HEAP_GROWTH_MB = 40;                              // ...e crescita assoluta > 40 MB

(async () => {
  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  const errors = []; const heap = [];
  let total = 0, cycles = 0, resolves = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
    page.on('console', m => { if (m.type() === 'error' && !/BABEL|in-browser Babel/.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    await installCdnRoutes(page);
    ({ total } = await openMatch(page, port));
    const readHeap = () => page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : null));

    for (let i = 0; i < N; i++) {
      const gi = i % total;
      await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi);
      await sleep(40);
      if (i % RESOLVE_EVERY === 0) { await page.evaluate(() => window.__CPM_RESOLVE(0)); resolves++; await sleep(120); }
      cycles++;
      if (i % 25 === 0) { const h = await readHeap(); if (h != null) heap.push({ i, mb: +(h / 1048576).toFixed(1) }); }
      if (errors.length) break; // stop early su crash
    }
    const hEnd = await readHeap(); if (hEnd != null) heap.push({ i: N, mb: +(hEnd / 1048576).toFixed(1) });
  } catch (e) {
    errors.push('FATAL: ' + (e && e.message || e));
  } finally {
    await browser.close(); srv.close();
  }

  // analisi heap (warn-only): confronta il campione finale col warmup (2° campione, salta il transitorio)
  const warmup = heap[1] || heap[0], end = heap[heap.length - 1];
  let heapWarn = null;
  if (warmup && end && end.mb > warmup.mb * HEAP_GROWTH_WARN && (end.mb - warmup.mb) > HEAP_GROWTH_MB)
    heapWarn = `heap ${warmup.mb}MB → ${end.mb}MB su ${cycles} cicli (possibile leak — verifica manuale)`;

  console.log(`\n=== STRESS / LEAK === ${cycles} cicli · ${resolves} resolve · ${total} Situations`);
  if (heap.length) console.log(`heap: ${heap.map(h => h.mb).join(' → ')} MB`);
  if (heapWarn) console.log('  ⚠️  ' + heapWarn);
  if (errors.length) { console.log(`  ❌ ${errors.length} errori:`); errors.slice(0, 8).forEach(e => console.log('     ' + e.slice(0, 140))); }
  const ok = errors.length === 0 && cycles === N;
  console.log(ok ? `✅ PASS — ${N} HL consecutivi senza crash${heapWarn ? ' (con warning heap)' : ''}` : '❌ FAIL');
  process.exit(ok ? 0 : 1);
})();
