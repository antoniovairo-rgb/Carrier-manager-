#!/usr/bin/env node
/* [7.999.141 PO-216 «Tabellino sbagliato»: tabellone 2-2, tabellino della gara 2-3] GUARDIANO del testimone sul salvataggio S12:
   a meta' partita si aggiunge al motore un gol avversario che il tabellone non ha (il caso della foto del PO), poi si arriva al fischio.
   VERDE: il taccuino ha la nota automatica PO-216 con i due punteggi diversi. ROSSO (__CPM_NO_TEST216): nessuna nota. Uso: node tabellino-216.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_TEST216 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-bugnotes', '[]'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 99, policy: 'seeded', tickMs: 150 }));
  await sleep(4000);
  const iniettato = await page.evaluate(() => { try { window.__CPM_MOTORE_OBJ()._S.tab.away.gol++; return true; } catch (e) { return false; } });
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
  await sleep(1500);
  const r = await page.evaluate(() => { let n = []; try { n = JSON.parse(localStorage.getItem('cpm-bugnotes') || '[]'); } catch (e) {} const a = n.filter(x => x && x.auto216); return { note: a.length, testo: a.length ? a[0].txt.slice(0, 160) : null }; });
  esito[rosso ? 'rosso' : 'verde'] = { fase: ph, iniettato, ...r }; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.iniettato && V.note === 1 && /tabellone \d+-\d+, motore \d+-\d+/.test(V.testo || ''))) g.push('verde: nessuna nota automatica col caso iniettato ' + JSON.stringify(V));
if (!(R.iniettato && R.note === 0)) g.push('rosso: nota presente anche spento ' + JSON.stringify(R));
if (g.length) { console.log('❌ tabellino-216'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ tabellino-216 verde (e il rosso si vede)');
