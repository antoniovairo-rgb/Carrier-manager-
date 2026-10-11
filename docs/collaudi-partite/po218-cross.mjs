#!/usr/bin/env node
/* PO-218 cross — partite vere (autoplay seeded, salvataggio S12, GLB default). Per partita registra OGNI scena dell'eroe:
   cast (tipo, minuto), esito scelto (RES218: label, key, ok, outKind), riquadro (fam, ovl), fatti del motore (ev) e la cronaca
   del minuto (TXT487: m, txt, pd, ef). Dati grezzi: una riga JSON per partita. Uso: FROM=1 TO=6 OUT=file.jsonl node po218-cross.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FROM = +(process.env.FROM || 1), TO = +(process.env.TO || 6), OUT = process.env.OUT || 'po218.jsonl';
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
for (let k = FROM; k <= TO; k++) {
  const t0 = Date.now(); const rec = { k, name: null, err: null, fine: null, score: null, res: [], cast: [], txt: [] };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + k; rec.name = pl.name;
    await page.addInitScript(([s]) => { window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_TXT487 = []; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv]);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    const tp = Date.now(); let ph = '';
    while (Date.now() - tp < 420000) {
      ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'ended' || ph === 'ceremony') break;
      await sleep(1000);
    }
    rec.fine = ph;
    rec.res = await page.evaluate(() => window.__CPM_RES218 || []);
    rec.cast = await page.evaluate(() => (window.__CPM_CAST219 || []).map(c => ({ hl: c.hl, min: c.min, tipo: c.tipo })));
    rec.txt = await page.evaluate(() => (window.__CPM_TXT487 || []).map(t => ({ m: t.m, txt: t.txt, pd: t.pd, ef: t.ef })));
    rec.score = await page.evaluate(() => window.__CPM_SCORE ? window.__CPM_SCORE() : null);
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  console.log(`k${k} ${rec.fine} scene=${rec.res.length} ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''}`);
  await ctx.close();
}
await b.close(); srv.close();
