#!/usr/bin/env node
/* [PO-281 · giro 70, «Pacchetto consigliato»] GUARDIANO ACQUISTI E INVESTIMENTI — non-gate, carriera.
 * Sei controlli, ognuno sulle funzioni VERE della pagina (handler di __CPM_CAREER dove esistono), ognuno col suo rosso:
 *   T1 trainer   piano mirato: +1 sull'attributo scelto in 76 settimane (rosso __CPM_NO_TRAINER281 → 0)
 *   T2 prep      preparatore atletico: migration nutri/fisio, rientro −1/−2 settimane, fatica nelle gare ravvicinate (rosso __CPM_NO_PREP281)
 *   T3 mental    niente morale, conseguenze dei bivi «tensione» ridotte, pressione dal vivo ridotta (rosso __CPM_NO_MENTAL281)
 *   T4 invest    chiusura unica: registro con `fonte`, notizia di stampa, importi identici alle formule di prima; rischio in pagina (rosso __CPM_NO_INV281)
 *   T5 beni      reazioni nel tempo dal chokepoint weeklyStaffRel (rosso __CPM_NO_BENI281)
 *   T6 vita      vita_auto/vita_casa leggono bankBalance (rosso __CPM_NO_VITA281)
 * Uso: node acquisti-281.mjs            → verde (esce 0 se 6/6)
 *      CPM_PROVA_ROSSO=1 node acquisti-281.mjs → in piu' accende un rosso alla volta e pretende che il SUO controllo cada. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const BASE = { name: 'Sim Acquisti', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, popularity: 20, coachTrust: 60, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, bankBalance: 5000000,
  perkFisio: true, perkFisioLv: 2 /* per la migration: deve ritrovarlo nel preparatore */ };
const SW = ['TRAINER', 'PREP', 'MENTAL', 'INV', 'BENI', 'VITA'];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

