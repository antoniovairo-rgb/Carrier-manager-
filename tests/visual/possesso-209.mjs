#!/usr/bin/env node
/* [7.999.136 PO-209 «il tabellino post partita con le statistiche è corretto? Alcune statistiche sembrano al contrario» — foto: possesso
   37% nel riquadro «Il tuo tabellino» e 49% nel «Tabellino della gara»] GUARDIANO su una partita vera dal salvataggio S12 (autoplay, seme
   fisso) fino al fischio finale: il possesso del riquadro dell'eroe e quello della riga «Possesso» del tabellino devono coincidere.
   MISURATO prima della correzione (sonda post209, 05/10): 51% contro 54%. ROSSO (__CPM_NO_POSS209): il riquadro torna allo stato della
   cronaca e i due numeri si separano. Uso: node possesso-209.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_POSS209 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended') break; await sleep(1000); }
  await sleep(2500);
  const m = await page.evaluate(() => {
    const txt = document.body.innerText; const poss = (txt.match(/(\d+)%\s*\n\s*Poss\./) || [])[1];
    const riga = (txt.match(/(\d+)%\s*\n\s*Possesso\s*\n\s*(\d+)%/) || []);
    return { riquadro: poss != null ? +poss : null, tabellino: riga[1] != null ? +riga[1] : null, loro: riga[2] != null ? +riga[2] : null };
  });
  const _e = { fase: ph, s: Math.round((Date.now() - t0) / 1000), ...m };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(_e));
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.fase === 'ended' && V.riquadro != null && V.tabellino != null && V.riquadro === V.tabellino)) g.push('verde: riquadro e tabellino diversi o non letti ' + JSON.stringify(V));
if (!(R.fase === 'ended' && R.riquadro != null && R.tabellino != null && R.riquadro !== R.tabellino)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ possesso-209'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ possesso-209 verde (e il rosso si vede)');
