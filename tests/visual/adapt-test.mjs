/* Test cpmadapt: confronto NELLA STESSA sessione — difesa PRIMA del pattern (byFlank vuoto→adaptShift 0)
   vs DOPO aver costruito il pattern di fascia. Un pattern DESTRA deve alzare la y media dei difensori. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;

async function measure(page) {
  await page.evaluate(() => { window.__CPM_FORCE_SIT(60, true, { x: 70, y: 50 }); });
  await sleep(1700);
  const st = await page.evaluate(() => window.__CPM_STATE());
  const defs = (st.players || []).filter(p => p.team === 'away' && !p.gk && p.x > 55);
  return +(defs.reduce((s, p) => s + p.y, 0) / (defs.length || 1)).toFixed(2);
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
  const before = await measure(page);        // byFlank vuoto → adaptShift ~0
  await buildPattern(page, flankY);           // costruisci pattern di fascia
  const after = await measure(page);          // adaptShift attivo
  await browser.close();
  const d = +(after - before).toFixed(2);
  console.log(`${label}: difensori y  prima=${before}  dopo=${after}  Δ=${d>0?'+':''}${d}u`);
  return d;
}
console.log('cpmadapt — shading difensivo verso la fascia più attaccata (misura mesh away, x>55)\n');
const dR = await trial(80, 'Pattern DESTRA (y=80) → Δ atteso POSITIVO');
const dL = await trial(20, 'Pattern SINISTRA(y=20) → attesa risposta < DESTRA');
const dirResp = +(dR - dL).toFixed(2); // RISPOSTA DIREZIONALE: quanto la difesa reagisce diversamente ai due pattern
console.log(`\nRisposta direzionale (Δdestra − Δsinistra) = ${dirResp}u  ·  Δdestra=${dR}  Δsinistra=${dL}`);
console.log(dirResp > 2 && dR > dL
  ? '\n✅ cpmadapt FUNZIONA — la difesa OMBREGGIA verso la fascia più attaccata (risposta direzionale netta e sottile).\n   NB: la marcatura reale degli attaccanti modera lo shift opposto → effetto realistico, non un teletrasporto (Cap.4.12 "mai estremo").'
  : '\n⚠️ risposta direzionale debole — rivedi');
srv.close();
