#!/usr/bin/env node
// PO-185: ripetizione del banco deterministico su entrambe le rappresentazioni.
// Avviare dalla radice. CPM_SCENES=33,133 restringe il lotto; checkpoint nel JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const scenes = (process.env.CPM_SCENES || '33,133,134,138,168,31,32,36,44,45,128,137,157,184,24,2').split(',').map(Number);
const modes = process.env.CPM_MODE === '0' ? [false] : process.env.CPM_MODE === '1' ? [true] : [false, true];
const repeated = new Set([33, 133, 45, 24]);
const out = path.resolve('tests/codex/banco-difesa-3d.json');
const shots = path.resolve('reports/codex/banco-difesa-3d');
fs.mkdirSync(shots, { recursive: true });
const data = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : { version: '7.999.105', base: 'b2094979df9c6fdce4bc8c62b836cde43fac8eef', viewport: [412, 915], cases: [] };
const save = () => fs.writeFileSync(out, JSON.stringify(data, null, 2));
const freeGB = () => os.freemem() / 2 ** 30;
if (freeGB() < 3.5) { console.error(`3D rinviato: RAM libera ${freeGB().toFixed(2)} GB < 3.5 GB`); process.exit(2); }
const server = await startServer();
const browser = await launchBrowser();
const port = server.address().port;

async function run({ gi, outcome, glb, repeat }) {
  const id = `gi${gi}-${outcome}-${glb ? 'glb' : 'procedurale'}-r${repeat}`;
  const result = { id, gi, outcome, glb, repeat, seed: gi * 1000 + 12345, valid: false, rejected: null, photos: [] };
  if (freeGB() < 3.5) { result.rejected = `memoria libera ${freeGB().toFixed(2)} GB < 3.5 GB`; return result; }
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await installCdnRoutes(page);
  // Trascrizione dell'orologio e del seme di tests/visual/inquadratura-185.mjs.
  await page.addInitScript(() => { let vt = 0; const raf = window.requestAnimationFrame.bind(window); performance.now = () => vt;
    window.requestAnimationFrame = cb => raf(() => { vt += 1000 / 30; cb(vt); }); });
  await page.addInitScript(sd => { let a = sd >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, result.seed);
  await page.addInitScript(g => { window.__CPM_GLB = g; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; }, glb);
  const shot = async (label) => { const file = path.join(shots, `${id}-${label}.png`); await page.screenshot({ path: file, timeout: 15000 }); result.photos.push(path.relative(process.cwd(), file).replaceAll('\\', '/')); };
  try {
    await openMatch(page, port); await sleep(700);
    if (glb) {
      try { await page.waitForFunction(() => window.__CPM_MXCLIP > 0, null, { timeout: 15000 }); }
      catch { result.rejected = 'GLB non montato: __CPM_MXCLIP<=0'; return result; }
    }
    const pre = await page.evaluate(() => { const b = window.__CPM_BALL?.(); return b ? `${b.x},${b.y}` : null; });
    const forcedAt = await page.evaluate(i => { window.__CPM_FORCE_SIT(i, true); return performance.now(); }, gi);
    if (repeat === 0) { await page.waitForFunction(t => performance.now() >= t, forcedAt + 900, { timeout: 25000 }); await shot('01-apertura'); }
    const settled = await page.evaluate(pre => new Promise(resolve => { let moved = false, last = null, same = 0; const start = performance.now();
      const tick = () => { const b = window.__CPM_BALL?.(); const key = b ? `${b.x},${b.y}` : null;
        if (key && key !== pre && key !== '50,50') moved = true;
        if (moved && key && key !== '50,50' && key === last) same++; else same = 0;
        last = key;
        if (same >= 2) resolve(key); else if (performance.now() - start > 25000) resolve(null); else requestAnimationFrame(tick);
      }; requestAnimationFrame(tick); }), pre);
    result.ballStart = settled;
    if (!settled) { result.rejected = 'pallone non assestato entro 25 s virtuali'; return result; }
    if (repeat === 0) await shot('02-scelta');
    const beforeTimeline = await page.evaluate(() => window.__CPM_TIMELINE?.().length ?? 0);
    const start = await page.evaluate(o => { window.__CPM_FRAME480 = null; window.__CPM_TGT185 = null; window.__CPM_FORCE_OUTCOME = o; window.__CPM_RESOLVE(0); return performance.now(); }, outcome);
    const marks = [['03-rincorsa', 300], ['04-contatto', 900], ['05-volo', 1600]];
    if (repeat === 0) for (const [label, dt] of marks) {
      await page.waitForFunction(t => performance.now() >= t, start + dt, { timeout: 25000 });
      await shot(label);
    }
    await page.waitForFunction(() => window.__CPM_FRAME480?.n >= 5, null, { timeout: 25000 });
    await sleep(glb ? 4000 : 2400);
    if (repeat === 0) await shot('06-esito');
    const obs = await page.evaluate(() => ({ frame: window.__CPM_FRAME480, target: window.__CPM_TGT185,
      phase: window.__CPM_PHASE?.(), timeline: window.__CPM_TIMELINE?.(), draft: window.__CPM_DRAFTNOTE ?? null }));
    result.frame = obs.frame; result.target = obs.target; result.phase = obs.phase; result.draft = obs.draft;
    const resolved = Array.isArray(obs.timeline) ? obs.timeline.slice(beforeTimeline).filter(x => x?.type === 'ActionResolved') : [];
    result.actionResolved = resolved.at(-1) ?? null;
    result.outcomeMatched = resolved.length === 1 && result.actionResolved.gi === gi && result.actionResolved.ok === (outcome === 'success');
    result.valid = !!obs.frame && obs.frame.n >= 5 && result.outcomeMatched;
    if (!result.valid) result.rejected = !obs.frame || obs.frame.n < 5 ? 'FRAME480 assente o meno di 5 letture' : 'ActionResolved non concorde';
    return result;
  } catch (e) { result.rejected = String(e?.stack || e); return result; }
  finally { await context.close().catch(() => {}); }
}

try {
  for (const gi of scenes) for (const outcome of ['success', 'fail']) for (const glb of modes) {
    const repeats = repeated.has(gi) ? 2 : 1;
    for (let repeat = 0; repeat < repeats; repeat++) {
      const id = `gi${gi}-${outcome}-${glb ? 'glb' : 'procedurale'}-r${repeat}`;
      if (data.cases.some(c => c.id === id && c.valid)) continue;
      const r = await run({ gi, outcome, glb, repeat }); data.cases.push(r); save();
      console.log(JSON.stringify({ id, valid: r.valid, rejected: r.rejected, n: r.frame?.n, heroOutside: r.frame?.fuori, ballOutside: r.frame?.bfuori }));
      if (r.rejected?.startsWith('memoria libera')) break;
    }
  }
} finally { await browser.close().catch(() => {}); server.close(); save(); }
