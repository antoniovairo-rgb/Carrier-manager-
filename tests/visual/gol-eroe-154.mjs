/* [giro 154, decisione PO PO-357 «i gol dell'eroe nascono solo negli highlight»] GUARDIANO «L'EROE NON SEGNA NE' FA ASSIST IN GIOCO FLUIDO».
   Difetto B14 del collaudo carriera 177 n.2 («tabellino con piu' gol/assist degli highlight»): il motore faceva segnare l'eroe (e gli
   faceva servire assist) anche fuori dalle sue scene, e quei gol entravano in pagella, voto e risultato registrato (giro 75).
   Per ogni partita vera (salvataggio S12 fixtures/save-190-s12-ovr93.json o save-c177-s5w20, autoplay seedato, velocita' 4, nomi
   diversi = partite diverse) si legge il registro gol del motore (_golLog: min · lato · scena · chi · as · int) e si contano:
     - gol dell'eroe con scena:false (gioco fluido) e assist dell'eroe con scena:false;
     - gol dell'eroe nelle scene, gol dell'eroe nel risultato registrato (__CPM_GOLEROE228), pagella eroe (gol/assist/voto), tabellone.
   Verde: zero gol e zero assist dell'eroe in gioco fluido su N partite valide (N >= NMIN) — dal registro del motore E dal contatore
   del live che accredita il gol fluido (__CPM_PAG75, giro 75) —, gol dell'eroe per partita nella fascia [BMIN, BMAX] (fissata dopo la
   misura, vedi docs/sviluppo/RAPPORTO-giro154.md), e risultato registrato = pagella per gol E assist (il voto viene dalla pagella).
   ⚠️ Il registro _golLog non vede i gol dopo il fischio del motore (S.fischio228): un gol in scena oltre il 90' c'e' nel risultato e
   non nel registro, per questo il confronto e' pagella ↔ registrato e non registro ↔ registrato.
   Rosso (__CPM_NO_G154): almeno un gol o assist dell'eroe in gioco fluido sul campione, altrimenti il guardiano guarda a vuoto.
   «Non giudicato» (campione sotto il minimo) = rosso. Verde e rosso stampati per ultimi.
   Uso: PAR=3 node gol-eroe-154.mjs (campione fisso 10+10 partite, ~35 min) · K=1,2,.. o N=12 K0=12 per altri semi   ·   SOLO=verde|rosso per un braccio solo (misura)   ·   OUT=file.jsonl per le righe. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const SAVES = { s12: JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url))),
  c177: (() => { const d = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url))); return typeof d['cpm-v3'] === 'string' ? JSON.parse(d['cpm-v3']) : d['cpm-v3']; })() };/* dump di localStorage: il salvataggio vero e' la chiave cpm-v3 */
const N = process.env.K ? process.env.K.split(',').filter(Boolean).length : Math.max(1, +(process.env.N || 10));
const NMIN = Math.max(4, Math.ceil(N * 0.75));
const PAR = Math.max(1, Math.min(3, +(process.env.PAR || 2)));
const SOLO = process.env.SOLO || '';
const BMIN = +(process.env.BMIN ?? 0.2), BMAX = +(process.env.BMAX ?? 1.2);/* fascia gol dell'eroe per partita: vedi rapporto giro 154 */
const OUT = process.env.OUT || '';

async function gioca(b, url, k, rosso) {
  const t0 = Date.now(); const key = (k % 2) ? 'c177' : 's12';
  const rec = { k, save: key, rosso, err: null, errori: [] };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => rec.errori.push(String(e.message).slice(0, 160)));
  try {
    const sv = JSON.parse(JSON.stringify(SAVES[key])); const pl = sv.player || sv; pl.name = pl.name + ' G154-' + k;
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G154 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
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
      const H = M ? M.HERO : null;
      const E = M && M.pagelle ? (M.pagelle() || []).find(p => p && p.eroe) : null;
      const log = (M && M._S && M._S._golLog) || null;
      const ev = (window.__CPM_EV && window.__CPM_EV()) || [];
      const chron = ev.filter(e => e && e.ev === 'chronicle').map(e => ({ min: e.min, txt: String(e.txt || '').slice(0, 110) }));
      return { hero: H, log, pagella: E ? { gol: E.gol | 0, assist: E.assist | 0, voto: E.voto } : null, chron,
        acc75: window.__CPM_PAG75 | 0, voto20: window.__CPM_VOTO20 };
    }));
    rec.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
    for (let i = 0; i < 6 && rec.registrato == null; i++) {
      rec.registrato = await page.evaluate(() => { const r = window.__CPM_ENDRESULT20 && window.__CPM_ENDRESULT20(); return r ? { gol: r.goals | 0, assist: r.assists | 0, rating: r.rating } : null; });
      if (rec.registrato == null) { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {}); await sleep(2000); }
    }
    if (rec.log) {
      const L = rec.log; const H = rec.hero;
      rec.golFluido = L.filter(g => g.chi === H && !g.scena).map(g => ({ min: g.min, int: g.int }));
      rec.assFluido = L.filter(g => g.as === H && !g.scena).map(g => ({ min: g.min, chi: g.chi, int: g.int }));
      rec.golScena = L.filter(g => g.chi === H && g.scena).length;
      rec.assScena = L.filter(g => g.as === H && g.scena).length;
      rec.golSquadra = L.filter(g => g.lato === 'home').length;
      rec.racconto = rec.golFluido.map(g => (rec.chron || []).filter(c => Math.abs((c.min | 0) - g.min) <= 1).map(c => c.min + "' " + c.txt));
    }
    delete rec.chron;
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  await ctx.close();
  return rec;
}

