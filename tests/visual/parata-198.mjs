#!/usr/bin/env node
/* [7.999.123 PO-198 collaudo PO 03/10 20:17 «Niente figurine, solo CGTrader!»] GUARDIANO: la parata come la monta la Fine Stagione
   (ParataCompleta198, esposta come __CPM_PARATA198_C) ha sul tetto i corpi CGTrader (testimone __CPM_PARATA.cg23) e nessuna
   figurina dei visi (data-cpm="parata2d"). Verde: cg23 >= 8 e 0 figurine. Rosso (__CPM_NO_PARATA198): niente corpi CGTrader e
   figurine presenti (com'era nella foto del PO). Corpi veri accesi (__CPM_GLB non false), come sul telefono. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const esito = {};
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { if (r) window.__CPM_NO_PARATA198 = 1; }, rosso);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
  await page.evaluate(() => {
    document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
    const club = { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 80, c: '#c8102e', c2: '#ffffff', nat: '🏴', lg: 'Premier Division' };
    ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club, euroWin: false, avatarId: 0, heroNum: 77 }));
  });
  let info = null;
  for (let t = 0; t < 45; t++) { await sleep(1000); info = await page.evaluate(() => ({ par: window.__CPM_PARATA || null, fig: document.querySelectorAll('[data-cpm="parata2d"]').length })); if (!info.par) continue; if ((info.par.cg23 || 0) >= 8 || (rosso && t >= 12)) break; }
  if (!rosso) await page.screenshot({ path: 'out/parata-198-verde.png' }).catch(() => {});
  esito[rosso ? 'rosso' : 'verde'] = { montata: !!info.par, cg23: info.par ? (info.par.cg23 || 0) : null, figurine: info.fig };
  await page.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(esito));
const V = esito.verde, R = esito.rosso, guasti = [];
if (!V.montata) guasti.push('verde: la parata non si e\' montata');
if (!(V.cg23 >= 8)) guasti.push('verde: corpi CGTrader sul tetto ' + V.cg23 + ' (attesi 8)');
if (V.figurine) guasti.push('verde: figurine ancora presenti');
if (!R.montata || R.cg23 >= 8 || !R.figurine) guasti.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (guasti.length) { console.log('❌ parata-198'); guasti.forEach(g => console.log('  · ' + g)); process.exit(1); }
console.log('✅ parata-198 verde (e il rosso si vede)');