async function giro(rosso) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window['__CPM_NO_' + rosso + '281'] = true;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s })); }, { s: BASE, rosso });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  const r = await page.evaluate(() => {
    const C = window.__CPM_CAREER, P = C.snapshot(), o = {};
    // T1 — 76 settimane di sola crescita del trainer (sessioni gia' fatte: niente auto-allenamento a sporcare)
    { let st = { ...P.stats }; const p0 = { ...P, perkTrainer: true, perkTrainerLv: 3, perkTrainerFocus: 'tiro', sessionsThisWeek: 3, age: 20 };
      for (let i = 0; i < 76; i++) { const p = { ...p0, stats: st, season: 2 + Math.floor(i / 38), week: 1 + (i % 38) }; const g = C.weeklyGrowthFields(p, { stats: st }); st = g.stats; }
      o.T1 = { tiroDa: P.stats.tiro, tiroA: st.tiro, altri: Object.keys(st).filter(k => k !== 'tiro' && st[k] !== P.stats[k]).length }; }
    // T2 — migration + rientro + gare ravvicinate
    { const mig = { nutri: !!P.perkNutrition, lv: P.perkNutritionLv || null, fisio: !!P.perkFisio };
      const righe = STAFF24.map(d => d.l);
      const inf = (lv) => { let n = 0, w = 0; for (let s = 1; s < 3000 && n < 300; s++) { const x = C.simInjuryRoll({ ...P, injured: false, perkFisio: false, perkNutrition: lv > 0, perkNutritionLv: lv, fatigue: 90 }, s * 7919); if (x && x.injured) { n++; w += x.injuryWeeks; } } return n ? Math.round(w / n * 100) / 100 : null; };
      const cal = [{ week: 5, matchday: 1 }, { week: 5, matchday: 2, type: 'cup' }];
      o.T2 = { mig, righe, settMedie0: inf(0), settMedie3: inf(3), faticaRavv3: prepFatica281({ ...P, week: 5, calendar: cal, perkNutrition: true, perkNutritionLv: 3 }, 40, 50), faticaSingola3: prepFatica281({ ...P, week: 5, calendar: [cal[0]], perkNutrition: true, perkNutritionLv: 3 }, 40, 50) }; }
    // T3 — morale, bivi di tensione, pressione dal vivo
    { const mo = (lv) => C.weeklyGrowthFields({ ...P, perkMental: lv > 0, perkMentalLv: lv, sessionsThisWeek: 3, morale: 70 }, { morale: 70 }).morale;
      let neg0 = 0, neg3 = 0, nT = 0; const pm = { ...P, perkMental: true, perkMentalLv: 3 };
      (WEEKLY_IMPULSES || []).filter(e => e && e.cat === 'tensione').forEach(e => (e.choices || []).forEach(c => { const ef = c.ef || {}; const ef3 = mentalTensione281(pm, 'tensione', ef);
        ['morale', 'form', 'popularity', 'coachTrust', 'chem'].forEach(k => { if (ef[k] < 0) { neg0 += ef[k]; neg3 += ef3[k]; nT++; } }); }));
      o.T3 = { morale0: mo(0), morale3: mo(3), negTensione0: Math.round(neg0), negTensione3: Math.round(neg3), nT, pressione3: mentalPressione281(pm, -0.03, true), pressioneLeggera: mentalPressione281(pm, -0.03, false) }; }
    // T4 — chiusura unica
    { const prev = { ...P, season: 2, investmentPending: true, investimenti223: [{ amt: 28000, prof: 'bilanciato', s: 2, w: 10 }, { amt: 20000, prof: 'rischioso', s: 2, w: 14 }], invest24: { prof: 'rischioso', amt: 100000, s: 2 }, investHist24: [], stampa281: [] };
      const ret = { ...prev, season: 3, bankBalance: 1000000, log: [] };
      const out = C.chiudiInvestimenti(ret, prev);
      const atteso = 1000000 + invEsiti223(prev).reduce((a, e) => a + e.ret, 0) + 100000 + Math.round(100000 * investRate24(prev, 2, 'rischioso'));
      o.T4 = { bank: out.bankBalance, atteso, fonti: (out.investHist24 || []).map(h => h.fonte || '-'), notizie: (out.stampa281 || []).length, pendente: !!out.investmentPending, iv: out.invest24,
        rischioF3: ['prudente', 'bilanciato', 'rischioso'].map(k => rischioTesto281(rischioF3_281(k))) }; }
    // T5 — reazioni dei beni in 76 settimane
    { let p = { ...P, beni24: ['casa', 'auto', 'barca', 'fondazione'], stampa281: [], popularity: 50, coachTrust: 60, teamChemistry: 60, matchHistory: [{ won: false, drew: false }] }, n = 0, dP = 0, dT = 0;
      for (let i = 0; i < 76; i++) { const q = { ...p, season: 2 + Math.floor(i / 38), week: 1 + (i % 38) }; const x = C.weeklyStaffRel(q); const b = (x.stampa281 || []).length - (q.stampa281 || []).length;
        if (b > 0) { n++; dP += (x.popularity != null ? x.popularity - q.popularity : 0); } p = { ...q, stampa281: x.stampa281 || q.stampa281 }; }
      const ultima = (p.stampa281 || []).slice(-1)[0] || null; o.T5 = { reazioni: n, dPop: dP, ultima: ultima && (ultima.headline + ' — ' + ultima.body) }; }
    // T6 — eventi di vita
    { const e = VITA_EVENTS.filter(x => x.id === 'vita_auto' || x.id === 'vita_casa');
      o.T6 = { cond: e.map(x => !!x.cond({ bankBalance: 5000000, season: 3, week: 5 })), conto: vitaConto281({ bankBalance: 100000, teamChemistry: 60 }, { bank: -45000, morale: 10 }) }; }
    return o;
  });
  // T4 bis — il rischio si legge sulla scelta vera dell'impulso (pop-up aperto col varco di collaudo)
  r.T4.rischioImpulso = null;
  try { await page.evaluate(() => window.__CPM_CAREER.apriImpulso('wi_ristorante_socio')); await sleep(700);
    r.T4.rischioImpulso = await page.evaluate(() => { const el = document.querySelector('[data-cpm="rischio281-impulso"]'); return el ? el.textContent.trim() : null; });
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await ctx.close();
  const ok = {
    T1: r.T1.tiroA - r.T1.tiroDa >= 5 && r.T1.altri === 0,
    T2: r.T2.mig.nutri && r.T2.mig.lv === 2 && !r.T2.mig.fisio && r.T2.righe.length === 3 && r.T2.righe.includes('Preparatore atletico')
      && r.T2.settMedie0 - r.T2.settMedie3 >= 0.8 && r.T2.faticaRavv3 === 45 && r.T2.faticaSingola3 === 50,
    T3: r.T3.morale3 === r.T3.morale0 && r.T3.nT > 0 && r.T3.negTensione3 > r.T3.negTensione0 * 0.6 && r.T3.pressione3 > -0.02 && r.T3.pressioneLeggera === -0.03,
    T4: r.T4.bank === r.T4.atteso && r.T4.fonti.filter(f => f === 'impulso').length === 2 && r.T4.fonti.includes('ufficio') && r.T4.notizie === 3 && !r.T4.pendente && !r.T4.iv && !!r.T4.rischioImpulso,
    T5: r.T5.reazioni >= 6,
    T6: r.T6.cond.every(Boolean) && r.T6.conto.bankBalance === 55000,
  };
  return { r, ok, err };
}

let exitCode = 0;
const v = await giro(null);
console.log('VERDE', JSON.stringify(v.r, null, 0));
for (const k of Object.keys(v.ok)) console.log(`  ${v.ok[k] ? '✅' : '❌'} ${k}`);
if (v.err.length) console.log('  pageerror:', v.err.slice(0, 3).join(' | '));
if (!Object.values(v.ok).every(Boolean) || v.err.length) exitCode = 1;
if (process.env.CPM_PROVA_ROSSO) {
  const MAP = { TRAINER: 'T1', PREP: 'T2', MENTAL: 'T3', INV: 'T4', BENI: 'T5', VITA: 'T6' };
  for (const s of SW) { const x = await giro(s); const caduto = !x.ok[MAP[s]];
    console.log(`ROSSO __CPM_NO_${s}281 → ${MAP[s]} ${caduto ? 'cade ✅' : 'resta verde ❌'} · altri verdi: ${Object.keys(x.ok).filter(k => k !== MAP[s] && x.ok[k]).length}/5 · ${JSON.stringify(x.r[MAP[s]])}`);
    if (!caduto) exitCode = 1; }
}
console.log(exitCode ? 'ACQUISTI-281: ❌ ROSSO' : 'ACQUISTI-281: ✅ VERDE');
await browser.close(); srv.close(); process.exit(exitCode);
