/* Local opt-in review of the approved CGTrader goalkeeper catch. No gameplay mutations. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'keeper-catch-review');
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, {
    skipLoadAll: true,
    name: 'Keeper Catch Review',
    query: { hyperCharacter: 'cgtrader-highlight-optimized', cpmForce: 'keeper' },
  });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup', null, { timeout: 120000 });
  const keeperSituationIndex = 33; // Muro in area, verified against __CPM_CURSIT.
  await page.evaluate(index => window.__CPM_FORCE_SIT(index, true), keeperSituationIndex);
  await sleep(750);
  const diagnostics = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(-25),
    phase: window.__CPM_PHASE?.() || null,
    current: window.__CPM_CURSIT?.() || null,
    state: window.__CPM_STATE?.() || null,
    probe: window.__CPM_PROBE?.() || null,
  }));
  console.log('BEFORE_CHOICE', JSON.stringify({
    buttons: diagnostics.buttons, phase: diagnostics.phase,
    situation: diagnostics.current || null,
    statePhase: diagnostics.state?.phase || null,
    probe: diagnostics.probe?.phase || null,
  }));
  await page.waitForFunction(() => [...document.querySelectorAll('button')]
    .some(b => /Chiama il portiere/i.test(b.textContent || '')), null, { timeout: 45000 });
  fs.mkdirSync(out, { recursive: true });
  const before = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(-12),
    state: window.__CPM_STATE?.() || null,
    phase: window.__CPM_PHASE?.() || null,
  }));
  // The UI action requires extra interaction in forced mode; the existing test
  // hook resolves the exact third choice through the same game handler.
  await page.evaluate(() => window.__CPM_RESOLVE(2));

  const frames = [];
  for (let i = 0; i < 20; i++) {
    await sleep(i === 0 ? 80 : 160);
    const state = await page.evaluate(() => ({
      state: window.__CPM_STATE?.() || null,
      phase: window.__CPM_PHASE?.() || null,
      ball: window.__CPM_BALL?.() || null,
      keeper: window.__CPM_GKW || null,
      arcEnd: window.__CPM_ARCEND457?.slice(-2) || null,
      contact: window.__CPM_CGTRADER_CONTACT_AUDIT?.() || null,
      fps: window.__CPM_FPS907?.() || null,
      roster: window.__CPM_CGTRADER_CINEMA_ROSTER || null,
    }));
    const file = i === 0 || i === 9 || i === 19 ? `catch-${String(i).padStart(2, '0')}.png` : null;
    if (file) await page.screenshot({ path: path.join(out, file) });
    frames.push({ file, ...state });
  }
  const report = { before, frames, errors };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    actionOffered: before.buttons.some(x => /Chiama il portiere/i.test(x)),
    frames: frames.length,
    phases: [...new Set(frames.map(x => x.phase))],
    arcEnds: frames.flatMap(x => x.arcEnd || []).filter(x => x?.def),
    errors,
    output: out,
  }, null, 2));
} finally {
  await browser.close();
  server.close();
}
