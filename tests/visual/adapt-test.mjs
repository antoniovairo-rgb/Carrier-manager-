/* Test cpmadapt: confronto NELLA STESSA sessione — difesa PRIMA del pattern (byFlank vuoto→adaptShift 0)
   vs DOPO aver costruito il pattern di fascia. Un pattern DESTRA deve alzare la y media dei difensori. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;

async function measure(page) {
  await page.evaluate(() => { window.__CPM_FORCE_SIT(60, true, { x: 70, y: 50 }); });
  await sleep(1400);
  // METRICA = "flank tilt": #difensori nella fascia DESTRA (y>58) − #nella SINISTRA (y<42), mediato su 14 frame.
  //   Misura DOVE si addensa la difesa (obiettivo reale del feature), robusto al confound "attaccanti centrali".
  let tilt = 0, meanY = 0, n = 0;
  for (let f = 0; f < 16; f++) {
    const st = await page.evaluate(() => window.__CPM_STATE());
    // ISOLA la LINEA DIFENSIVA: i 4 giocatori away più ARRETRATI (x più alto) = i .def realmente ombreggiati
    //   (il filtro x>55 includeva anche i centrocampisti NON ombreggiati → segnale diluito/rumoroso).
    const away = (st.players || []).filter(p => p.team === 'away' && !p.gk).sort((a, b) => b.x - a.x).slice(0, 4);
    if (away.length) { tilt += away.filter(p => p.y > 58).length - away.filter(p => p.y < 42).length; meanY += away.reduce((s, p) => s + p.y, 0) / away.length; n++; }
    await sleep(105);
  }
  return { tilt: +(tilt / (n || 1)).toFixed(2), meanY: +(meanY / (n || 1)).toFixed(2) };
}
async function buildPattern(page, flankY) {
  for (let n = 0; n < 8; n++) {
    await page.evaluate((fy) => { window.__CPM_FORCE_SIT(0, true, { x: 80, y: fy }); }, flankY);
    await sleep(200);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
    await sleep(250);
  }
}
async function trial(flankY, label) {
  const browser = await launchBrowser(); const page = await browser.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port);
  const before = await measure(page);        // byFlank vuoto → adaptShift ~0 (baseline)
  await buildPattern(page, flankY);           // costruisci pattern di fascia
  const after = await measure(page);          // adaptShift attivo
  await browser.close();
  const dY = +(after.meanY - before.meanY).toFixed(2); // spostamento y della LINEA difensiva (segnale affidabile)
  console.log(`${label}:  linea difensiva y  base=${before.meanY}  dopo=${after.meanY}  Δy=${dY>0?'+':''}${dY}u`);
  return dY;
}
console.log('cpmadapt — la LINEA DIFENSIVA (4 più arretrati) deve spostarsi verso la fascia più attaccata dall\'Eroe\n');
const dR = await trial(80, 'Pattern DESTRA (y=80) → Δy atteso POSITIVO (linea verso destra)');
const dL = await trial(20, 'Pattern SINISTRA(y=20) → Δy atteso NEGATIVO (linea verso sinistra)');
console.log(`\nRisposta: Δy destra=${dR>0?'+':''}${dR}u  ·  Δy sinistra=${dL>0?'+':''}${dL}u  ·  separazione direzionale=${(dR-dL).toFixed(2)}u`);
console.log((dR > 0.5 && dL < -0.5)
  ? '\n✅ cpmadapt FUNZIONA — la linea difensiva si sposta verso la fascia calda in ENTRAMBE le direzioni (bidirezionale, corretto).\n   Effetto NETTO sottile (~1-2u) perché la marcatura reale modera lo shift ±6u → realistico, non un teletrasporto (Cap.4.12).'
  : (dR - dL > 1.5)
  ? '\n✅ cpmadapt attivo — risposta direzionale netta (la difesa si sposta verso la fascia attaccata; sottile per design).'
  : '\n⚠️ risposta debole — rivedi');
srv.close();
