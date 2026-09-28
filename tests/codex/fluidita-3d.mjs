#!/usr/bin/env node
// External, read-only 3D fluidity probe. First mode validates real rAF FPS on GPU.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startServer, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const requireVisual = createRequire(new URL('../visual/package.json', import.meta.url));
const { chromium } = requireVisual('playwright');
const chrome = process.env.CPM_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const mode = process.env.CPM_GPU_MODE || 'headless-d3d11';
const task = process.env.CPM_TASK || 'pilot';
const gi = +(process.env.CPM_GI || 64);
const ids = process.env.CPM_IDS ? process.env.CPM_IDS.split(',').map(Number) : Array.from({ length: 191 }, (_, i) => i);
const started = new Date().toISOString();
const server = await startServer();
const launch = {
  executablePath: chrome,
  headless: mode !== 'headed',
  args: mode === 'headed'
    ? ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox']
    : ['--headless=new', '--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox']
};
const out = { started, task, mode, gi, ids: task === 'scan' ? ids : undefined, launch, viewport: [412, 915], deviceScaleFactor: 2,
  feetRecorder: process.env.CPM_FEET === '1', errors: [], scenes: [] };
const medianOf = values => {
  const a = values.filter(Number.isFinite).sort((x, y) => x - y);
  return a.length ? a[Math.floor(a.length / 2)] : null;
};
const pOf = (values, p) => {
  const a = values.filter(Number.isFinite).sort((x, y) => x - y);
  return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * p))] : null;
};
const r2 = n => Number.isFinite(n) ? +n.toFixed(2) : null;

