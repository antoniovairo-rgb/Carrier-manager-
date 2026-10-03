import fs from 'node:fs';
import os from 'node:os';
import { chromium } from '../visual/node_modules/playwright/index.mjs';
import { startServer, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const source = 'tests/codex/goleade-carriera-avanzata.json';
const target = 'tests/codex/goleade-live-avanzata.json';
const fixture = process.env.CPM_PRECOMPILED === '1' ? fs.readFileSync('tests/codex/goleade-precompiled.html', 'utf8') : null;
const data = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : { version: '7.999.112', commit: '8cef5317', command: 'node tests/codex/goleade-live-avanzata.mjs', matches: [] };
const save = () => fs.writeFileSync(target, JSON.stringify(data, null, 2));
const freeGB = () => os.freemem() / 2 ** 30;
if (freeGB() < 3.5) { data.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2) }; save(); process.exit(2); }
const selectedSeeds = (process.env.CPM_SEEDS || '').split(',').filter(Boolean).map(Number);
const careers = JSON.parse(fs.readFileSync(source, 'utf8')).careers.filter(c => c.advancedSave?.season >= 6 && (!selectedSeeds.length || selectedSeeds.includes(c.seed)));
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
    let lowMemory = false;
    const memoryGuard = setInterval(() => { if (freeGB() < 3.5) { lowMemory = true; context.close().catch(() => {}); } }, 1000);
    await installCdnRoutes(page);
    if (fixture) await page.route('**/CARRIER-MANAGER-AV.html?*', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixture }));
    await page.addInitScript(saveText => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; localStorage.setItem('cpm-v3', saveText); }, career.advancedSave.localStorage);
    try {
      await page.goto(`http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      const enterUntil = Date.now() + 60000;
      while (Date.now() < enterUntil && !(await page.evaluate(() => !!window.__CPM_CAREER).catch(() => false))) {
        const button = page.getByText(/CONTINUA/i).first();
        if (await button.isVisible().catch(() => false)) await button.click({ timeout: 1500, noWaitAfter: true }).catch(() => {});
        await sleep(700);
      }
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 10000 });
      const contractBefore = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { expired: !!s.contractExpired, expiresAtSeason: s.contract?.expiresAtSeason, duration: s.contract?.duration, season: s.season }; });
      row.contractBefore = contractBefore;
      if (contractBefore.expired) {
        await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard'));
        const renewal = page.getByRole('button', { name: /Negozia rinnovo/i }).first();
        row.renewalButtonVisible = await renewal.isVisible().catch(() => false);
        if (row.renewalButtonVisible) {
          row.blockingChoices = [];
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
            row.blockingChoices.push(blocker);
            if (blocker.choice) await page.locator('[data-cpm-qa-active="1"]').first().click({ timeout: 5000 });
            await sleep(200);
          }
          await renewal.click({ timeout: 8000 });
          const accept = page.getByRole('button', { name: /Accetta l.offerta del club/i }).first();
          row.renewalOfferVisible = await accept.isVisible().catch(() => false);
          if (row.renewalOfferVisible) await accept.click({ timeout: 8000 });
        }
        await sleep(250);
        row.contractAfter = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { expired: !!s.contractExpired, expiresAtSeason: s.contract?.expiresAtSeason, duration: s.contract?.duration, season: s.season }; });
      }
      for (let i = 0; i < 12; i++) {
        const state = await page.evaluate(() => ({ md: window.__CPM_CAREER.thisWeekMd(), pending: window.__CPM_CAREER.openingPending(), screen: window.__CPM_CAREER.screen() }));
        if (state.md && typeof state.md === 'object' && !state.pending?.length) { row.matchday = state.md; break; }
        row.preSteps = row.preSteps || [];
        const step = await page.evaluate(() => { const C = window.__CPM_CAREER; const result = C.step(); C.dismiss(); return result; });
        row.preSteps.push({ state, step });
        if (typeof step === 'string' && (step.startsWith('error:') || step.startsWith('blocked:'))) throw Error(`Prima della partita: ${step}`);
        await sleep(350);
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
    } catch (error) { row.error = String(error.stack || error); row.finished = false; if (lowMemory) row.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2) }; else await page.screenshot({ path: `reports/codex/goleade-live-errore-seed${career.seed}.png` }).catch(() => {}); }
    finally { clearInterval(memoryGuard); row.finishedAt = new Date().toISOString(); save(); await context.close().catch(() => {}); }
    console.log(JSON.stringify({ seed: row.seed, finished: row.finished, matchday: row.matchday, score: row.match?.score, goals: row.goals?.length, error: row.error?.slice(0, 140) }));
  }
} finally { await browser.close(); server.closeAllConnections?.(); server.close(); save(); }
