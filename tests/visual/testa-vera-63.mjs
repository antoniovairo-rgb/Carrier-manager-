#!/usr/bin/env node
/* [7.999.64 guardiano — taccuino PO #7 «il colpo di testa non e' sincronizzato con la velocita' del cross» (000)] Sul flusso VERO
   (cross deciso dal motore, 7.999.26) la conclusione aveva ancora 0,24 s di caricamento: il pallone arrivato alla testa scendeva
   alle ginocchia e il colpo partiva da li'. Le prove forzate non lo vedevano (costruzione diversa): qui si gioca una partita vera in
   autoplay (GLB-ON) e si legge il testimone __CPM_TESTA33 scena per scena.
   VERDE → in ogni colpo di testa il pallone passa a meno di 0,45u dalla testa; ROSSO (__CPM_NO_TESTA63+63B) → almeno una scena oltre 0,5u.
   Le scene di testa variano fra i giri: se un braccio non ne produce, il guardiano lo DICHIARA e fallisce (mai verde a vuoto).
   Uso: node testa-vera-63.mjs   ·   CPM_ROSSO=1 per il solo braccio rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const out = [];
  for (const seed of [7101, 7303]) {
    const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TESTA33_REC = 1; window.__CPM_GLB = true; if (r) { window.__CPM_NO_TESTA63 = 1; window.__CPM_NO_TESTA63B = 1; } try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, rosso);
    await openMatch(page, port, { skipLoadAll: true, name: 'TV' + seed });
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
    let prev = null; const t0 = Date.now();
    while (Date.now() - t0 < 130000) {
      await sleep(400);
      const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (prev === 'hl_result' && ph !== 'hl_result') {
        const W = await page.evaluate(() => { const w = window.__CPM_TESTA33; window.__CPM_TESTA33 = null; const y = window.__CPM_Y063 || []; window.__CPM_Y063 = []; return w ? { n: w.f.length, y } : null; });
        if (W && W.n > 15 && W.y.length) out.push(W.y[W.y.length - 1]);
      }
      prev = ph; if (ph === 'ended' || ph === 'ceremony') break;
    }
    await page.close();
  }
  return out;
}
const med = a => { const q = a.slice().sort((x, y) => x - y); return q[Math.floor(q.length / 2)]; };
let ok = true;
if (!process.env.CPM_ROSSO) {
  const v = await braccio(false); console.log(`VERDE: ${v.length} colpi di testa · quota del pallone all'impatto ${JSON.stringify(v)} · mediana ${v.length ? med(v) : '-'}`);
  if (!v.length || Math.min(...v) < 1.3) { ok = false; console.log('✗ verde fallito (o nessuna scena di testa)'); }
}
const r = await braccio(true); console.log(`ROSSO (__CPM_NO_TESTA63+63B): ${r.length} colpi di testa · quota del pallone all'impatto ${JSON.stringify(r)} · mediana ${r.length ? med(r) : '-'}`);
if (!r.length || !(Math.min(...r) < 1.0)) { ok = false; console.log('✗ il rosso non mostra il difetto (o nessuna scena): il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ testa-vera-63 verde (e il rosso si vede)' : '❌ testa-vera-63 ROSSO'); process.exit(ok ? 0 : 1);
