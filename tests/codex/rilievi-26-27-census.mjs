#!/usr/bin/env node
// Censimento indipendente delle scene naturali per il rilievo 26-D.
// La fixture HTML viene precompilata da rilievi-precompile.mjs senza toccare il gioco.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from '../visual/node_modules/playwright/index.mjs';
import { startServer, installCdnRoutes, openMatch, matchPhase, sleep } from '../visual/lib/harness.mjs';

const root = process.cwd();
const output = path.join(root, 'tests/codex/rilievi-26-27-census.json.gz');
const fixture = fs.readFileSync(path.join(root, 'tests/codex/rilievi-precompiled.html'), 'utf8');
const raw = fs.existsSync(output) ? JSON.parse(zlib.gunzipSync(fs.readFileSync(output))) : {
  version: '7.999.96', commit: 'ccabb486d7bc957edc8d7a39ef45d2c51bb80d32',
  command: 'CPM_CHROME=<chrome> node tests/codex/rilievi-26-27-census.mjs',
  settings: { autoplaySpeed: '2', tickMs: 300, viewport: [360, 640], dSF: 1, glb: false },
  games: []
};
const save = () => fs.writeFileSync(output, zlib.gzipSync(JSON.stringify(raw)));
const desired = Math.max(1, Number(process.env.CPM_VALID || 30));
const maxSeeds = Math.max(desired, Number(process.env.CPM_MAX_SEEDS || 45));
const server = await startServer();
try {
  for (let i = 0; i < maxSeeds && raw.games.filter(x => x.finished).length < desired; i++) {
    if (raw.games.some(x => x.i === i)) continue;
    const freeGiB = os.freemem() / 2 ** 30;
    if (freeGiB < 2.2) { console.log(`Pausa per memoria libera ${freeGiB.toFixed(2)} GiB`); break; }
    const name = `Rilievi${i + 1}`;
    const seed = 972600 + 97 * i;
    const browser = await chromium.launch({ headless: true, executablePath: process.env.CPM_CHROME,
      args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--renderer-process-limit=1', '--disable-extensions', '--disable-background-networking', '--no-sandbox'] });
    let memoryAbort = false;
    const guard = setInterval(() => {
      if (!memoryAbort && os.freemem() < 1.5 * 2 ** 30) { memoryAbort = true; browser.close().catch(() => {}); }
    }, 250);
    let row;
    const t0 = Date.now();
    try {
      const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e.message)));
      await installCdnRoutes(page);
      await page.route('**/CARRIER-MANAGER-AV.html?*', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixture }));
      await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', '2'); });
      await openMatch(page, server.address().port, { skipLoadAll: true, name });
      await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
      let phase;
      while (Date.now() - t0 < 300000) {
        phase = await matchPhase(page);
        if (phase === 'ended' || phase === 'ceremony') break;
        await sleep(500);
      }
      const data = await page.evaluate(() => {
        const events = window.__CPM_EV?.() || [];
        return { phase: window.__CPM_PHASE?.() || null,
          scenes: events.filter(e => e.ev === 'scena').map(e => ({ min: e.min ?? null, src: e.src ?? null, kind: e.kind ?? null, sk: e.sk ?? null })),
          numHL: window.__CPM_NUMHL?.() ?? null, origins: window.__CPM_ORIG26 || [],
          timelineActionResolved: (window.__CPM_TIMELINE?.() || []).filter(e => e.type === 'ActionResolved').length };
      });
      row = { i, name, seed, finished: data.phase === 'ended' || data.phase === 'ceremony', ...data,
        pageErrors, durationMs: Date.now() - t0, memoryAbort };
      await context.close().catch(() => {});
    } catch (e) { row = { i, name, seed, finished: false, error: String(e.stack || e), durationMs: Date.now() - t0, memoryAbort }; }
    finally { clearInterval(guard); await browser.close().catch(() => {}); }
    raw.games.push(row);
    save();
    console.log(`${raw.games.filter(x => x.finished).length}/${desired} valide, seme ${seed}: ${row.finished ? `${row.scenes.length} scene` : 'non concluso'}`);
  }
} finally { server.close(); }
console.log(output);
