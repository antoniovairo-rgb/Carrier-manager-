#!/usr/bin/env node
// Rilegge le schede effettivamente mostrate in una partita con quattro punizioni.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from '../visual/node_modules/playwright/index.mjs';
import { startServer, installCdnRoutes, openMatch, matchPhase, sleep } from '../visual/lib/harness.mjs';

const root = process.cwd();
const output = path.join(root, 'tests/codex/rilievi-27b-replay.json');
const fixture = fs.readFileSync(path.join(root, 'tests/codex/rilievi-precompiled.html'), 'utf8');
const seed = Number(process.env.CPM_SEED || 974734);
const name = process.env.CPM_NAME || 'Rilievi23';
const server = await startServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.CPM_CHROME,
  args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--renderer-process-limit=1', '--disable-extensions', '--disable-background-networking', '--no-sandbox'] });
let memoryAbort = false;
const guard = setInterval(() => { if (!memoryAbort && os.freemem() < 1.5 * 2 ** 30) { memoryAbort = true; browser.close().catch(() => {}); } }, 250);
const seen = new Set();
const cards = [];
const started = Date.now();
let row;
let catalog = null;
try {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  await installCdnRoutes(page);
  await page.route('**/CARRIER-MANAGER-AV.html?*', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixture }));
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', '2'); });
  await openMatch(page, server.address().port, { skipLoadAll: true, name });
  catalog = await page.evaluate(() => {
    const used = [];
    for (let i = 0; i < SITUATIONS.length; i++) {
      const s = SITUATIONS[i];
      if (!s || s.type === 'def') continue;
      const penalty = isPenaltySit(s);
      const direct = deriveIntent(s) === 'freekick' && !/fascia|indirett|defilat/i.test(String(s.text || ''));
      if (penalty || direct) used.push({ gi: i, text: s.text, penalty, direct });
    }
    return used;
  });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  let phase;
  while (Date.now() - started < 300000) {
    phase = await matchPhase(page);
    if (phase === 'ended' || phase === 'ceremony') break;
    const hit = await page.evaluate(() => {
      const ph = window.__CPM_PHASE?.() || null;
      if (!ph?.startsWith('hl_')) return null;
      const s = window.__CPM_CURSIT?.();
      if (!s) return null;
      const sit = SITUATIONS[s.gi];
      return { phase: ph, i: s.i ?? null, gi: s.gi, text: sit?.text ?? null, intent: sit ? deriveIntent(sit) : null,
        penalty: sit ? isPenaltySit(sit) : null, origin: typeof _ORIG26 !== 'undefined' ? _ORIG26?.kind ?? null : null };
    }).catch(() => null);
    if (hit) { const key = `${hit.i}/${hit.gi}/${hit.phase}`; if (!seen.has(key)) { seen.add(key); cards.push(hit); } }
    await sleep(500);
  }
  row = await page.evaluate(() => ({ phase: window.__CPM_PHASE?.(),
    scenes: (window.__CPM_EV?.() || []).filter(e => e.ev === 'scena').map(e => ({ min: e.min, src: e.src, kind: e.kind, sk: e.sk })),
    resolved: (window.__CPM_TIMELINE?.() || []).filter(e => e.type === 'ActionResolved').length,
    numHL: window.__CPM_NUMHL?.() ?? null }));
  row = { seed, name, durationMs: Date.now() - started, catalog, cards, ...row, memoryAbort };
  await context.close().catch(() => {});
} catch (e) { row = { seed, name, durationMs: Date.now() - started, catalog, cards, error: String(e.stack || e), memoryAbort }; }
finally { clearInterval(guard); await browser.close().catch(() => {}); server.close(); }
fs.writeFileSync(output, JSON.stringify(row, null, 2));
console.log(JSON.stringify({ output, phase: row.phase, resolved: row.resolved, candidates: row.catalog?.length, cards: row.cards?.length, error: row.error?.split('\n')[0] }));
