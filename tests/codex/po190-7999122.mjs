#!/usr/bin/env node
// PO-190, 7.999.122: coppie verde/rosso di partite vissute dalla fixture S12.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { gzipSync, gunzipSync } from 'node:zlib';
import { chromium } from '../visual/node_modules/playwright/index.mjs';
import { startServer, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const fixturePath = path.resolve(process.env.CPM_SAVE_190 || 'tests/visual/fixtures/save-190-s12-ovr93.json');
const outputPath = path.resolve('tests/codex/po190-7999122.json.gz');
const version = fs.readFileSync('src/07-versione-save-interviste.jsx', 'utf8').match(/const GAME_VERSION="([^"]+)"/)?.[1];
if (version !== '7.999.122') throw Error(`Serve GAME_VERSION 7.999.122; trovata ${version}`);
if (!fs.existsSync(fixturePath)) throw Error(`Salvataggio assente: ${fixturePath}`);
const fixtureFile = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const sourceSave = typeof fixtureFile['cpm-v3'] === 'string' ? JSON.parse(fixtureFile['cpm-v3'])
  : fixtureFile.player ? fixtureFile : fixtureFile.save?.player ? fixtureFile.save : null;
if (!sourceSave?.player?.name) throw Error('Formato salvataggio non riconosciuto: manca player.name');
const commit = execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'merge-base', 'HEAD', 'origin/main'], { encoding: 'utf8' }).trim();
const opponents = [...new Map((sourceSave.player.calendar || []).filter(m => m.played && !m.type && m.opponentId)
  .map(m => [m.opponentId, { id: m.opponentId, name: m.opponentName }])).values()];
if (!opponents.length) throw Error('Nessun avversario di lega nel calendario della fixture');
const total = Number(process.env.CPM_MATCHES || 30);
if (!Number.isInteger(total) || total < 30) throw Error(`CPM_MATCHES deve essere almeno 30: ${total}`);
function prepareCase(index) {
  const name = `PO190 Prova ${String(index + 1).padStart(2, '0')}`;
  const namedSave = structuredClone(sourceSave);
  namedSave.player.name = name;
  const opponent = opponents[index % opponents.length];
  // Le guardie del gioco confrontano sia calendario sia storico per avversario/sede.
  // Rinominare il precedente incrocio prima di assegnare l'avversario alla W38.
  for (const m of namedSave.player.calendar || []) if (m.played && !m.type && m.opponentId === opponent.id) {
    m.opponentId = `alt-${index}`; m.opponentName = 'Altro Club';
  }
  for (const h of namedSave.player.matchHistory || []) if (h.season === namedSave.player.season && h.opponent === opponent.name && !h.cup && !h.euro) {
    h.opponent = 'Altro Club';
  }
  const week38 = namedSave.player.calendar?.find(m => m.week === 38 && m.matchday === 34 && !m.type);
  if (!week38 || week38.played) throw Error('Fixture W38/MD34 non pronta');
  week38.opponentId = opponent.id; week38.opponentName = opponent.name; week38.isHome = index % 2 === 0;
  return { name, namedSave, opponent, week38, seed: 19012200 + index };
}
if (process.env.CPM_DRY_RUN === '1') {
  const cases = Array.from({ length: total }, (_, index) => {
    const { name, namedSave, opponent, week38, seed } = prepareCase(index);
    const alreadyPlayed = namedSave.player.calendar.some(m => m !== week38 && m.played && !m.type &&
      (m.opponentId === opponent.id || m.opponentName === opponent.name) && m.isHome === week38.isHome);
    const historyConflict = namedSave.player.matchHistory.some(h => h.season === namedSave.player.season &&
      h.opponent === opponent.name && h.isHome === week38.isHome && !h.cup && !h.euro);
    if (alreadyPlayed || historyConflict || namedSave.player.playedMd?.md?.includes(34))
      throw Error(`Guardia anti-duplicato non risolta per indice ${index}`);
    return { index, name, seed, opponent, isHome: week38.isHome, alreadyPlayed, historyConflict };
  });
  console.log(JSON.stringify({ version, commit, dryRun: true, cases }));
  process.exit(0);
}
const data = fs.existsSync(outputPath) ? JSON.parse(gunzipSync(fs.readFileSync(outputPath)))
  : { version, commit, source: path.relative('.', fixturePath), command: 'node tests/codex/po190-7999122.mjs', matches: [] };
