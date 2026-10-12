#!/usr/bin/env node
/* ============================================================================
   SONDA RAPIDA — check `motion` (No Dead Players) fuori dal gate, a bracci alternati.
   Nata per il rosso della 7.999.161 (verde sulla 7.999.160 nelle stesse condizioni).
   Ripete SOLO la parte `motion` di validate-situations: stesse 24 scene motIdx, stessa finestra
   (settle 500 · poll 100 · window 1900), stessa rimisura unica sotto 13, stesso calcolo di `alive`
   (copiato da lib/harness.mjs sampleMotion, aggiunge solo i testimoni: tempo di scena percorso,
   campioni, fps della pagina).

   Bracci: ARMS="160,161,161:__CPM_NO_DRB229,161:__CPM_NO_PO229+__CPM_NO_TAB228"
     - la parte prima dei due punti sceglie la radice (ROOT160 / ROOT161, default: wt160 e questo repo)
     - dopo i due punti, interruttori window accesi (separati da +) prima del caricamento
   R=<ripetizioni> (default 3): l'ordine dei bracci si ALTERNA a ogni ripetizione (avanti/indietro).
   TIRED=<n>: prima della misura forza n scene come il giro del gate (pagina «stanca»), default 0.
   OUT=<file.jsonl>: una riga per corsa.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import ballMotion from './checks/ball-motion.mjs';
import { sampleBallPath } from './lib/harness.mjs';
import { startServer, launchBrowser, openMatch, forceSituation, freeze, unfreeze, canvasShot, samplePostHighlight, sleep, waitBallSettle, frameState, installCdnRoutes, ROOT } from './lib/harness.mjs';

const ROOTS = { '160': process.env.ROOT160 || '/tmp/claude-0/wt160', '161': process.env.ROOT161 || ROOT };
const ARMS = (process.env.ARMS || '160,161').split(',').map(s => s.trim()).filter(Boolean);
const R = +(process.env.R || 3);
const TIRED = +(process.env.TIRED || 0);
/* GATE=1: prima della misura ripete le passate che il gate fa PRIMA di `motion`, nello stesso ordine e coi
   suoi tempi: 191 forzature (settle 600 + freeze/scatto/unfreeze) · determinism (ogni 12, settle 550) ·
   final-state (ogni 8: resolve(0), 700 ms, assestamento palla, stato) · post-highlight (6 scene). */
const GATE = process.env.GATE === '1';
/* MINSCENE=<s> MAXWIN=<ms>: il pavimento di tempo di scena proposto per il gate (0 = finestra d'orologio pura, come la 7.999.161). */
/* BM=1: dopo `motion` ripete anche `ball-motion` come il gate (stesse scene, settle 450 · poll 90 · window 1100). */
const BM = process.env.BM === '1';
const MINSCENE = +(process.env.MINSCENE || 0); const MAXWIN = +(process.env.MAXWIN || 6000);
async function gatePasses(page, total) {
  for (let gi = 0; gi < total; gi++) { await forceSituation(page, gi, { settle: 600, choose: true }); await freeze(page); await canvasShot(page); await unfreeze(page); }
  for (let gi = 0; gi < total; gi += 12) await forceSituation(page, gi, { settle: 550, choose: true });
  for (let gi = 0; gi < total; gi += 8) {
    await forceSituation(page, gi, { settle: 550, choose: true });
    await page.evaluate(() => window.__CPM_RESOLVE(0)); await sleep(700);
    await waitBallSettle(page, { maxMs: 9000, quietMs: 700, pollMs: 110 }); await frameState(page); await sleep(300);
  }
  for (const gi of [0, 2, 30, 60, 79, 120].filter(g => g < total)) { await samplePostHighlight(page, gi, { windowMs: 1100, pollMs: 110 }); await sleep(300); }
}
const OUT = process.env.OUT || path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'sonda-motion-161.jsonl');
const MOT_IDX = [0, 2, 8, 14, 20, 26, 30, 36, 44, 52, 60, 66, 71, 79, 84, 90, 96, 104, 110, 116, 120, 128, 134, 140];

