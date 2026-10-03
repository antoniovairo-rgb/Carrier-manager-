#!/usr/bin/env node
// PO-185: ripetizione del banco deterministico su entrambe le rappresentazioni.
// Avviare dalla radice. CPM_SCENES=33,133 restringe il lotto; checkpoint nel JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const scenes = (process.env.CPM_SCENES || '33,133,134,138,168,31,32,36,44,45,128,137,157,184,24,2').split(',').map(Number);
const outcomes = process.env.CPM_OUTCOME ? [process.env.CPM_OUTCOME] : ['success', 'fail'];
const shotsEnabled = process.env.CPM_NO_SHOTS !== '1';
const modes = process.env.CPM_MODE === '0' ? [false] : process.env.CPM_MODE === '1' ? [true] : [false, true];
const repeated = new Set([33, 133, 45, 24]);
const out = path.resolve('tests/codex/banco-difesa-3d.json');
const gzOut = path.resolve('tests/codex/banco-difesa-3d.json.gz');
const shots = path.resolve('reports/codex/banco-difesa-3d');
fs.mkdirSync(shots, { recursive: true });
const data = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : fs.existsSync(gzOut) ? JSON.parse(zlib.gunzipSync(fs.readFileSync(gzOut))) : { version: '7.999.105', base: 'b2094979df9c6fdce4bc8c62b836cde43fac8eef', viewport: [412, 915], cases: [] };
const save = () => { const raw = JSON.stringify(data, null, 2); fs.writeFileSync(out, raw); const gz = zlib.gzipSync(raw);
  for (let attempt = 0; attempt < 15; attempt++) { try { fs.writeFileSync(gzOut, gz); return; }
    catch (e) { if (e.code !== 'EBUSY' || attempt === 14) { console.error(`Checkpoint JSON conservato; compressione differita: ${e.message}`); return; }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200); } } };
const freeGB = () => os.freemem() / 2 ** 30;
if (freeGB() < 3.5) { console.error(`3D rinviato: RAM libera ${freeGB().toFixed(2)} GB < 3.5 GB`); process.exit(2); }
const server = await startServer();
const browser = await launchBrowser();
const port = server.address().port;

