#!/usr/bin/env node
/* [7.999.126 PO-201 collaudo PO 03/10 «I portieri non hanno i guanti»] GUARDIANO: in partita, con i corpi CGTrader, i due portieri
   ricevono i guanti (testimone __CPM_GUANTI201: facce-guanto per corpo vestito). Verde: almeno 2 corpi con >= 50 facce-guanto ciascuno
   (una mano ha centinaia di facce) e la quota di facce-guanto sul corpo e' <= 0,30. MISURATO sul modello del portiere
   (korward-regular-player.glb, 12.128 facce): le 3.412 facce-guanto (28,1%) appartengono TUTTE a ossa di mano e dita (palmi 268+268,
   dita il resto, avambraccio 0): le dita del modello sono molto dettagliate. Oltre 0,30 il guanto salirebbe sul braccio. Rosso (__CPM_NO_GUANTI_PO201): nessuno. Foto del portiere in out/guanti-201-verde.png. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out', { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_REC = true; if (r) window.__CPM_NO_GUANTI_PO201 = 1; }, rosso);
  await openMatch(page, port);
  let g = [];
  for (let t = 0; t < 40; t++) { await sleep(1000); g = await page.evaluate(() => (window.__CPM_GUANTI201 || []).slice()); esito[(rosso ? 'rosso' : 'verde') + 'Quota'] = await page.evaluate(() => (window.__CPM_GUANTI201Q || []).slice()); if (g.length >= 2 || (rosso && t >= 20)) break; }
  if (!rosso) { try { await forceSituation(page, 41, { settle: 2500 }); } catch (e) {} await page.screenshot({ path: 'out/guanti-201-verde.png' }).catch(() => {}); }
  esito[rosso ? 'rosso' : 'verde'] = g; await page.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(esito));
const V = esito.verde.filter(x => x >= 50).length;
if (V < 2) { console.log('❌ guanti-201: corpi con i guanti ' + V + ' (attesi 2)'); process.exit(1); }
const Q = esito.verdeQuota || []; if (!Q.length || Q.some(q => q > 0.30)) { console.log('❌ guanti-201: quota di facce-guanto ' + JSON.stringify(Q) + ' (tetto 0,30)'); process.exit(1); }
if (esito.rosso.length) { console.log('❌ guanti-201: il rosso non si vede'); process.exit(1); }
console.log('✅ guanti-201 verde (e il rosso si vede)');
