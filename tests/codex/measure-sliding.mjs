#!/usr/bin/env node
// Scheda 4: inspect the existing per-frame witness; never alter game state outside test hooks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';
import { loadSituations } from '../visual/lib/situations.mjs';
import { loadCine } from '../visual/lib/cine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outFile = path.join(root, 'reports/codex/2026-09-27-scivolamento-corsa-data.json');
const sits = loadSituations();
const { deriveHL } = loadCine();
const selected = [0, 2, 12];
for (let i = 0; i < sits.length && selected.length < 10; i++) {
  if (selected.includes(i)) continue;
  const action = sits[i]?.actions?.[0];
  const hl = action && deriveHL(sits[i], action);
  if (hl?.type === 'shot' && !/chip|volley|scissor/i.test(hl.variant || '') &&
      !/rovesciat|sforbiciat/i.test(sits[i].text || '')) selected.push(i);
}

const server = await startServer();
const browser = await launchBrowser();
const rows = [];
const median = values => { if (!values.length) return null; const a = [...values].sort((x, y) => x - y); const m = Math.floor(a.length / 2); return +(a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2).toFixed(2); };
try {
  for (const gi of selected) {
    const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message)));
    await installCdnRoutes(page);
    await page.addInitScript(() => {
      window.__CPM_PRESENT = 1;
      window.__CPM_CINE = 1;
      window.__CPM_TIRO34_REC = 1;
      window.__CODEX_RAF = [];
      const record = time => {
        try { if (window.__CPM_PHASE?.() === 'hl_result' && window.__CODEX_RAF.length < 1200) window.__CODEX_RAF.push(time); } catch {}
        requestAnimationFrame(record);
      };
      requestAnimationFrame(record);
    });
    const row = { gi, action: 0, scene: sits[gi]?.text || null, error: null, samples: [] };
    try {
      await openMatch(page, server.address().port, { skipLoadAll: true, name: `Slip${gi}` });
      await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90_000 });
      await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CODEX_RAF = []; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
      await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_choose', null, { timeout: 45_000 });
      await sleep(600);
      await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
      let last = -1;
      for (let i = 0; i < 85; i++) {
        await sleep(500);
        const n = await page.evaluate(() => window.__CPM_TIRO34?.f?.length || 0);
        if (n > 25 && n === last) break;
        last = n;
      }
      const data = await page.evaluate(() => ({ witness: window.__CPM_TIRO34 || null, raf: window.__CODEX_RAF || [], fpsEma: window.__CPM_FPS708 || null }));
      const f = data.witness?.f || [];
      const firstKick = f.findIndex(x => x.g === 'kick');
      row.witnessFrames = f.length;
      row.firstKick = firstKick;
      row.fpsEma = data.fpsEma == null ? null : +data.fpsEma.toFixed(2);
      const times = data.raf;
      row.rafFrames = times.length;
      row.fpsMeasured = times.length > 1 ? +((times.length - 1) * 1000 / (times.at(-1) - times[0])).toFixed(2) : null;
      const pre = firstKick < 0 ? f : f.slice(0, firstKick);
      row.samples = pre.filter(x => x.sl != null && Number.isFinite(x.v)).map(x => ({ t: x.t, v: x.v, sl: x.sl, g: x.g, w: x.w }));
      row.sampleCount = row.samples.length;
      row.slMedian = median(row.samples.map(x => x.sl));
      if (errors.length) row.pageErrors = errors;
    } catch (e) { row.error = String(e.stack || e); }
    rows.push(row);
    console.log(JSON.stringify({ gi, error: row.error, frames: row.witnessFrames, samples: row.sampleCount, fps: row.fpsMeasured, slMedian: row.slMedian }));
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
const bands = { '0-3': [], '3-6': [], '6-9': [], '9+': [] };
for (const row of rows) for (const s of row.samples) {
  const key = s.v < 3 ? '0-3' : s.v < 6 ? '3-6' : s.v < 9 ? '6-9' : '9+';
  bands[key].push(s.sl);
}
const summary = Object.fromEntries(Object.entries(bands).map(([key, values]) => [key, { n: values.length, median: median(values) }]));
fs.writeFileSync(outFile, JSON.stringify({ version: '7.999.34', commit: '76b708a0', command: 'node tests/codex/measure-sliding.mjs', selected, rows, summary }, null, 2));
console.log('BANDS ' + JSON.stringify(summary));
