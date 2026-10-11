#!/usr/bin/env node
/* PO-221 T3 — collaudo partite vere su 7.999.159 (sessione rilascio, SOLA LETTURA sul gioco).
   Stesso metodo della 7.999.158 (docs/collaudi-partite/po221-partite.mjs su collaudo/partite-vere):
   salvataggio S12 (tests/visual/fixtures/save-190-s12-ovr93.json), nome diverso per partita
   («<base> k»), autoplay seedato (seed=k, policy seeded), GLB spento, __CPM_PRESENT=1, __CPM_REC=true.
   Differenze di strategia (decisione PO del giro 159):
   - un browser NUOVO per ogni partita (launch → partita → close), mai riusato;
   - un crash («browser closed» / target chiuso) si rilancia UNA volta con nome «<base> kb»; se ricade, crash finale;
   - al massimo due processi in parallelo (W=0 pari, W=1 dispari), ciascuno con il proprio jsonl;
   - ogni partita viene scritta su jsonl appena finisce (una riga per tentativo);
   - nessun nuovo start oltre DEADLINE (epoch ms), così la chiamata chiude pulita.
   Uso: W=0 NW=2 OUT=file.jsonl DEADLINE=<epoch ms> node po221-t3-159.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import(path.resolve(HERE, '../../tests/visual/lib/harness.mjs'));
const SAVE_PATH = path.resolve(HERE, '../../tests/visual/fixtures/save-190-s12-ovr93.json');
const SAVE = JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8'));
const BASE = (SAVE.player || SAVE).name;

const W = +(process.env.W || 0), NW = +(process.env.NW || 1), KMAX = +(process.env.KMAX || 60);
const OUT = process.env.OUT || path.resolve(HERE, `po221-t3-159-w${W}.jsonl`);
const DEADLINE = +(process.env.DEADLINE || Infinity);
const MATCH_CAP_MS = 420000;

// Già fatte (ultima riga per k): si salta, così un lotto interrotto riprende senza perdere nulla.
const done = new Set();
if (fs.existsSync(OUT)) for (const l of fs.readFileSync(OUT, 'utf8').split('\n').filter(Boolean)) {
  const r = JSON.parse(l); if (r.final) done.add(r.k);
}

async function runOnce(srv, k, attempt, name) {
  const rec = { k, attempt, name, err: null, crash: false, fine: null, cast: [], res: [], scena: [], goal: [], score: null };
  const t0 = Date.now();
  const b = await launchBrowser();
  try {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    await installCdnRoutes(page);
    const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
    const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player || sv; pl.name = name;
    await page.addInitScript(([s]) => {
      window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1;
      localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s));
    }, [sv]);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
    await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
    await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    const tp = Date.now(); let ph = '';
    while (Date.now() - tp < MATCH_CAP_MS) {
      ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'ended' || ph === 'ceremony') break;
      await sleep(500);
    }
    rec.fine = ph;
    const D = await page.evaluate(() => ({
      cast: window.__CPM_CAST219 || [], res: window.__CPM_RES218 || [],
      ev: (window.__CPM_EV && window.__CPM_EV()) || [], score: window.__CPM_SCORE ? window.__CPM_SCORE() : null,
    }));
    rec.score = D.score;
    rec.cast = D.cast.map(c => ({ hl: c.hl, min: c.min, tipo: c.tipo || null }));
    rec.res = D.res.map(r => ({ hl: r.hl, label: r.label, key: r.key, ok: !!r.ok, outKind: r.outKind || null }));
    rec.scena = D.ev.filter(e => e.ev === 'scena').map(e => ({ min: e.min, src: e.src, tipo: e.tipo || null }));
    rec.goal = D.ev.filter(e => e.ev === 'goal').map(e => ({ min: e.min, side: e.side, src: e.src }));
  } catch (e) {
    rec.err = String(e).slice(0, 240);
    rec.crash = /closed|Target|crash|Protocol/i.test(rec.err);
  } finally {
    await b.close().catch(() => {});
  }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  return rec;
}

const srv = await startServer();
for (let k = 1; k <= KMAX; k++) {
  if (k % NW !== W || done.has(k)) continue;
  if (Date.now() > DEADLINE) break;
  let rec = await runOnce(srv, k, 1, `${BASE} ${k}`);
  fs.appendFileSync(OUT, JSON.stringify({ ...rec, final: !rec.crash }) + '\n');
  if (rec.crash) {
    rec = await runOnce(srv, k, 2, `${BASE} ${k}b`);
    fs.appendFileSync(OUT, JSON.stringify({ ...rec, final: true }) + '\n');
  }
  const sc = rec.scena ? rec.cast.length : 0;
  const gh = rec.res.filter(r => r.ok && r.key === 'goal').length;
  console.log(`k${k} att${rec.attempt} ${rec.fine} scene=${sc} gol_eroe=${gh} score=${JSON.stringify(rec.score)} ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''}`);
}
srv.close();
