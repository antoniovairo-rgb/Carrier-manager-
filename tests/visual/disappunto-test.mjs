#!/usr/bin/env node
/* [7.999.41 guardiano — clip del PO «Golf Bad Shot», «gesto per il disappunto»] Misurato prima: sull'occasione sprecata (tiro fuori)
   l'eroe montava `missed-chance` (3,4 s) dentro una finestra di 1,4 s, cioe' a ~2,4x: un gesto frettoloso. Ora monta `mx-disappunto`
   (tratto 0,5-2,6 s di Golf Bad Shot: mani alla testa, si piega) a velocita' nativa per 2,1 s. Verde se su gi2 con esito fuori (tempi
   veri del gioco, __CPM_REALWAIT): la clip montata e' mx-disappunto, dopo il tiro, e passa mani alla testa e piegamento (tempo di clip >= 1,4 s su 2,1: in headless la finestra d'esito chiude a ~1,6).
   Rosso: CPM_ROSSO=1 -> __CPM_NO_DISAPP41 -> torna missed-chance -> FALLISCE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REALWAIT = 1; if (r) window.__CPM_NO_DISAPP41 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Disappunto' }); await sleep(1500);
await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => { window.__CPM_VAR23 = {}; window.__CPM_FORCE_SIT(2, false); window.__CPM_FROZEN = false; });
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
await sleep(1500);
await page.evaluate(() => { window.__CPM_TIRO34_REC = 1; window.__CPM_TIRO34 = null; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = 'miss'; window.__CPM_RESOLVE(0); });
const t0 = Date.now(); while (Date.now() - t0 < 14000) await sleep(400);
const o = await page.evaluate(() => { const f = (window.__CPM_TIRO34 && window.__CPM_TIRO34.f) || []; const ord = []; let last = null, ct = 0, n = 0;
  for (const x of f) { if (x.g !== last) { ord.push(x.g || '—'); last = x.g; } if (x.g === 'miss') { n++; ct = Math.max(ct, +x.ct || 0); } }
  return { ordine: ord, var: (window.__CPM_VAR23 || {}).miss || {}, n, ctMax: +ct.toFixed(2) }; }).catch(e => ({ err: String(e) }));
console.log(JSON.stringify(o));
await b.close(); srv.close();
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
const iK = (o.ordine || []).indexOf('kick'), iM = (o.ordine || []).indexOf('miss');
ok(iM >= 0 && iK >= 0 && iK < iM, `il disappunto arriva dopo il tiro (${(o.ordine || []).join(' → ')})`);
ok(!!o.var['mx-disappunto'], `la clip montata e' mx-disappunto (${Object.keys(o.var || {}).join(',') || 'nessuna'})`);
ok(o.ctMax >= 1.4, `il disappunto passa mani alla testa e piegamento (tempo di clip ${o.ctMax} s su 2,1; il cuore del gesto sta entro 1,05 s)`);/* in headless la finestra d'esito (tempo reale) chiude prima che il tempo di scena arrivi a 2,1 s: misurato 1,58-1,60 */
if (err.length) { console.log('\nDISAPPUNTO: FALLITO (' + err.length + ')' + (ROSSO ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nDISAPPUNTO: PASS'); process.exit(0);
