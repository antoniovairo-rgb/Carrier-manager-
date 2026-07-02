#!/usr/bin/env node
/* [6.3.0 R0/LMQP-10] LIVE MATCH VALIDATOR — primo gradino del framework richiesto dalla direttiva PO
   «Riprogettazione Match Engine» (MATCH_ENGINE_REDESIGN.md §7). Gioca N partite REALI (autoplay: selezione
   contestuale, catene, clock, tick playing — NIENTE force-sit), registra palla+22 per-frame nel browser
   (__CPM_REC) e calcola METRICHE CINEMATICHE per highlight:
     teleport palla/giocatori · velocità palla per tratto · statue (fermi con palla viva) ·
     compenetrazioni · coerenza esito⟺traiettoria (gol ⟹ palla in porta).
   Output: out/live-validator/report.json + verdetti PASS/WARN/FAIL per highlight + baseline percentile
   (live-baseline.json: creata al primo run, confrontata nei successivi; LMV_UPDATE_BASELINE=1 rigenera).
   Env: LMV_MATCHES (default 2) · LMV_SEED (base 11) · LMV_STRICT=1 (exit≠0 sui FAIL — da attivare post-R3/R4).
   NOTA v1: contesto provino (openMatch); il freeze di lettura è disattivato sotto ?cpmtest=1 → le statue
   rilevate sono difetti REALI dell AI, non presentazione. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dir, 'out', 'live-validator');
fs.mkdirSync(OUT, { recursive: true });
const N_MATCHES = parseInt(process.env.LMV_MATCHES || '2', 10);
const SEED0 = parseInt(process.env.LMV_SEED || '11', 10);
const STRICT = process.env.LMV_STRICT === '1';
const BASELINE_PATH = path.join(__dir, 'live-baseline.json');

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const pct = (arr, q) => { if (!arr.length) return 0; const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

/* ── metriche su un segmento di frame (un highlight o un tratto di playing) ── */
function analyzeSegment(frames, events) {
  const issues = [], warns = [];
  const m = { frames: frames.length, ballTeleports: 0, worstBallJump: 0, playerTeleports: 0, maxBallSpeed: 0, statues: 0, overlaps: 0 };
  if (frames.length < 4) return { metrics: m, issues, warns };
  // teleport & velocità palla per tratto (stessa fase: i cambi fase sono cut di regia dichiarati)
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1], b = frames[i];
    const dtm = Math.max(1, b.t - a.t);
    if (a.ph === b.ph) {
      const d = dist(a.b, b.b);
      const v = d / (dtm / 1000);
      if (d > m.worstBallJump) m.worstBallJump = +d.toFixed(1);
      if (d > 12 && dtm < 220) { m.ballTeleports++; if (m.ballTeleports <= 2) issues.push(`teleport palla ${d.toFixed(1)}u in ${dtm}ms (fase ${b.ph}, t=${b.t})`); }
      else if (v > 60 && d > 3) { m.maxBallSpeed = Math.max(m.maxBallSpeed, +v.toFixed(0)); }
      for (let j = 0; j < Math.min(a.p.length, b.p.length); j++) {
        const pd = dist(a.p[j], b.p[j]);
        if (pd > 9 && dtm < 220) { m.playerTeleports++; if (m.playerTeleports <= 2) issues.push(`teleport giocatore #${j} ${pd.toFixed(1)}u in ${dtm}ms (fase ${b.ph})`); }
      }
    }
  }
  // statue: finestra scorrevole ~2.5s — giocatore fermo (<0.5u) mentre la palla percorre >8u
  const span = frames[frames.length - 1].t - frames[0].t;
  if (span > 2600) {
    const step = Math.max(1, Math.floor(frames.length / (span / 1300)));
    for (let w0 = 0; w0 + step * 2 < frames.length; w0 += step) {
      const a = frames[w0], b = frames[Math.min(frames.length - 1, w0 + step * 2)];
      if (b.t - a.t < 1800) continue;
      const ballMoved = dist(a.b, b.b);
      if (ballMoved < 8) continue;
      for (let j = 0; j < Math.min(a.p.length, b.p.length); j++) if (dist(a.p[j], b.p[j]) < 0.5) m.statues++;
    }
    if (m.statues > 30) warns.push(`${m.statues} finestre-giocatore immobili con palla viva (statue)`);
  }
  // compenetrazioni: coppie sotto 0.9u per 3+ frame consecutivi
  let runPairs = new Map();
  for (const f of frames) {
    const near = new Set();
    for (let i = 0; i < f.p.length; i++) for (let j = i + 1; j < f.p.length; j++) {
      if (dist(f.p[i], f.p[j]) < 0.9) near.add(i + '_' + j);
    }
    for (const kk of near) runPairs.set(kk, (runPairs.get(kk) || 0) + 1);
    for (const kk of [...runPairs.keys()]) if (!near.has(kk)) { if (runPairs.get(kk) >= 3) m.overlaps++; runPairs.delete(kk); }
  }
  if (m.overlaps > 4) warns.push(`${m.overlaps} compenetrazioni prolungate (coppie <0.9u per 3+ frame)`);
  return { metrics: m, issues, warns };
}

