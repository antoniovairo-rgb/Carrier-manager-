#!/usr/bin/env node
// Collaudo PO-021/035. Eseguire dalla radice del repository:
// node tests/codex/goleade-credibilita.mjs A
// node tests/codex/goleade-credibilita.mjs B
// Le due fasi salvano un checkpoint dopo ogni partita; B non altera A.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { gzipSync, gunzipSync } from 'node:zlib';

const root = process.cwd();
const output = path.join(root, 'tests/codex/goleade-credibilita.json.gz');
const html = fs.readFileSync(path.join(root, 'CARRIER-MANAGER-AV.html'), 'utf8');
const version = html.match(/const GAME_VERSION="([^"]+)"/)?.[1] ?? null;
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (!version || Number(version.split('.').at(-1)) < 96) throw Error(`Versione insufficiente: ${version ?? 'non trovata'}`);
const phase = (process.argv[2] || '').toUpperCase();
if (!['A', 'B'].includes(phase)) throw Error('Specificare A oppure B');
const current = fs.existsSync(output) ? JSON.parse(gunzipSync(fs.readFileSync(output)).toString('utf8')) : null;
if (current) {
  const gameDiff = execFileSync('git', ['diff', '--name-only', `${current.commit}..HEAD`, '--', 'CARRIER-MANAGER-AV.html', 'src', 'prototipo'], { cwd: root, encoding: 'utf8' }).trim();
  if (current.version !== version || gameDiff) throw Error('Il checkpoint appartiene a una versione diversa del gioco');
}
const data = current || { version, commit, startedAt: new Date().toISOString(), commands: [], environment: {}, partA: [], partB: [] };
data.speedChecks ||= [];
function save() {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  // Su Windows renameSync non sostituisce in modo affidabile un file già presente.
  const bytes = gzipSync(Buffer.from(JSON.stringify(data)), { level: 9 });
  for (let attempt = 0; attempt < 50; attempt++) {
    try { fs.writeFileSync(output, bytes); return; }
    catch (e) {
      if (!['EBUSY', 'EPERM', 'EACCES'].includes(e.code) || attempt === 49) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}
function avg(xs) { return xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : null; }
function pick(t, field) { return typeof t?.[field] === 'number' ? t[field] : null; }

if (phase === 'A') {
  await import('../../prototipo/partita-vera/motore-v2.js');
  await import('../../prototipo/partita-vera/partita.js');
  globalThis.window = {};
  const pairs = [[50, 50], [60, 50], [70, 50], [80, 50], [95, 50], [95, 80], [50, 95]];
  const limit = Math.min(100, Math.max(1, Number(process.env.CPM_GAMES_PER_PAIR || 100)));
  const command = `node tests/codex/goleade-credibilita.mjs A`;
  if (!data.commands.includes(command)) data.commands.push(command);
  for (let pair = 0; pair < pairs.length; pair++) {
    const [homeStrength, awayStrength] = pairs[pair];
    for (let i = 0; i < limit; i++) {
      const seed = 960100 + pair * 1000 + i;
      if (data.partA.some(x => x.seed === seed)) continue;
      const t0 = performance.now();
      const P = globalThis.creaPartita({
        crea: cfg => globalThis.creaMotoreV2({ ...cfg, occasioniV2: false }),
        registra: false, v2: true, seed,
        casa: { sigla: 'CASA', forza: homeStrength },
        ospite: { sigla: 'OSP', forza: awayStrength },
        eroeLato: 'home', eroe: { nome: 'EROE', ovr: homeStrength }
      });
      const result = P.tuttaSubito();
      const goals = P.stato.eventi.filter(e => e.t === 'gol');
      const tab = result.tab || P.motore.tabellino();
      data.partA.push({ pair: `${homeStrength}-${awayStrength}`, homeStrength, awayStrength, seed,
        home: result.casa, away: result.ospite, eventGoals: goals.length,
        tab: {
          home: Object.fromEntries(['tiri', 'inPorta', 'possesso', 'falli'].map(k => [k, pick(tab?.eroe || tab?.home, k)])),
          away: Object.fromEntries(['tiri', 'inPorta', 'possesso', 'falli'].map(k => [k, pick(tab?.avv || tab?.away, k)]))
        }, durationMs: Math.round(performance.now() - t0) });
      if ((i + 1) % 10 === 0 || i + 1 === limit) save();
    }
    const rows = data.partA.filter(x => x.pair === `${homeStrength}-${awayStrength}`);
    console.log(`A ${homeStrength}-${awayStrength}: ${rows.length}/100, gol medi ${avg(rows.map(x => x.home))?.toFixed(2)}-${avg(rows.map(x => x.away))?.toFixed(2)}`);
  }
} else {
  const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } = await import('../visual/lib/harness.mjs');
  const light = process.env.CPM_LIGHT_CHROME === '1';
  const fixture = light ? fs.readFileSync(path.join(root, 'tests/codex/goleade-precompiled.html'), 'utf8') : null;
  data.environment = { platform: process.platform, arch: process.arch, node: process.version, cpu: os.cpus()[0]?.model || null, chrome: process.env.CPM_CHROME || null, light, precompiledFixture: !!fixture };
  const command = 'node tests/codex/goleade-credibilita.mjs B';
  if (!data.commands.includes(command)) data.commands.push(command);
  const server = await startServer();
  const browser = light ? await (await import('../visual/node_modules/playwright/index.mjs')).chromium.launch({
    headless: true, executablePath: process.env.CPM_CHROME,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--renderer-process-limit=1', '--disable-extensions', '--disable-background-networking', '--no-sandbox']
  }) : await launchBrowser();
  let memoryAbort = false;
  const guard = setInterval(() => {
    if (!memoryAbort && os.freemem() < 1.5 * 2 ** 30) {
      memoryAbort = true;
      browser.close().catch(() => {});
    }
  }, 250);
  try {
    const liveLimit = Math.min(40, Math.max(1, Number(process.env.CPM_LIVE_MATCHES || 20)));
    const replayIndex = process.env.CPM_REPLAY_INDEX == null ? null : Number(process.env.CPM_REPLAY_INDEX);
    const indices = replayIndex == null ? Array.from({ length: liveLimit }, (_, i) => i) : [replayIndex];
    const skip = new Set((process.env.CPM_SKIP_INDICES || '').split(',').filter(Boolean).map(Number));
    const matchSpeed = process.env.CPM_MATCH_SPEED || '1';
    const tickMs = Math.max(25, Number(process.env.CPM_AUTOPLAY_TICK_MS || 300));
    for (const i of indices) {
      if (skip.has(i)) continue;
      if (replayIndex == null && data.partB.some(x => x.i === i && x.finished)) continue;
      const name = `Credibilita${i + 1}`;
      const seed = 960200 + i * 97;
      if (memoryAbort) throw Error('Interrotto: memoria libera sotto 1,5 GB');
      const context = await browser.newContext({ viewport: light ? { width: 360, height: 640 } : { width: 412, height: 915 }, deviceScaleFactor: light ? 1 : 2, serviceWorkers: 'block' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e.message)));
      await installCdnRoutes(page);
      if (fixture) await page.route('**/CARRIER-MANAGER-AV.html?*', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixture }));
      await page.addInitScript(speed => { window.__CPM_GLB = false; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', speed); }, matchSpeed);
      const t0 = Date.now();
      let row;
      try {
        await openMatch(page, server.address().port, { skipLoadAll: true, name });
        await page.evaluate(({ seed, tickMs }) => window.__CPM_AUTOPLAY(true, { seed, policy: 'seeded', tickMs }), { seed, tickMs });
        let phaseNow = null;
        while (Date.now() - t0 < 300000) {
          phaseNow = await matchPhase(page);
          if (phaseNow === 'ended' || phaseNow === 'ceremony') break;
          await sleep(500);
        }
        const observed = await page.evaluate(() => {
          const state = window.__CPM_STATE?.();
          const events = window.__CPM_EV?.() || [];
          const score = window.__CPM_SCORE?.() || null;
          const motor = window.__CPM_MOTORE_OBJ?.();
          return { phase: window.__CPM_PHASE?.() || null, score, strength: { home: state?.ctx?.home?.forza ?? null, away: state?.ctx?.away?.forza ?? null },
            stateContext: state?.ctx || null,
            goals: events.filter(e => e.ev === 'goal').map(e => ({ time: e.m ?? e.d?.min ?? null, side: e.d?.side ?? e.d?.lato ?? e.side ?? null, src: e.d?.src ?? e.src ?? null, raw: e })),
            tab: motor?.tabellino?.() || null };
        });
        row = { i, name, seed, matchSpeed, tickMs, finished: observed.phase === 'ended' || observed.phase === 'ceremony', ...observed, pageErrors, durationMs: Date.now() - t0 };
      } catch (e) { row = { i, name, seed, matchSpeed, tickMs, finished: false, error: String(e.stack || e), pageErrors, durationMs: Date.now() - t0 }; }
      finally { await context.close().catch(() => {}); }
      if (replayIndex == null) {
        const old = data.partB.findIndex(x => x.i === i);
        if (old >= 0) data.partB[old] = row; else data.partB.push(row);
      } else data.speedChecks.push({ replayOf: i, row });
      save();
      console.log(`B ${i + 1}/20: ${row.finished ? 'completata' : 'non completata'} ${row.score ? `${row.score.home}-${row.score.away}` : ''}`);
    }
  } finally { clearInterval(guard); await browser.close().catch(() => {}); server.close(); }
}

console.log(`Checkpoint: ${output}`);
