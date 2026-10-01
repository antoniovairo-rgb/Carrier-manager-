#!/usr/bin/env node
/* [7.999.100 GUARDIANO rilievo Codex 27-B] Esaurito il catalogo dei piazzati, la scena resta un piazzato. Il caso di Codex (seme 974734,
   4 punizioni contro 3 schede) dipende dalla sequenza della partita e non si forza in modo affidabile (tetto di 4 piazzati a partita,
   le punizioni nate dal gioco lo consumano): si interroga la funzione che il gioco usa, schedePiazzato(rigore, usate), con il catalogo
   gia' tutto giocato e con una sola scheda libera. Verde: catalogo esaurito → si ripete una scheda dello stesso tipo; una libera → e'
   quella. CPM_RED=1 → __CPM_NO_PIAZ99: catalogo esaurito → nessuna candidata → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const b = await launchBrowser(); const page = await b.newPage(); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_PIAZ99 = 1; }, RED);
await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Catalogo99' }); await sleep(500);
const R = await page.evaluate(() => { const out = {};
  for (const rig of [true, false]) { const tipo = rig ? 'rigore' : 'punizione', ok = s => rig ? isPenaltySit(s) : deriveIntent(s) === 'freekick';
    const tutte = schedePiazzato(rig, []); const testi = tutte.map(s => s.text);
    const esaurito = schedePiazzato(rig, testi); const unaLibera = schedePiazzato(rig, testi.slice(1));
    out[tipo] = { catalogo: tutte.length, esaurito: esaurito.length, esauritoTuttiDelTipo: esaurito.every(ok), unaLibera: unaLibera.map(s => s.text), attesa: testi[0] }; }
  return out; });
await b.close(); srv.close();
for (const [k, v] of Object.entries(R)) console.log(`${k}: catalogo ${v.catalogo} · catalogo esaurito → ${v.esaurito} candidate (tutte ${k}: ${v.esauritoTuttiDelTipo}) · una libera → ${v.unaLibera.length === 1 && v.unaLibera[0] === v.attesa ? 'quella giusta' : JSON.stringify(v.unaLibera)}`);
const vuoti = Object.values(R).filter(v => v.esaurito === 0).length;
if (RED) { const ok = vuoti > 0; console.log(ok ? `✅ ROSSO come atteso: catalogo esaurito senza candidate (${vuoti} tipi)` : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const ok = Object.values(R).every(v => v.catalogo > 0 && v.esaurito === v.catalogo && v.esauritoTuttiDelTipo && v.unaLibera.length === 1 && v.unaLibera[0] === v.attesa);
console.log(ok ? '✅ PASS piazzati-catalogo' : '❌ FAIL piazzati-catalogo'); process.exit(ok ? 0 : 1);
