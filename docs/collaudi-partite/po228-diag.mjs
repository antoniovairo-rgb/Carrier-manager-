/* PO-228 — diagnostica: una partita vera dal salvataggio S12, a fine gara salva il testo visibile della pagina
   e le righe del tabellino, per capire dove appare il «Tabellino della gara» nel DOM. Sola lettura sul gioco. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('../../tests/visual/fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' diag';
await page.addInitScript(([s]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv]);
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 1, policy: 'seeded', tickMs: 150 }));
const t0 = Date.now(); let ph = '';
while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
console.log('fase', ph, 'secondi', Math.round((Date.now() - t0) / 1000), 'score', JSON.stringify(await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE())));
await sleep(3000);
for (let i = 0; i < 6; i++) {
  const txt = await page.evaluate(() => document.body.innerText);
  const hit = txt.includes('Tabellino') || txt.includes('Possesso');
  fs.writeFileSync(`${process.env.SCRATCH || '/tmp/x'}/diag-${i}.txt`, txt);
  console.log('passo', i, 'hit', hit, 'len', txt.length);
  if (hit && txt.includes('Tabellino della gara')) break;
  await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
  await sleep(2500);
}
await b.close(); srv.close();
