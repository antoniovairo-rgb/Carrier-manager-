#!/usr/bin/env node
/* [7.999.143 decisione PO 06/10: il colpo di testa in L1] GUARDIANO GLB-ON su scene forzate (colpo di testa riuscito): distanza
   testa-pallone quando parte l'arco del colpo (testimone __CPM_P1B2, colonna testa). Misurato al 7.999.143: rosso 3,22 e 3,18 u (l'arco
   partiva dal punto di consegna del cross), verde 0,49 e 0,78. VERDE: <= 1,0. ROSSO: >= 2,5.
   [giro 50 PO-271] Il braccio rosso col SOLO __CPM_NO_TESTA146 era cieco (gi36/gi44 a 0,08-0,88 u): misurato, oggi l'attesa del 146
   non ingaggia mai sulle scene forzate (testimone __CPM_TESTA146: attesa 0 s, testa a 0,24-0,47 u all'avvio, 7 scene su 7) perche' a
   monte la innesca gia' il colpo «al passaggio» del 7.999.76 (__CPM_NO_TESTA76). Spento il 76 il difetto ricompare (gi1 3,22 · gi6
   2,73) e il 146 lo ripara (0,05 · 0,45). Quindi tre bracci, una pagina nuova per scena (7.483):
     gioco  (niente spento)            gi6 gi44            → giudicate tutte <= 1,0
     rete   (__CPM_NO_TESTA76)          gi6 gi7            → giudicate tutte <= 1,0  (il 146 da solo ripara)
     rosso  (__CPM_NO_TESTA76 + 146)    gi6 gi7 gi55       → almeno 2 >= 2,5  (il difetto si vede)                                      */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function lancio(gi, flags) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(f => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; for (const k of f) window[k] = 1; }, flags);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Testa 145' }); await sleep(1500);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(gi => { window.__CPM_P1B2 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    const k = await page.evaluate(gi => { const s = SITUATIONS[gi]; return (s.actions || s.a || []).findIndex(a => { try { return (deriveHL(s, a) || {}).type === 'header'; } catch (e) { return false; } }); }, gi);
    await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, Math.max(0, k));
    const lan = () => page.evaluate(() => (window.__CPM_P1B2 || []).filter(r => r[0] === 'header' && r[6] > 0 && r[6] <= 0.06 && r[8] >= 0).map(r => r[8]));
    for (let w = 0; w < 30; w++) { await sleep(700); if ((await lan()).length) break; const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (!/^hl_/.test(f || '')) break; }/* il lancio e' gia' scritto: non serve aspettare la fine della scena */
    const L = await lan(); if (L.length) return L[0];
    /* [giro 50] se la clip del colpo si e' gia' chiusa quando l'arco parte (l'attesa del 146 dura fino a 0,8 s) il testimone del gesto
       non scrive la riga del lancio: misurato gi6/gi7 nel braccio «rete», 3 volte su 5. Stessa grandezza (osso della testa → pallone)
       dal testimone dell'attesa __CPM_TESTA146: la sua ultima riga e' il fotogramma in cui l'arco e' stato rilasciato. */
    const W = await page.evaluate(() => (window.__CPM_TESTA146 || []).filter(r => r[4] === 1).map(r => r[1]));
    return W.length ? W[W.length - 1] : null;
  } catch (e) { return null; } finally { await page.close().catch(() => {}); }
}
const SC = [6, 7, 55];
const BR = [['gioco', [], [6, 44], x => x <= 1.0], ['rete', ['__CPM_NO_TESTA76'], [6, 7], x => x <= 1.0], ['rosso', ['__CPM_NO_TESTA76', '__CPM_NO_TESTA146'], SC, x => x >= 2.5]];
const g = [];
for (const [nome, fl, scene, ok] of BR) { const out = []; for (const gi of scene) out.push({ gi, lancio: await lancio(gi, fl) });
  const giud = out.filter(x => x.lancio != null), buoni = giud.filter(x => ok(x.lancio));
  /* una scena non giudicata (testimone senza la riga del lancio, capita sotto carico) non decide; servono almeno 2 scene giudicate.
     Verdi: tutte le giudicate dentro. Rosso: almeno 2 scene oltre 2,5 (misurato 2,70-3,26 su gi6/gi7/gi55, un campione di gi1 a 1,7). */
  const pass = giud.length >= 2 && (nome === 'rosso' ? buoni.length >= 2 : buoni.length === giud.length);
  console.log(nome.padEnd(6) + JSON.stringify(out) + (pass ? ' ok' : ' NO')); if (!pass) g.push(nome + ': ' + JSON.stringify(out)); }
await b.close(); srv.close();
if (g.length) { console.log('❌ testa-146'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ testa-146 verde (il 146 ripara da solo e il rosso si vede)');
