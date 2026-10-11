#!/usr/bin/env node
/* [7.999.159 PO-218, collaudatrice giro 5 «Finta e tiro»] GUARDIANO per enumerazione (nessuna partita): per ogni azione del catalogo
   SITUATIONS il cui nome e' un TIRO (stessa regola di _hlOvlCat), un esito fallito con chiave «intercept» deve avere il lessico di tiro
   («miss»), non quello di passaggio («pass_fail»). VERDE: 0 azioni-tiro con lessico di passaggio, su almeno 10. ROSSO (__CPM_NO_LEX218):
   almeno il 90% torna al lessico di passaggio. Uso: node lessico-218.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext(); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_LEX218 = 1; }, rosso);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof _hlOvlCat === 'function' && typeof SITUATIONS !== 'undefined', null, { timeout: 60000 });
  esito[rosso ? 'rosso' : 'verde'] = await page.evaluate(() => {
    const reShot = /tir|conclus|destr|sinistr|girat|vol[eé]|bomba|stoccat|incroci|piattone|pallonett|rasoterra|a giro/;
    const rePass = /passagg|imbucat|filtrant|lanci|scaric|verticalizz|apertur|servizi|smista|triangol|uno-due|dai e vai|appoggi/;
    const lab = new Set(); for (const s of SITUATIONS) for (const a of (s.actions || [])) { const L = String(a.label || '').toLowerCase(); if (reShot.test(L) && !rePass.test(L)) lab.add(a.label); }
    let pas = 0; const es = []; for (const l of lab) { const c = _hlOvlCat('intercept', false, l); if (c === 'pass_fail') { pas++; if (es.length < 5) es.push(l); } }
    return { n: lab.size, pas, es };
  });
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.n >= 10 && V.pas === 0)) g.push('verde: azioni-tiro con lessico di passaggio ' + V.pas + ' su ' + V.n);
if (!(R.pas >= Math.ceil(R.n * 0.9))) g.push('rosso: il difetto non si vede (' + R.pas + ' su ' + R.n + ')');
if (g.length) { console.log('❌ lessico-218'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ lessico-218 verde (0 su ' + V.n + ' azioni-tiro col lessico di passaggio) e il rosso si vede (' + R.pas + ' su ' + R.n + ')');