/* ── coerenza esito⟺traiettoria: gol ⟹ la palla raggiunge la porta avversaria (world x≈+50) ── */
function checkOutcomeCoherence(seg, ev) {
  if (!ev || !ev.ok) return null;
  if (ev.key === 'goal') {
    const reached = seg.some(f => f.b[0] > 44 && Math.abs(f.b[1]) < 8);
    if (!reached) return `esito GOL ma la palla non raggiunge mai la porta avversaria (max x=${Math.max(...seg.map(f => f.b[0])).toFixed(1)})`;
  }
  return null;
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const report = { version: 1, matches: [], startedAt: new Date().toISOString() };
const allDist = { ballJump: [], statues: [], overlaps: [], hlFail: 0, hlWarn: 0, hlPass: 0 };

for (let mi = 0; mi < N_MATCHES; mi++) {
  const seed = SEED0 + mi * 97;
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 140)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port, { skipLoadAll: true });
  await page.evaluate((s) => { window.__CPM_REC = true; window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET(); window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded' }); }, seed);

  const frames = [];
  const t0 = Date.now(); let lastClock = -1, stuckSince = Date.now(), ended = false;
  while (Date.now() - t0 < 240000) {
    await sleep(1500);
    const chunk = await page.evaluate(() => ({ buf: window.__CPM_REC_DRAIN ? window.__CPM_REC_DRAIN() : [], probe: window.__CPM_PROBE ? window.__CPM_PROBE() : null,
      over: /FISCHIO FINALE|Fine partita|TRIALS COMPLETATI/i.test(document.body.innerText.slice(0, 400)) }));
    frames.push(...chunk.buf);
    const ck = chunk.probe?.clock ?? -1, ph = chunk.probe?.phase;
    if (ck !== lastClock || (ph && ph.startsWith('hl'))) { lastClock = ck; stuckSince = Date.now(); }
    if (chunk.over || ck >= 90 || ph === 'ended' || ph == null) { ended = true; break; } // la probe non conosce 'ended' (3D smontato): il fischio finale si legge dal DOM
    if (Date.now() - stuckSince > 25000) { break; } // stallo: lo riportiamo come FAIL del match
  }
  const timeline = await page.evaluate(() => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []));
  await page.close();

  // segmentazione: run contigui di fasi hl_* = un highlight; il resto = playing/BG
  const segs = []; let cur = null;
  for (const f of frames) {
    const inHL = f.ph && String(f.ph).startsWith('hl');
    if (inHL) { if (!cur) { cur = { frames: [] }; segs.push(cur); } cur.frames.push(f); }
    else if (cur) { cur = null; }
  }
  const resolved = timeline.filter(e => e.type === 'ActionResolved');
  const highlights = segs.map((sg, i) => {
    const { metrics, issues, warns } = analyzeSegment(sg.frames, null);
    const ev = resolved[i] || null;
    const coh = checkOutcomeCoherence(sg.frames, ev && { ok: ev.ok, key: ev.key });
    if (coh) issues.push(coh);
    const verdict = issues.length ? 'FAIL' : warns.length ? 'WARN' : 'PASS';
    allDist.ballJump.push(metrics.worstBallJump); allDist.statues.push(metrics.statues); allDist.overlaps.push(metrics.overlaps);
    allDist[verdict === 'FAIL' ? 'hlFail' : verdict === 'WARN' ? 'hlWarn' : 'hlPass']++;
    return { i, intent: ev?.intent || null, key: ev?.key || null, ok: ev?.ok ?? null, clock: sg.frames[0]?.ck ?? null, verdict, metrics, issues, warns };
  });
  const bgSeg = analyzeSegment(frames.filter(f => f.ph === 'playing' || f.ph === 'match'), null);
  const matchFail = !ended && frames.length > 0;
  report.matches.push({ seed, frames: frames.length, clockReached: lastClock, ended, stalled: matchFail, pageErrors: errors, highlights, playingMetrics: bgSeg.metrics, playingIssues: bgSeg.issues, playingWarns: bgSeg.warns });
  console.log(`── match ${mi + 1}/${N_MATCHES} seed ${seed}: ${frames.length} frame · clock →${lastClock}' · ${highlights.length} HL (${highlights.filter(h => h.verdict === 'PASS').length}P/${highlights.filter(h => h.verdict === 'WARN').length}W/${highlights.filter(h => h.verdict === 'FAIL').length}F)${matchFail ? ' · ⚠️ STALLO' : ''} · pageerr ${errors.length}`);
  for (const h of highlights.filter(h => h.verdict !== 'PASS').slice(0, 6)) console.log(`   ${h.verdict} HL#${h.i} [${h.intent || '?'}→${h.key || '?'}] ${(h.issues[0] || h.warns[0] || '')}`);
}