const srv = await startServer();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const KS = process.env.K ? process.env.K.split(',').map(x => +x).filter(Boolean) : (process.env.N || process.env.K0 ? Array.from({ length: N }, (_, i) => i + 1 + (+(process.env.K0 || 0))) : [1, 2, 3, 4, 5, 6, 7, 8, 21, 22]);/* campione fisso: k3/k6 (assist fluidi) e k21/k22 (rigori al 90'-91') sono i casi-testimone del rosso */
const lavori = []; for (const k of KS) for (const r of [false, true]) { if (SOLO === 'verde' && r) continue; if (SOLO === 'rosso' && !r) continue; lavori.push({ k, r }); }
const ris = []; const browsers = []; for (let i = 0; i < Math.min(PAR, lavori.length); i++) browsers.push(await launchBrowser());
let next = 0;
await Promise.all(browsers.map(async (b) => {
  while (next < lavori.length) {
    const { k, r } = lavori[next++];
    let x = await gioca(b, url, k, r);
    if (x.err || !x.log || !x.registrato) { console.log(`  k${k} ${r ? 'rosso' : 'verde'}: ${x.err || 'misura incompleta'} — riprovo una volta`); x = await gioca(b, url, k, r); }
    ris.push(x); if (OUT) fs.appendFileSync(OUT, JSON.stringify(x) + '\n');
    console.log(`k${k} ${x.save} ${r ? 'rosso' : 'verde'}: ${JSON.stringify(x.score)} · eroe fluido gol ${x.golFluido ? x.golFluido.length : '?'}${x.golFluido && x.golFluido.length ? ' ' + JSON.stringify(x.golFluido) : ''} · assist fluido ${x.assFluido ? x.assFluido.length : '?'} · scena gol ${x.golScena} ass ${x.assScena} · registrato ${JSON.stringify(x.registrato)} · pagella ${JSON.stringify(x.pagella)} · ${x.fine} ${x.sec}s${x.err ? ' ERR ' + x.err : ''}`);
    if (x.racconto && x.racconto.some(a => a.length)) console.log('    cronaca: ' + JSON.stringify(x.racconto));
  }
}));
for (const b of browsers) await b.close(); srv.close();

const valida = (x) => !x.err && x.log && x.registrato && x.pagella && (x.fine === 'ended' || x.fine === 'ceremony');
const V = ris.filter(x => !x.rosso && valida(x)), R = ris.filter(x => x.rosso && valida(x));
const sum = (A, f) => A.reduce((s, x) => s + f(x), 0);
const righe = []; const err = [];
for (const x of ris) { if (!valida(x)) err.push(`k${x.k} ${x.rosso ? 'rosso' : 'verde'}: misura non valida (${x.err || x.fine || 'dato mancante'})`); if (x.errori.length) err.push(`k${x.k}: pageerror ${x.errori.join(' | ')}`); }
if (SOLO !== 'rosso') {
  const gf = sum(V, x => x.golFluido.length), af = sum(V, x => x.assFluido.length), gs = sum(V, x => x.golScena);
  const media = V.length ? sum(V, x => x.registrato.gol) / V.length : NaN;
  if (V.length < NMIN) err.push(`verde NON GIUDICATO: ${V.length} partite valide su ${N} (minimo ${NMIN})`);
  if (gf > 0) err.push(`verde: ${gf} gol dell'eroe in gioco fluido`);
  if (af > 0) err.push(`verde: ${af} assist dell'eroe in gioco fluido`);
  for (const x of V) if (x.registrato.gol !== x.pagella.gol || x.registrato.assist !== x.pagella.assist) err.push(`k${x.k} verde: registrato ${x.registrato.gol}+${x.registrato.assist} ≠ pagella ${x.pagella.gol}+${x.pagella.assist}`);
  for (const x of V) if (x.acc75 > 0) err.push(`k${x.k} verde: ${x.acc75} gol dell'eroe accreditati dal live come gioco fluido (giro 75)`);
  if (V.length && !(media >= BMIN && media <= BMAX)) err.push(`verde: gol dell'eroe per partita ${media.toFixed(2)} fuori dalla fascia [${BMIN}, ${BMAX}]`);
  righe.push(`VERDE: ${V.length}/${N} partite valide · gol eroe fluido ${gf} · assist eroe fluido ${af} · gol eroe in scena ${gs} · gol eroe registrati per partita ${Number.isFinite(media) ? media.toFixed(2) : '—'} (fascia ${BMIN}-${BMAX}) · partite con gol dell'eroe ${V.filter(x => x.registrato.gol > 0).length}/${V.length}`);
}
if (SOLO !== 'verde') {
  const gf = sum(R, x => x.golFluido.length), af = sum(R, x => x.assFluido.length);
  if (R.length < NMIN) err.push(`rosso NON GIUDICATO: ${R.length} partite valide su ${N} (minimo ${NMIN})`);
  if (!SOLO && gf + af === 0) err.push('rosso: nessun gol/assist dell\'eroe in gioco fluido — il guardiano guarda a vuoto');
  righe.push(`ROSSO (__CPM_NO_G154): ${R.length}/${N} partite valide · gol eroe fluido ${gf} · assist eroe fluido ${af} · gol eroe registrati per partita ${R.length ? (sum(R, x => x.registrato.gol) / R.length).toFixed(2) : '—'}`);
}
for (const r of righe) console.log(r);
if (err.length) { console.error('❌ gol-eroe-154: ' + err.join(' · ')); process.exit(1); }
console.log('✅ gol-eroe-154' + (SOLO ? ' (solo ' + SOLO + ', misura)' : ' verde e rosso'));
