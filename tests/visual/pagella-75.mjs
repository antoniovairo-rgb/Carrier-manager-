/* [giro 75] GUARDIANO «LA PAGELLA E IL RISULTATO REGISTRATO CONTANO GLI STESSI GOL DELL'EROE».
   Difetto del giro 67 §3: nelle partite k4 · k12 · k13 di quota-190-vivo (salvataggio fixtures/save-190-s12-ovr93.json, autoplay seedato,
   velocita' 4) la pagella del motore dava all'eroe 2 gol e il risultato registrato 1. Causa (registro _golLog del motore): l'eroe segna
   anche in GIOCO FLUIDO (scena:false, chi = HERO); la pagella lo conta, il live lo narrava come gol ambientale e mStats.goals non lo vedeva.
   Qui si rigiocano le tre partite in due bracci:
   - verde: pagella (M.pagelle(), voce eroe) == risultato registrato (__CPM_GOLEROE228) in tutte e tre;
   - rosso (__CPM_NO_PAGELLA75): almeno una delle tre torna a divergere, altrimenti il guardiano guarda a vuoto.
   [giro 94] entrambi i bracci girano con __CPM_NO_C3D2 (vedi addInitScript).
   Uso: K=4,12,13 PAR=2 node pagella-75.mjs  (~14 min con PAR=2). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const KS = (process.env.K || '4,12,13').split(',').map(s => +s.trim()).filter(Boolean);
const PAR = Math.max(1, Math.min(3, +(process.env.PAR || 2)));

async function gioca(b, url, k, rosso) {
  const t0 = Date.now(); const rec = { k, rosso, err: null, errori: [] };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => rec.errori.push(String(e.message).slice(0, 160)));
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' Q190-' + k;/* stesso nome di quota-190-vivo: stessa partita */
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_NO_C3D2 = 1;/* [giro 94] i casi-testimone k12/k13 (gol dell'eroe in gioco fluido) erano rigori calciati dal motore al posto della scena: il D2 del giro 94 li ha tolti e il guardiano restava cieco. Si ricrea quella condizione in ENTRAMBI i bracci: l'invariante pagella = registrato resta misurato */ if (r) window.__CPM_NO_PAGELLA75 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
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
      const E = M && M.pagelle ? (M.pagelle() || []).find(p => p && p.eroe) : null;
      return { pagella: E ? E.gol | 0 : null, fluido: M && M._S && M._S._golLog ? M._S._golLog.filter(g => g && g.chi === M.HERO && !g.scena).length : null, acc75: window.__CPM_PAG75 | 0 };
    }));
    rec.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
    for (let i = 0; i < 6 && rec.registrato == null; i++) {
      rec.registrato = await page.evaluate(() => (typeof window.__CPM_GOLEROE228 === 'number' ? window.__CPM_GOLEROE228 : null));
      if (rec.registrato == null) { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {}); await sleep(2000); }
    }
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  await ctx.close();
  return rec;
}

const srv = await startServer();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const lavori = []; for (const k of KS) for (const r of [false, true]) lavori.push({ k, r });
const ris = []; const browsers = []; for (let i = 0; i < Math.min(PAR, lavori.length); i++) browsers.push(await launchBrowser());
let next = 0;
await Promise.all(browsers.map(async (b) => {
  while (next < lavori.length) {
    const { k, r } = lavori[next++];
    let x = await gioca(b, url, k, r);
    if (x.err || x.registrato == null || x.pagella == null) { console.log(`  k${k} ${r ? 'rosso' : 'verde'}: ${x.err || 'misura incompleta'} — riprovo una volta`); x = await gioca(b, url, k, r); }
    ris.push(x);
    console.log(`k${k} ${r ? 'rosso' : 'verde'}: pagella ${x.pagella} · registrato ${x.registrato} · gol in gioco fluido ${x.fluido} · accreditati ${x.acc75} · ${JSON.stringify(x.score)} · ${x.fine} ${x.sec}s${x.err ? ' ERR ' + x.err : ''}`);
  }
}));
for (const b of browsers) await b.close(); srv.close();

const err = []; const V = ris.filter(x => !x.rosso), R = ris.filter(x => x.rosso);
for (const x of ris) { if (x.err || x.registrato == null || x.pagella == null) err.push(`k${x.k} ${x.rosso ? 'rosso' : 'verde'}: misura non valida (${x.err || 'dato mancante'})`); if (x.errori.length) err.push(`k${x.k}: pageerror ${x.errori.join(' | ')}`); }
for (const x of V) if (x.pagella !== x.registrato) err.push(`k${x.k} verde: pagella ${x.pagella} ≠ registrato ${x.registrato}`);
if (!V.some(x => x.fluido > 0)) err.push('verde: nessuna partita con un gol dell\'eroe in gioco fluido (il caso non e\' esercitato)');
if (!R.some(x => x.pagella !== x.registrato)) err.push('rosso: nessuna divergenza (il guardiano guarda a vuoto)');
if (err.length) { console.error('❌ pagella-75: ' + err.join(' · ')); process.exit(1); }
console.log(`✅ pagella-75 verde (${V.length}/${V.length} partite con pagella = registrato; gol in gioco fluido accreditati) · rosso: ${R.filter(x => x.pagella !== x.registrato).length}/${R.length} divergono`);
