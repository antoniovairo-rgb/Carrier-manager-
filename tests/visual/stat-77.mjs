#!/usr/bin/env node
/* [7.999.77 guardiano — collaudo PO «brutte le statistiche con lo scroll, le mostrerei tutte» (foto 14:36)]
   A 412x915, pannello aperto sulla linguetta Statistiche: il contenitore delle righe non deve scorrere. Si misura anche il
   caso peggiore (tutte le voci accese: 16 nel rosso, 11 nel verde) proiettando l'altezza di una riga sulle voci possibili.
   VERDE: nessuno scroll e caso peggiore dentro. ROSSO __CPM_NO_STAT77: caso peggiore fuori (lo scroll torna). Uso: node stat-77.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
fs.mkdirSync('out/stat77', { recursive: true });
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_STAT77 = 1; try { if (window.__CPM_MEM927) {} } catch (_e) {} }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'Stat77' });
  await p.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  for (let i = 0; i < 60; i++) { const f = await p.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } }); if (f === 'playing') break; await sleep(500); }
  await sleep(12000);
  let r = null;
  for (let k = 0; k < 20 && !r; k++) {
    await p.evaluate(() => { if (window.__CPM_MEM927) { window.__CPM_MEM927.aperto = true; window.__CPM_MEM927.vista = 'stat'; } });
    const bb = await p.$$('[data-cpm="pannello918"] button');
    if (bb && bb[0]) { await bb[0].click().catch(() => {}); }
    if (bb && bb[2]) { const aperto = await p.$('[data-cpm="stat77"]'); if (!aperto) await bb[2].click().catch(() => {}); }
    await sleep(500);
    r = await p.evaluate(() => { const el = document.querySelector('[data-cpm="stat77"]'); if (!el) return null;
      const righe = el.children.length; const cs = getComputedStyle(el); const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      let som = 0; for (const c of el.children) som += c.getBoundingClientRect().height; const hr = righe ? som / righe : 0;
      return { righe, scroll: el.scrollHeight, client: el.clientHeight, hRiga: +hr.toFixed(1), pad };
    });
    if (!r) await sleep(1500);
  }
  await p.screenshot({ path: `out/stat77/${rosso ? 'rosso' : 'verde'}.png` }).catch(() => {});
  await ctx.close();
  if (r) { r.max = rosso ? 16 : 11; r.peggiore = Math.round(r.hRiga * r.max + r.pad); r.dentro = r.peggiore <= r.client + 1; r.scorre = r.scroll > r.client + 1; }
  return r;
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_STAT77)', JSON.stringify(r));
const ok = v && r && !v.scorre && v.dentro && !r.dentro;
await b.close(); srv.close();
console.log(ok ? '✅ stat-77 verde: statistiche tutte a vista (e il rosso scorre)' : '❌ stat-77 ROSSO'); process.exit(ok ? 0 : 1);
