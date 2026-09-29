#!/usr/bin/env node
/* [7.999.58 guardiano — collaudo PO «i rigori non si vedono bene, non si vede il tiratore ed il portiere non si tuffa ma si
   sposta un po' a cavolo»] Serie vera di Coppa coi corpi 3D (telefono in verticale 412x915), testimone __CPM_SO80 (solo prova).
   Dal secondo rigore in poi (il primo serve alla camera per arrivare): quota di campioni col rigorista DENTRO lo schermo,
   quota col portiere in porta dentro lo schermo, tuffo con la clip «dive» in ogni rigore.
   VERDE: rigorista e portiere inquadrati >= 90%, tuffo in ogni rigore. ROSSO __CPM_NO_RIGORI58: il rigorista esce dal quadro
   (< 50%) e il tuffo non suona. */
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
  await pg.addInitScript(([sv, r]) => { window.__CPM_GLB = true; if (r) window.__CPM_NO_RIGORI58 = 1; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, [mkSave({}), rosso]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 8080, policy: 'seeded', tickMs: 300 }));
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
  await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE());
  await sleep(14000);
  const W = await pg.evaluate(() => (window.__CPM_SO80 || []).filter(w => w.key >= 1 && w.u >= 0.3 && w.inq));
  await pg.close();
  const n = W.length, k = W.filter(w => w.inq.k).length, g = W.filter(w => w.inq.g).length;
  const keys = [...new Set(W.map(w => w.key))].filter(kk => W.some(w => w.key === kk && w.u >= 1.3))/* solo i rigori arrivati oltre il tiro */, tuffi = keys.filter(kk => W.some(w => w.key === kk && w.gk && w.gk.g === 'dive')).length;
  return { campioni: n, rigoristaInQuadro: n ? +(k / n).toFixed(2) : 0, portiereInQuadro: n ? +(g / n).toFixed(2) : 0, rigori: keys.length, tuffi };
}
const v = await braccio(false); console.log('VERDE', JSON.stringify(v));
const r = await braccio(true); console.log('ROSSO', JSON.stringify(r));
await browser.close(); srv.close();
const okV = v.campioni >= 10 && v.rigoristaInQuadro >= 0.9 && v.portiereInQuadro >= 0.9 && v.rigori >= 2 && v.tuffi === v.rigori;
const okR = r.campioni >= 10 && r.rigoristaInQuadro < 0.5 && r.tuffi === 0;
console.log(okV ? '✅ rigori: rigorista e portiere inquadrati, il portiere si tuffa' : '❌ rigori non leggibili');
console.log(okR ? '✅ il rosso __CPM_NO_RIGORI58 riproduce il difetto' : '❌ il rosso non si distingue');
process.exit(okV && okR ? 0 : 1);
