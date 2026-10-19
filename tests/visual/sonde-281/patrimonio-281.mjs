#!/usr/bin/env node
/* [PO-281 · giro 59, SOLA MISURA — zona G ferma] COSA FA DAVVERO IL PATRIMONIO SU UNA CARRIERA.
 * Stessa carriera (S2 W1, pro, 5M€ sul conto per non far scattare la sospensione a fondi finiti), stesso seme di Math.random
 * (mulberry32 iniettato prima del caricamento), due stagioni sugli handler VERI di window.__CPM_CAREER (step/startNewSeason,
 * come career-sim-test). Un braccio per acquisto, contro il braccio «base». Misura per settimana morale/fatica/forma/infortunio,
 * a fine corsa OVR, somma attributi, popolarita', fiducia del mister, conto, voto medio, eredita' (legacyPatrimonio24).
 * Non e' un guardiano: non giudica, stampa (e scrive out/patrimonio-281.json).
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node sonde-281/patrimonio-281.mjs   (CPM_SEEDS=3 CPM_PAR=4 CPM_ARMS=base,fisio3) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../lib/harness.mjs';
import fs from 'fs';

const SEEDS = +(process.env.CPM_SEEDS || 3), PAR = +(process.env.CPM_PAR || 4);
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const ARMS = {
  base: {},
  base_m40: { morale: 40 },
  mental3_m40: { morale: 40, perkMental: true, perkMentalLv: 3 },
  trainer3: { perkTrainer: true, perkTrainerLv: 3 },
  nutri3: { perkNutrition: true, perkNutritionLv: 3 },
  fisio3: { perkFisio: true, perkFisioLv: 3 },
  mental3: { perkMental: true, perkMentalLv: 3 },
  staff1: { perkTrainer: true, perkNutrition: true, perkFisio: true, perkMental: true },
  accademia: { academy24: { name: 'Accademia Patrimonio', founded: 2, grads: [], tot: 0, paused: false } },
  // beni: i delta una-tantum dell'acquisto (src/18 ~10717: pop +1+3+4+6=+14, fiducia +2-2-3+2=-1) applicati a mano, come farebbe il bottone
  beni: { beni24: ['casa', 'auto', 'barca', 'fondazione'], popularity: 34, coachTrust: 59 },
};
const want = (process.env.CPM_ARMS || Object.keys(ARMS).join(',')).split(',');
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

async function corsa(arm, seed) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 120)));
  const save = { phase: 'career', player: { name: 'Sim Patrimonio', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70,
    tutorialDone: true, club: CLUB, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
    form: 70, morale: 72, fatigue: 10, popularity: 20, coachTrust: 60, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, bankBalance: 5000000, ...ARMS[arm] } };
  await page.addInitScript(({ s, seed }) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1;
    let a = seed >>> 0; Math.random = function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, seed: 1000 + seed * 7919 });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  const w = [], voti = {}; let done = 0, it = 0, inj = 0, wasInj = false, stuck = 0, last = '';
  while (it++ < 500 && done < 2) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); const p = C.snapshot();
      const mh = p.matchHistory || [], lm = mh[mh.length - 1]; return { res, s: p.season, wk: p.week, mo: p.morale, fa: p.fatigue, fo: p.form, inj: !!p.injured, rk: lm ? lm.season + '/' + lm.week + '/' + lm.opponent : null, rt: lm ? lm.rating : null }; });
    if (r.res === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); done++; await sleep(700); await page.evaluate(() => window.__CPM_CAREER.dismiss()); continue; }
    if (String(r.res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
    if (String(r.res).startsWith('error:')) { err.push('step ' + r.res); break; }
    const key = r.s + '/' + r.wk + '/' + r.res; stuck = key === last ? stuck + 1 : 0; last = key; if (stuck > 8) { err.push('blocco ' + key); break; }
    if (r.rk && r.rt != null) voti[r.rk] = +r.rt;
    if (r.res === 'advanced' || r.res === 'simulated') { w.push(r); if (r.inj && !wasInj) inj++; wasInj = r.inj; }
    await sleep(60);
  }
  const fin = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const mh = (p.matchHistory || []).filter(m => m && m.rating != null);
    const st = p.stats || {}; let leg = null; try { leg = legacyPatrimonio24(p); } catch (e) {}
    return { season: p.season, ovr: p.ovr, statSum: Object.values(st).reduce((a, b) => a + (+b || 0), 0), pop: p.popularity, trust: p.coachTrust, bank: p.bankBalance,
      chem: p.teamChemistry, tm: p.totalMatches,
      gol: p.totalGoals, acc: p.academy24 ? p.academy24.tot : 0, accLog: (p.log || []).filter(l => /Accademia|Investimento/.test(l)).slice(0, 4), leg,
      staffOn: [p.perkTrainer, p.perkNutrition, p.perkFisio, p.perkMental].map(x => !!x) }; });
  const avg = k => w.length ? Math.round(w.reduce((a, x) => a + (+x[k] || 0), 0) / w.length * 10) / 10 : null;
  await ctx.close();
  const vv = Object.values(voti);
  return { arm, seed, settimane: w.length, voto: vv.length ? Math.round(vv.reduce((a, b) => a + b, 0) / vv.length * 100) / 100 : null, nVoti: vv.length, moraleCap: w.filter(x => x.mo >= 99).length, morale: avg('mo'), fatica: avg('fa'), forma: avg('fo'), setInf: w.filter(x => x.inj).length, infortuni: inj, ...fin, voto: vv.length ? Math.round(vv.reduce((a, b) => a + b, 0) / vv.length * 100) / 100 : null, err: err.slice(0, 3) };
}

const jobs = []; for (const a of want) for (let s = 0; s < SEEDS; s++) jobs.push([a, s]);
const out = []; let k = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: PAR }, async () => { while (k < jobs.length) { const [a, s] = jobs[k++]; let r; try { r = await corsa(a, s); } catch (e) { r = { arm: a, seed: s, err: ['corsa fallita: ' + String(e.message).slice(0, 80)] }; } out.push(r);
  fs.writeFileSync('/tmp/claude-0/p281-parz.json', JSON.stringify(out));
  console.log(`[${Math.round((Date.now() - t0) / 1000)}s] ${a} s${s}: sett ${r.settimane} mor ${r.morale} fat ${r.fatica} for ${r.forma} inf ${r.infortuni}(${r.setInf}w) ovr ${r.ovr} Σ${r.statSum} pop ${r.pop} fid ${r.trust} voto ${r.voto} acc ${r.acc} err ${r.err.join('|')}`); } }));
// tabella resa investimenti (funzioni vere della pagina) su 12 nomi
const ctx = await browser.newContext(); const pg = await ctx.newPage(); await installCdnRoutes(pg);
await pg.addInitScript(() => { window.__CPM_GLB = false; });
await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await pg.waitForFunction(() => typeof investRate24 === 'function', null, { timeout: 40000 }).catch(() => {});
const inv = await pg.evaluate(() => { const N = ['Marco Ferri', 'Luca Neri', 'Ada Riva', 'Paolo Sala', 'Gino Bassi', 'Elia Conti', 'Sara Fumo', 'Ivo Marchi', 'Rino Gatti', 'Teo Valli', 'Dario Pace', 'Nico Russo'];
  const r = {}; try { ['prudente', 'bilanciato', 'rischioso'].forEach(pr => { r[pr] = N.map(n => Math.round(investRate24({ name: n }, 2, pr) * 1000) / 10); }); } catch (e) { r.err = String(e); } return r; });
await ctx.close();
const agg = {}; for (const r of out) { (agg[r.arm] = agg[r.arm] || []).push(r); }
const m = (a, k) => { const v = a.map(x => x[k]).filter(x => typeof x === 'number'); return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length * 100) / 100 : null; };
console.log('\nMEDIE SUI SEMI (' + SEEDS + ')');
for (const a of want) { const L = agg[a] || []; console.log(a.padEnd(10), ['settimane', 'morale', 'fatica', 'forma', 'infortuni', 'setInf', 'ovr', 'statSum', 'pop', 'trust', 'voto', 'nVoti', 'moraleCap', 'tm', 'acc', 'bank'].map(k => k + '=' + m(L, k)).join(' ')); }
console.log('\nRESA INVEST24 (%, stagione 2, 12 nomi):', JSON.stringify(inv));
fs.mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../out/patrimonio-281.json', import.meta.url), JSON.stringify({ out, inv }, null, 1));
await browser.close(); srv.close();
