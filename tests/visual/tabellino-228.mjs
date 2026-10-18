/* [7.999.161 PO-228 k4 guardiano] Il tabellino della gara (motore) e il tabellone (__CPM_SCORE) devono dire gli stessi gol.
   Caso misurato dalla collaudatrice (docs/collaudi-partite/PO228-k4.md sul ramo collaudo/partite-vere): salvataggio S12
   (fixtures/save-190-s12-ovr93.json), nome «PO228-4», autoplay seedato (seme 4, tickMs 150, velocita' 4): tabellino «Gol» 1-0,
   tabellone 0-0. Il gol del tabellino nasce nel motore al 96', dopo che il fischio ha chiuso il tabellone.
   VERDE: sul caso k4 tabellino gol == tabellone a fine partita. ROSSO (__CPM_NO_TAB228): lo scarto ricompare.
   ⚠️ In questo ambiente la partita k4 NON e' riproducibile al gol (misurato: due giri dello stesso k4 danno 2-1 e 0-3, divergenti
   dopo il 18'; il sotto-tick del motore e' legato all'orologio da polso). Per questo il caso si RICREA con __CPM_TAB228_PROVA
   (PROVA=1, default quando K contiene 4): al fischio il motore gioca sotto-tick veri finche' segna (arrivoTiro -> ev('gol') ->
   _conta914) e il gol resta in coda, non narrato — lo stesso stato del 96' di k4. PROVA=0 gioca la partita naturale.
   Uso: node tabellino-228.mjs                 (k4 verde + rosso, due browser in parallelo)
        K=1,2,3 MODI=verde,rosso node tabellino-228.mjs   (non regressione: solo misura, esito per partita)
   Esce 0 solo se, per k4, verde coincide e rosso no (quando K contiene 4 e MODI li contiene entrambi). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const KS = (process.env.K || '4').split(',').map(s => +s.trim()).filter(Boolean);
const MODI = (process.env.MODI || 'verde,rosso').split(',').map(s => s.trim()).filter(Boolean);
const PAR = Math.max(1, Math.min(2, +(process.env.PAR || 2)));
const OUT = process.env.OUT || null;
const PROVA = process.env.PROVA == null ? KS.includes(4) : process.env.PROVA === '1';

async function gioca(b, url, k, modo) {
  const t0 = Date.now(); const rec = { k, modo, err: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' PO228-' + k; rec.name = pl.name;
    await page.addInitScript(([s, rosso, prova]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_NO_STILI = 1; /* [giro 67 PO-098] lo scenario e' la partita S12 della 172: con lo stile (centravanti → Finalizzatore) la partita cambia e il caso non si riproduce */ window.__CPM_PRESENT = 1; if (rosso) window.__CPM_NO_TAB228 = true; if (prova) window.__CPM_TAB228_PROVA = true; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, modo === 'rosso', PROVA]); rec.prova = PROVA;
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
      const S = M && M._S;
      return {
        motore: T && T.home && T.away ? { home: T.home.gol | 0, away: T.away.gol | 0 } : null,
        golLog: (S && S._golLog) || null,
        tolti228: (S && S._tolti228) || null,
        fischio: ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => e.ev === 'fine').map(e => ({ min: e.min, minVero: e.minVero, causa: e.causa || null })),
        t216: window.__CPM_T216 ? window.__CPM_T216.txt : null,
        provaEsito: typeof window.__CPM_TAB228_PROVA === 'object' ? window.__CPM_TAB228_PROVA : null,
      };
    }));
    rec.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
    let txt = '';
    for (let i = 0; i < 10; i++) {
      txt = await page.evaluate(() => document.body.innerText);
      if (txt.includes('TABELLINO DELLA GARA')) break;
      await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
      await sleep(2500);
    }
    const L = txt.split('\n').map(s => s.trim()).filter(Boolean);
    const i0 = L.indexOf('TABELLINO DELLA GARA');
    rec.tabellinoGol = i0 < 0 ? null : (() => { const j = L.findIndex((s, idx) => idx > i0 && s === 'Gol'); return j < 0 ? null : { mine: +L[j - 1], loro: +L[j + 1] }; })();
    const s = rec.score, t = rec.tabellinoGol;
    rec.coincide = !!(s && t) && ((t.mine === s.home && t.loro === s.away) || (t.mine === s.away && t.loro === s.home));
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
    console.log(`k${r.k} ${r.modo}: tabellino ${r.tabellinoGol ? r.tabellinoGol.mine + '-' + r.tabellinoGol.loro : '?'} (mio-loro), tabellone ${r.score ? r.score.home + '-' + r.score.away : '?'}, motore ${r.motore ? r.motore.home + '-' + r.motore.away : '?'}, golLog ${JSON.stringify(r.golLog)}, fischio ${JSON.stringify(r.fischio)}, tolti228 ${JSON.stringify(r.tolti228)}, prova ${r.prova ? JSON.stringify(r.provaEsito) : 'no'} -> ${r.coincide ? 'COINCIDE' : 'SCARTO'} ${r.sec}s${r.err ? ' ERR ' + r.err : ''}`);
  }
}));
for (const b of browsers) await b.close(); srv.close();
const v4 = risultati.find(r => r.k === 4 && r.modo === 'verde'), r4 = risultati.find(r => r.k === 4 && r.modo === 'rosso');
if (v4 && r4) {
  const ok = v4.coincide && !r4.coincide && !v4.err && !r4.err && (!PROVA || (v4.provaEsito && (v4.provaEsito.gol > 0 || v4.provaEsito.coda > 0) && r4.provaEsito && (r4.provaEsito.gol > 0 || r4.provaEsito.coda > 0)))/* [12/10] in catena il contatore gol della prova e' rimasto a 0 con un gol in coda (coda 1) e lo scarto 1-0/0-0 visibile nel rosso: la coda e' la prova che il caso e' stato ricreato */;
  console.log(ok ? '✅ tabellino-228 verde (e il rosso si vede)' : '❌ tabellino-228 ROSSO'); process.exit(ok ? 0 : 1);
}
const tutte = risultati.every(r => r.coincide && !r.err);
console.log(tutte ? '✅ tabellino-228: tutte le partite coincidono' : '⚠ tabellino-228: almeno una partita non coincide'); process.exit(tutte ? 0 : 1);
