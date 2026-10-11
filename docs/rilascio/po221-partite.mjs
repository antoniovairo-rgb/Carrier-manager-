#!/usr/bin/env node
/* PO-221 — collaudo partite vere (sessione collaudatrice, sola lettura sul gioco).
   Per ogni partita dal salvataggio S12 (fixture save-190-s12-ovr93), con nome diverso (il seme nasce da avversario+stagione+settimana+NOME),
   autoplay seedato. Registra grezzo: scene dell'eroe (__CPM_CAST219), esiti (__CPM_RES218), registro scene/gol (__CPM_EV: src = percorso),
   tabellone (__CPM_SCORE). Output: una riga JSON per partita. Uso: FROM=1 TO=60 OUT=file.jsonl node po221-partite.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('../../tests/visual/fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FROM = +(process.env.FROM || 1), TO = +(process.env.TO || 60), OUT = process.env.OUT || 'po221.jsonl';
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
for (let k = FROM; k <= TO; k++) {
  const t0 = Date.now(); const rec = { k, name: null, err: null, fine: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + k; rec.name = pl.name;
    await page.addInitScript(([s]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv]);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    const tp = Date.now(); let ph = '';
    while (Date.now() - tp < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
    rec.fine = ph;
    const D = await page.evaluate(() => ({ cast: window.__CPM_CAST219 || [], res: window.__CPM_RES218 || [], ev: (window.__CPM_EV && window.__CPM_EV()) || [], score: window.__CPM_SCORE ? window.__CPM_SCORE() : null }));
    rec.score = D.score;
    rec.cast = D.cast.map(c => ({ hl: c.hl, min: c.min, tipo: c.tipo || null }));
    rec.res = D.res.map(r => ({ hl: r.hl, label: r.label, key: r.key, ok: !!r.ok, outKind: r.outKind || null, defGesto: r.defGesto || null }));
    rec.scena = D.ev.filter(e => e.ev === 'scena').map(e => ({ min: e.min, src: e.src, tipo: e.tipo || null }));
    rec.goal = D.ev.filter(e => e.ev === 'goal').map(e => ({ min: e.min, side: e.side, src: e.src }));
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  console.log(`k${k} ${rec.fine} scene=${(rec.cast || []).length} gol_eroe=${(rec.res || []).filter(r => r.ok && r.key === 'goal').length} score=${JSON.stringify(rec.score)} ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''}`);
  await ctx.close();
}
await b.close(); srv.close();
