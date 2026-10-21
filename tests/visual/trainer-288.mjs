#!/usr/bin/env node
/* [PO-288 · giro 83] GUARDIANO «IL PIANO DEL TRAINER SI LEGGE» — non-gate, carriera.
 * Ufficio › Staff privato, personal trainer con livello >= 1. Sui pulsanti-piano:
 *   V  ogni pulsante mostra il valore uguale a player.stats (e «generale» il giudizio calcOvr)
 *   R  le settimane per +1 coincidono con Math.round(1/trainerQuota281(...)) della pagina (stessa funzione del motore); «generale» mostra +10/15/20%
 *   C  «consigliato» compare su 1-2 caratteristiche e coincide con la regola: peso OVR x (99 - valore), solo valori < 85, primi 2
 *   L  a 400 px nessun overflow orizzontale e i pulsanti vanno a capo (piu' di una riga)
 *   B  il pulsante attivo e il testo trainerFx281 restano
 * Rosso: __CPM_NO_PT288 = la schermata di 7.999.176 (nessun valore/resa/consigliato) -> V, R, C devono cadere.
 * Uso: node trainer-288.mjs   ·   CPM_PROVA_ROSSO=1 node trainer-288.mjs   ·   CPM_FOTO=<cartella> per le foto (desktop + 400 px) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const STATS = { 'velocità': 80, tecnica: 66, fisico: 58, 'mentalità': 70, tiro: 74, passaggio: 62, dribbling: 78, posizionamento: 71 };
const BASE = { name: 'Sim Trainer', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true, club: CLUB, stats: STATS,
  form: 70, morale: 72, fatigue: 10, popularity: 20, coachTrust: 60, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, bankBalance: 5000000,
  perkTrainer: true, perkTrainerLv: 2, perkTrainerFocus: 'tiro' };
const ATTR = ['velocità', 'tecnica', 'fisico', 'mentalità', 'tiro', 'passaggio', 'dribbling', 'posizionamento'];
const PESI = { tiro: 2.5, tecnica: 2, 'velocità': 1.5, dribbling: 1.5, posizionamento: 1.5, 'mentalità': 1, fisico: 1, passaggio: 1 };/* copia di calcOvr: se la formula cambia, questo guardiano lo dice */
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

async function giro(rosso, w, foto) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_PT288 = true;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s })); }, { s: BASE, rosso });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(600);
  await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(900);
  await page.waitForSelector('[data-cpm="trainer281-piano"]', { timeout: 15000 });
  const r = await page.evaluate((ATTR) => {
    const P = window.__CPM_CAREER.snapshot(), o = { stats: P.stats, attr: {} };
    const piano = document.querySelector('[data-cpm="trainer281-piano"]');
    const txt = (sel) => { const e = document.querySelector(sel); return e ? e.textContent.trim() : null; };
    for (const a of ATTR) { const val = txt(`[data-cpm="trainer288-val-${a}"]`), resa = txt(`[data-cpm="trainer288-resa-${a}"]`);
      const q = trainerQuota281(P, P.stats[a]);
      o.attr[a] = { val, resa, cons: !!document.querySelector(`[data-cpm="trainer288-cons-${a}"]`), attesoSett: q > 0 ? Math.round(1 / q) : null }; }
    o.gen = { val: txt('[data-cpm="trainer288-val-generale"]'), resa: txt('[data-cpm="trainer288-resa-generale"]'), ovr: calcOvr(P.stats) };
    const att = piano.querySelector('[data-cpm="trainer281-tiro"]'); o.attivoTiro = att ? getComputedStyle(att).backgroundColor : null;
    const gen = piano.querySelector('[data-cpm="trainer281-generale"]'); o.generaleBg = gen ? getComputedStyle(gen).backgroundColor : null;
    o.fx = trainerFx281(P, P.perkTrainerLv);
    o.fxInPagina = document.body.innerText.includes(o.fx);
    const bt = [...piano.querySelectorAll('button')]; o.nBtn = bt.length; o.righe = new Set(bt.map(b => Math.round(b.getBoundingClientRect().top))).size;
    o.overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    o.sbordo = bt.filter(b => b.getBoundingClientRect().right > window.innerWidth + 1).length;
    return o; }, ATTR);
  if (foto) { const el = await page.$('[data-cpm="trainer281-piano"]'); if (el) await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await sleep(300); await page.screenshot({ path: foto }); }
  await ctx.close();
  // attesi indipendenti dalla pagina
  const att = ATTR.filter(a => r.stats[a] < 85).map(a => ({ a, s: PESI[a] * (99 - r.stats[a]) })).sort((x, y) => y.s - x.s || ATTR.indexOf(x.a) - ATTR.indexOf(y.a)).slice(0, 2).map(x => x.a);
  const cons = ATTR.filter(a => r.attr[a].cons);
  const num = (t) => t ? (t.match(/\d+/g) || []).map(Number) : [];
  const ok = {
    V: ATTR.every(a => r.attr[a].val && r.attr[a].val.includes(a) && num(r.attr[a].val).pop() === r.stats[a]) && !!r.gen.val && num(r.gen.val).pop() === r.gen.ovr,
    R: ATTR.every(a => r.attr[a].resa && r.attr[a].attesoSett != null && num(r.attr[a].resa).pop() === r.attr[a].attesoSett) && !!r.gen.resa && num(r.gen.resa)[0] === 15,
    C: cons.length >= 1 && cons.length <= 2 && JSON.stringify(cons.slice().sort()) === JSON.stringify(att.slice().sort()),
    L: r.overflowX <= 0 && r.sbordo === 0 && (w > 500 || r.righe > 1),
    B: r.attivoTiro !== r.generaleBg && r.fxInPagina && r.nBtn === 9,
  };
  return { r: { cons, att, righe: r.righe, valori: Object.fromEntries(ATTR.map(a => [a, `${r.attr[a].val}|${r.attr[a].resa}`])), gen: `${r.gen.val}|${r.gen.resa}` }, ok, err };
}

let exitCode = 0;
const foto = process.env.CPM_FOTO;
const v = await giro(false, 400, foto && `${foto}/po288-dopo-telefono.png`);
const vd = await giro(false, 1300, foto && `${foto}/po288-dopo.png`);
console.log('VERDE', JSON.stringify(vd.r));
for (const [n, x] of [['400px', v], ['1300px', vd]]) { for (const k of Object.keys(x.ok)) console.log(`  ${n} ${x.ok[k] ? '✅' : '❌'} ${k}`); if (x.err.length) console.log('  pageerror:', x.err.slice(0, 3).join(' | ')); if (!Object.values(x.ok).every(Boolean) || x.err.length) exitCode = 1; }
const x = await giro(true, 1300, foto && `${foto}/po288-prima.png`);
const cadute = ['V', 'R', 'C'].filter(k => !x.ok[k]);
console.log(`ROSSO __CPM_NO_PT288 → cadono ${cadute.join(',') || 'nessuno'} ${cadute.length === 3 ? '✅' : '❌'} · B resta ${x.ok.B ? 'verde' : 'rosso'}`);
if (cadute.length !== 3) exitCode = 1;
console.log(exitCode ? 'TRAINER-288: ❌ ROSSO' : 'TRAINER-288: ✅ VERDE');
await browser.close(); srv.close(); process.exit(exitCode);
