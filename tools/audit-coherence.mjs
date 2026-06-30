/* Verifica COERENZA contesto↔azioni su tutte le SITUATIONS (item: niente giocate aeree con palla non aerea, ecc.).
   Carica il gioco, legge window.__CPM_SITS + hlBallState + filterSitActions, e segnala ogni incoerenza residua. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../tests/visual/lib/harness.mjs';

const srv = await startServer();
const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await installCdnRoutes(page);
let exitCode = 1;
try {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => Array.isArray(window.__CPM_SITS) && typeof window.hlBallState === 'function', { timeout: 40000 });
  await sleep(300);
  const res = await page.evaluate(() => {
    const SITS = window.__CPM_SITS, bs = window.hlBallState, filt = window.filterSitActions;
    // giocata aerea DELL'EROE (allineata a _isAerialLbl del gioco): esclude i cross/assist per la testa di un COMPAGNO
    const aerialRx = l => (/\btesta\b|incornat|colpo di testa|\bstacco\b|rovesciat|sforbiciat|di petto/i.test(l)) && !/compagn|cross|traversone|crossa|assist|servi|pennell/i.test(l);
    const out = { total: SITS.length, aerialOnGround: [], filteredEmpty: [], stillAerialAfterFilter: [] };
    SITS.forEach((s, gi) => {
      const state = bs(s);
      const acts = s.actions || [];
      const aerialActs = acts.filter(a => aerialRx(a.label || ''));
      // 1) palla NON aerea ma azioni aeree presenti nei DATI (prima del filtro)
      if (state !== 'aerial' && aerialActs.length) out.aerialOnGround.push({ gi, state, n: aerialActs.length, ex: aerialActs.map(a => a.label).slice(0, 3) });
      // 2) dopo il filtro runtime: quante azioni restano + restano azioni aeree incoerenti?
      if (typeof filt === 'function') {
        const px = (s.startZone && s.startZone.x) ? (s.startZone.x[0] + s.startZone.x[1]) / 2 : 60;
        const f = filt(acts, px, s) || [];
        if (f.length < 2) out.filteredEmpty.push({ gi, left: f.length });
        if (state !== 'aerial' && f.some(a => aerialRx(a.label || ''))) out.stillAerialAfterFilter.push({ gi, ex: f.filter(a => aerialRx(a.label || '')).map(a => a.label) });
      }
    });
    return out;
  });
  console.log('=== VERIFICA COERENZA CONTESTO↔AZIONI ===');
  console.log(`Situations: ${res.total}`);
  console.log(`• Dati con azioni AEREE su palla NON aerea (gestite a runtime dal filtro): ${res.aerialOnGround.length}`);
  res.aerialOnGround.slice(0, 12).forEach(h => console.log(`   - gi${h.gi} [${h.state}] ${h.n}× ${JSON.stringify(h.ex)}`));
  console.log(`• Situations con <2 azioni dopo il filtro (UI rotta): ${res.filteredEmpty.length} ${JSON.stringify(res.filteredEmpty.slice(0,8))}`);
  console.log(`• AZIONI AEREE ANCORA proposte su palla non aerea DOPO il filtro (INCOERENZA da correggere): ${res.stillAerialAfterFilter.length}`);
  res.stillAerialAfterFilter.slice(0, 12).forEach(h => console.log(`   ❌ gi${h.gi} ${JSON.stringify(h.ex)}`));
  // PASS se: nessuna azione aerea sopravvive al filtro su palla non aerea, e nessuna UI svuotata.
  const ok = res.stillAerialAfterFilter.length === 0 && res.filteredEmpty.length === 0;
  console.log(ok ? '\n✅ COERENTE — il filtro elimina ogni giocata aerea incoerente e ogni situazione mantiene ≥2 azioni.' : '\n❌ Incoerenze residue da correggere.');
  exitCode = ok ? 0 : 2;
} catch (e) {
  console.error('FATAL:', e && e.message); exitCode = 1;
} finally {
  await browser.close(); srv.close();
}
process.exit(exitCode);
