#!/usr/bin/env node
// GPU equivalent of aperture-blocco-sonda + apertura-profilo-sonda; no game edits.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startServer, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(new URL('../visual/package.json', import.meta.url))('playwright');
const chrome = process.env.CPM_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const nScenes = +(process.env.CPM_SCENES || 5), waitMs = +(process.env.CPM_ATTESA || 15000);
const profileOn = process.env.CPM_PROFILE !== '0';
const launch = { executablePath: chrome, headless: true,
  args: ['--headless=new', '--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] };
const result = { command: profileOn
  ? 'CPM_GLB=1 CPM_ATTESA=15000 CPM_SCENES=5 node tests/codex/apertura-gpu.mjs'
  : 'CPM_GLB=1 CPM_ATTESA=15000 CPM_SCENES=5 CPM_PROFILE=0 node tests/codex/apertura-gpu.mjs',
  launch, viewport: [412, 915], deviceScaleFactor: 2, glbRequested: true, waitMs, nScenes, profileOn, openings: [], errors: [] };
const server = await startServer();
const browser = await chromium.launch(launch);
let page, context;
try {
  context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  page = await context.newPage();
  page.on('pageerror', error => result.errors.push(String(error.message)));
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
    window.__LT_GPU = []; window.__RAF_GPU = [];
    try { new PerformanceObserver(list => { for (const e of list.getEntries()) window.__LT_GPU.push([e.startTime, e.duration]); })
      .observe({ type: 'longtask', buffered: true }); } catch (error) { window.__LT_GPU_ERROR = String(error); }
    let prev = null; const tick = t => { if (prev != null && window.__RAF_GPU.length < 100000) window.__RAF_GPU.push([t, t-prev]);
      prev=t; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  });
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'AperturaGPU' });
  await page.waitForFunction(() => !!window.__CPM_GLB_READY && (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 });
  await sleep(waitMs);
  result.glb = await page.evaluate(() => ({ ready: !!window.__CPM_GLB_READY, clipCount: window.__CPM_MXCLIP | 0,
    override: window.__CPM_GLB ?? null }));
  result.renderer = await page.evaluate(() => {
    for (const c of document.querySelectorAll('canvas')) { const g=c.getContext('webgl2')||c.getContext('webgl'); if(!g)continue;
      const d=g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER); } return null;
  });
  const cdp = profileOn ? await context.newCDPSession(page) : null;
  if (cdp) { await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
    await cdp.send('Profiler.start'); }
  let profile = null, prev = null, resultAt = null;
  result.phaseChanges = [];
  const start = Date.now();
  while (result.openings.length < nScenes && Date.now() - start < 420000) {
    const state = await page.evaluate(() => ({ phase: window.__CPM_PHASE?.() || null, t: performance.now(),
      canvases: [...document.querySelectorAll('canvas')].map(c => [c.width,c.height]) })).catch(() => null);
    const phase = state?.phase;
    if (phase !== prev && result.phaseChanges.length < 100) result.phaseChanges.push({ t: state?.t ?? null, phase });
    if (phase === 'ended' || phase === 'ceremony') { await openMatch(page, server.address().port, { skipLoadAll: true, name: 'AperturaGPU' }); prev=null; continue; }
    if (phase && /^hl_(intro|move|choose)/.test(phase) && !(prev && /^hl/.test(prev))) {
      result.openings.push({ index: result.openings.length + 1, t: state.t, phase, canvases: state.canvases });
      console.log(`apertura ${result.openings.length}: fase=${phase}`);
      if (cdp && !profile) { await sleep(4000); profile = (await cdp.send('Profiler.stop')).profile; }
    }
    if (phase === 'playing') await page.evaluate(() => window.__CPM_QUEUE_REACTIVE?.()).catch(() => {});
    if (phase === 'hl_move') await page.locator('[data-cpm="scegli"]').click({ timeout: 2000 }).catch(() => {});
    if (phase === 'hl_choose') await page.evaluate(() => window.__CPM_RESOLVE?.(0)).catch(() => {});
    if (phase === 'hl_result') {
      if (resultAt == null) resultAt = Date.now();
      if (Date.now() - resultAt > 4500) {
        await page.getByRole('button', { name: 'Continua', exact: true }).last().click({ timeout: 2000 }).catch(() => {});
      }
    } else resultAt = null;
    prev = phase;
    await sleep(100);
  }
  await sleep(4000);
  const logs = await page.evaluate(() => ({ tasks: window.__LT_GPU || [], raf: window.__RAF_GPU || [], observerError: window.__LT_GPU_ERROR || null }));
  result.observerError = logs.observerError;
  for (const op of result.openings) {
    const near = logs.tasks.filter(([s]) => s > op.t - 1500 && s < op.t + 4000);
    const raf = logs.raf.filter(([t]) => t > op.t - 1500 && t < op.t + 4000).map(x => x[1]);
    op.longTaskMaxMs = near.length ? Math.max(...near.map(x => x[1])) : 0;
    op.longTaskSumMs = near.reduce((a,x)=>a+x[1],0);
    op.longTasks = near;
    op.rafMaxGapMs = raf.length ? Math.max(...raf) : null;
    op.rafFrames = raf.length;
  }
  if (profile) {
    const profileFile = path.join(root, 'reports/codex/2026-09-28-apertura-gpu.cpuprofile');
    fs.writeFileSync(profileFile, JSON.stringify(profile));
    const nodes = new Map(profile.nodes.map(n => [n.id,n]));
    const self = new Map(), parents = new Map();
    for(const n of profile.nodes)for(const c of n.children||[])parents.set(c,n.id);
    for(let i=0;i<profile.samples.length;i++)self.set(profile.samples[i],(self.get(profile.samples[i])||0)+(profile.timeDeltas[i]||0));
    const label = n => `${n.callFrame.functionName||'(anonima)'} @${(n.callFrame.url||'').split('/').pop().split('?')[0]}:${n.callFrame.lineNumber+1}`;
    const own = new Map(), total = new Map();
    for(const [id,us] of self){const n=nodes.get(id);const k=label(n);own.set(k,(own.get(k)||0)+us);
      const seen=new Set();let curr=id;while(curr!=null){const kk=label(nodes.get(curr));if(!seen.has(kk)){seen.add(kk);total.set(kk,(total.get(kk)||0)+us)}curr=parents.get(curr)} }
    const top = map => [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([functionName,us])=>({functionName,ms:+(us/1000).toFixed(2)}));
    result.profile = { sampledMs:+([...self.values()].reduce((a,b)=>a+b,0)/1000).toFixed(2), topOwn:top(own), topInclusive:top(total), file:path.relative(root,profileFile).replaceAll('\\','/') };
  }
  result.elapsedMs = Date.now()-start;
  console.log(JSON.stringify({ renderer: result.renderer, glb: result.glb,
    openings: result.openings.map(x=>({index:x.index,longTaskMaxMs:x.longTaskMaxMs,rafMaxGapMs:x.rafMaxGapMs})), top10:result.profile?.topOwn, errors:result.errors }));
} catch(error) { result.failure=String(error.stack||error);console.error(result.failure);process.exitCode=1; }
finally { await browser.close();server.close();fs.writeFileSync(path.join(root,profileOn?'reports/codex/2026-09-28-apertura-gpu.json':'reports/codex/2026-09-28-apertura-gpu-no-profiler.json'),JSON.stringify(result,null,2)); }
