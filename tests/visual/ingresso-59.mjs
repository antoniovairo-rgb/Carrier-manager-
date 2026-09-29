#!/usr/bin/env node
/* [7.999.59 guardiano — collaudo PO «le scene 3D all'ingresso in campo sono molto scattose e pesanti»] Coi corpi 3D accesi, dal
   pre-partita al fischio d'inizio, si contano i LONG TASK (blocchi del thread principale > 50 ms: sono gli scatti) e si separano
   quelli che cadono DURANTE LA CAMMINATA dell'ingresso da quelli dell'attesa coperta dal velo (__CPM_WALKHOLD74). In headless la
   GPU e' software e i tempi assoluti sono gonfiati: il guardiano giudica il CONFRONTO fra i due bracci.
   VERDE: velo visto, blocchi durante la camminata <= 1500 ms in tutto. ROSSO __CPM_NO_WALKHOLD74: l'ingresso cammina mentre
   compila — blocchi durante la camminata >= 4000 ms (il difetto del PO). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const mkSave = (patch) => ({ phase: 'career', player: { name: 'Rigori Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
  cup: { active: true, round: 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
  calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 2, cupRoundName: 'Ottavi' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

async function braccio(rosso) {
  const pg = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(pg);
  await pg.addInitScript(([sv, r]) => { window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; window.__CPM_WALKCAP74 = 60; if (r) window.__CPM_NO_WALKHOLD74 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify(sv)); window.__LT = []; window.__HT = [];
    setInterval(() => { const h = !!window.__CPM_WALKHOLD74; const w = !!(window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout'); const s = (w ? 'W' : '-') + (h ? 'H' : '-'); if (s !== window.__HS) { window.__HS = s; window.__HT.push([Math.round(performance.now()), s]); } if (document.querySelector('[data-cpm="walkhold74"]')) window.__VELO = 1; }, 50);
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__LT.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch (e) {} }, [mkSave({}), rosso]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1000);
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  for (let i = 0; i < 200; i++) { const ph = await pg.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
    if (ph === 'matchday' || ph === 'formations') await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Formazioni|Entra in campo|Scendi in campo|In campo|Avanti|Continua/i.test(x.textContent || '')); if (b) b.click(); });
    if (ph === 'playing') break; await sleep(500); }
  const r = await pg.evaluate(() => ({ lt: window.__LT, ht: window.__HT, velo: !!window.__VELO }));
  await pg.close();
  /* camminata = tratti in walkout SENZA attesa: da ogni ingresso in 'W-' fino al cambio successivo */
  const seg = []; for (let i = 0; i < r.ht.length; i++) if (r.ht[i][1] === 'W-') seg.push([r.ht[i][0], (r.ht[i + 1] || [Infinity])[0]]);
  const inCamm = r.lt.filter(([t]) => seg.some(([a, b]) => t >= a - 60 && t < b));
  return { velo: r.velo, camminata: seg.length, blocchiCamminata: inCamm.length, msCamminata: inCamm.reduce((s, x) => s + x[1], 0), maxCamminata: inCamm.reduce((m, x) => Math.max(m, x[1]), 0), msTotale: r.lt.reduce((s, x) => s + x[1], 0) };
}
const v = await braccio(false); console.log('VERDE', JSON.stringify(v));
const r = await braccio(true); console.log('ROSSO', JSON.stringify(r));
await browser.close(); srv.close();
const okV = v.velo && v.camminata >= 1 && v.msCamminata <= 1500, okR = r.camminata >= 1 && r.msCamminata >= 4000;
console.log(okV ? '✅ ingresso: la camminata parte a 3D pronto (blocchi coperti dal velo)' : '❌ ingresso ancora a scatti');
console.log(okR ? '✅ il rosso __CPM_NO_WALKHOLD74 riproduce gli scatti' : '❌ il rosso non si distingue');
process.exit(okV && okR ? 0 : 1);
