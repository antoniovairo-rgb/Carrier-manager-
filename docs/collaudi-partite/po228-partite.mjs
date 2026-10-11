/* PO-228 — collaudo statistiche di partita (sessione collaudatrice, sola lettura sul gioco).
   Per ogni k: partita vera dal salvataggio S12 (tests/visual/fixtures/save-190-s12-ovr93.json), nome diverso per k
   (il seme nasce da avversario+stagione+settimana+NOME), autoplay seedato come PO-221. Si gioca fino a «FISCHIO FINALE»,
   poi si legge il TABELLINO DELLA GARA dal DOM (stessa sorgente del motore: motoreRef.current.tabellino(), vedi
   CARRIER-MANAGER-AV.html righe 38099-38101 e 27837). Una riga JSON per partita con il testo grezzo del blocco e le terne.
   Uso: FROM=1 TO=2 OUT=file.jsonl node po228-partite.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('../../tests/visual/fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FROM = +(process.env.FROM || 1), TO = +(process.env.TO || 2), OUT = process.env.OUT || 'po228.jsonl';
const isNum = s => /^-?\d+(\.\d+)?%?$/.test(s);
function parse(txt) {
  const L = txt.split('\n').map(s => s.trim()).filter(Boolean);
  const out = { headline: null, teams: null, stats: {}, raw: [] };
  const h = L.findIndex(s => /^\d+–\d+$/.test(s));
  if (h > 0) out.headline = { mine: L[h - 1], score: L[h], loro: L[h + 1] };
  const i0 = L.indexOf('TABELLINO DELLA GARA');
  if (i0 < 0) return out;
  let i1 = L.indexOf('IL TUO TABELLINO IN NUMERI', i0); if (i1 < 0) i1 = L.length;
  const blk = L.slice(i0, i1); out.raw = blk;
  out.teams = blk.slice(1, 5).filter(s => s !== '—' && s !== '›');
  for (let j = i0 + 1; j + 2 < i1; ) {
    if (isNum(L[j]) && !isNum(L[j + 1]) && isNum(L[j + 2])) { out.stats[L[j + 1]] = { mine: L[j], loro: L[j + 2] }; j += 3; }
    else j++;
  }
  return out;
}
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
for (let k = FROM; k <= TO; k++) {
  const t0 = Date.now(); const rec = { k, name: null, err: null, fine: null, fischio: false };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' PO228-' + k; rec.name = pl.name;
    await page.addInitScript(([s, dump]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (dump) window.__CPM_TIRI202 = []; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, !!process.env.DUMP_EV]);
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
    rec.fine = ph; await sleep(2500);
    let txt = '';
    for (let i = 0; i < 10; i++) {
      txt = await page.evaluate(() => document.body.innerText);
      if (txt.includes('TABELLINO DELLA GARA')) break;
      await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
      await sleep(2500);
    }
    rec.fischio = txt.includes('FISCHIO FINALE');
    rec.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
    Object.assign(rec, parse(txt));
    rec.bloccoTrovato = txt.includes('TABELLINO DELLA GARA');
    if (process.env.DUMP_EV) { const EV = await page.evaluate(() => (window.__CPM_EV && window.__CPM_EV()) || []); const G785 = await page.evaluate(() => ({ tiri: window.__CPM_TIRI202 || null })); fs.writeFileSync(`${process.env.DUMP_EV}-k${k}.json`, JSON.stringify(EV)); fs.writeFileSync(`${process.env.DUMP_EV}-gol785-k${k}.json`, JSON.stringify(G785)); }
    rec.clubSave = save.player ? save.player.club.name : save.club.name;
    rec.ev_fine = await page.evaluate(() => ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => e.ev === 'fine').map(e => ({ min: e.min, causa: e.causa || null })));
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  const pass = rec.stats ? Object.keys(rec.stats).length : 0;
  console.log(`k${k} fine=${rec.fine} fischio=${rec.fischio} blocco=${rec.bloccoTrovato} voci=${pass} score=${JSON.stringify(rec.score)} ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''}`);
  await ctx.close();
}
console.log('FINE');
await b.close(); srv.close();
