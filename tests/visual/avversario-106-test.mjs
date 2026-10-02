#!/usr/bin/env node
/* [7.999.106 GUARDIANO — l'avversario della giornata si cerca nel calendario] Prova diretta di avversarioDiGiornata (src/09), usata da
   partita dal vivo, Simula, avanzamento settimana e gare extra. Caso: avversario del calendario FUORI dalla lega ricalcolata.
   Atteso: il club giusto dall'archivio CLUBS (non null, non un sorteggio). Controlli: avversario dentro la lega → quello della lega;
   club inesistente → null. Nota: al CARICAMENTO una migrazione riallinea gia' gli avversari estranei del calendario alla lega, quindi lo
   stato vive solo a meta' sessione — per questo la prova e' sulla funzione e non su un salvataggio. CPM_RED=1 → __CPM_NO_AVV106: torna
   null sull'estraneo (vecchio comportamento: settimana senza simulazione / sorteggio) → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 414, height: 896 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_AVV106 = 1; }, RED);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => typeof avversarioDiGiornata === 'function', { timeout: 40000 }); await sleep(500);
const r = await page.evaluate(() => {
  const lc = CLUBS.filter(c => c.lg === 'Premier Division' && !c.isU18).slice(0, 18);
  const est = CLUBS.find(c => !c.isU18 && c.lg && c.lg !== 'Premier Division');
  const a = avversarioDiGiornata(lc, { opponentId: est.id, opponentName: est.n }, null);
  const b = avversarioDiGiornata(lc, { opponentId: lc[3].id, opponentName: lc[3].n }, null);
  const c = avversarioDiGiornata(lc, { opponentId: 'zzz-inesistente', opponentName: 'Nessuno FC' }, null);
  return { atteso: est.n, estraneo: a && a.n, dentro: b && b.n, dentroAtteso: lc[3].n, inesistente: c };
});
await browser.close(); srv.close();
console.log(`estraneo: atteso ${r.atteso} → ${r.estraneo} · dentro la lega: ${r.dentro} (atteso ${r.dentroAtteso}) · inesistente: ${JSON.stringify(r.inesistente)}`);
const okE = r.estraneo === r.atteso, okC = r.dentro === r.dentroAtteso && r.inesistente === null;
if (RED) { const x = !okE && okC; console.log(x ? '✅ ROSSO come atteso: l\'estraneo non si trova' : '❌ il rosso non riproduce'); process.exit(x ? 0 : 1); }
console.log(okE && okC ? '✅ PASS avversario-106' : '❌ FAIL avversario-106'); process.exit(okE && okC ? 0 : 1);