async function sampleMotionT(page, gi, { settle = 500, pollMs = 100, windowMs = 1900 } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const frames = []; const t0 = Date.now(); const end = t0 + windowMs;
  const sceneT0 = await page.evaluate(() => window.__CPM_SCENET || 0);
  const raf0 = await page.evaluate(() => window.__sondaRaf || 0);
  const TARGET_SCENE = 1.2; let sceneNow = sceneT0;
  const hardEnd = t0 + Math.max(windowMs, MAXWIN);
  while (Date.now() < end || (sceneNow - sceneT0 < MINSCENE && Date.now() < hardEnd)) {
    const st = await page.evaluate(() => (typeof window.__CPM_STATE === 'function' ? window.__CPM_STATE() : null));
    const players = ((st && st.players) || []).map(p => ({ x: p.x, y: p.y, team: p.team, gk: p.gk }));
    frames.push({ players, ph: st && st.phase });
    sceneNow = await page.evaluate(() => window.__CPM_SCENET || 0);
    if (sceneNow - sceneT0 >= TARGET_SCENE && frames.length >= 8) break;
    await sleep(pollMs);
  }
  const realMs = Date.now() - t0;
  const raf1 = await page.evaluate(() => window.__sondaRaf || 0);
  const n = frames.length ? frames[0].players.length : 0;
  const disp = new Array(n).fill(0);
  for (let f = 1; f < frames.length; f++) for (let p = 0; p < n; p++) {
    const a = frames[f - 1].players[p], c = frames[f].players[p]; if (!a || !c) continue;
    disp[p] += Math.hypot(c.x - a.x, c.y - a.y);
  }
  let alive = 0; for (let p = 0; p < n; p++) if (disp[p] > 0.7) alive++;
  const phs = [...new Set(frames.map(f => f.ph))].join('/');
  return { gi, players: n, alive, scene: +(sceneNow - sceneT0).toFixed(2), realMs, samples: frames.length, fps: +((raf1 - raf0) / (realMs / 1000)).toFixed(1), phs, disp: disp.map(d => +d.toFixed(1)) };
}

async function runArm(browser, arm, rep) {
  const [ver, flagStr] = arm.split(':');
  const flags = (flagStr || '').split('+').filter(Boolean);
  const srv = await startServer(ROOTS[ver]); const port = srv.address().port;
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript((fl) => {
    window.__CPM_GLB = false;
    for (const f of fl) window[f] = true;
    window.__sondaRaf = 0; const tick = () => { window.__sondaRaf++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  }, flags);
  const t0 = Date.now();
  const { total } = await openMatch(page, port);
  const gv = await page.evaluate(() => { try { return typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : null; } catch (_e) { return null; } });
  await forceSituation(page, 0, { settle: 1200, choose: true });
  for (let gi = 0; gi < Math.min(TIRED, total); gi++) await forceSituation(page, gi, { settle: 600, choose: true });
  if (GATE) await gatePasses(page, total);
  const tPre = Math.round((Date.now() - t0) / 1000);
  const rows = []; const retry = [];
  for (const gi of MOT_IDX.filter(g => g < total)) {
    let s = await sampleMotionT(page, gi);
    const first = s;
    if (s && s.players && s.alive < 13) { await sleep(300); const s2 = await sampleMotionT(page, gi); retry.push(`gi${gi}:${s.alive}->${s2.alive}`); s = s2; }
    rows.push({ ...s, first: first.alive, firstScene: first.scene });
    await sleep(150);
  }
  let bm = null;
  if (BM) {
    const bs = [];
    for (const gi of [0, 8, 17, 30, 43, 60, 63, 72, 88, 120, 132, 153, 163].filter(g => g < total)) { bs.push(await sampleBallPath(page, gi, { settle: 450, pollMs: 90, windowMs: 1100 })); await sleep(150); }
    const res = ballMotion.run({ samples: bs });
    bm = { pass: res.issues.length === 0, issues: res.issues, back: Object.fromEntries(bs.map(b => [b.gi, b.maxBackStep])) };
  }
  await page.close(); srv.close();
  const fails = rows.filter(r => r.alive < 13).map(r => `gi${r.gi} ${r.alive}/${r.players}`);
  const rec = { arm, ver, flags, rep, gv, at: new Date().toISOString(), secs: Math.round((Date.now() - t0) / 1000), bm, tired: TIRED, gate: GATE, minScene: MINSCENE, tPre, pass: fails.length === 0, fails, retry, errs: errs.slice(0, 3),
    alive: Object.fromEntries(rows.map(r => [r.gi, r.alive])), first: Object.fromEntries(rows.map(r => [r.gi, r.first])),
    scene: Object.fromEntries(rows.map(r => [r.gi, r.firstScene])), fps: +(rows.reduce((a, r) => a + r.fps, 0) / rows.length).toFixed(2), rows };
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  const med = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
  console.log(`[${rec.at}] ${arm} rep${rep} gv=${gv} gate=${GATE} minScene=${MINSCENE} tPre=${tPre}s fps~${rec.fps} ${rec.pass ? 'PASS' : 'FAIL'} fails=[${fails.join(', ')}] retry=[${retry.join(' ')}] first-median=${med(rows.map(r => r.first))} scene-median=${med(rows.map(r => r.firstScene))}`);
  if (bm) console.log(`   ball-motion ${bm.pass ? 'PASS' : 'FAIL'} ${bm.issues.join(' ; ')} back=${JSON.stringify(bm.back)}`);
  console.log('   first: ' + rows.map(r => `${r.gi}:${r.first}`).join(' '));
  return rec;
}

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await launchBrowser();
  try {
    for (let rep = 0; rep < R; rep++) {
      const order = rep % 2 === 0 ? ARMS : ARMS.slice().reverse();
      for (const arm of order) {
        try { await runArm(browser, arm, rep); } catch (e) { console.log(`${arm} rep${rep} ERRORE ${e.message}`); }
      }
    }
  } finally { await browser.close(); }
  console.log('FINE sonda');
})();
