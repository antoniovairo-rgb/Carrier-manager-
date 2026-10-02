import fs from 'node:fs';
import os from 'node:os';
import { chromium } from '../visual/node_modules/playwright/index.mjs';
import { startServer, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const source = 'tests/codex/goleade-carriera-avanzata.json';
const target = 'tests/codex/goleade-live-avanzata.json';
const data = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : { version: '7.999.112', commit: '8cef5317', command: 'node tests/codex/goleade-live-avanzata.mjs', matches: [] };
const save = () => fs.writeFileSync(target, JSON.stringify(data, null, 2));
const freeGB = () => os.freemem() / 2 ** 30;
if (freeGB() < 3.5) { data.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2) }; save(); process.exit(2); }
const careers = JSON.parse(fs.readFileSync(source, 'utf8')).careers.filter(c => c.advancedSave?.season >= 6);
const server = await startServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.CPM_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--renderer-process-limit=1', '--disable-extensions', '--disable-background-networking', '--no-sandbox'] });
try {
  for (const career of careers) {
    if (data.matches.some(m => m.seed === career.seed && m.finished)) continue;
    if (freeGB() < 3.5) { data.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2) }; save(); break; }
    const row = { seed: career.seed, sourceSeason: career.advancedSave.season, sourceWeek: career.advancedSave.week, path: 'vissuta', startedAt: new Date().toISOString() };
    data.matches.push(row); save();
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const page = await context.newPage();
    await installCdnRoutes(page);
    await page.addInitScript(saveText => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; localStorage.setItem('cpm-v3', saveText); }, career.advancedSave.localStorage);
    try {
      await page.goto(`http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 });
      for (let i = 0; i < 12; i++) {
        const state = await page.evaluate(() => ({ md: window.__CPM_CAREER.thisWeekMd(), pending: window.__CPM_CAREER.openingPending(), screen: window.__CPM_CAREER.screen() }));
        if (state.md && typeof state.md === 'object') { row.matchday = state.md; break; }
        row.preSteps = row.preSteps || [];
        const step = await page.evaluate(() => { const C = window.__CPM_CAREER; const result = C.step(); C.dismiss(); return result; });
        row.preSteps.push({ state, step });
        if (typeof step === 'string' && (step.startsWith('error:') || step.startsWith('blocked:'))) throw Error(`Prima della partita: ${step}`);
        await sleep(150);
      }
      if (!row.matchday) throw Error('Nessuna partita di club trovata entro 12 passi');
      row.before = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { season: s.season, week: s.week, ovr: s.ovr, club: s.club?.n, goals: s.goals, matches: s.matches, historyLength: s.matchHistory?.length }; });
      row.playMatchResult = await page.evaluate(() => window.__CPM_CAREER.playMatch());
      if (row.playMatchResult !== true) throw Error(`playMatch: ${row.playMatchResult}`);
      await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 60000 });
      const autoplaySeed = 190000 + career.seed;
      await page.evaluate(seed => window.__CPM_AUTOPLAY(true, { seed, policy: 'seeded', tickMs: 150 }), autoplaySeed);
      row.autoplaySeed = autoplaySeed;
      const until = Date.now() + 300000;
      while (Date.now() < until) {
        const phase = await page.evaluate(() => window.__CPM_PHASE?.() ?? null);
        if (phase === 'ended' || phase === 'ceremony') break;
        if (phase === 'hl_result') await page.getByRole('button', { name: 'Continua', exact: true }).last().click({ timeout: 3000 }).catch(() => {});
        await sleep(250);
      }
      row.match = await page.evaluate(() => ({ phase: window.__CPM_PHASE?.(), score: window.__CPM_SCORE?.(), events: window.__CPM_EV?.() ?? [], timeline: window.__CPM_TIMELINE?.() ?? [] }));
      row.goals = row.match.events.filter(e => e?.ev === 'goal').map(e => ({ source: e?.d?.src ?? e?.src ?? null, raw: e }));
      row.finished = ['ended', 'ceremony'].includes(row.match.phase);
    } catch (error) { row.error = String(error.stack || error); row.finished = false; }
    finally { row.finishedAt = new Date().toISOString(); save(); await context.close().catch(() => {}); }
    console.log(JSON.stringify({ seed: row.seed, finished: row.finished, matchday: row.matchday, score: row.match?.score, goals: row.goals?.length, error: row.error?.slice(0, 140) }));
  }
} finally { await browser.close(); server.closeAllConnections?.(); server.close(); save(); }
