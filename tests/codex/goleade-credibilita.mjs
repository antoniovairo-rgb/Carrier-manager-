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
if (current && (current.commit !== commit || current.version !== version)) throw Error('Il checkpoint appartiene a un altro commit/versione');
const data = current || { version, commit, startedAt: new Date().toISOString(), commands: [], environment: {}, partA: [], partB: [] };
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
  data.environment = { platform: process.platform, arch: process.arch, node: process.version, cpu: os.cpus()[0]?.model || null, chrome: process.env.CPM_CHROME || null };
  const command = 'node tests/codex/goleade-credibilita.mjs B';
  if (!data.commands.includes(command)) data.commands.push(command);
  const server = await startServer();
  const browser = await launchBrowser();
  try {
    const liveLimit = Math.min(20, Math.max(1, Number(process.env.CPM_LIVE_MATCHES || 20)));
    for (let i = 0; i < liveLimit; i++) {
      if (data.partB.some(x => x.i === i && x.finished)) continue;
      const name = `Credibilita${i + 1}`;
      const seed = 960200 + i * 97;
      const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e.message)));
      await installCdnRoutes(page);
      await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
      const t0 = Date.now();
      let row;
      try {
        await openMatch(page, server.address().port, { skipLoadAll: true, name });
        await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
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
        row = { i, name, seed, finished: observed.phase === 'ended' || observed.phase === 'ceremony', ...observed, pageErrors, durationMs: Date.now() - t0 };
      } catch (e) { row = { i, name, seed, finished: false, error: String(e.stack || e), pageErrors, durationMs: Date.now() - t0 }; }
      finally { await context.close().catch(() => {}); }
      const old = data.partB.findIndex(x => x.i === i);
      if (old >= 0) data.partB[old] = row; else data.partB.push(row);
      save();
      console.log(`B ${i + 1}/20: ${row.finished ? 'completata' : 'non completata'} ${row.score ? `${row.score.home}-${row.score.away}` : ''}`);
    }
  } finally { await browser.close(); server.close(); }
}

console.log(`Checkpoint: ${output}`);
