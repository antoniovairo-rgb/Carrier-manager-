#!/usr/bin/env node
/* [giro 296 PO-534] SONDA: quanto dura DAVVERO la cerimonia della coppa dopo i rigori (finale vinta ai rigori dall'eroe).
   Il giro 272 aveva visto la cerimonia passare a `ended` «2-6 s dopo la serie» su PC in trasferta. Qui il tempo NON lo prende la sonda:
   un registro DENTRO la pagina (setInterval 25 ms su __CPM_PHASE, performance.now della pagina) annota ogni cambio di fase, e dal giro
   296 il gioco stesso scrive il testimone `__CPM_CER296` (inizio, fine, chi ha chiuso, durata prevista). La durata e' fine − inizio
   della fase `ceremony` sull'orologio della pagina: non dipende da quanto ci mette la sonda a leggere (foto, lettura stabile).
   Opzioni: { pc, trasferta, rosso (__CPM_NO_G296), carico: true = durante la serie fa le stesse foto a coppie di sonda-214 (il carico
   che al 272 ritardava le letture) e riporta anche «quando la sonda ha visto» la cerimonia, radice: altra cartella da servire }. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
export function salva296({ trasferta = false, nome = 'Lotteria Probe' } = {}) {
  return { phase: 'career', player: { name: nome, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
    cup: { active: true, round: 4, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
    calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: !trasferta, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 4, cupRoundName: 'Finale' }],
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 }, form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } };
}
/* apre la finale e porta la partita alla lotteria dei rigori; ritorna la pagina */
export async function apriLotteria296(browser, port, { pc = false, trasferta = false, rosso = false, nome, viewport, senzaForza = false } = {}) {
  const pg = await browser.newPage({ viewport: viewport || (pc ? { width: 1366, height: 768 } : { width: 375, height: 667 }) }); await installCdnRoutes(pg);
  pg.__errs = []; pg.on('pageerror', e => pg.__errs.push(String(e.message).slice(0, 160)));
  await pg.addInitScript(([s, r]) => { if (r) window.__CPM_NO_G296 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s));
    const L = (window.__FASI296 = []); let u = null; setInterval(() => { let p = null; try { p = window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) {} if (p !== u) { u = p; L.push([p, Math.round(performance.now())]); } }, 25); }, [salva296({ trasferta, nome }), rosso]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 8080, policy: 'seeded', tickMs: 300 }));
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)); await sleep(1500);
  if (senzaForza) return pg;/* la sonda della striscia legge prima la partita, poi chiama forza296 */
  await forza296(pg);
  return pg;
}
export async function forza296(pg) { await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE());
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'shootout', null, { timeout: 20000 }).catch(() => {}); }
export async function cerimonia296(browser, port, { pc = false, trasferta = false, rosso = false, carico = false } = {}) {
  const pg = await apriLotteria296(browser, port, { pc, trasferta, rosso });
  let vistaSonda = null; const tS = Date.now();
  /* la serie: si aspetta l'evento (uscita da shootout), tetto 4 minuti */
  for (;;) { const ph = await pg.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph !== 'shootout') { vistaSonda = { ph, t: await pg.evaluate(() => Math.round(performance.now())) }; break; }
    if (Date.now() - tS > 240000) break;
    if (carico) { const a = await pg.screenshot(), b = await pg.screenshot(); await pg.evaluate(async ([A, B]) => { for (const x of [A, B]) { const im = new Image(); im.src = 'data:image/png;base64,' + x; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); g.getImageData(0, 0, c.width, c.height); } }, [a.toString('base64'), b.toString('base64')]); await sleep(150); }
    else await sleep(200); }
  /* la cerimonia: si aspetta che finisca sull'orologio della pagina (tetto 45 s) */
  await pg.waitForFunction(() => { const L = window.__FASI296 || []; const i = L.findIndex(x => x[0] === 'ceremony'); return i >= 0 && L.length > i + 1; }, null, { timeout: 45000, polling: 200 }).catch(() => {});
  const r = await pg.evaluate(() => ({ fasi: (window.__FASI296 || []).slice(-6), cer: window.__CPM_CER296 || null, salta: !!document.querySelector('[data-cpm="salta"]') }));
  const i = r.fasi.findIndex(x => x[0] === 'ceremony'); const durata = (i >= 0 && r.fasi[i + 1]) ? r.fasi[i + 1][1] - r.fasi[i][1] : null;
  const out = { pc, trasferta, rosso, carico, durataMs: durata, dopo: i >= 0 && r.fasi[i + 1] ? r.fasi[i + 1][0] : null, inizioCerimonia: i >= 0 ? r.fasi[i][1] : null, sondaHaVisto: vistaSonda, ritardoSondaMs: (vistaSonda && i >= 0) ? vistaSonda.t - r.fasi[i][1] : null, testimone: r.cer, errs: pg.__errs.slice(0, 3) };
  await pg.close(); return out;
}
if (process.argv[1] && process.argv[1].endsWith('/sonda-296.mjs')) {
  const srv = await startServer(process.env.CPM_RADICE296 || undefined); const port = srv.address().port; const browser = await launchBrowser();
  for (const caso of (process.env.CPM_CASI || 'pc-trasferta').split(',')) console.log(JSON.stringify(await cerimonia296(browser, port, { pc: /pc/.test(caso), trasferta: /trasferta/.test(caso), rosso: !!process.env.CPM_ROSSO, carico: /carico/.test(caso) })));
  await browser.close(); srv.close();
}
