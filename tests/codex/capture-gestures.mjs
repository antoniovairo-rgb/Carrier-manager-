#!/usr/bin/env node
// Scheda 5: eight actual 412x915 browser frames per distinct gesture scene.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(root, 'reports/codex/gesti-7999-34');
fs.mkdirSync(dir, { recursive: true });
const allCases = [
  { kind: 'tiro', gi: 0 }, { kind: 'tiro', gi: 2 }, { kind: 'tiro', gi: 3 },
  { kind: 'tiro', gi: 12 }, { kind: 'tiro', gi: 76 },
  { kind: 'testa', gi: 7 }, { kind: 'testa', gi: 55 }, { kind: 'testa', gi: 86 },
  { kind: 'esultanza', gi: 1 }, { kind: 'esultanza', gi: 90 }
];
const celebrationsOnly = process.argv.includes('--celebrations');
const lateOnly = process.argv.includes('--late');
const cases = celebrationsOnly ? allCases.filter(x => x.kind === 'esultanza')
  : lateOnly ? allCases.filter(x => (x.kind === 'tiro' && x.gi === 0) || (x.kind === 'testa' && x.gi === 55)) : allCases;
const targets = [2, 6, 10, 14, 18, 22, 26, 30];
const celebTargets = [1, 4, 8, 12, 16, 24, 32, 48];
const manifestFile = path.join(dir, 'manifest.json');
const manifest = (celebrationsOnly || lateOnly) && fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')).cases.filter(x => !cases.some(c => c.kind === x.kind && c.gi === x.gi)) : [];
const server = await startServer();
const browser = await launchBrowser();
try {
  for (const { kind, gi } of cases) {
    const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
    const record = { kind, gi, files: [], error: null };
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error.message)));
    await installCdnRoutes(page);
    await page.addInitScript(() => {
      window.__CPM_PRESENT = 1;
      window.__CPM_CINE = 1;
      window.__CPM_TIRO34_REC = 1;
      window.__CPM_TESTA33_REC = 1;
      window.__CPM_REC = true;
    });
    try {
      await openMatch(page, server.address().port, { skipLoadAll: true, name: `Gesti${gi}` });
      await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90_000 });
      await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CPM_TESTA33 = null; window.__CPM_FORCE_SIT(g, true); window.__CPM_FROZEN = false; }, gi);
      await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_choose', null, { timeout: 60_000 });
      await sleep(600);
      await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
      const goal = kind === 'esultanza' ? celebTargets
        : kind === 'tiro' && gi === 0 ? [2, 10, 20, 30, 36, 42, 48, 54]
        : kind === 'testa' && gi === 55 ? [2, 12, 22, 30, 38, 46, 54, 62] : targets;
      const deadline = Date.now() + 150_000;
      for (let ix = 0; ix < goal.length; ix++) {
        let state = null;
        while (Date.now() < deadline) {
          state = await page.evaluate(() => {
            const w = window.__CPM_TIRO34?.f || [];
            const c = window.__CPM_CELN || 0;
            const last = w.length ? w.at(-1) : null;
            return { resultFrames: w.length, celebFrames: c, last, fps: window.__CPM_FPS708 || null,
              phase: window.__CPM_PHASE?.() || null, plan: !!window.__CPM_CELEB };
          });
          if ((kind === 'esultanza' ? state.celebFrames : state.resultFrames) >= goal[ix]) break;
          await sleep(160);
        }
        if ((kind === 'esultanza' ? state?.celebFrames : state?.resultFrames) < goal[ix]) { record.lastState = state; break; }
        const file = `${kind}-gi${String(gi).padStart(3, '0')}-f${String(ix + 1).padStart(2, '0')}.jpg`;
        await page.screenshot({ path: path.join(dir, file), type: 'jpeg', quality: 82 });
        record.files.push({ file, target: goal[ix], ...state });
        record.lastState = state;
      }
    } catch (e) { record.error = String(e.stack || e); }
    if (pageErrors.length) record.pageErrors = pageErrors;
    manifest.push(record);
    fs.writeFileSync(manifestFile, JSON.stringify({ commit: '76b708a0', command: 'node tests/codex/capture-gestures.mjs' + (celebrationsOnly ? ' --celebrations' : lateOnly ? ' --late' : ''), viewport: [412, 915], cases: manifest }, null, 2));
    console.log(`${kind} gi${gi}: ${record.files.length}/8 frames; ${record.error || 'ok'}`);
    await page.close();
  }
} finally { await browser.close(); server.close(); }
