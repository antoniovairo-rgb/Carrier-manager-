/* LMQP-8 — PERFORMANCE MONITOR (LIVE_MATCH_QA_SPEC cap. 3.7), slice headless
   Misura, con la pagina viva e il render-loop 3D attivo: tempo di caricamento
   (navigation timing), JS heap (Chromium), e frame-timing del render-loop
   (avg/p95/fps su una finestra). È WARN-ONLY / INFORMATIVO: gli FPS su runner
   CI sono hardware-dipendenti → renderlo bloccante sarebbe flaky (contro
   «Determinism First»). I valori finiscono in run-summary.json (LMQP-7) e nel
   report; le soglie generano solo warning. Additivo, non tocca il gate. */

// soglie soft (solo warning, mai FAIL): floor HEADLESS-realistici — Chromium headless rende via software
//   (niente GPU) quindi il baseline è ~10-12fps / ~90ms: le soglie catturano solo regressioni grossolane
//   (render-loop rotto, leak, hang), non la performance assoluta (che va misurata su device/GPU reali).
const TH = { fpsMin: 8, heapUsedMaxMB: 600, loadMaxMs: 15000, p95MaxMs: 250 };

export async function measurePerf(page, { frameWindowMs = 1000 } = {}) {
  const warnings = [];

  // 1) load timing (navigation)
  const nav = await page.evaluate(() => {
    const n = (performance.getEntriesByType('navigation') || [])[0];
    if (!n) return null;
    return {
      loadMs: n.duration ? +n.duration.toFixed(0) : null,
      domContentLoadedMs: n.domContentLoadedEventEnd ? +n.domContentLoadedEventEnd.toFixed(0) : null,
    };
  });

  // 2) JS heap (solo Chromium espone performance.memory)
  const heap = await page.evaluate(() => {
    const m = performance.memory;
    if (!m) return null;
    return {
      usedMB: +(m.usedJSHeapSize / 1048576).toFixed(1),
      totalMB: +(m.totalJSHeapSize / 1048576).toFixed(1),
      limitMB: +(m.jsHeapSizeLimit / 1048576).toFixed(0),
    };
  });

  // 3) frame-timing del render-loop su una finestra temporale (rAF deltas)
  const deltas = await page.evaluate(win => new Promise(res => {
    const ds = []; let last = performance.now(); const t0 = last;
    const tick = now => { ds.push(now - last); last = now; (now - t0 < win) ? requestAnimationFrame(tick) : res(ds); };
    requestAnimationFrame(tick);
  }), frameWindowMs);
  const ds = deltas.filter(d => d > 0).sort((a, b) => a - b);
  const n = ds.length;
  const avg = n ? ds.reduce((s, d) => s + d, 0) / n : 0;
  const p95 = n ? ds[Math.min(n - 1, Math.floor(n * 0.95))] : 0;
  const frames = { count: n, avgMs: +avg.toFixed(2), p95Ms: +p95.toFixed(2), fps: avg ? +(1000 / avg).toFixed(1) : 0 };

  // soglie soft → solo warning
  if (frames.fps && frames.fps < TH.fpsMin) warnings.push(`perf: fps ${frames.fps} < ${TH.fpsMin} (render-loop lento)`);
  if (frames.p95Ms && frames.p95Ms > TH.p95MaxMs) warnings.push(`perf: frame p95 ${frames.p95Ms}ms > ${TH.p95MaxMs}ms (stutter)`);
  if (heap && heap.usedMB > TH.heapUsedMaxMB) warnings.push(`perf: heap ${heap.usedMB}MB > ${TH.heapUsedMaxMB}MB`);
  if (nav && nav.loadMs && nav.loadMs > TH.loadMaxMs) warnings.push(`perf: load ${nav.loadMs}ms > ${TH.loadMaxMs}ms`);

  return { nav, heap, frames, thresholds: TH, warnings };
}

/* [BL-12] LEAK/ZOMBIE DETECTION (warn-only, come tutto LMQP-8) — campiona lo JS heap N volte a
   pagina "ferma" (render-loop attivo ma nessuna nuova azione) e stima la PENDENZA (MB/s): una
   crescita sostenuta con scena statica è il segnale classico di leak per-frame (allocazioni nel
   render-loop, listener/timer accumulati). In più conta i <canvas> montati a fine run: un numero
   anomalo = componenti 3D zombie mai smontati (match + gala/interview/intro coexistono al massimo
   in transizione). Headless è rumoroso (GC non forzabile senza --expose-gc) → soglie LARGHE, mai FAIL. */
const LEAK_TH = { slopeMaxMBs: 3, canvasMax: 4 };

export async function measureLeak(page, { samples = 4, gapMs = 700 } = {}) {
  const warnings = [];
  const heaps = [];
  for (let i = 0; i < samples; i++) {
    const h = await page.evaluate(() => performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null);
    if (h == null) return null; // non-Chromium: nessuna misura
    heaps.push(h);
    if (i < samples - 1) await new Promise(r => setTimeout(r, gapMs));
  }
  const spanS = ((samples - 1) * gapMs) / 1000;
  const slope = spanS > 0 ? (heaps[heaps.length - 1] - heaps[0]) / spanS : 0; // MB/s
  const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length);
  if (slope > LEAK_TH.slopeMaxMBs) warnings.push(`leak: heap +${slope.toFixed(1)}MB/s a scena statica (> ${LEAK_TH.slopeMaxMBs}MB/s)`);
  if (canvases > LEAK_TH.canvasMax) warnings.push(`zombie: ${canvases} canvas montati a fine run (> ${LEAK_TH.canvasMax})`);
  return { heapsMB: heaps, slopeMBs: +slope.toFixed(2), canvases, thresholds: LEAK_TH, warnings };
}
