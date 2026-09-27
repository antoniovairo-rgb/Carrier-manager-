#!/usr/bin/env node
// Scheda 3 proposal: wait for real running samples and exclude repositioning spikes.
import { startServer, launchBrowser, installCdnRoutes, openMatch } from '../visual/lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const red = process.env.CPM_ROSSO === '1';
const server = await startServer();
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = true; if (r) window.__CPM_NO_PASSO7 = 1; }, red);
let sample = null;
try {
  await openMatch(page, server.address().port, { name: 'Passo7Stable' });
  await page.evaluate(() => window.__CPM_AUTOPLAY?.(true, { seed: 11, policy: 'seeded', tickMs: 300 }));
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    sample = await page.evaluate(() => ({ p7: window.__CPM_PASSO7 || null, st: (window.__CPM_STRIDE || []).slice(-600), fps: window.__CPM_FPS708 || null }));
    let slow = 0, fast = 0;
    for (const [v, cadence] of sample.st) if (cadence > 0) {
      if (v >= 2 && v < 4) slow++;
      else if (v >= 4 && v <= 9) fast++;
    }
    if (slow >= 20 && fast >= 10) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
} finally {
  await browser.close();
  server.close();
}
const bands = { '2-4': [], '4-9': [] };
let excluded = 0;
for (const [v, cadence] of sample?.st || []) {
  if (v > 9) excluded++;
  if (cadence <= 0) continue;
  if (v >= 2 && v < 4) bands['2-4'].push(v / cadence);
  else if (v >= 4 && v <= 9) bands['4-9'].push(v / cadence);
}
const measured = Object.entries(bands).map(([band, a]) => ({ band, n: a.length, mean: a.length ? a.reduce((x, y) => x + y, 0) / a.length : null }));
const ratio = measured.every(x => x.mean != null) ? Math.max(...measured.map(x => x.mean)) / Math.min(...measured.map(x => x.mean)) : null;
const detail = Object.fromEntries(Object.entries(bands).map(([name, values]) => {
  const a = [...values].sort((x, y) => x - y);
  return [name, { n: a.length, median: a.length ? a[Math.floor(a.length / 2)] : null,
    p90: a.length ? a[Math.floor(a.length * 0.9)] : null, max: a.at(-1) || null }];
}));
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../reports/codex', red ? 'passo-stabile-rosso-campioni.json' : 'passo-stabile-verde-campioni.json');
fs.writeFileSync(out, JSON.stringify({ red, sample, detail, measured, excluded, ratio }, null, 2));
console.log(JSON.stringify({ red, measured, detail, excluded, ratio, fps: sample?.fps || null, sampleCount: sample?.st?.length || 0, errors }));
const failures = [];
if (!red && !sample?.p7) failures.push('velocita naturale della clip non misurata');
if (bands['2-4'].length < 20 || bands['4-9'].length < 10) failures.push(`misura non fatta: 2-4 n=${bands['2-4'].length}, 4-9 n=${bands['4-9'].length}`);
if (ratio != null && ratio > 1.15) failures.push(`scarto x${ratio.toFixed(2)} > x1.15`);
if (errors.length) failures.push(`errore pagina: ${errors[0]}`);
console.log(failures.length ? 'FAIL ' + failures.join(' | ') : 'PASS');
process.exit(failures.length ? 1 : 0);
