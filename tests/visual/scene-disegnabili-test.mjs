#!/usr/bin/env node
/* [7.999.97 GUARDIANO PO-086 «nessuna scena deve promettere un gesto che il 3D non mostra»] Sul gioco caricato:
   1) nessuna scheda NON sospesa ha nel testo un gesto senza clip; 2) le opzioni mostrate (filterSitActions, in area) non
   contengono azioni non disegnabili salvo il ripiego dichiarato (meno di due disegnabili); 3) la pesca
   (selectContextualSituations, 400 semi, punteggi e minuti diversi) non restituisce mai una scheda sospesa;
   4) RIATTIVAZIONE: collegando a runtime i gesti mancanti (window.__CPM_GESTI_COLLEGATI) non resta nessuna scheda sospesa.
   CPM_RED=1 → __CPM_NO_RICHIEDE → nessuna sospensione → il punto 1 deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_RICHIEDE = 1; }, RED);
await openMatch(page, port, { skipLoadAll: true, name: 'Disegnabili' }); await sleep(1000);
const R = await page.evaluate(() => {
  const S = SITUATIONS, out = { schede: S.length, sospese: [], promesseAttive: [], opzioniND: [], ripieghi: [], pescaSospese: 0, pescate: 0, azioniNascoste: 0 };
  const manca = k => !gestoCollegato(k);
  S.forEach((s, gi) => {
    const sosp = sitSospesa(s); if (sosp) out.sospese.push(gi);
    if (!sosp && (s.richiede || []).some(manca)) out.promesseAttive.push(gi);
    if (sosp) return;
    const opz = filterSitActions(s.actions || [], 80, s) || [];
    const nd = opz.filter(a => !azioneDisegnabile(a));
    const tutteND = (s.actions || []).filter(a => !azioneDisegnabile(a)).length;
    out.azioniNascoste += tutteND - nd.length;
    if (nd.length) { if ((s.actions || []).filter(azioneDisegnabile).length < 2) out.ripieghi.push(gi); else out.opzioniND.push(gi); }
  });
  const pl = { stats: { tiro: 70, fisico: 70, passaggio: 70, 'velocità': 70 }, ovr: 72, history: [], club: { id: 'x' } };
  const ctx = ['drawing', 'losing', 'winning'];
  for (let i = 0; i < 400; i++) { const sel = selectContextualSituations([...S], 6, pl, (i * 2654435761) >>> 0, { scoreCtx: ctx[i % 3], clock: (i * 7) % 90, momentum: 30 + (i % 40), possession: 40 + (i % 20) }) || [];
    for (const s of sel) { out.pescate++; if (sitSospesa(s)) out.pescaSospese++; } }
  const tutte = {}; S.forEach(s => { (s.richiede || []).forEach(k => tutte[k] = 1); (s.actions || []).forEach(a => (a.richiede || []).forEach(k => tutte[k] = 1)); });
  window.__CPM_GESTI_COLLEGATI = tutte; out.dopoRiattivazione = S.filter(s => sitSospesa(s)).length; out.gestiMancanti = Object.keys(tutte); window.__CPM_GESTI_COLLEGATI = null;
  return out; });
await b.close(); srv.close();
console.log(JSON.stringify(R));
const ok = R.promesseAttive.length === 0 && R.opzioniND.length === 0 && R.pescaSospese === 0 && R.dopoRiattivazione === 0 && R.sospese.length > 0 && R.pescate > 0;
console.log(`schede sospese ${R.sospese.length} (${R.sospese.join(',')}) · azioni nascoste ${R.azioniNascoste} · ripieghi ${R.ripieghi.length} · pesca ${R.pescate} schede, sospese pescate ${R.pescaSospese} · dopo riattivazione ${R.dopoRiattivazione} · gesti mancanti: ${R.gestiMancanti.join(', ')}`);
if (RED) { const r = R.promesseAttive.length > 0; console.log(r ? '✅ ROSSO come atteso: schede attive che promettono gesti senza clip' : '❌ il rosso non riproduce'); process.exit(r ? 0 : 1); }
console.log(ok ? '✅ PASS scene-disegnabili' : '❌ FAIL scene-disegnabili'); process.exit(ok ? 0 : 1);
