#!/usr/bin/env node
/* [7.999.108 GUARDIANO PO-187 — decisione PO 02/10 «etichette vere»] Rilievo Codex gi18: «Dribbling netto» mostrato come passaggio.
   Il tipo di scena 3D nasce dall'esito (deriveHL): un'azione con etichetta da dribbling/finta la cui scena e' un TIRO, un PASSAGGIO o un
   CROSS deve dichiarare quel gesto nell'etichetta (tiro/segn/assist/cross/passaggio/appoggi/servi/…). Censisce tutte le SITUATIONS.
   Prova del rosso: sul sorgente 7.999.107 (git show HEAD~:src/04…) le incoerenti erano 13 → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage(); await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => typeof SITUATIONS !== 'undefined' && typeof deriveHL === 'function', { timeout: 60000 }); await sleep(300);
const r = await page.evaluate(() => {
  const DRIB = /dribbl|sterzat|tunnel|finta|roulette|ruleta|veronica|doppio passo|elastico|serpentina|slalom|spunto|scatto/i;
  const DICE = { shot: /tir[oai]|segn|conclu|gol|rete|pallonett|cucchiaio|piatto|mancino|destro|interno|esterno|potenza|giro/i, pass: /assist|passaggi|appoggi|serv[ei]|scarico|filtrant|imbucat|uno-due|dai e vai|smarcat|compagno|sponda/i, cross: /cross|traversone|metti in mezzo|al centro/i };
  const bad = []; let n = 0;
  SITUATIONS.forEach((s, gi) => (s.actions || []).forEach((a, i) => { const l = a.label || ''; if (!DRIB.test(l)) return; let hl = null; try { hl = deriveHL(s, a); } catch (e) {} const t = hl && (hl.hlType || hl.type);
    if (!DICE[t]) return; n++; if (!DICE[t].test(l)) bad.push(`gi${gi}#${i} «${l}» → scena ${t}`); }));
  return { n, bad };
});
await b.close(); srv.close();
console.log(`azioni da dribbling con gesto finale tiro/passaggio/cross: ${r.n} · etichette che non lo dichiarano: ${r.bad.length}`);
r.bad.forEach(x => console.log('  ' + x));
console.log(r.bad.length === 0 ? '✅ PASS etichette-108' : '❌ FAIL etichette-108'); process.exit(r.bad.length === 0 ? 0 : 1);
