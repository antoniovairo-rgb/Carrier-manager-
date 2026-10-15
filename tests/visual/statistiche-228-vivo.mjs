/* [giro 16 PO-228 verifica dal vivo] LE STATISTICHE DELLA RITARATURA NELLE PARTITE VERE, NON SOLO AL BANCO.
   Il banco (statistiche-228.mjs) gioca il motore da solo; qui si gioca la partita intera nel gioco (salvataggio S12
   fixtures/save-190-s12-ovr93.json, autoplay seedato, velocita' 4) in due bracci sugli stessi semi:
   verde = gioco com'e' · rosso = __CPM_NO_PASS228 (motore del possesso di prima). Per ogni partita si legge il tabellino del
   motore (passaggi, cross, tiri, gol delle due squadre), la pagella dell'eroe (gol e tiri) e il testimone dei gol dell'eroe
   del risultato registrato (__CPM_GOLEROE228, scritto da _buildEndResult in src/15).
   ⚠️ La partita dal vivo NON e' riproducibile al tick (il sotto-tick del motore e' legato all'orologio, vedi tabellino-228):
   gli stessi semi danno partite diverse, quindi si confrontano MEDIE su almeno 12 partite per braccio, a macchina libera
   (PAR=1 di default: due browser in parallelo cambiano la cadenza dei sotto-tick).
   Uso: K=1,2,...,12 node statistiche-228-vivo.mjs      (default K=1..12, MODI=verde,rosso alternati)
        OUT=file.jsonl per accumulare le righe; RIASSUMI=file.jsonl per il solo riassunto. Esce 0 sempre: e' una misura. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const riassumi = (righe) => {
  const f = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d).replace('.', ',') : '—');
  const m = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN;
  const sd = (a) => { const mu = m(a); return a.length > 1 ? Math.sqrt(a.reduce((s, x) => s + (x - mu) ** 2, 0) / (a.length - 1)) : NaN; };
  const out = {};
  for (const modo of ['verde', 'rosso']) {
    const R = righe.filter(r => r.modo === modo && !r.err && r.tab);
    const col = (fn) => R.map(fn).filter(Number.isFinite);
    const o = { n: R.length };
    for (const [k, fn] of [['passaggi', r => r.tab.passaggi], ['cross', r => r.tab.cross], ['tiri', r => r.tab.tiri], ['gol', r => r.tab.gol],
      ['tiriEroe', r => r.eroe ? r.eroe.tiri : NaN], ['golEroePagella', r => r.eroe ? r.eroe.gol : NaN], ['golEroe', r => r.golEroe]]) { const a = col(fn); o[k] = { media: m(a), sd: sd(a), n: a.length }; }
    out[modo] = o;
    console.log(`${modo.padEnd(6)} n=${o.n} · passaggi ${f(o.passaggi.media)} (sd ${f(o.passaggi.sd)}) · cross ${f(o.cross.media)} · tiri ${f(o.tiri.media)} (sd ${f(o.tiri.sd)}) · gol ${f(o.gol.media, 2)} · eroe: tiri ${f(o.tiriEroe.media, 2)} · gol pagella ${f(o.golEroePagella.media, 2)} · gol registrati ${f(o.golEroe.media, 2)} (n ${o.golEroe.n})`);
  }
  return out;
};

if (process.env.RIASSUMI) { riassumi(fs.readFileSync(process.env.RIASSUMI, 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s))); process.exit(0); }

const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const KS = (process.env.K || '1,2,3,4,5,6,7,8,9,10,11,12').split(',').map(s => +s.trim()).filter(Boolean);
const MODI = (process.env.MODI || 'verde,rosso').split(',').map(s => s.trim()).filter(Boolean);
const PAR = Math.max(1, Math.min(2, +(process.env.PAR || 1)));
const OUT = process.env.OUT || null;

async function gioca(b, url, k, modo) {
  const t0 = Date.now(); const rec = { k, modo, err: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' V228-' + k;
    await page.addInitScript(([s, rosso]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (rosso) window.__CPM_NO_PASS228 = true; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, modo === 'rosso']);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    const tp = Date.now(); let ph = '';
    while (Date.now() - tp < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
    rec.fine = ph; await sleep(2500);
    Object.assign(rec, await page.evaluate(() => {
      const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ();
      const T = M && M.tabellino ? M.tabellino() : null;
      const E = M && M.pagelle ? (M.pagelle() || []).find(p => p && p.eroe) : null;
      const s = (k) => T ? ((T.home[k] | 0) + (T.away[k] | 0)) : null;
      return { tab: T ? { passaggi: s('passaggi'), cross: s('cross'), tiri: s('tiri'), gol: s('gol') } : null,
        eroe: E ? { gol: E.gol | 0, tiri: E.tiri | 0, voto: E.voto } : null,
        rami228: M && M._S && M._S.conta ? { circola: M._S.conta.rami.circola228 | 0, appoggio: M._S.conta.rami.appoggio228 | 0, ricicla: M._S.conta.rami.ricicla228 | 0 } : null };
    }));
    rec.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
    /* il testimone del risultato registrato si scrive al fischio (sidecar) o al tap post-partita */
    for (let i = 0; i < 6 && rec.golEroe == null; i++) {
      rec.golEroe = await page.evaluate(() => (typeof window.__CPM_GOLEROE228 === 'number' ? window.__CPM_GOLEROE228 : null));
      if (rec.golEroe == null) { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {}); await sleep(2000); }
    }
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  await ctx.close();
  return rec;
}

const srv = await startServer();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const lavori = []; for (const k of KS) for (const m of MODI) lavori.push({ k, m });
const risultati = [];
const browsers = []; for (let i = 0; i < Math.min(PAR, lavori.length); i++) browsers.push(await launchBrowser());
let next = 0;
await Promise.all(browsers.map(async (b) => {
  while (next < lavori.length) {
    const { k, m } = lavori[next++];
    const r = await gioca(b, url, k, m);
    risultati.push(r);
    if (OUT) fs.appendFileSync(OUT, JSON.stringify(r) + '\n');
    console.log(`k${r.k} ${r.modo}: ${JSON.stringify({ tab: r.tab, eroe: r.eroe, golEroe: r.golEroe, score: r.score, rami228: r.rami228, fine: r.fine })} ${r.sec}s${r.err ? ' ERR ' + r.err : ''}`);
  }
}));
for (const b of browsers) await b.close(); srv.close();
riassumi(risultati);
process.exit(0);
