#!/usr/bin/env node
/* [7.999.138 PO-202, decisione PO 05/10 «correggi entrambe»] GUARDIANO su una partita vera dal salvataggio S12 (autoplay, seme fisso),
   fino al fischio finale. Il tempo fermo delle scene si restituisce TUTTO: al fischio il debito di passi deve essere saldato.
   MISURATO (24 partite per passo): la 7.999.137 giocava 84,5 minuti di motore contro i 94 della simulata; con il fermo sull'occasione
   e il debito senza tetto, pagato fino a 8 passi a battito e prima del fischio, gli avversari tirano 9,7 volte contro le 9,9 del
   brain da solo (erano 6,5). VERDE: debito residuo 0 al fischio e almeno 22 passi pagati. ROSSO (__CPM_NO_TEMPO138): resta debito
   non pagato al fischio, oppure il pagato non copre l'aperto. Uso: node tempo-138.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) { window.__CPM_NO_TEMPO138 = 1; window.__CPM_NO_P6 = 1; /* [7.999.148] il rosso rimette anche le scene del catalogo: con le scene del Passo 6 (piu' brevi) il vecchio tetto bastava per caso */ } localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
  const r = await page.evaluate(() => ({ pagato: window.__CPM_MIN202 | 0, residuo: window.__CPM_DEB202 | 0, aperto: window.__CPM_DEB202T | 0 }));
  esito[rosso ? 'rosso' : 'verde'] = { fase: ph, ...r }; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!((V.fase === 'ended' || V.fase === 'ceremony') && V.residuo === 0 && V.pagato >= 22 && V.pagato >= V.aperto)) g.push('verde: debito non saldato al fischio ' + JSON.stringify(V));
if (!((R.fase === 'ended' || R.fase === 'ceremony') && (R.residuo > 0 || R.pagato < R.aperto))) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ tempo-138'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ tempo-138 verde (e il rosso si vede)');
