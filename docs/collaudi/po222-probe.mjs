#!/usr/bin/env node
/* PO-222 — SOLO MISURA. Carriere diverse (3 club reali della Lega A, tre stati di partenza diversi),
   guidate dagli handler VERI via __CPM_CAREER.step(). Per ogni giornata di lega simulata registra:
   la decisione del mister calcolata dallo stato PRE-partita con le funzioni del gioco
   (calcMatchWeight + calcCoachDecision), e il contatore presenze prima/dopo la simulazione.
   Non tocca il gioco: sola lettura + harness di collaudo. Uscita: JSON su stdout. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const PER_SAVE = Number(process.env.PO222_PER_SAVE || 12);
const LEAGUE_IDX = [2, 7, 12];
const TRUST = [18, 55, 85], ROLE = ['riserva', 'rotazione', 'titolare'], OVR = [60, 68, 76], FORM = [62, 72, 80], FAT = [15, 35, 5];

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;

// fase 0: anagrafica club reale (stessi dati che il gioco usa in CLUBS)
const p0 = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(p0);
await p0.addInitScript(() => { window.__CPM_GLB = false; });
await p0.goto(url, { waitUntil: 'load', timeout: 30000 });
await p0.waitForFunction(() => window.__CPM_CLUBS && window.__CPM_CLUBS.length > 0, { timeout: 40000 });
const lega = await p0.evaluate(() => window.__CPM_CLUBS.filter(c => c.lg === 'Lega A'));
await p0.close();

const results = [];
const errors = [];
for (let k = 0; k < 3; k++) {
  const club = lega[LEAGUE_IDX[k]];
  const save = { phase: 'career', player: { name: `Collaudo PO222 ${k + 1}`, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20,
    ovr: OVR[k], tutorialDone: true, club, squadRole: ROLE[k], coachTrust: TRUST[k], form: FORM[k], fatigue: FAT[k], morale: 70,
    stats: Object.fromEntries(['velocità', 'tecnica', 'fisico', 'mentalità', 'tiro', 'passaggio', 'dribbling', 'posizionamento'].map(s => [s, OVR[k]])),
    contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(`save${k + 1}: ` + String(e.message).slice(0, 160)));
  await page.addInitScript((s) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { errors.push(`save${k + 1}: CONTINUA non cliccato`); }
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(1200);

  let simmed = 0, guard = 0, stop = null;
  while (simmed < PER_SAVE && guard++ < 400) {
    const pre = await page.evaluate(() => {
      const C = window.__CPM_CAREER; const S = C.snapshot();
      const md = (S.calendar || []).find(m => m.week === S.week && !m.played) || null;
      if (!S.weekLived || !md) return { S: { season: S.season, week: S.week, weekLived: S.weekLived, matches: S.matches, screen: C.screen() }, md: !!md };
      const cw = calcMatchWeight(S, md.opponentId, S.standings || [], S.week);
      const cd = calcCoachDecision(S, cw);
      return { S: { season: S.season, week: S.week, weekLived: S.weekLived, matches: S.matches || 0, matchStatus: S.matchStatus ?? null,
        squadRole: S.squadRole, coachTrust: S.coachTrust, form: S.form, fatigue: S.fatigue, ovr: S.ovr, contractExpired: !!S.contractExpired, screen: C.screen() },
        md: true, mw: cw, decision: cd.status, reason: cd.reason.slice(0, 90), entryMinute: cd.entryMinute, isHome: md.isHome, screen: C.screen() };
    });
    if (pre.S.screen === 'seasonEnd' || pre.S.screen === 'seasonAwards') { stop = 'seasonEnd'; break; }
    if (!pre.md) {
      const r = await page.evaluate(() => window.__CPM_CAREER.step());
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
      if (typeof r === 'string' && r.startsWith('error')) { stop = r; break; }
      continue;
    }
    // giornata di lega non ancora giocata e settimana non ancora vissuta: viene prima vissuta
    if (!pre.S.weekLived) {
      await page.evaluate(() => window.__CPM_CAREER.step());
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
      continue;
    }
    const r = await page.evaluate(() => window.__CPM_CAREER.step());
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    const post = await page.evaluate(() => { const S = window.__CPM_CAREER.snapshot(); return { matches: S.matches || 0, matchStatus: S.matchStatus ?? null, played: (S.calendar || []).filter(m => m.week === S.week).map(m => !!m.played) }; });
    results.push({ save: k + 1, club: club.n, season: pre.S.season, week: pre.S.week, step: r,
      squadRole: pre.S.squadRole, coachTrust: pre.S.coachTrust, form: pre.S.form, fatigue: pre.S.fatigue, ovr: pre.S.ovr,
      mw: pre.mw, decision: pre.decision, reason: pre.reason, entryMinute: pre.entryMinute, isHome: pre.isHome,
      matchStatusPre: pre.S.matchStatus, matchStatusPost: post.matches !== undefined ? post.matchStatus : null,
      matchesBefore: pre.S.matches, matchesAfter: post.matches, delta: post.matches - pre.S.matches, contractExpired: pre.S.contractExpired });
    if (r === 'simulated') simmed++;
    if (typeof r === 'string' && r.startsWith('error')) { stop = r; break; }
  }
  results.push({ save: k + 1, summary: { simmed, stop, club: club.n, lega: 'Lega A' } });
  await page.close();
}
await browser.close();
srv.close();
console.log(JSON.stringify({ perSave: PER_SAVE, errors, rows: results }, null, 1));
