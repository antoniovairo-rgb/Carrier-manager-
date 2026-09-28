#!/usr/bin/env node
/* [7.999.45 sonda — taccuino PO SIT #56 «Lancio lungo millimetrico! Scatta in profondita'», azione «Rimanda al mittente», esito
   intercetto: «codice 012 — verticalizzazione all'indietro». Decisione PO 28/09: il ritorno al compagno non va MAI indietro]
   Pagina nuova per giro: forza la scena, sceglie l'azione per nome, esito CPM_ESITO. Registra lo scrittore del pallone per
   fotogramma (__CPM_WS38) e la direzione del passaggio (__CPM_PASS475). Stampa l'arretramento massimo del pallone dal suo punto
   piu' avanzato (la misura del codice 012: >= 12 u), con lo scrittore che lo produce. CPM_GI (56) · CPM_AZ · CPM_ESITI · CPM_GIRI. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = +(process.env.CPM_GI || 56), AZ = process.env.CPM_AZ || 'Rimanda al mittente', ESITI = (process.env.CPM_ESITI || 'fail,success').split(','), GIRI = +(process.env.CPM_GIRI || 2);
const GLB = process.env.CPM_GLB === '1';
const WS = ["—","scena","arco","inseguitore","portatore","addosso","palo","respinta","ricevente-cross","ricevente-pass","consegna","buildup-aereo","buildup-fine","buildup-volo","testa","avvicinamento","esito"];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let rossi = 0, tot = 0;
for (const es of ESITI) for (let g = 0; g < GIRI; g++) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(gl => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (!gl) window.__CPM_GLB = false; }, GLB);
  if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
  await openMatch(page, port, { skipLoadAll: true, name: 'Ritorno45' }); await sleep(900);
  if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, GI);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(600);
  const ai = await page.evaluate(([g, l, e]) => { const a = (window.__CPM_SITS[g].actions || []); const i = a.findIndex(x => String(x.label || '').indexOf(l) >= 0); window.__CPM_WS38 = []; window.__CPM_WS38_REC = 1; window.__CPM_PASS475 = []; window.__CPM_WS38_T0 = performance.now(); window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(i < 0 ? 0 : i); return i; }, [GI, AZ, es]);
  const tS = Date.now(); while (Date.now() - tS < 12000) { const ph = await page.evaluate(() => window.__CPM_PHASE()).catch(() => null); if (ph && !/^hl/.test(ph)) break; await sleep(250); }
  const W = await page.evaluate(() => ({ ws: (window.__CPM_WS38 || []).filter(w => w[0] >= window.__CPM_WS38_T0), pass: window.__CPM_PASS475 || [] }));
  await page.close();
  let xMax = -1e9, back = 0, at = null;
  for (const w of W.ws) { if (w[2] > xMax) xMax = w[2]; if (xMax - w[2] > back) { back = xMax - w[2]; at = w; } }
  tot++; if (back >= 12) rossi++;
  console.log(`${es} giro ${g + 1}: azione ${ai} · passaggio ${JSON.stringify(W.pass.slice(-1)[0] || null)} · arretramento massimo ${back.toFixed(1)} u${at ? ` (scrittore ${WS[at[1]] || at[1]}, a x ${at[2].toFixed(1)}, ${((at[0] - W.ws[0][0]) / 1000).toFixed(2)} s)` : ''} · fotogrammi ${W.ws.length}`);
}
await b.close(); srv.close();
console.log(`\ngiri ${tot} · con arretramento >= 12 u (codice 012) ${rossi}`);
