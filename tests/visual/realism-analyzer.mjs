#!/usr/bin/env node
/* [7.194.0 direttiva PO «salto di qualità nella credibilità calcistica»] REALISM ANALYZER —
   il Live Match Validator (6.3.0) dice se una cosa è ROTTA (teleport, stalli, esiti incoerenti); questo dice
   se è ARTIFICIALE. Gioca N partite REALI (stesso autoplay del validator, niente force-sit), registra palla+22
   per-frame e calcola una SCORECARD cinematica:

     movimento   turnP90   cambi di direzione istantanei (gradi/secondo, solo a velocità reale)
                 jerkP90   strappi di accelerazione (u/s²)
                 stopStart arresti secchi (da corsa a fermo in un frame)
                 idleFrac  quota di giocatore-frame FERMI mentre la palla è viva ← «difensori immobili»
                 spread    deviazione standard delle velocità medie (0 = tutti alla stessa andatura = robotico)
                 sync      quota di frame in cui tutti si muovono insieme (coreografia, non partita)
     palla       arcHVar   varietà dell'apice degli archi · arcDVar varietà delle durate
                 spdP90    picco di velocità · straight quota di traiettorie perfettamente rettilinee
     contatti    minDist   distanza minima fra due giocatori (p05) · overlap frame sotto 1.2u
     portieri    gkMove    escursione dei portieri · gkBallP10 distanza minima GK-palla sugli esiti

   Le metriche sono RELATIVE: contano i delta fra una release e l'altra (headless gira a ~6fps, i valori
   assoluti non sono confrontabili con un device). Baseline in realism-baseline.json (RA_UPDATE=1 rigenera).
   Env: RA_MATCHES (default 4) · RA_SEED (base 31) · RA_CTX (career|trial, default career). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dir, 'out', 'realism');
fs.mkdirSync(OUT, { recursive: true });
const N = parseInt(process.env.RA_MATCHES || '4', 10);
const SEED0 = parseInt(process.env.RA_SEED || '31', 10);
const CTX = process.env.RA_CTX || 'career';
const BASE = path.join(__dir, 'realism-baseline.json');

const pct = (a, q) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const sd = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };

const SAVE = { phase: 'career', player: {
  name: 'Realism Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 6, weekLived: false, age: 24, ovr: 78,
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, mercatoSeen: 4,
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' }, leagueOverrides: { sal: 'Lega A' },
  stats: { 'velocità': 78, tecnica: 79, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 78, dribbling: 79, posizionamento: 78 },
  form: 76, morale: 70, fatigue: 14, goals: 5, assists: 3, matches: 5, matchHistory: [],
  contract: { duration: 3, wage: 40000, expiresAtSeason: 7 } } };

/* ── analisi cinematica di una sequenza di frame ── */
function kinematics(frames) {
  const turn = [], jerk = [], spd = [], gkm = [];
  let stopStart = 0, idle = 0, idleTot = 0, minD = [], overlapFr = 0, syncFr = 0, moveFr = 0;
  const perPlayerSpeeds = [];
  if (frames.length < 6) return null;
  const nP = frames[0].p.length;
  for (let i = 0; i < nP; i++) perPlayerSpeeds.push([]);
  let prevV = new Array(nP).fill(null), prevTh = new Array(nP).fill(null);
  for (let f = 1; f < frames.length; f++) {
    const A = frames[f - 1], B = frames[f];
    const dt = Math.max(0.016, (B.t - A.t) / 1000);
    if (dt > 0.6) { prevV = new Array(nP).fill(null); prevTh = new Array(nP).fill(null); continue; } // buco di cattura
    const bs = Math.hypot(B.b[0] - A.b[0], B.b[1] - A.b[1]) / dt;
    const ballLive = bs > 1.2;
    let moving = 0;
    for (let i = 0; i < nP && i < B.p.length; i++) {
      const dx = B.p[i][0] - A.p[i][0], dz = B.p[i][1] - A.p[i][1];
      const d = Math.hypot(dx, dz), v = d / dt;
      if (v > 26) { prevV[i] = null; prevTh[i] = null; continue; } // teleport/setup-snap: fuori dalla cinematica
      perPlayerSpeeds[i].push(v);
      spd.push(v);
      if (v > 0.35) moving++;
      if (ballLive) { idleTot++; if (v < 0.25) idle++; }
      const th = (d > 0.05) ? Math.atan2(dz, dx) : null;
      if (prevV[i] != null) {
        jerk.push(Math.abs(v - prevV[i]) / dt);
        if (prevV[i] > 2.2 && v < 0.35) stopStart++;
      }
      if (th != null && prevTh[i] != null && v > 1.0) {
        let dth = Math.abs(th - prevTh[i]); if (dth > Math.PI) dth = 2 * Math.PI - dth;
        turn.push(dth * 180 / Math.PI / dt);
      }
      prevV[i] = v; if (th != null) prevTh[i] = th;
    }
    if (moving > 0) { moveFr++; if (moving >= Math.max(4, Math.floor(nP * 0.85))) syncFr++; }
    // distanza minima fra coppie (campionata ogni 3 frame per costo)
    if (f % 3 === 0) {
      let md = 1e9;
      for (let i = 0; i < B.p.length; i++) for (let j = i + 1; j < B.p.length; j++) {
        const dd = Math.hypot(B.p[i][0] - B.p[j][0], B.p[i][1] - B.p[j][1]); if (dd < md) md = dd;
      }
      if (md < 1e9) { minD.push(md); if (md < 1.2) overlapFr++; }
    }
    // portieri: estremi in x (il recorder non porta il ruolo)
    const xs = B.p.map(q => q[0]);
    gkm.push([Math.min(...xs), Math.max(...xs)]);
  }
  const avgs = perPlayerSpeeds.filter(s => s.length > 8).map(mean);
  return {
    turnP90: +pct(turn, 0.9).toFixed(0), turnP99: +pct(turn, 0.99).toFixed(0),
    jerkP90: +pct(jerk, 0.9).toFixed(1), stopStart,
    idleFrac: idleTot ? +(idle / idleTot).toFixed(3) : 0,
    spread: +sd(avgs).toFixed(2), meanSpd: +mean(avgs).toFixed(2),
    syncFrac: moveFr ? +(syncFr / moveFr).toFixed(3) : 0,
    minDistP05: +pct(minD, 0.05).toFixed(2), overlapFrames: overlapFr,
    gkSpanHome: +(Math.max(...gkm.map(g => g[0])) - Math.min(...gkm.map(g => g[0]))).toFixed(1),
    gkSpanAway: +(Math.max(...gkm.map(g => g[1])) - Math.min(...gkm.map(g => g[1]))).toFixed(1),
  };
}