async function run({ gi, outcome, glb, repeat }) {
  const id = `gi${gi}-${outcome}-${glb ? 'glb' : 'procedurale'}-r${repeat}`;
  const result = { id, gi, outcome, glb, repeat, seed: gi * 1000 + 12345, clockMode: 'one-tick-per-browser-frame', settleMode: process.env.CPM_SETTLE_MODE || 'fixed-45-frames', valid: false, rejected: null, photos: [] };
  if (freeGB() < 3.5) { result.rejected = `memoria libera ${freeGB().toFixed(2)} GB < 3.5 GB prima del caso 3D`; return result; }
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await installCdnRoutes(page);
  // Trascrizione dell'orologio e del seme di tests/visual/inquadratura-185.mjs.
  await page.addInitScript(() => { let vt = 0; let lastNative = null; const raf = window.requestAnimationFrame.bind(window); performance.now = () => vt;
    window.requestAnimationFrame = cb => raf(nativeTime => { if (nativeTime !== lastNative) { vt += 1000 / 30; lastNative = nativeTime; } cb(vt); }); });
  await page.addInitScript(sd => { let a = sd >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, result.seed);
  await page.addInitScript(g => { window.__CPM_GLB = g; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; }, glb);
  const shot = async (label) => { const file = path.join(shots, `${id}-${label}.png`); await page.screenshot({ path: file, timeout: 15000 }); result.photos.push(path.relative(process.cwd(), file).replaceAll('\\', '/')); };
  try {
    await openMatch(page, port);
    await page.evaluate(() => window.__CPM_AUTOPLAY?.(false));
    await sleep(700);
    if (glb) {
      try { await page.waitForFunction(() => window.__CPM_MXCLIP > 0, null, { timeout: Number(process.env.CPM_MXCLIP_WAIT_MS) || 30000 }); }
      catch { result.rejected = 'GLB non montato: __CPM_MXCLIP<=0'; return result; }
    }
    if (!shotsEnabled) {
      // Misura numerica: usa la stessa evaluate atomica del guardiano PO-185.
      // Una seconda chiamata Playwright fra la forzatura e il poll alterava l'istante scelto.
      const beforeTimeline = await page.evaluate(() => window.__CPM_TIMELINE?.().length ?? 0);
      const resolvedAt = process.env.CPM_SETTLE_MODE === 'timed' ? await (async () => {
        const forced = await page.evaluate(i => { window.__CPM_FORCE_SIT(i, true); return { t: performance.now(), phase: window.__CPM_PHASE?.() }; }, gi);
        await sleep(400);
        return await page.evaluate(([o, forced]) => { const phaseBefore = window.__CPM_PHASE?.(); const b = window.__CPM_BALL?.();
          if (phaseBefore !== 'hl_choose') return { phaseBefore, accepted: false, phaseChangedBeforeSettle: true, elapsedVirtualMs: performance.now() - forced.t };
          window.__CPM_FRAME480 = null; window.__CPM_TGT185 = null; window.__CPM_FORCE_OUTCOME = o;
          return { key: b ? `${b.x},${b.y}` : null, phaseBefore, accepted: window.__CPM_RESOLVE(0), elapsedVirtualMs: performance.now() - forced.t }; }, [outcome, forced]);
      })() : await page.evaluate(([i, o, mode]) => new Promise(resolve => { const b0 = window.__CPM_BALL?.(); const pre = b0 ? `${b0.x},${b0.y}` : null; const t0Ball = window.__CPM_BALL3?.()?.t;
        let moved = false, last = null, same = 0, seenChoose = false; window.__CPM_FORCE_SIT(i, true); const t0 = performance.now();
        let chooseFrames = 0;
        const tick = () => { const ph = window.__CPM_PHASE?.(); if (ph === 'hl_choose') seenChoose = true;
          else if (seenChoose) { resolve({ phaseBefore: ph, accepted: false, phaseChangedBeforeSettle: true, elapsedVirtualMs: performance.now() - t0 }); return; }
          else { if (performance.now() - t0 > 25000) resolve(null); else requestAnimationFrame(tick); return; }
          chooseFrames++;
          const b = window.__CPM_BALL?.(); const key = b ? `${b.x},${b.y}` : null;
          if (key && key !== pre && key !== '50,50') moved = true;
          if (moved && key && key !== '50,50' && key === last) same++; else same = 0; last = key;
          const b3 = mode === 'target-aligned' ? window.__CPM_BALL3?.() : null;
          const targetChanged = b3?.t && t0Ball && Math.hypot(b3.t.x-t0Ball.x,b3.t.y-t0Ball.y)>3;
          const meshNearTarget = b3?.m && b3?.t && Math.hypot(b3.m.x-b3.t.x,b3.m.y-b3.t.y)<2;
          if ((mode === 'fixed-45-frames' ? chooseFrames >= 45 : mode === 'moved' ? moved : mode === 'mounted-500ms' ? moved && performance.now() - t0 >= 500 : mode === 'target-aligned' ? targetChanged && meshNearTarget : same >= 2)) { window.__CPM_FRAME480 = null; window.__CPM_TGT185 = null; window.__CPM_FORCE_OUTCOME = o;
            const phaseBefore = window.__CPM_PHASE?.(); const ball3 = window.__CPM_BALL3?.() ?? null; const accepted = window.__CPM_RESOLVE(0); resolve({ key, ball3, phaseBefore, accepted, chooseFrames, elapsedVirtualMs: performance.now() - t0 }); }
          else if (performance.now() - t0 > 25000) resolve(null); else requestAnimationFrame(tick);
        }; requestAnimationFrame(tick); }), [gi, outcome, process.env.CPM_SETTLE_MODE || 'fixed-45-frames']);
      result.ballStart = resolvedAt?.key ?? null; result.resolve = resolvedAt; result.chooseFrames = resolvedAt?.chooseFrames ?? null;
      if (!resolvedAt) { result.rejected = 'pallone non assestato entro 25 s virtuali'; return result; }
      if (resolvedAt.phaseChangedBeforeSettle) { result.rejected = `scena passata a ${resolvedAt.phaseBefore} prima dell'assestamento`; return result; }
      await sleep(glb ? 4000 : 2400);
      const obs = await page.evaluate(() => ({ frame: window.__CPM_FRAME480, target: window.__CPM_TGT185,
        phase: window.__CPM_PHASE?.(), timeline: window.__CPM_TIMELINE?.(), draft: window.__CPM_DRAFTNOTE ?? null }));
      result.frame = obs.frame; result.target = obs.target; result.phase = obs.phase; result.draft = obs.draft;
      result.timelineTail = Array.isArray(obs.timeline) ? obs.timeline.slice(beforeTimeline) : obs.timeline ?? null;
      const events = Array.isArray(result.timelineTail) ? result.timelineTail.filter(x => x?.type === 'ActionResolved') : [];
      result.actionResolved = events.at(-1) ?? null;
      result.outcomeMatched = events.length === 1 && result.actionResolved.gi === gi && result.actionResolved.ok === (outcome === 'success');
      result.valid = !!obs.frame && obs.frame.n >= 5 && result.outcomeMatched && result.chooseFrames >= 45;
      if (!result.valid) result.rejected = result.chooseFrames < 45 ? `scelta osservata solo ${result.chooseFrames} frame` : !obs.frame || obs.frame.n < 5 ? 'FRAME480 assente o meno di 5 letture' : 'ActionResolved non concorde';
      return result;
    }
    const beforeTimeline = await page.evaluate(() => window.__CPM_TIMELINE?.().length ?? 0);
    const forcedAt = await page.evaluate(([i, mode, outcome]) => { const b0 = window.__CPM_BALL?.(); const pre = b0 ? `${b0.x},${b0.y}` : null;
      window.__CPM_FORCE_SIT(i, true);
      window.__QA_BANK_TRACE = [];
      window.__QA_BANK_SETTLED = new Promise(resolve => { let moved = false, last = null, same = 0, chooseFrames = 0; const start = performance.now();
        const tick = () => { const b = window.__CPM_BALL?.(); const key = b ? `${b.x},${b.y}` : null;
          const phase = window.__CPM_PHASE?.();
          if (phase === 'hl_choose') chooseFrames++;
          else if (chooseFrames > 0) { window.__QA_BANK_CHOOSE_FRAMES = chooseFrames; resolve(null); return; }
          if (key && key !== pre && key !== '50,50') moved = true;
          if (moved && key && key !== '50,50' && key === last) same++; else same = 0;
          last = key;
          if (window.__QA_BANK_TRACE.length < 150) window.__QA_BANK_TRACE.push({ ms: Math.round(performance.now() - start), key, phase: window.__CPM_PHASE?.(), moved, same });
          if (mode === 'fixed-45-frames' ? chooseFrames >= 45 : mode === 'moved' ? moved : same >= 2) { window.__QA_BANK_CHOOSE_FRAMES = chooseFrames;
            window.__CPM_FRAME480 = null; window.__CPM_TGT185 = null; window.__CPM_FORCE_OUTCOME = outcome;
            const phaseBefore = window.__CPM_PHASE?.(); const accepted = window.__CPM_RESOLVE(0);
            resolve({ key, t: performance.now(), phaseBefore, accepted, chooseFrames }); }
          else if (performance.now() - start > 25000) resolve(null); else requestAnimationFrame(tick);
        }; requestAnimationFrame(tick); });
      return performance.now(); }, [gi, process.env.CPM_SETTLE_MODE || 'fixed-45-frames', outcome]);
    if (shotsEnabled) { await page.waitForFunction(t => performance.now() >= t, forcedAt + 900, { timeout: 25000 }); await shot('01-apertura'); await shot('02-scelta'); }
    const settled = await page.evaluate(() => window.__QA_BANK_SETTLED);
    result.ballStart = settled?.key ?? null;
    result.chooseFrames = await page.evaluate(() => window.__QA_BANK_CHOOSE_FRAMES ?? null);
    if (process.env.CPM_DEBUG_SETTLE === '1') result.settleTrace = await page.evaluate(() => window.__QA_BANK_TRACE);
    result.phaseAtSettle = settled?.phaseBefore ?? await page.evaluate(() => window.__CPM_PHASE?.());
    if (!settled) { result.rejected = 'pallone non assestato entro 25 s virtuali'; return result; }
    if (result.phaseAtSettle !== 'hl_choose') { result.rejected = `scena passata a ${result.phaseAtSettle} prima della risoluzione`; return result; }
    result.resolve = settled;
    const start = settled.t;
    const marks = [['03-rincorsa', 300], ['04-contatto', 900], ['05-volo', 1600]];
    if (shotsEnabled) for (const [label, dt] of marks) {
      await page.waitForFunction(t => performance.now() >= t, start + dt, { timeout: 25000 });
      await shot(label);
    }
    await page.waitForFunction(() => window.__CPM_FRAME480?.n >= 5, null, { timeout: 25000 });
    await sleep(glb ? 4000 : 2400);
    if (shotsEnabled) await shot('06-esito');
    const obs = await page.evaluate(() => ({ frame: window.__CPM_FRAME480, target: window.__CPM_TGT185,
      phase: window.__CPM_PHASE?.(), timeline: window.__CPM_TIMELINE?.(), draft: window.__CPM_DRAFTNOTE ?? null }));
    result.frame = obs.frame; result.target = obs.target; result.phase = obs.phase; result.draft = obs.draft;
    result.timelineTail = Array.isArray(obs.timeline) ? obs.timeline.slice(beforeTimeline) : obs.timeline ?? null;
    const resolved = Array.isArray(obs.timeline) ? obs.timeline.slice(beforeTimeline).filter(x => x?.type === 'ActionResolved') : [];
    result.actionResolved = resolved.at(-1) ?? null;
    result.outcomeMatched = resolved.length === 1 && result.actionResolved.gi === gi && result.actionResolved.ok === (outcome === 'success');
    result.valid = !!obs.frame && obs.frame.n >= 5 && result.outcomeMatched && result.photos.length === 6 && result.chooseFrames >= 45;
    if (!result.valid) result.rejected = result.chooseFrames < 45 ? `scelta osservata solo ${result.chooseFrames} frame` : !obs.frame || obs.frame.n < 5 ? 'FRAME480 assente o meno di 5 letture' : !result.outcomeMatched ? 'ActionResolved non concorde' : `foto ${result.photos.length}/6`;
    return result;
  } catch (e) { result.rejected = String(e?.stack || e); return result; }
  finally { await context.close().catch(() => {}); }
}

try {
  outer: for (const gi of scenes) for (const outcome of outcomes) for (const glb of modes) {
    const repeats = process.env.CPM_REPEAT === '1' ? 1 : repeated.has(gi) ? 2 : 1;
    for (let repeat = 0; repeat < repeats; repeat++) {
      const id = `gi${gi}-${outcome}-${glb ? 'glb' : 'procedurale'}-r${repeat}`;
      if (data.cases.some(c => c.id === id && c.valid && c.clockMode === 'one-tick-per-browser-frame' && c.settleMode === (process.env.CPM_SETTLE_MODE || 'fixed-45-frames') && c.chooseFrames >= 45 && (!shotsEnabled || c.photos?.length === 6))) continue;
      const r = await run({ gi, outcome, glb, repeat }); data.cases.push(r); save();
      console.log(JSON.stringify({ id, valid: r.valid, rejected: r.rejected, n: r.frame?.n, heroOutside: r.frame?.fuori, ballOutside: r.frame?.bfuori }));
      if (r.rejected?.startsWith('memoria libera')) break outer;
    }
  }
} finally { await browser.close().catch(() => {}); server.close(); save(); }
