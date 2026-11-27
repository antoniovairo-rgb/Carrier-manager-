/* [giro 425 PO-658] GUARDIANO «NELLE GOLEADE GIOCATE DAL VIVO LA PAGELLA DELL'EROE E' COERENTE COL RISULTATO».
   Residuo di PO-190 (giro 75): pagella dell'eroe incoerente col risultato nelle goleade. Il giro 379 l'ha misurato sulle SIMULATE
   («Simula»); qui si misurano le partite GIOCATE (LiveMatch + motore del possesso, autoplay seedato, GLB acceso), che il 379 lascia fuori.
   Banco: fixtures/save-190-s12-ovr93.json (S12, OVR 93, club di prestigio 96: produce goleade). Ogni partita ha un nome diverso
   dell'eroe → seme diverso (il seme di partita nasce da avversario+stagione+settimana+nome, CLAUDE.md 7.496).

   REGOLE (scritte PRIMA della misura; soglie fisse):
   L1 pagella del motore (gol, assist dell'eroe) == risultato registrato (_buildEndResult: goals, assists);
   L2 voto registrato == voto della pagella (arrotondato a 0,1);
   L3 tabellino del motore (gol casa/ospiti) == punteggio registrato, nel verso giusto;
   L4 goleada (scarto >= 3) vinta, eroe in campo fino alla fine (matchStatus starter) → voto >= 6,0;
   L5 goleada vinta con doppietta o piu' dell'eroe → voto >= 7,0;
   L6 goleada persa senza gol ne' assist dell'eroe → voto <= 6,5;
   L7 almeno MIN_GOL goleade giudicate nel braccio verde, altrimenti NON GIUDICATO (= rosso).
   Braccio rosso (__CPM_NO_G425): riarma i due difetti storici della famiglia (__CPM_NO_PAGELLA75: il gol dell'eroe in gioco fluido
   non arriva al registrato; __CPM_NO_VOTO20: il voto registrato torna alla vecchia formula delle scene) e ricrea il gol dell'eroe in
   gioco fluido (__CPM_NO_G154, come pagella-75): almeno una partita deve violare L1 o L2, altrimenti il guardiano guarda a vuoto.
   Uso: npm run pagella-425 (6 semi + 2 rossi, PAR=4, ~20 min) · censimento: N=24 MISURA=1 node pagella-425.mjs (solo verde)
   GLB acceso per default (GLB=0 lo spegne): a 2× una partita chiude in ~6-10 min anche coi corpi (RAPPORTO-giro425 §4) · FOTO=1 salva la schermata di fine partita
   della prima goleada in out/pagella-425/. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const N = Math.max(1, +(process.env.N || 12));
const NR = Math.max(1, +(process.env.NR || 2));
const PAR = Math.max(1, Math.min(4, +(process.env.PAR || 4)));
const MIN_GOL = +(process.env.MIN_GOL || 3);
const MISURA = process.env.MISURA === '1';
const FOTO = process.env.FOTO === '1';
/* semi del guardiano: sei partite che nel censimento (24 semi, out/pagella-425/censimento.log) sono finite in goleada */
const SEMI = (process.env.SEMI || (process.env.N ? '' : '1,6,10,11,14,16')).split(',').map(s => s.trim()).filter(Boolean);
const GLB = process.env.GLB !== '0';/* corpi CGTrader accesi (regola dei giri); GLB=0 li spegne */
const TMAX = +(process.env.TMAX || 900000);
const OPP = [['bou', 'FC Dorset'], ['swn', 'FC Swans'], ['wat', 'FC Hornets'], ['cry', 'FC Selhurst'], ['eve', 'FC Goodison'], ['bre', 'FC Griffin']];
const OUT = new URL('./out/pagella-425/', import.meta.url); fs.mkdirSync(OUT, { recursive: true });