function summarize(gi, raw) {
  const seen = new Set();
  const rows = raw.trace.filter(x => x.s && x.w && !seen.has(x.si) && seen.add(x.si));
  const dt = raw.raf.map(x => x.dt);
  const fps = medianOf(dt) ? 1000 / medianOf(dt) : null;
  const carriers = rows.filter(x => x.w[1] === 4 || x.w[1] === 14);
  let carrySeconds = 0, carryWallSeconds = 0, maxCarryStreak = 0, streak = 0;
  for (let i = 1; i < rows.length; i++) {
    const s = rows[i].s, prev = rows[i - 1].s;
    const ds = Math.max(0, s.t - prev.t);
    const dw = Math.max(0, rows[i].wall - rows[i - 1].wall) / 1000;
    if (rows[i].w[1] === 4 || rows[i].w[1] === 14) {
      carrySeconds += ds; carryWallSeconds += dw; streak += ds;
      maxCarryStreak = Math.max(maxCarryStreak, streak);
    } else streak = 0;
  }
  const heroCarriers = carriers.filter(x => x.owner === -2 || x.pori === -2);
  const near = heroCarriers.map(x => Math.min(x.s.dL ?? Infinity, x.s.dR ?? Infinity)).filter(Number.isFinite);
  const far = heroCarriers.map(x => ({ frame: x.si, t: x.s.t, distance: Math.min(x.s.dL ?? Infinity, x.s.dR ?? Infinity), writer: x.w[1] }))
    .filter(x => x.distance > 1.5 && Number.isFinite(x.distance));
  const jumps = [];
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1].w, b = rows[i].w;
    if (rows[i].wi === rows[i - 1].wi) continue;
    const dts = (b[0] - a[0]) / 1000;
    if (!(dts > 0)) continue;
    const d = Math.hypot(b[2] - a[2], b[3] - a[3]);
    const threshold = 85 * dts + 0.5;
    if (d > threshold) jumps.push({ frame: rows[i].si, t: rows[i].s.t, dt: r2(dts), distance: r2(d), threshold: r2(threshold), before: a[1], after: b[1] });
  }
  const speedVectors = [];
  for (let i = 1; i < rows.length; i++) {
    // Hero positions update on the 3D render tick; use its clock, not a possibly
    // interleaved requestAnimationFrame timestamp (which creates false spikes).
    const a = rows[i - 1], b = rows[i], dtSec = b.s.t - a.s.t;
    if (!(dtSec > 0)) { speedVectors.push(null); continue; }
    speedVectors.push({ vx: (b.hero[0] - a.hero[0]) / dtSec, vz: (b.hero[1] - a.hero[1]) / dtSec, dtSec });
  }
  const jerks = [], inversions = [];
  for (let i = 2; i < rows.length; i++) {
    const a = speedVectors[i - 2], b = speedVectors[i - 1];
    if (!a || !b) continue;
    const acceleration = Math.hypot(b.vx - a.vx, b.vz - a.vz) / b.dtSec;
    jerks.push({ frame: rows[i].si, t: rows[i].s.t, acceleration: r2(acceleration), gesture: rows[i].s.g });
    const sa = Math.hypot(a.vx, a.vz), sb = Math.hypot(b.vx, b.vz);
    if (sa > 1 && sb > 1 && a.vx * b.vx + a.vz * b.vz < 0)
      inversions.push({ frame: rows[i].si, t: rows[i].s.t, beforeSpeed: r2(sa), afterSpeed: r2(sb), gesture: rows[i].s.g });
  }
  const gestures = [], shortGestures = [];
  let segment = null;
  for (const x of carriers) {
    if (!segment || segment.g !== x.s.g) {
      if (segment && segment.duration < 0.15) shortGestures.push(segment);
      segment = { g: x.s.g, from: x.s.t, duration: 0, frame: x.si };
      gestures.push({ frame: x.si, t: x.s.t, from: gestures.length ? gestures.at(-1).to : null, to: x.s.g });
    } else segment.duration = x.s.t - segment.from;
  }
  // The final carry segment is right-censored: its gesture may continue after carrying ends.
  // Only a segment closed by a later gesture change can be called shorter than 0.15 s.
  const bands = { '0-3': [], '3-6': [], '6-9': [], '9+': [] };
  for (const x of carriers) if (x.s.sl != null && x.s.v != null) {
    const key = x.s.v < 3 ? '0-3' : x.s.v < 6 ? '3-6' : x.s.v < 9 ? '6-9' : '9+';
    bands[key].push(x.s.sl);
  }
  const feet = Object.fromEntries(Object.entries(bands).map(([k, v]) => [k, { n: v.length, median: r2(medianOf(v)), conclusive: v.length >= 20 }]));
  const longFrames = raw.raf.filter(r => r.dt > 50).map(r => {
    const x = raw.trace.reduce((best, y) => Math.abs(y.wall-r.t)<Math.abs((best?.wall??Infinity)-r.t)?y:best,null);
    const close = x && Math.abs(x.wall-r.t)<25 ? x : null;
    const prev = close && rows.find(y => y.si === close.si-1);
    return { frame: close?.si??null, t: close?.s?.t??null, dt:r.dt, gesture:close?.s?.g??null,
      firstGesture: !!close?.s?.g && close.s.g !== prev?.s?.g,
      cameraStep: close && prev ? r2(Math.hypot(...close.cam.map((v,k)=>v-prev.cam[k]))) : null,
      cut: close?.cut??null, contextMatched:!!close };
  });
  return { gi, fpsMedian: r2(fps), valid: fps != null && fps >= 45, rafFrames: dt.length, witnessFrames: rows.length,
    dt: { median: r2(medianOf(dt)), p95: r2(pOf(dt, .95)), max: r2(Math.max(...dt)), over50: longFrames },
    carry: { frames: carriers.length, heroFrames: heroCarriers.length, seconds: r2(carrySeconds), wallSeconds: r2(carryWallSeconds), longestStreak: r2(maxCarryStreak),
      near: { n: near.length, median: r2(medianOf(near)), p95: r2(pOf(near, .95)), max: r2(Math.max(...near)) }, over1_5: far },
    jumps, hero: { accelerationP99: r2(pOf(jerks.map(x => x.acceleration), .99)), accelerationMax: r2(Math.max(...jerks.map(x => x.acceleration))), jerks, inversions },
    gesture: { changes: Math.max(0, gestures.length - 1), perSecond: carrySeconds > 0 ? r2(Math.max(0, gestures.length - 1) / carrySeconds) : null, transitions: gestures, under0_15: shortGestures },
    feet, errors: raw.errors || [], raw };
}
let browser;
try {
  browser = await chromium.launch(launch);
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('pageerror', error => out.errors.push(String(error.message)));
  await installCdnRoutes(page);
  await page.addInitScript(feetRecorder => {
    // ?cpmtest=1 disables the cinematic buildup unless this opt-in precedes navigation.
    window.__CPM_CINE = 1;
    window.__CPM_PRESENT = 1;
    window.__CPM_TIRO34_REC = 1;
    window.__CPM_WS38_REC = 1;
    if (feetRecorder) window.__CPM_PIEDI_REC = 1;
    window.__CPM_FLUID_RAF = { frames: [], trace: [], last: null };
    const tick = t => {
      const r = window.__CPM_FLUID_RAF;
      const phase = window.__CPM_PHASE?.();
      if (phase === 'hl_result') {
        const dt = r.last == null ? null : +(t - r.last).toFixed(2);
        if (dt != null && r.frames.length < 3000) r.frames.push({ t: +t.toFixed(2), dt });
        const s34 = window.__CPM_TIRO34, w38 = window.__CPM_WS38;
        if (dt != null && s34?.f?.length && w38?.length && r.trace.length < 3000) {
          const h = window.__CPM3D?.hero?.position, c = window.__CPM3D?.camera?.position;
          if (h && c) { const w = w38.at(-1), carry = w[1] === 4 || w[1] === 14;
            r.trace.push({ wall: +t.toFixed(2), dt, si: s34.f.length - 1, wi: w38.length - 1,
              w, s: s34.f.at(-1), hero: [h.x, h.z], cam: [c.x, c.y, c.z], cut: !!window.__CPM_CUTLIVE?.(),
              owner: carry ? window.__CPM_OWN?.()?.i ?? null : null, pori: carry ? window.__CPM_WS?.()?.pori ?? null : null }); }
        }
        r.last = t;
      } else r.last = null;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, out.feetRecorder);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Fluidita3D' });
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0 && !!window.__CPM_GESTURE?.()?.glb, null, { timeout: 90000 });
  out.glb = await page.evaluate(() => ({ mxclip: window.__CPM_MXCLIP, glb: !!window.__CPM_GESTURE?.()?.glb, glbOverride: window.__CPM_GLB ?? null }));
  out.renderer = await page.evaluate(() => {
    for (const canvas of [...document.querySelectorAll('canvas')]) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) continue;
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      return { webgl: gl.getParameter(gl.VERSION), renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), canvas: [canvas.width, canvas.height] };
    }
    return null;
  });
  if (task === 'scan') {
    for (const id of ids) {
      try {
        await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CPM_WS38 = []; window.__CPM_PIEDI = null;
          window.__CPM_FLUID_RAF = { frames: [], trace: [], last: null }; window.__CPM_FORCE_SIT(g, true); window.__CPM_FROZEN = false; }, id);
        await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_choose', null, { timeout: 20000 });
        await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
        await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_result', null, { timeout: 20000 });
        await sleep(+(process.env.CPM_SCENE_MS || 6000));
        const raw = await page.evaluate(() => ({ raf: window.__CPM_FLUID_RAF?.frames || [], trace: window.__CPM_FLUID_RAF?.trace || [],
          writers: window.__CPM_WS38 || [], feet: window.__CPM_PIEDI || null, phase: window.__CPM_PHASE?.() }));
        const summary = summarize(id, raw);
        out.scenes.push(summary);
        console.log(`gi${id}: fps=${summary.fpsMedian} valid=${summary.valid} carry=${summary.carry.seconds}s jumps=${summary.jumps.length} frames=${summary.witnessFrames}`);
      } catch (error) {
        out.scenes.push({ gi: id, valid: false, failure: String(error.stack || error) });
        console.log(`gi${id}: FAIL ${String(error.message || error)}`);
      }
      const file = path.join(root, 'reports/codex/2026-09-28-fluidita-3d-scan.json');
      if (out.scenes.length % 10 === 0 || out.scenes.length === ids.length) fs.writeFileSync(file, JSON.stringify(out));
    }
  } else {
    await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CPM_WS38 = []; window.__CPM_FORCE_SIT(g, true); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_choose', null, { timeout: 30000 });
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
    await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_result', null, { timeout: 30000 });
    await sleep(7000);
    out.scene = await page.evaluate(() => ({ phase: window.__CPM_PHASE?.(), raf: window.__CPM_FLUID_RAF?.frames || [], trace: window.__CPM_FLUID_RAF?.trace || [], shot: window.__CPM_TIRO34?.f || [], writers: window.__CPM_WS38 || [], feet: window.__CPM_PIEDI || null }));
    out.analyzed = summarize(gi, { raf: out.scene.raf, trace: out.scene.trace, writers: out.scene.writers, feet: out.scene.feet });
    const dt = out.scene.raf.map(x => x.dt).sort((a,b) => a-b);
    const median = dt.length ? dt[Math.floor(dt.length / 2)] : null;
    out.summary = { rafFrames: dt.length, medianDtMs: median, medianFps: median ? +(1000 / median).toFixed(2) : null,
      p95DtMs: dt.length ? dt[Math.floor(dt.length * 0.95)] : null, shotFrames: out.scene.shot.length, writerFrames: out.scene.writers.length,
      valid: median ? 1000 / median >= 45 : false };
    console.log(JSON.stringify({ mode: out.mode, gi, glb: out.glb, renderer: out.renderer, summary: out.summary, errors: out.errors }));
  }
} catch (error) {
  out.failure = String(error.stack || error);
  console.error(out.failure);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.close();
  const file = path.join(root, `reports/codex/2026-09-28-fluidita-3d-${task === 'scan' ? 'scan' : 'pilot-' + mode}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
}
