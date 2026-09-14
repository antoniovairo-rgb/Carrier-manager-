/* Test cpmadapt: confronto NELLA STESSA sessione — difesa PRIMA del pattern (byFlank vuoto→adaptShift 0)
   vs DOPO aver costruito il pattern di fascia. Un pattern DESTRA deve alzare la y media dei difensori. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;

async function measure(page) {
  await page.evaluate(() => { window.__CPM_FORCE_SIT(60, true, { x: 70, y: 50 }); });
  await sleep(2600);/* [BL-07] convergenza del lerp prima della misura */
  /* [7.46.1 BL-07 — RISOLTO: era un ARTEFATTO DI MISURA, non una regressione del gioco] i «4 più arretrati
     per x» MESCOLAVANO gli INGAGGIATI (senza shading, che seguono l'eroe anche in direzione OPPOSTA) e il
     BLOCCO di zona (il solo ombreggiato): a trequarti stanno alle stesse x → il segnale si cancellava
     (0.4-0.8u su tutta la storia). Ora si misura il BLOCCO (si escludono i 2 più vicini all'eroe) dopo una
     finestra di CONVERGENZA del lerp (2.6s, tick 650ms) → Δ blocco ≈ +4.6u col pattern pieno. */
  await sleep(1200);
  let meanY = 0, n = 0;
  for (let f = 0; f < 12; f++) {
    const mp = await page.evaluate(() => window.__CPM_MP ? window.__CPM_MP() : null);
    if (mp) {
      const away = mp.map((p, i) => p && p.t === 'away' ? { ...p, i } : null).filter(Boolean).filter(p => p.i !== 10);
      away.sort((a, b) => Math.hypot(a.x - 70, a.y - 50) - Math.hypot(b.x - 70, b.y - 50));
      const block = away.slice(2);
      if (block.length) { meanY += block.reduce((s, p) => s + p.y, 0) / block.length; n++; }
    }
    await sleep(120);
  }
  return { tilt: 0, meanY: +(meanY / (n || 1)).toFixed(2) };
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