/* ── archi della palla: apice, durata, rettilineità ── */
function ballArcs(frames) {
  const arcs = []; let cur = null;
  for (let f = 1; f < frames.length; f++) {
    const A = frames[f - 1], B = frames[f];
    const dt = Math.max(0.016, (B.t - A.t) / 1000);
    if (dt > 0.6) { cur = null; continue; }
    const v = Math.hypot(B.b[0] - A.b[0], B.b[1] - A.b[1]) / dt;
    if (v > 3) { if (!cur) cur = { t0: A.t, pts: [A.b], hMax: A.b[2] }; cur.pts.push(B.b); cur.hMax = Math.max(cur.hMax, B.b[2]); }
    else if (cur) { if (cur.pts.length >= 3) { cur.dur = (B.t - cur.t0) / 1000; arcs.push(cur); } cur = null; }
  }
  const H = arcs.map(a => +a.hMax.toFixed(2)), D = arcs.map(a => +a.dur.toFixed(2));
  // rettilineità: scarto massimo dei punti dalla retta inizio→fine, normalizzato sulla lunghezza
  const bend = arcs.map(a => {
    const p0 = a.pts[0], p1 = a.pts[a.pts.length - 1];
    const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
    let mx = 0;
    for (const q of a.pts) { const cr = Math.abs((p1[0] - p0[0]) * (p0[1] - q[1]) - (p0[0] - q[0]) * (p1[1] - p0[1])) / L; if (cr > mx) mx = cr; }
    return +(mx / L).toFixed(3);
  });
  return { arcs: arcs.length, apexMean: +mean(H).toFixed(2), apexSd: +sd(H).toFixed(2), durMean: +mean(D).toFixed(2), durSd: +sd(D).toFixed(2),
    straightFrac: bend.length ? +(bend.filter(b => b < 0.02).length / bend.length).toFixed(2) : 0, bendMean: +mean(bend).toFixed(3) };
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const all = { hl: [], playing: [], arcs: [], matches: [] };
let pageErrors = 0;

for (let mi = 0; mi < N; mi++) {
  const seed = SEED0 + mi * 97;
  const page = await browser.newPage({ viewport: { width: 900, height: 760 } });
  await installCdnRoutes(page);
  page.on('pageerror', () => pageErrors++);
  await page.addInitScript((sv) => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (e) {} }, SAVE);
  if (CTX === 'career') {
    /* stessa procedura d'ingresso del live-validator: save pro precaricato → CONTINUA → handler VERI */
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
    await sleep(1800);
    try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 30000 });
    for (let a = 0; a < 14 && !(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')); a++) {
      await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss && C.dismiss(); const pm = C.playMatch ? C.playMatch() : 'nomatch';
        if (pm !== true) { const r = C.step ? C.step() : null; if (String(r).startsWith('blocked') && C.clearTournaments) C.clearTournaments(); } });
      await sleep(900);
    }
  } else {
    await openMatch(page, port, { skipLoadAll: true });
  }
  if (!(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function'))) { console.log(`── match ${mi + 1}: live non raggiunto — skip`); await page.close(); continue; }
  await page.evaluate((s) => { window.__CPM_REC = true; window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded' }); }, seed);
  const frames = [];
  for (let k = 0; k < 90; k++) {
    await sleep(900);
    const chunk = await page.evaluate(() => (window.__CPM_REC_DRAIN ? window.__CPM_REC_DRAIN() : []));
    frames.push(...chunk);
    const gone = CTX === 'career' && !(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function'));
    if (gone) break;
  }
  await page.close();
  if (frames.length < 40) { console.log(`── match ${mi + 1}: solo ${frames.length} frame — skip`); continue; }
  fs.writeFileSync(path.join(OUT, `frames-m${mi}.json`), JSON.stringify(frames), 'utf8');
  const hlF = frames.filter(f => f.ph && String(f.ph).startsWith('hl'));
  const plF = frames.filter(f => f.ph === 'playing');
  const kHL = kinematics(hlF), kPL = kinematics(plF), arcs = ballArcs(frames);
  if (kHL) all.hl.push(kHL); if (kPL) all.playing.push(kPL); all.arcs.push(arcs);
  all.matches.push({ seed, frames: frames.length, hlFrames: hlF.length, playFrames: plF.length, arcs: arcs.arcs });
  console.log(`── match ${mi + 1}/${N} seed ${seed}: ${frames.length} frame (${hlF.length} HL) · archi ${arcs.arcs}` +
    (kHL ? ` · turnP90 ${kHL.turnP90}°/s · idle ${(kHL.idleFrac * 100).toFixed(0)}% · spread ${kHL.spread} · minDist ${kHL.minDistP05}u` : ''));
}
await browser.close(); srv.close();

const agg = (rows, k) => rows.length ? +(mean(rows.map(r => r[k])).toFixed(3)) : 0;
const card = {
  matches: all.matches.length,
  hl: all.hl.length ? {
    turnP90: agg(all.hl, 'turnP90'), turnP99: agg(all.hl, 'turnP99'), jerkP90: agg(all.hl, 'jerkP90'),
    stopStart: agg(all.hl, 'stopStart'), idleFrac: agg(all.hl, 'idleFrac'), spread: agg(all.hl, 'spread'),
    meanSpd: agg(all.hl, 'meanSpd'), syncFrac: agg(all.hl, 'syncFrac'), minDistP05: agg(all.hl, 'minDistP05'),
    overlapFrames: agg(all.hl, 'overlapFrames'), gkSpanHome: agg(all.hl, 'gkSpanHome'), gkSpanAway: agg(all.hl, 'gkSpanAway'),
  } : null,
  playing: all.playing.length ? {
    turnP90: agg(all.playing, 'turnP90'), idleFrac: agg(all.playing, 'idleFrac'), spread: agg(all.playing, 'spread'),
    meanSpd: agg(all.playing, 'meanSpd'), minDistP05: agg(all.playing, 'minDistP05'),
  } : null,
  ball: all.arcs.length ? {
    arcs: agg(all.arcs, 'arcs'), apexMean: agg(all.arcs, 'apexMean'), apexSd: agg(all.arcs, 'apexSd'),
    durMean: agg(all.arcs, 'durMean'), durSd: agg(all.arcs, 'durSd'), straightFrac: agg(all.arcs, 'straightFrac'), bendMean: agg(all.arcs, 'bendMean'),
  } : null,
  pageErrors,
};
fs.writeFileSync(path.join(OUT, 'scorecard.json'), JSON.stringify({ card, matches: all.matches }, null, 1));

console.log('\n══ REALISM SCORECARD ══');
if (card.hl) console.log(`HIGHLIGHT  turnP90 ${card.hl.turnP90}°/s · turnP99 ${card.hl.turnP99} · jerkP90 ${card.hl.jerkP90} · arresti secchi ${card.hl.stopStart} · fermi-con-palla-viva ${(card.hl.idleFrac * 100).toFixed(1)}% · spread ${card.hl.spread} (media ${card.hl.meanSpd} u/s) · sync ${(card.hl.syncFrac * 100).toFixed(0)}% · minDist ${card.hl.minDistP05}u (overlap ${card.hl.overlapFrames}) · GK span ${card.hl.gkSpanHome}/${card.hl.gkSpanAway}u`);
if (card.playing) console.log(`PLAYING    turnP90 ${card.playing.turnP90}°/s · fermi ${(card.playing.idleFrac * 100).toFixed(1)}% · spread ${card.playing.spread} · minDist ${card.playing.minDistP05}u`);
if (card.ball) console.log(`PALLA      archi ${card.ball.arcs} · apice ${card.ball.apexMean}±${card.ball.apexSd} · durata ${card.ball.durMean}±${card.ball.durSd}s · rettilinei ${(card.ball.straightFrac * 100).toFixed(0)}% · curvatura media ${card.ball.bendMean}`);
console.log(`pageerror ${pageErrors}`);

if (!fs.existsSync(BASE) || process.env.RA_UPDATE === '1') {
  fs.writeFileSync(BASE, JSON.stringify(card, null, 1));
  console.log('★ baseline realismo scritta → realism-baseline.json');
} else {
  const b = JSON.parse(fs.readFileSync(BASE, 'utf8'));
  const cmp = (grp, k, better) => {
    const o = b[grp] && b[grp][k], n = card[grp] && card[grp][k];
    if (o == null || n == null) return;
    const d = n - o, dir = better === 'down' ? (d < 0 ? '✅' : d > 0 ? '⚠️' : '=') : (d > 0 ? '✅' : d < 0 ? '⚠️' : '=');
    console.log(`   ${dir} ${grp}.${k}: ${o} → ${n} (${d > 0 ? '+' : ''}${+d.toFixed(3)})`);
  };
  console.log('\ndelta vs baseline:');
  cmp('hl', 'turnP90', 'down'); cmp('hl', 'jerkP90', 'down'); cmp('hl', 'stopStart', 'down'); cmp('hl', 'idleFrac', 'down');
  cmp('hl', 'spread', 'up'); cmp('hl', 'syncFrac', 'down'); cmp('hl', 'minDistP05', 'up');
  cmp('ball', 'apexSd', 'up'); cmp('ball', 'durSd', 'up'); cmp('ball', 'straightFrac', 'down');
}
console.log('scorecard → tests/visual/out/realism/scorecard.json');
process.exit(pageErrors > 0 ? 1 : 0);
