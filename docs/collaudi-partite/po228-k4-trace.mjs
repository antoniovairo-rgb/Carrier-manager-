/* PO-228 zona A — tracciamento del gol del tabellino su k4 (sessione collaudatrice 2, sola lettura sul gioco).
   Stesso flusso di po228-partite.mjs (salvataggio S12, nome PO228-4, autoplay seedato, tickMs 150, speed 4),
   ma servito dalla COPIA STRUMENTATA della build in ROOT_DIR (fuori da src/): i registratori window.__GOLREC
   sono nei tre punti che incrementano A.gol (conta914 evento gol, registra tiro esito=gol, registra gol).
   Uso: ROOT_DIR=<cartella copia> OUT=file.json node po228-k4-trace.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('../../tests/visual/fixtures/save-190-s12-ovr93.json', import.meta.url)));
const OUT = process.env.OUT || 'po228-k4-trace.json';
const K = +(process.env.K || 4);
const srv = await startServer(process.env.ROOT_DIR), b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }), page = await ctx.newPage(); await installCdnRoutes(page);
const rec = { k: K, root: process.env.ROOT_DIR || 'repo', err: null };
try {
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' PO228-' + K; rec.name = pl.name;
  await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), K);
  const tp = Date.now(); let ph = '';
  while (Date.now() - tp < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
  rec.fine = ph; await sleep(2500);
  let txt = '';
  for (let i = 0; i < 10; i++) {
    txt = await page.evaluate(() => document.body.innerText);
    if (txt.includes('TABELLINO DELLA GARA')) break;
    await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
    await sleep(2500);
  }
  const L = txt.split('\n').map(s => s.trim()).filter(Boolean);
  const i0 = L.indexOf('TABELLINO DELLA GARA');
  rec.tabellinoGol = i0 < 0 ? null : (() => { const j = L.findIndex((s, idx) => idx > i0 && s === 'Gol'); return j < 0 ? null : { mine: L[j - 1], loro: L[j + 1] }; })();
  rec.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
  rec.golRec = await page.evaluate(() => window.__GOLREC || []);
  rec.evGoal = await page.evaluate(() => ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => /goal|gol/.test(e.ev || '')).map(e => ({ ev: e.ev, min: e.min, lato: e.lato || null, ef: e.ef || null })));
  rec.fischio = txt.includes('FISCHIO FINALE');
} catch (e) { rec.err = String(e).slice(0, 240); }
fs.writeFileSync(OUT, JSON.stringify(rec, null, 2));
console.log(JSON.stringify({ fine: rec.fine, fischio: rec.fischio, score: rec.score, tabellinoGol: rec.tabellinoGol, golRec: rec.golRec.length, evGoal: rec.evGoal.length, err: rec.err }));
await ctx.close(); await b.close(); srv.close();