/* ── baseline percentile + regressione ── */
const summary = {
  hl: { pass: allDist.hlPass, warn: allDist.hlWarn, fail: allDist.hlFail },
  p90BallJump: +pct(allDist.ballJump, 0.9).toFixed(1),
  p90Statues: pct(allDist.statues, 0.9),
  p90Overlaps: pct(allDist.overlaps, 0.9),
  pageErrors: report.matches.reduce((a, mm) => a + mm.pageErrors.length, 0),
  stalled: report.matches.filter(mm => mm.stalled).length,
};
report.summary = summary;
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
let regressions = [];
if (fs.existsSync(BASELINE_PATH) && process.env.LMV_UPDATE_BASELINE !== '1') {
  const base = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const worse = (k, tol) => summary[k] > (base[k] ?? Infinity) * tol;
  if (worse('p90BallJump', 1.35)) regressions.push(`p90BallJump ${base.p90BallJump}→${summary.p90BallJump}`);
  if (worse('p90Statues', 1.5)) regressions.push(`p90Statues ${base.p90Statues}→${summary.p90Statues}`);
  if (worse('p90Overlaps', 1.5)) regressions.push(`p90Overlaps ${base.p90Overlaps}→${summary.p90Overlaps}`);
  const baseFailRate = base.hl.fail / Math.max(1, base.hl.pass + base.hl.warn + base.hl.fail);
  const failRate = summary.hl.fail / Math.max(1, summary.hl.pass + summary.hl.warn + summary.hl.fail);
  if (failRate > baseFailRate * 1.4 + 0.02) regressions.push(`FAIL-rate ${(baseFailRate * 100).toFixed(0)}%→${(failRate * 100).toFixed(0)}%`);
} else {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(summary, null, 1));
  console.log('★ baseline scritta →', path.relative(__dir, BASELINE_PATH));
}
console.log(`\n══ LIVE VALIDATOR ══  HL: ${summary.hl.pass} PASS · ${summary.hl.warn} WARN · ${summary.hl.fail} FAIL · p90 ballJump ${summary.p90BallJump}u · statue p90 ${summary.p90Statues} · overlap p90 ${summary.p90Overlaps} · stalli ${summary.stalled} · pageerr ${summary.pageErrors}`);
regressions.forEach(r => console.log('  ⛔ REGRESSIONE vs baseline: ' + r));
console.log('report → tests/visual/out/live-validator/report.json');
const hardFail = summary.pageErrors > 0 || summary.stalled > 0 || regressions.length > 0 || (STRICT && summary.hl.fail > 0);
console.log(hardFail ? '❌ LIVE VALIDATOR: problemi bloccanti' : '✅ LIVE VALIDATOR: run completo (i FAIL/WARN degli HL sono la mappa di lavoro R2-R4)');
await browser.close(); srv.close();
process.exit(hardFail ? 1 : 0);
