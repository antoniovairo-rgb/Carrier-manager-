import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root = process.cwd();
const output = path.join(root, 'tests/codex/premiazione-3d.json');
const photoDir = path.join(root, 'reports/codex/premiazione-3d');
fs.mkdirSync(photoDir, { recursive: true });
const version = fs.readFileSync('src/07-versione-save-interviste.jsx', 'utf8').match(/const GAME_VERSION="([^"]+)"/)?.[1];
if (!version || Number(version.split('.').at(-1)) < 111) throw Error(`Versione insufficiente: ${version}`);
const data = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : { version, commit: '8cef5317', command: 'node tests/codex/premiazione-3d.mjs', cases: [] };
const save = () => fs.writeFileSync(output, JSON.stringify(data, null, 2));
const freeGB = () => os.freemem() / 2 ** 30;
if (freeGB() < 3.5) {
  data.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2), at: new Date().toISOString() };
  save();
  console.log(JSON.stringify(data.paused));
  process.exit(2);
}
const server = await startServer();
const browser = await launchBrowser();
try {
  for (const kind of ['league', 'cup', 'euro']) {
    if (data.cases.some(c => c.kind === kind && c.completed)) continue;
    if (freeGB() < 3.5) { data.paused = { reason: 'RAM libera sotto 3,5 GB', freeGB: +freeGB().toFixed(2), at: new Date().toISOString() }; save(); break; }
    const row = { kind, startedAt: new Date().toISOString(), samples: [], photos: [], completed: false };
    data.cases.push(row); save();
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
    const page = await context.newPage();
    await installCdnRoutes(page);
    await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; });
    try {
      await openMatch(page, server.address().port, { skipLoadAll: true, name: `Premiazione-${kind}` });
      await page.waitForFunction(() => typeof window.__CPM_FORCE_CEREMONY === 'function', null, { timeout: 30000 });
      await page.waitForFunction(() => window.__CPM_MXCLIP > 0, null, { timeout: 30000 });
      row.glbMounted = await page.evaluate(() => window.__CPM_MXCLIP > 0);
      row.accepted = await page.evaluate(k => window.__CPM_FORCE_CEREMONY({ name: k === 'league' ? 'CAMPIONI PREMIER DIVISION' : `CAMPIONI ${k.toUpperCase()}`, kind: k }), kind);
      if (!row.accepted) throw Error(`kind ${kind} rifiutato da __CPM_FORCE_CEREMONY`);
      const start = Date.now();
      for (let n = 0; n <= 200; n++) {
        if (freeGB() < 2.2) throw Error(`RAM durante Chromium ${freeGB().toFixed(2)} GB < 2,2 GB`);
        const target = start + n * 50;
        if (Date.now() < target) await sleep(target - Date.now());
        const witness = await page.evaluate(() => ({
          at: performance.now(), ceremonyTime: window.__CPM_CERT ?? null,
          state: window.__CPM_STATE?.() ?? null,
          foot: window.__CPM_FOOT77?.() ?? null,
          gesture: window.__CPM_GST ?? null,
          actors: window.__CPM_CGTRADER_ACTORS_AUDIT?.() ?? null,
          ceremony: (window.__CPM_CER476 ?? []).at(-1) ?? null,
        }));
        row.samples.push({ elapsedMs: Date.now() - start, ...witness });
        if ([0, 2, 5, 8].includes(n / 20)) {
          const file = path.join(photoDir, `${kind}-${n / 20}s.png`);
          await page.screenshot({ path: file, timeout: 20000 });
          row.photos.push(path.relative(root, file).replaceAll('\\', '/'));
        }
        if (n % 20 === 0) save();
      }
      row.witnessFrames = await page.evaluate(() => window.__CPM_CER476 ?? []);
      row.elapsedMs = Date.now() - start;
      row.completed = row.samples.length === 201 && row.photos.length === 4;
    } catch (error) { row.error = String(error.stack || error); }
    finally { row.finishedAt = new Date().toISOString(); save(); await context.close().catch(() => {}); }
    console.log(JSON.stringify({ kind, completed: row.completed, samples: row.samples.length, photos: row.photos.length, error: row.error?.slice(0, 150) }));
  }
} finally { await browser.close(); server.closeAllConnections?.(); server.close(); save(); }