if (data.version !== version || data.commit !== commit) throw Error('Il grezzo appartiene a una base diversa');
const save = () => fs.writeFileSync(outputPath, gzipSync(JSON.stringify(data), { level: 9 }));
const freeGB = () => os.freemem() / 2 ** 30;
const memoryOK = () => freeGB() >= 3.5;
if (!memoryOK()) { data.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2) }; save(); process.exit(0); }
const server = await startServer();
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CPM_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--renderer-process-limit=1', '--disable-extensions', '--disable-background-networking', '--no-sandbox'],
});
try {
  for (let index = 0; index < total; index++) {
    for (const arm of ['verde', 'rosso']) {
    if (data.matches.some(row => row.index === index && row.arm === arm && row.valid)) continue;
    if (!memoryOK()) { data.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2) }; save(); break; }
    const { name, namedSave, opponent, week38, seed } = prepareCase(index);
    const row = { index, arm, name, seed, opponent, isHome: week38.isHome,
      season: namedSave.player.season, week: namedSave.player.week,
      startedAt: new Date().toISOString(), valid: false };
    data.matches.push(row); save();
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const page = await context.newPage();
    let lowMemory = false;
    const guard = setInterval(() => {
      if (memoryOK()) return;
      lowMemory = true;
      context.close().catch(() => {});
    }, 1000);
    try {
      await installCdnRoutes(page);
      await page.addInitScript(({saveText, red}) => {
        window.__CPM_GLB = false;
        window.__CPM_REC = true;
        window.__CPM_NO_RIG190 = red;
        window.__CPM_NO_DEB190 = red;
        localStorage.setItem('cpm-v3', saveText);
      }, { saveText: JSON.stringify(namedSave), red: arm === 'rosso' });
      await page.goto(`http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      const enterUntil = Date.now() + 60000;
      while (Date.now() < enterUntil && !(await page.evaluate(() => !!window.__CPM_CAREER).catch(() => false))) {
        const button = page.getByText(/CONTINUA/i).first();
        if (await button.isVisible().catch(() => false)) await button.click({ timeout: 1500, noWaitAfter: true }).catch(() => {});
        await sleep(500);
      }
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 10000 });
      row.before = await page.evaluate(() => {
        const s = window.__CPM_CAREER.snapshot();
        return { name: s.name, season: s.season, week: s.week, ovr: s.ovr, club: s.club?.n, contractExpired: !!s.contractExpired };
      });
      if (row.before.name !== name || row.before.contractExpired) throw Error(`Salvataggio non pronto: ${JSON.stringify(row.before)}`);
      for (let n = 0; n < 12; n++) {
        const md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
        if (md && typeof md === 'object') { row.matchday = md; break; }
        const step = await page.evaluate(() => { const C = window.__CPM_CAREER; const result = C.step(); C.dismiss(); return result; });
        row.preSteps ||= [];
        row.preSteps.push(step);
        if (typeof step === 'string' && /^(blocked|error):/.test(step)) throw Error(`Passo verso la partita: ${step}`);
        await sleep(250);
      }
      if (!row.matchday) throw Error('Nessuna partita trovata entro 12 passi');
      row.playMatch = await page.evaluate(() => window.__CPM_CAREER.playMatch());
      if (row.playMatch !== true) throw Error(`playMatch: ${row.playMatch}`);
      await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 60000 });
      await page.evaluate(seed => window.__CPM_AUTOPLAY(true, { seed, policy: 'seeded', tickMs: 150 }), seed);
      const deadline = Date.now() + 300000;
      while (Date.now() < deadline) {
        const phase = await page.evaluate(() => window.__CPM_PHASE?.() ?? null);
        if (phase === 'ended' || phase === 'ceremony') break;
        if (phase === 'hl_result') await page.getByRole('button', { name: 'Continua', exact: true }).last().click({ timeout: 3000 }).catch(() => {});
        await sleep(250);
      }
      row.match = await page.evaluate(() => ({ phase: window.__CPM_PHASE?.(), score: window.__CPM_SCORE?.(),
        events: window.__CPM_EV?.() ?? [], tab: window.__CPM_MOTORE_OBJ?.()?.tabellino?.() ?? null,
        brain: window.__CPM_BRAIN82 ?? [], b2: window.__CPM_B2 ?? null, sp3: window.__CPM_SP3 ?? [] }));
      row.goals = row.match.events.filter(e => e?.ev === 'goal').map(e => ({ side: e.side, src: e.src, min: e.min }));
      row.eventGoals = { home: row.goals.filter(g => g.side === 'home').length, away: row.goals.filter(g => g.side === 'away').length };
      row.attributionComplete = row.eventGoals.home === row.match.score?.home && row.eventGoals.away === row.match.score?.away
        && row.goals.every(g => g.side && g.src);
      row.valid = ['ended', 'ceremony'].includes(row.match.phase) && !!row.match.score;
      row.goalSources = Object.fromEntries(['highlight', 'setpiece', 'cronaca', 'microsim'].map(src =>
        [src, row.goals.filter(g => g.side === 'home' && g.src === src).length]));
      row.heroPenaltyScenes = row.match.sp3.filter(x => x.k === 'penalty').length;
      row.motorPenaltiesCommitted = { home: row.match.tab?.home?.rigori ?? null, away: row.match.tab?.away?.rigori ?? null };
      row.heroTeamMotorPenaltiesEarned = row.motorPenaltiesCommitted.away;
      row.heroScenes = row.match.b2?.n ?? null;
      row.heroMeanProbability = row.match.b2?.n ? row.match.b2.pSum / row.match.b2.n : null;
    } catch (error) {
      row.error = String(error.stack || error);
      if (lowMemory) row.lowMemory = true;
    } finally {
      clearInterval(guard);
      row.finishedAt = new Date().toISOString();
      save();
      await context.close().catch(() => {});
    }
    console.log(JSON.stringify({ index, arm, valid: row.valid, score: row.match?.score, sources: row.goalSources, error: row.error?.slice(0, 120) }));
    if (lowMemory) break;
    }
    if (!memoryOK()) break;
  }
} finally {
  await browser.close();
  server.closeAllConnections?.();
  server.close();
  save();
}
