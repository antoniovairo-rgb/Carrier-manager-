#!/usr/bin/env node
/* [7.999.39 guardiano — taccuino PO su 7.999.34: #92 «Roulette sul difensore!», azione «Roulette di classe», codice 003 «esito
   bugiardo»; clip «Soccer Spin» mandata dal PO: «la ruleta (chiamata anche roulette, veronica o marsiglia)»] Misurato prima: nel tiro
   preceduto da dribbling l'eroe non montava NESSUN gesto nel tratto di finta, e «Roulette di classe» era un tiro dal limite senza giro.
   Verde se: (1) #92/0 monta la ruleta (mx-ruleta) prima del tiro e la suona quasi intera (tempo di clip >= 1,0 su 1,27 s) con il
   pallone al piede (distanza pallone-piede piu' vicino <= 1,6 u in ogni fotogramma della ruleta); (2) #92/1 «Finta e scatto» monta il
   gesto di finta prima del tiro. Rosso: CPM_ROSSO=1 -> __CPM_NO_FINTA39 -> nessun gesto nel tratto di finta -> FALLISCE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = {};
for (const ai of [0, 1]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO_FINTA39 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Ruleta' + ai }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_VAR23 = {}; window.__CPM_FORCE_SIT(92, false); window.__CPM_FROZEN = false; });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(1500);
  await page.evaluate(a => { window.__CPM_TIRO34_REC = 1; window.__CPM_TIRO34 = null; window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, ai);
  const t0 = Date.now(); while (Date.now() - t0 < 9000) await sleep(400);
  out[ai] = await page.evaluate(() => { const f = (window.__CPM_TIRO34 && window.__CPM_TIRO34.f) || []; const ord = []; let last = null; let ctMax = 0, dMax = 0, n = 0;
    for (const x of f) { if (x.g !== last) { ord.push(x.g || '—'); last = x.g; } if (x.g === 'ruleta') { n++; ctMax = Math.max(ctMax, +x.ct || 0); const d = Math.min(x.dL != null ? x.dL : 99, x.dR != null ? x.dR : 99); if (d < 99) dMax = Math.max(dMax, d); } }
    return { ordine: ord, var: window.__CPM_VAR23 || {}, ruleta: { n, ctMax: +ctMax.toFixed(2), dMax: +dMax.toFixed(2) } }; }).catch(e => ({ err: String(e) }));
  console.log(`#92/${ai}: ${JSON.stringify(out[ai])}`); await page.close();
}
await b.close(); srv.close();
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
const o0 = out[0] || {}, o1 = out[1] || {}; const iK0 = (o0.ordine || []).indexOf('kick'), iR = (o0.ordine || []).indexOf('ruleta');
ok(iR >= 0 && (iK0 < 0 || iR < iK0), `#92/0 «Roulette di classe»: la ruleta prima del tiro (${(o0.ordine || []).join(' → ')})`);
ok(!!(o0.var && o0.var.ruleta && o0.var.ruleta['mx-ruleta']), '#92/0: la clip montata e\' mx-ruleta');
ok(o0.ruleta && o0.ruleta.ctMax >= 1.0, `#92/0: la ruleta suona quasi intera (tempo di clip ${o0.ruleta && o0.ruleta.ctMax} s su 1,27)`);
ok(o0.ruleta && o0.ruleta.n > 0 && o0.ruleta.dMax <= 1.6, `#92/0: pallone al piede durante la ruleta (distanza massima ${o0.ruleta && o0.ruleta.dMax} u)`);
const iK1 = (o1.ordine || []).indexOf('kick'), iF = (o1.ordine || []).indexOf('feint');
ok(iF >= 0 && (iK1 < 0 || iF < iK1), `#92/1 «Finta e scatto»: la finta prima del tiro (${(o1.ordine || []).join(' → ')})`);
if (err.length) { console.log('\nRULETA: FALLITO (' + err.length + ')' + (ROSSO ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nRULETA: PASS'); process.exit(0);
