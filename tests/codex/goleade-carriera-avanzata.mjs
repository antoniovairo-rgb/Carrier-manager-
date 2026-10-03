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
const data = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : { version, commit: '8cef5317', command: 'node tests/codex/goleade-carriera-avanzata.mjs', careers: [] };
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
if (memoryStop()) { console.error(JSON.stringify(data.paused)); process.exit(2); }
const server = await startServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.CPM_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--renderer-process-limit=1', '--disable-extensions', '--disable-background-networking', '--no-sandbox'] });
try {
  for (const seed of seeds) {
    if (memoryStop()) break;
    let career = data.careers.find(c => c.seed === seed);
    if (career?.completed) continue;
    if (!career) { career = { seed, creation: 'UI naturale', trials: [], steps: [], seasons: [], lived: [], errors: [], startedAt: new Date().toISOString() }; data.careers.push(career); save(); }
    delete career.failure; delete career.paused;
    const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const page = await context.newPage(); page.setDefaultTimeout(30000);
    page.on('pageerror', e => career.errors.push(String(e.message)));
    await installCdnRoutes(page);
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
      if (!resume) {
        await page.getByRole('button', { name: /Nuova carriera/i }).first().click();
        await page.getByPlaceholder('Es. Giovanni Pisano').fill(`QA Naturale ${seed}`);
        await page.getByRole('button', { name: /Inizia i provini/i }).click();
        for (let i = 0; i < 3; i++) {
          if (memoryStop()) throw Error('pausa memoria durante provini');
          await page.getByRole('button', { name: /Inizia il provino/i }).click();
          await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 60000 });
          await page.evaluate(n => window.__CPM_AUTOPLAY(true, { seed: n, policy: 'seeded', tickMs: 150 }), seed * 100 + i);
          const until = Date.now() + 180000;
          while (Date.now() < until) {
            const phase = await page.evaluate(() => window.__CPM_PHASE?.() ?? null);
            if (phase === 'hl_result') await page.getByRole('button', { name: 'Continua', exact: true }).last().click({ timeout: 3000 }).catch(() => {});
            if (phase === 'ended') break;
            await sleep(200);
          }
          if (await page.evaluate(() => window.__CPM_PHASE?.()) !== 'ended') throw Error(`Provino ${i + 1} non concluso`);
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
      while (state.snapshot.season <= 6 && Date.now() - started < 5 * 60 * 60 * 1000) {
        if (memoryStop()) break;
        const s = state.snapshot;
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
        state = await checkpoint();
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
      if (message.includes('pausa memoria')) career.paused = { reason: 'RAM libera sotto 3,5 GB', at: new Date().toISOString(), detail: message };
      else career.failure = message;
    }
    finally { career.finishedAt = new Date().toISOString(); save(); await context.close().catch(() => {}); }
    console.log(JSON.stringify({ seed, completed: career.completed, initial: career.initial, last: career.last, failure: career.failure?.slice(0, 180) }));
  }
} finally { await browser.close(); server.closeAllConnections?.(); server.close(); save(); }