async function gioca(b, url, k, rosso) {
  const t0 = Date.now(); const rec = { k, rosso, err: null, errori: [] };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => rec.errori.push(String(e.message).slice(0, 160)));
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' G425-' + k;
    /* avversario e campo variano col seme: le sei ultime della classifica del salvataggio (goleade piu' probabili), casa/fuori alternati */
    { const o = OPP[k % OPP.length]; const c = pl.calendar.find(x => !x.played); if (c && !process.env.STESSO) { c.opponentId = o[0]; c.opponentName = o[1]; c.isHome = k % 2 === 0;
      /* le guardie anti-loop di getThisWeekMatchday rifiutano un avversario gia' incontrato in casa/fuori: nella COPIA si tolgono i precedenti */
      pl.calendar = pl.calendar.filter(x => x === c || x.opponentId !== o[0]); pl.matchHistory = (pl.matchHistory || []).filter(h => h.opponent !== o[1]); } rec.opp = (c && c.opponentName) + (c && c.isHome ? ' (casa)' : ' (fuori)'); }
    await page.addInitScript(([s, r, g]) => {
      window.__CPM_GLB = g; window.__CPM_REC = true; window.__CPM_PRESENT = 1;
      if (r) { window.__CPM_NO_G425 = 1; window.__CPM_NO_PAGELLA75 = 1; window.__CPM_NO_VOTO20 = 1; window.__CPM_NO_G154 = 1; window.__CPM_NO_C3D2 = 1; }
      localStorage.setItem('cpm-match-speed', '2');/* MATCH_SPEEDS = [1, 1.5, 2]: un 4 viene riscritto a 1 */ localStorage.setItem('cpm-v3', JSON.stringify(s));
    }, [sv, rosso, GLB]);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), 4250 + k);
    const tp = Date.now(); let ph = '';
    while (Date.now() - tp < TMAX) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; if (process.env.TRACCIA && ((Date.now() - tp) / 1000 | 0) % 30 === 0) console.log(`   k${k} ${((Date.now() - tp) / 1000) | 0}s fase ${ph} ${JSON.stringify(await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE()))}`); await sleep(700); }
    rec.fine = ph; await sleep(2500);
    Object.assign(rec, await page.evaluate(() => {
      const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ();
      const E = M && M.pagelle ? (M.pagelle() || []).find(p => p && p.eroe) : null;
      const T = M && M.tabellino ? M.tabellino() : null;
      const R = window.__CPM_ENDRESULT20 ? window.__CPM_ENDRESULT20() : null;
      return {
        pag: E ? { gol: E.gol | 0, assist: E.assist | 0, voto: E.voto, rossi: E.rossi | 0, amm: E.amm | 0 } : null,
        tab: T ? { home: T.home.gol | 0, away: T.away.gol | 0 } : null,
        reg: R ? { goals: R.goals | 0, assists: R.assists | 0, rating: R.rating, status: R.matchStatus, hs: R.homeScore, as: R.awayScore, isHome: R.isHome } : null,
        fluido: M && M._S && M._S._golLog ? M._S._golLog.filter(g => g && g.chi === M.HERO && !g.scena).length : null,
      };
    }));
    if (FOTO && rec.reg && Math.abs(rec.reg.hs - rec.reg.as) >= 3) {
      /* la foto e' la schermata di fine partita con il voto dell'eroe: si salta la premiazione, se c'e' */
      try { await page.getByText('Salta premiazione', { exact: false }).first().click({ timeout: 3000 }); await sleep(3500); } catch (e) {}
      /* il riepilogo ha quattro pagine (risultato, …): si avanza fino a quella con la pagella dell'eroe */
      for (let i = 0; i < 4; i++) { const t = await page.evaluate(() => document.body.innerText); if (/pagell|voto/i.test(t) && !/1\/4/.test(t)) break; try { await page.getByText('AVANTI', { exact: false }).first().click({ timeout: 3000 }); await sleep(1500); } catch (e) { break; } }
      const f = new URL(`goleada-k${k}-${rosso ? 'rosso' : 'verde'}.png`, OUT); await page.screenshot({ path: f.pathname, fullPage: true }); rec.foto = f.pathname;
    }
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  await ctx.close();
  return rec;
}

/* il verso: in questa build il motore gira con la squadra dell'eroe come «home» del motore? Si giudica su entrambe le letture e si
   accetta solo quella coerente col registrato (L3 confronta la coppia, non un lato). */
