#!/usr/bin/env node
// PO-190: tre carriere nate dall'interfaccia, senza valori iniziali iniettati.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from '../visual/node_modules/playwright/index.mjs';
import { startServer, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const output = path.resolve('tests/codex/goleade-carriera-avanzata.json');
const version = fs.readFileSync('src/07-versione-save-interviste.jsx', 'utf8').match(/const GAME_VERSION="([^"]+)"/)?.[1];
if (!version || Number(version.split('.').at(-1)) < 111) throw Error(`Versione insufficiente: ${version}`);
const seeds = (process.env.CPM_SEEDS || '0,1,2').split(',').map(Number).filter(Number.isInteger);
const precompiled = process.env.CPM_PRECOMPILED === '1';
const fixture = precompiled ? fs.readFileSync(path.resolve('tests/codex/goleade-precompiled.html'), 'utf8') : null;
const data = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : { version, commit: '8cef5317', command: 'node tests/codex/goleade-carriera-avanzata.mjs', careers: [] };
data.environment = { ...(data.environment || {}), precompiled, renderer: precompiled ? 'd3d11' : 'swiftshader', viewport: '360x640', deviceScaleFactor: 1 };
const save = () => { const raw = JSON.stringify(data, null, 2); for (let i = 0; i < 15; i++) {
  try { fs.writeFileSync(output, raw); return; }
  catch (e) { if (e.code !== 'EBUSY' || i === 14) throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200); }
} };
const leagueSummary = s => {
  const played = (s.calendar || []).filter(m => m && !m.type && m.played && m.result && Number.isFinite(m.result.homeScore) && Number.isFinite(m.result.awayScore));
  const scored = m => m.isHome ? m.result.homeScore : m.result.awayScore;
  const conceded = m => m.isHome ? m.result.awayScore : m.result.homeScore;
  const gf = played.reduce((n, m) => n + scored(m), 0);
  const ga = played.reduce((n, m) => n + conceded(m), 0);
  const heroLeagueGoals = (s.matchHistory || []).filter(m => m && !m.cup && !m.euro && m.simulated === true).reduce((n, m) => n + (m.goals || 0), 0);
  return { games: played.length, gf, ga, gfPerGame: played.length ? gf / played.length : null,
    gaPerGame: played.length ? ga / played.length : null,
    gamesSixPlus: played.filter(m => scored(m) >= 6).map(m => ({ matchday: m.matchday, week: m.week, scored: scored(m), conceded: conceded(m), result: m.result })),
    marginsFivePlus: played.filter(m => Math.abs(scored(m) - conceded(m)) >= 5).map(m => ({ matchday: m.matchday, week: m.week, scored: scored(m), conceded: conceded(m), result: m.result })),
    heroLeagueGoalsSimulated: heroLeagueGoals, heroGoalShareSimulated: gf ? heroLeagueGoals / gf : null,
    perspective: 'calendar.isHome: homeScore/awayScore', source: 'src/09-audio-scout-anagrafiche.jsx generateSeasonCalendar + calendar.result' };
};
const freeGB = () => os.freemem() / 2 ** 30;
const memoryStop = () => { if (freeGB() >= 3.5) return false; data.paused = { at: new Date().toISOString(), freeGB: +freeGB().toFixed(2), reason: 'RAM libera sotto 3,5 GB' }; save(); return true; };
async function renewFromUI(page) {
  const result = { choices: [] };
  const presentation = page.getByRole('button', { name: /Inizia la tua storia/i }).first();
  if (await presentation.isVisible().catch(() => false)) { await presentation.click({ timeout: 8000 }); result.choices.push('Inizia la tua storia'); await sleep(150); }
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard'));
  const renew = page.getByRole('button', { name: /Negozia rinnovo/i }).first();
  result.buttonVisible = await renew.isVisible().catch(() => false);
  if (!result.buttonVisible) return result;
  for (let n = 0; n < 12; n++) {
    const blocker = await page.evaluate(() => {
      document.querySelectorAll('[data-cpm-qa-active]').forEach(x => x.removeAttribute('data-cpm-qa-active'));
      const b = [...document.querySelectorAll('button')].find(x => x.textContent?.includes('Negozia rinnovo'));
      if (!b) return { ready: false, reason: 'renew button missing' };
      const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
      if (hit === b || b.contains(hit)) return { ready: true };
      const modals = [...document.querySelectorAll('div')].filter(x => { const q=x.getBoundingClientRect(),st=getComputedStyle(x);return q.width>0&&q.height>0&&st.position==='fixed'&&Number.parseInt(st.zIndex,10)>=1000; }).reverse();
      for (const modal of modals) for (const choice of modal.querySelectorAll('button')) {
        const q=choice.getBoundingClientRect(),cx=q.x+q.width/2,cy=q.y+q.height/2;
        if (!q.width || !q.height || choice.disabled || cx<0 || cy<0 || cx>=innerWidth || cy>=innerHeight) continue;
        const top=document.elementFromPoint(cx,cy);
        if (top !== choice && !choice.contains(top)) continue;
        choice.setAttribute('data-cpm-qa-active','1');
        return { ready: false, choice: choice.textContent?.trim().slice(0,100), modal: modal.textContent?.trim().slice(0,120) };
      }
      return { ready: false, reason: 'renew button obstructed', hit: hit?.textContent?.trim().slice(0,120) };
    });
    if (blocker.ready) break;
    result.choices.push(blocker);
    if (blocker.choice) await page.locator('[data-cpm-qa-active="1"]').first().click({ timeout: 5000 });
    await sleep(200);
  }
  await renew.click({ timeout: 8000 });
  const accept = page.getByRole('button', { name: /Accetta l.offerta del club/i }).first();
  result.offerVisible = await accept.isVisible().catch(() => false);
  if (result.offerVisible) { await accept.click({ timeout: 8000 }); result.accepted = true; }
  else result.modalText = await page.evaluate(() => document.body?.innerText?.slice(-600) || '');
  await sleep(250);
  return result;
}
if (memoryStop()) { console.error(JSON.stringify(data.paused)); process.exit(2); }
delete data.paused; save();
const server = await startServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.CPM_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--headless=new', '--use-gl=angle', `--use-angle=${precompiled ? 'd3d11' : 'swiftshader'}`, ...(precompiled ? ['--enable-gpu'] : []), '--ignore-gpu-blocklist', '--renderer-process-limit=1', '--disable-extensions', '--disable-background-networking', '--no-sandbox'] });
try {
  for (const seed of seeds) {
    if (memoryStop()) break;
    let career = data.careers.find(c => c.seed === seed);
    if (career?.completed) continue;
    if (!career) { career = { seed, creation: 'UI naturale', renewUI: process.env.CPM_RENEW_UI === '1', trials: [], steps: [], seasons: [], lived: [], errors: [], startedAt: new Date().toISOString() }; data.careers.push(career); save(); }
    if (!career.checkpoint && career.trials.length) {
      // React keeps the three-trial flow in memory. A closed page cannot resume
      // midway; preserve the partial run as evidence and restart its UI flow.
      career.interruptedTrialRuns ||= [];
      career.interruptedTrialRuns.push({ trials: career.trials, interruptedAt: career.paused?.at || career.finishedAt || null });
      career.trials = [];
      save();
    }
    delete career.failure; delete career.paused;
    const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const page = await context.newPage(); page.setDefaultTimeout(30000);
    let lowMemory = false;
    const memoryGuard = setInterval(() => { if (freeGB() < 3.5) { lowMemory = true; context.close().catch(() => {}); } }, 1000);
    page.on('pageerror', e => career.errors.push(String(e.message)));
    await installCdnRoutes(page);
    if (fixture) await page.route('**/CARRIER-MANAGER-AV.html?*', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixture }));
    const resume = career.checkpoint?.localStorage || null;
    await page.addInitScript(({ seed, resume }) => {
      window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1;
      if (resume) localStorage.setItem('cpm-v3', resume);
      let x = (Number(sessionStorage.getItem('qa-rng') || seed + 1) >>> 0) || 1;
      Math.random = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; sessionStorage.setItem('qa-rng', String(x >>> 0)); return (x >>> 0) / 4294967296; };
    }, { seed, resume });
    try {
      const url = `http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
      await page.goto(url, { waitUntil: 'load', timeout: 90000 });
      if (resume) {
        const until = Date.now() + 60000;
        while (Date.now() < until && !(await page.evaluate(() => !!window.__CPM_CAREER).catch(() => false))) {
          const button = page.getByText(/CONTINUA/i).first();
          if (await button.isVisible().catch(() => false)) await button.click({ timeout: 1500, noWaitAfter: true }).catch(() => {});
          await sleep(700);
        }
      }
      if (!resume) {
        await page.getByRole('button', { name: /Nuova carriera/i }).first().click();
        await page.getByPlaceholder('Es. Giovanni Pisano').fill(`QA Naturale ${seed}`);
        await page.getByRole('button', { name: /Inizia i provini/i }).click();
        for (let i = 0; i < 3; i++) {
          if (memoryStop()) throw Error('pausa memoria durante provini');
          await page.getByRole('button', { name: /Inizia il provino/i }).click();
          await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 60000 });
          await page.evaluate(n => window.__CPM_AUTOPLAY(true, { seed: n, policy: 'seeded', tickMs: 150 }), seed * 100 + i);
          const until = Date.now() + 300000;
          let lastPhase = null;
          while (Date.now() < until) {
            const phase = await page.evaluate(() => window.__CPM_PHASE?.() ?? null);
            lastPhase = phase;
            if (phase === 'hl_result') await page.getByRole('button', { name: 'Continua', exact: true }).last().click({ timeout: 3000 }).catch(() => {});
            if (phase === 'ended') break;
            await sleep(200);
          }
          if (await page.evaluate(() => window.__CPM_PHASE?.()) !== 'ended') throw Error(`Provino ${i + 1} non concluso; ultima fase ${lastPhase}`);
          await page.getByRole('button', { name: /Risultati provino/i }).click();
          career.trials.push({ number: i + 1, completedAt: new Date().toISOString() }); save();
          if (i < 2) await page.getByRole('button', { name: new RegExp(`Vai al Provino ${i + 2}`, 'i') }).click();
        }
        await page.getByText('Offerte ricevute', { exact: false }).first().waitFor({ timeout: 30000 });
        await page.keyboard.press('Enter');
      }
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 });
      await sleep(800);
      const checkpoint = async () => {
        const state = await page.evaluate(() => ({ snapshot: window.__CPM_CAREER.snapshot(), localStorage: localStorage.getItem('cpm-v3'), screen: window.__CPM_CAREER.screen() }));
        career.checkpoint = { localStorage: state.localStorage, season: state.snapshot.season, week: state.snapshot.week, screen: state.screen };
        save(); return state;
      };
      let state = await checkpoint();
      career.initial = career.initial || { name: state.snapshot.name, position: state.snapshot.position, ovr: state.snapshot.ovr, age: state.snapshot.age, club: state.snapshot.club?.n };
      const started = Date.now();
      let sameState = 0;
      while (state.snapshot.season <= 6 && Date.now() - started < 5 * 60 * 60 * 1000) {
        if (memoryStop()) break;
        const s = state.snapshot;
        if (process.env.CPM_RENEW_UI === '1' && s.proStatus === 'pro' && (s.contractExpired || (s.contract?.duration ?? 9) <= 1)
          && !(career.renewals || []).some(x => x.season === s.season)) {
          const before = { season: s.season, week: s.week, expired: !!s.contractExpired, duration: s.contract?.duration, expiresAtSeason: s.contract?.expiresAtSeason };
          const ui = await renewFromUI(page);
          state = await checkpoint();
          const after = state.snapshot;
          career.renewals ||= [];
          career.renewals.push({ before, ui, after: { season: after.season, week: after.week, expired: !!after.contractExpired, duration: after.contract?.duration, expiresAtSeason: after.contract?.expiresAtSeason } });
          save();
          continue;
        }
        if (state.screen === 'proTransition') {
          if (!career.seasons.some(row => row.season === s.season)) career.seasons.push({ season: s.season, age: s.age, club: s.club?.n, clubId: s.club?.id, position: s.position, ovr: s.ovr,
            goals: s.goals, matches: s.matches, league: leagueSummary(s), standings: s.standings, matchHistory: s.matchHistory, calendar: s.calendar });
          await page.keyboard.press('Enter');
          await sleep(250);
          const after = await checkpoint();
          career.steps.push({ season: s.season, week: s.week, action: 'UI: Enter on proTransition', result: { season: after.snapshot.season, week: after.snapshot.week, screen: after.screen } });
          if (after.snapshot.season <= s.season) throw Error(`Scelta proTransition senza cambio stagione S${s.season}/W${s.week}`);
          state = after;
          sameState = 0;
          continue;
        }
        if (state.screen === 'seasonEnd' || state.screen === 'seasonAwards') {
          career.seasons = career.seasons.filter(row => row.season !== s.season);
          career.seasons.push({ season: s.season, age: s.age, club: s.club?.n, clubId: s.club?.id, position: s.position, ovr: s.ovr,
            goals: s.goals, matches: s.matches, league: leagueSummary(s), standings: s.standings, matchHistory: s.matchHistory, calendar: s.calendar });
          const next = await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); return C.startNewSeason(); });
          career.steps.push({ season: s.season, week: s.week, action: 'startNewSeason', result: next });
          if (next !== true) throw Error(`Rollover S${s.season}: ${next}`);
        } else {
          const result = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
          career.steps.push({ season: s.season, week: s.week, action: 'step', result });
          if (typeof result === 'string' && (result.startsWith('error:') || result.startsWith('blocked:'))) throw Error(`S${s.season}/W${s.week}: ${result}`);
        }
        // Il salvataggio del gioco è differito: il checkpoint deve leggere il valore persistito.
        await sleep(800);
        const nextState = await checkpoint();
        sameState = nextState.snapshot.season === s.season && nextState.snapshot.week === s.week ? sameState + 1 : 0;
        state = nextState;
        if (sameState > 5) throw Error(`Stagione/settimana immutate per ${sameState} passi: S${s.season}/W${s.week}, schermata ${state.screen}`);
        if (state.snapshot.season >= 6 && !career.advancedSave) {
          career.advancedSave = { season: state.snapshot.season, week: state.snapshot.week,
            localStorage: career.checkpoint.localStorage, ovr: state.snapshot.ovr,
            club: state.snapshot.club?.n, position: state.snapshot.position };
          save();
        }
        if (career.steps.length > 3000) throw Error('limite di 3000 passi');
      }
      career.completed = state.snapshot.season >= 7;
      career.last = { season: state.snapshot.season, week: state.snapshot.week, ovr: state.snapshot.ovr, goals: state.snapshot.goals, matches: state.snapshot.matches };
    } catch (error) { const message = String(error.stack || error);
      if (lowMemory || message.includes('pausa memoria')) career.paused = { reason: 'RAM libera sotto 3,5 GB', at: new Date().toISOString(), detail: message };
      else career.failure = message;
    }
    finally { clearInterval(memoryGuard); career.finishedAt = new Date().toISOString(); save(); await context.close().catch(() => {}); }
    console.log(JSON.stringify({ seed, completed: career.completed, initial: career.initial, last: career.last, failure: career.failure?.slice(0, 180) }));
  }
} finally { await browser.close(); server.closeAllConnections?.(); server.close(); save(); }
