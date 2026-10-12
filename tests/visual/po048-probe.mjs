#!/usr/bin/env node
/* [7.999.160 PO-048] SONDA: eroe tagliato o fuori quadro nelle scene segnalate da Codex (07/10, 7.999.143):
   #3 «Tiro a giro», #38 «Dai e vai preciso» fallito, #64 «Testa potente angolato» fallito, #74 «Prima intenzione».
   GLB acceso (direttiva PO 29/07), __CPM_PRESENT=1, pagina NUOVA per ogni passata (lezione 7.483).
   Per campione (ogni 100 ms per 4 s dalla risoluzione): piedi in NDC (FR73) e altezza apparente (FRAME480.ultimo).
   fuori = piedi fuori quadro; tagliato = piedi dentro ma testa oltre il bordo alto (ay+2h>1) o corpo a meno di 0,05 dal bordo laterale.
   Uso: CPM_RIP=3 [CPM_SCENE=3,38] [CPM_RED=__CPM_NO_X] node po048-probe.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const CASI = { 3: 'success', 38: 'fail', 64: 'fail', 74: 'success' };
const SC = (process.env.CPM_SCENE || '3,38,64,74').split(',').map(Number);
const RIP = +(process.env.CPM_RIP || 3), RED = process.env.CPM_RED || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = {};
for (let r = 0; r < RIP; r++) for (const gi of SC) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(red => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; if (red) red.split(',').forEach(k => window[k] = 1); }, RED);
  try {
    await openMatch(page, port); await sleep(900);
    await forceSituation(page, gi, { settle: 500, choose: true });
    await page.evaluate(o => { window.__CPM_FRAME480 = null; window.__CPM_FR73 = []; window.__CPM_FORCE_OUTCOME = o; }, CASI[gi]);
    await page.evaluate(() => { try { window.__CPM_RESOLVE(0); } catch (e) {} });
    const camp = [];
    for (let k = 0; k < 40; k++) {
      await sleep(100);
      camp.push(await page.evaluate(() => { const f = window.__CPM_FR73 || [], l = f[f.length - 1], g = window.__CPM_FRAME480 || {}; return l ? { ax: l.ax, ay: l.ay, h: g.ultimo || 0, ph: g.fase } : null; }));
    }
    const v = camp.filter(Boolean); let fu = 0, ta = 0;
    for (const c of v) { const dentro = Math.abs(c.ax) <= 1 && Math.abs(c.ay) <= 1; if (!dentro) fu++; else if (c.ay + 2 * c.h > 1 || Math.abs(c.ax) > 0.95) ta++; }
    (out[gi] = out[gi] || []).push({ n: v.length, fuori: fu, tagliato: ta, hmed: v.length ? +v.map(c => c.h).sort((a, b) => a - b)[v.length >> 1].toFixed(3) : null });
  } catch (e) { (out[gi] = out[gi] || []).push({ err: String(e.message).slice(0, 80) }); }
  await page.close().catch(() => {});
}
await b.close(); srv.close();
for (const gi of SC) console.log('#' + gi + ' ' + JSON.stringify(out[gi]));
console.log('JSON ' + JSON.stringify(out));
