#!/usr/bin/env node
/* [7.999.72 guardiano — collaudo Codex 001/002 su gi31 «Scivolata netta»: nella scelta i protagonisti stanno sotto il pannello]
   Misurato: pallone a y 746-755 px con i pulsanti delle scelte da 736 px. Nella sola fase di scelta la finestra di proiezione
   scorre (setViewOffset) quando il pallone cade sotto ndc -0,30.
   VERDE → sulla scena 31 lo spostamento si attiva (≥ 60 px) e il pallone sta piu' in alto che nel rosso (media ≥ 50 px).
   ROSSO (__CPM_NO_PAN72) → nessuno spostamento. Uso: node pannello-72.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; if (r) window.__CPM_NO_PAN72 = 1; }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'Pan72' }); await sleep(1000);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => { window.__CPM_FORCE_SIT(31, true); window.__CPM_FROZEN = false; });
  await p.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  const R = []; for (let k = 0; k < 5; k++) { await sleep(900); R.push(await p.evaluate(() => { const s = window.__CPM_STATE(); const cv = document.querySelector('canvas').getBoundingClientRect();
    const by = s.ball && s.ball.ndc ? cv.top + (1 - s.ball.ndc.y) / 2 * cv.height : null; const pw = window.__CPM_PAN72 || {}; return { by, off: pw.off || 0 }; })); }
  await p.close(); const L = R.slice(-3); return { by: L.reduce((a, r) => a + (r.by || 0), 0) / L.length, off: Math.max(...R.map(r => r.off)) };
}
const v = await braccio(false), r = await braccio(true);
console.log(`VERDE: pallone a y ${v.by.toFixed(0)} px · spostamento max ${v.off.toFixed(0)} px`);
console.log(`ROSSO (__CPM_NO_PAN72): pallone a y ${r.by.toFixed(0)} px · spostamento max ${r.off.toFixed(0)} px`);
const ok = v.off >= 60 && r.off === 0 && r.by - v.by >= 50;
await b.close(); srv.close();
console.log(ok ? '✅ pannello-72 verde (e il rosso si vede)' : '❌ pannello-72 ROSSO'); process.exit(ok ? 0 : 1);
