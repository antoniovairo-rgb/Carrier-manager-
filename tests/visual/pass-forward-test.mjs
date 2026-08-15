#!/usr/bin/env node
/* GUARDIANO — «IL FILTRANTE IN AVANTI E NON ALL'INDIETRO» (nota PO #187).

   Un passaggio in profondita' che parte all'indietro non e' un passaggio in profondita'. Il ciclo che
   sceglie il ricevente il filtro di direzione ce l'ha da sempre (`_fwd2>-3`); la RETE DI RISERVA — nata
   nel 7.464 per non mirare al vuoto e allargata ai passaggi FALLITI nel 7.470 — prendeva l'uomo PIU'
   VICINO e basta, e su una palla filtrante l'uomo piu' vicino e' spesso quello alle spalle.

   COSA MISURA. Testimone `__CPM_PASS475`, scritto sulla riga stessa che fissa il bersaglio dell'arco:
   origine della palla, bersaglio, e se un uomo e' stato trovato. Su ogni situation di passaggio, sia
   con esito RIUSCITO sia FALLITO (e' il fallito il ramo che il PO ha fotografato), il bersaglio deve
   stare AVANTI rispetto all'origine.

   ⚠️ E VA DETTO SUBITO: QUESTO GUARDIANO NON PROVA LA NOTA #187. Con `CPM_NO475=1` — cioe' senza il
   filtro di direzione — su dieci scene campionate NESSUN passaggio parte all'indietro: la rete di
   riserva, sulle scene raggiungibili da qui, non entra quasi mai in funzione perche' il ciclo
   principale un uomo in avanti lo trova. Il filtro resta perche' e' corretto per lettura (una rete di
   riserva che contraddice la regola del ciclo che sostituisce non e' una riserva, e' un secondo
   comportamento), ma la causa della nota del PO NON e' dimostrata e la nota resta aperta.
   Il valore di questo strumento e' l'INVARIANTE che fissa: da qui in avanti, nessun passaggio parte
   all'indietro, e se qualcuno lo rimette in gioco il guardiano lo dice.

   PROVA DEL ROSSO: `CPM_NO475=1` toglie il filtro di direzione dalla rete di riserva — verde anche
   cosi', vedi sopra.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node pass-forward-test.mjs [--verbose]                 */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
/* ⚠️ LE SCENE NON SI INDOVINANO, SI CHIEDONO AL GIOCO. La prima stesura elencava a mano dodici
   situations «di passaggio» e ne misurava DUE su ventiquattro tentativi: uno strumento cieco al 92%,
   che sarebbe stato verde per inerzia. L'intento lo decide `deriveHL(situation, azione)`, ed e'
   raggiungibile dalla pagina: qui si chiede al gioco quali situations danno `hlType==='pass'`
   sull'AZIONE 0 — che e' quella che la sonda risolve — e si campiona fra quelle. */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(n => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_CINE = 1; if (n) window.__CPM_NO475 = 1; }, process.env.CPM_NO475 ? 1 : 0);
await openMatch(page, port); await sleep(800);
const SCENE = process.env.CPM_SIT ? process.env.CPM_SIT.split(',').map(Number)
  : (await page.evaluate(() => { const o = []; for (let i = 0; i < SITUATIONS.length; i++) { try { const h = deriveHL(SITUATIONS[i], (SITUATIONS[i].actions || [])[0]); if (h && h.type === 'pass') o.push(i); } catch (e) {} } return o; }))
      .filter((_, i) => i % 3 === 0).slice(0, +(process.env.CPM_N || 22));
console.log(`scene a intento PASSAGGIO sull'azione 0: ${SCENE.length} campionate — ${SCENE.join(',')}`);

const righe = []; let forzFallite = 0, risolte = 0, vuote = 0;
for (const gi of SCENE) {
  for (const modo of ['ok', 'fail']) {
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
    if (!ok) { forzFallite++; continue; }
    await sleep(350);
    await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_PASS475 = []; });
    await page.evaluate(m => { window.__CPM_FORCE_OUTCOME = m; }, modo);
    try { await page.evaluate(() => window.__CPM_RESOLVE(0)); risolte++; } catch (e) { continue; }
    /* ⚠️ 900ms non bastano: la conclusione parte DOPO la finestra d'esito, e una sonda che dorme meno
       della catena che vuole misurare misura il proprio cronometro (lezione 7.460). */
    await sleep(2600);
    const W = await page.evaluate(() => (window.__CPM_PASS475 || []).slice());
    if (!W.length) vuote++;
    for (const w of W) righe.push({ gi, modo, ...w });
  }
}
await b.close(); srv.close();

console.log(`diagnostica: forzature fallite ${forzFallite} · risolte ${risolte} · risolte senza arco di passaggio ${vuote}`);
if (!righe.length) { console.log('❌ nessun passaggio osservato: il guardiano e\' cieco, non verde'); process.exit(2); }
const indietro = righe.filter(r => r.d <= 0);
const senzaUomo = righe.filter(r => !r.uomo);
console.log(`\n=== ${righe.length} passaggi misurati su ${SCENE.length} scene (riusciti + falliti) ===`);
if (VERB) for (const r of righe) console.log(`  gi${r.gi} ${r.modo.padEnd(4)} · origine x=${r.ox} → bersaglio x=${r.tx} (${r.d > 0 ? '+' : ''}${r.d}) · uomo=${r.uomo}`);
console.log(`giocati all'INDIETRO: ${indietro.length}/${righe.length} · senza un uomo a cui mirare: ${senzaUomo.length}/${righe.length}`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (indietro.length) {
  console.log(`\n❌ FAIL — ${indietro.length} passaggi partono all'indietro:`);
  for (const r of indietro.slice(0, 10)) console.log(`  · gi${r.gi} ${r.modo}: da x=${r.ox} a x=${r.tx} (${r.d})`);
  process.exit(1);
}
console.log('\n✅ PASS — ogni passaggio va in avanti, riuscito o intercettato che sia');
