/* Repro mirato gi=40 (dribbling→gol): forza la situation, risolve, campiona la palla nel tempo.
   Se la palla raggiunge gx≥45 entro pochi secondi → era solo la finestra di campionamento. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await page.evaluate(() => window.__CPM_FORCE_SIT(40, true));
await sleep(700);
const out = await page.evaluate(async () => {
  window.__CPM_RESOLVE(0);
  const samples = [];
  const t0 = performance.now();
  for (let i = 0; i < 40; i++) {
    await new Promise(res => setTimeout(res, 200));
    const st = window.__CPM_STATE && window.__CPM_STATE();
    const oc = window.__CPM_OUTCOME;
    if (st && st.ok) samples.push({ t: Math.round(performance.now() - t0), bx: st.ball.x, out: oc ? oc.outKey : null });
    if (st && st.ok && st.ball.x >= 45 && i > 3) break;
  }
  return { samples };
});
await browser.close(); srv.close();
out.samples.forEach(s => console.log(`  t=${String(s.t).padStart(5)}ms · palla gx=${s.bx} · outKey=${s.out}`));
const last = out.samples[out.samples.length - 1];
const reached = out.samples.some(s => s.bx >= 45);
console.log(reached ? `\n✅ la palla raggiunge gx≥45 (ultimo gx=${last.bx}) — solo timing di campionamento` : `\n❌ la palla NON arriva (ultimo gx=${last && last.bx}) — regressione logica`);