function giudica(x) {
  const v = [];
  if (!x.pag || !x.reg || !x.tab) { v.push('NON GIUDICATO: dato mancante'); return v; }
  if (x.fine !== 'ended' && x.fine !== 'ceremony') { v.push(`NON GIUDICATO: partita non finita (fase ${x.fine})`); return v; }
  if (x.pag.gol !== x.reg.goals) v.push(`L1 gol pagella ${x.pag.gol} ≠ registrato ${x.reg.goals}`);
  if (x.pag.assist !== x.reg.assists) v.push(`L1 assist pagella ${x.pag.assist} ≠ registrato ${x.reg.assists}`);
  const vp = Math.round(x.pag.voto * 10) / 10;
  if (Math.abs(vp - x.reg.rating) > 0.051) v.push(`L2 voto pagella ${vp} ≠ registrato ${x.reg.rating}`);
  const okDir = (x.tab.home === x.reg.hs && x.tab.away === x.reg.as) || (x.tab.home === x.reg.as && x.tab.away === x.reg.hs);
  if (!okDir) v.push(`L3 tabellino ${x.tab.home}-${x.tab.away} ≠ punteggio ${x.reg.hs}-${x.reg.as}`);
  const sc = x.reg.hs - x.reg.as; /* hs = gol della squadra dell'eroe nel risultato registrato (homeScore = _sc.home = noi) */
  if (Math.abs(sc) >= 3) {
    if (sc > 0 && x.reg.status === 'starter' && x.reg.rating < 6.0) v.push(`L4 goleada vinta ${x.reg.hs}-${x.reg.as}, voto ${x.reg.rating} < 6,0`);
    if (sc > 0 && x.reg.goals >= 2 && x.reg.rating < 7.0) v.push(`L5 goleada vinta con ${x.reg.goals} gol, voto ${x.reg.rating} < 7,0`);
    if (sc < 0 && x.reg.goals === 0 && x.reg.assists === 0 && x.reg.rating > 6.5) v.push(`L6 goleada persa senza contributo, voto ${x.reg.rating} > 6,5`);
  }
  return v;
}

const srv = await startServer();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const ks = SEMI.length ? SEMI.map(Number) : Array.from({ length: N }, (_, i) => i + 1);
const lavori = ks.map(k => ({ k, r: false }));
if (!MISURA) for (const k of ks.slice(0, NR)) lavori.push({ k, r: true });
const ris = []; const browsers = []; for (let i = 0; i < Math.min(PAR, lavori.length); i++) browsers.push(await launchBrowser());
let next = 0;
await Promise.all(browsers.map(async (b) => {
  while (next < lavori.length) {
    const { k, r } = lavori[next++];
    let x = await gioca(b, url, k, r);
    if (x.err || !x.reg || !x.pag || (x.fine !== 'ended' && x.fine !== 'ceremony')) { console.log(`  k${k} ${r ? 'rosso' : 'verde'}: ${x.err || 'misura incompleta'} — riprovo una volta`); x = await gioca(b, url, k, r); }
    x.viol = giudica(x); ris.push(x);
    const p = x.pag || {}, g = x.reg || {};
    console.log(`k${k} ${r ? 'rosso' : 'verde'} ${x.opp}: ${g.hs}-${g.as} ${g.status || '?'} · pagella ${p.gol}g ${p.assist}a voto ${p.voto} (rossi ${p.rossi}) · registrato ${g.goals}g ${g.assists}a voto ${g.rating} · tab ${x.tab ? x.tab.home + '-' + x.tab.away : '?'} · fluido ${x.fluido} · ${x.fine} ${x.sec}s${x.viol.length ? ' ✗ ' + x.viol.join(' | ') : ''}${x.err ? ' ERR ' + x.err : ''}`);
  }
}));
for (const b of browsers) await b.close(); srv.close();
fs.writeFileSync(new URL('esiti.json', OUT), JSON.stringify(ris, null, 1));

const V = ris.filter(x => !x.rosso), R = ris.filter(x => x.rosso);
const gole = V.filter(x => x.reg && Math.abs(x.reg.hs - x.reg.as) >= 3);
const err = [];
for (const x of ris) if (x.errori.length) err.push(`k${x.k} ${x.rosso ? 'rosso' : 'verde'}: pageerror ${x.errori.slice(0, 2).join(' | ')}`);
for (const x of V) if (x.viol.length) err.push(`k${x.k} verde: ${x.viol.join(' | ')}`);
if (gole.length < MIN_GOL) err.push(`L7 NON GIUDICATO: ${gole.length} goleade nel verde (< ${MIN_GOL})`);
const rosseViste = R.filter(x => x.viol.some(s => /^L[12] /.test(s))).length;
if (!MISURA && !rosseViste) err.push('rosso: nessuna violazione L1/L2 (il guardiano guarda a vuoto)');
console.log(`riepilogo: verde ${V.length} partite · goleade ${gole.length} (${gole.map(x => x.reg.hs + '-' + x.reg.as + ' v' + x.reg.rating).join(', ')}) · violazioni verde ${V.filter(x => x.viol.length).length}${MISURA ? '' : ` · rosso ${rosseViste}/${R.length} violano L1/L2`}`);
if (err.length) { console.error('❌ pagella-425: ' + err.join(' · ')); process.exit(1); }
console.log(`✅ pagella-425 verde (${V.length} partite giocate, ${gole.length} goleade, 0 violazioni L1-L6)${MISURA ? '' : ` · rosso visto (${rosseViste}/${R.length})`}`);
