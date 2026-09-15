#!/usr/bin/env node
/* ============================================================================
   panchina-glb.mjs — MISURA LA PANCHINA CH38 ALLEGGERITA (C4, task grafica)
   ----------------------------------------------------------------------------
   Direttiva PO: i panchinari (6+coach+vice per lato) devono avere il corpo CH38
   (GLB alleggerito, assets/footballer-panchina.glb) invece delle figure
   procedurali, e "non devono volare". Rosso/verde: window.__CPM_NO904.

   Misura, per ENTRAMBI i bracci (Chromium 412×915, GLB accesi):
     a) corpi CH38 in panchina / totale — window.__CPM_PANCHINA904().glb / .tot
        (atteso 16/16 in verde, 0/16 in rosso)
     b) triangoli in scena (renderer.info.render.triangles, via lo stesso gancio)
        e fps medi su 8s (window.__CPM_FPS708, EMA gia' presente nel motore),
        con la camera che inquadra il dugout (window.__CPM_CAM_DUGOUT904)
     c) appoggio min/max — piedi (verso il pavimento) e bacino (verso la seduta,
        solo i seduti) di TUTTE le 16 comparse, dallo stesso gancio
     d) foto: dugout casa/ospiti da vicino (piedi visibili) per braccio, + una
        durante l'esultanza (gol forzato con __CPM_FORCE_SIT+__CPM_RESOLVE, la
        stessa via di celebration-test.mjs) — screencast CDP (page.screenshot
        rende il canvas WebGL nero, misurato altrove in questo repo), ripetuto
        finche' il fotogramma cambia
     e) 0 pageerror in entrambi i bracci

   INTERPRETAZIONE DICHIARATA (vedi anche il commento sul gancio in
   src/12-three-match-view.jsx): "piedi" = distanza dal PAVIMENTO del dugout
   (y=0), non dalla seduta — un piede sulla seduta (0,77u) sarebbe sospeso a
   mezz'aria, il contrario della direttiva. "bacino" (solo seduti) = distanza
   dalla SEDUTA (0,77u). Per mister/vice "piedi" e' comunque rispetto al suolo,
   "bacino" e' null (in piedi, la seduta non li riguarda).

   NON VERIFICATO: Chromium software (SwiftShader) non e' l'Android del PO —
   fps e triangoli sono indicativi, non assoluti; nessuna verifica su device reale.

   Uso: node panchina-glb.mjs
   ============================================================================ */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out', 'panchina-glb');
fs.mkdirSync(OUT, { recursive: true });
const W = 412, H = 915;
const READY_BUDGET_MS = 20000;   // attesa __CPM_GLB_READY (corpo principale)
const BENCH_BUDGET_MS = 25000;   // attesa __CPM_PANCHINA904().glb === 16 (corpo panchina, caricato DOPO)
const FPS_WINDOW_MS = 8000;

/* Scatta via screencast CDP e ripete finche' il fotogramma non e' chiaramente diverso
   dall'ultimo salvato per QUESTO braccio (canvas nero/statico) — page.screenshot() del
   canvas WebGL torna nero (misurato altrove nel repo, es. tabellone-stadi.mjs). */
async function shotCdp(cdp, getFrame, filePath, { waitFirst = 1500, waitNext = 700, maxTries = 6 } = {}) {
  let last = null;
  for (let i = 0; i < maxTries; i++) {
    await sleep(i === 0 ? waitFirst : waitNext);
    const buf = getFrame();
    if (!buf) continue;
    if (last && buf.equals(last) && i < maxTries - 1) continue; // stesso fotogramma di prima: aspetta che cambi
    last = buf;
    fs.writeFileSync(filePath, buf);
    return { ok: true, tries: i + 1, bytes: buf.length };
  }
  if (last) fs.writeFileSync(filePath, last);
  return { ok: !!last, tries: maxTries };
}

function fmt(n, d = 2) { return (n == null || Number.isNaN(n)) ? '—' : (+n).toFixed(d); }

async function misuraBraccio(arm) {
  const srv = await startServer();
  const port = srv.address().port;
  const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/BABEL/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });
  await page.addInitScript((o) => {
    window.__CPM_GLB = true; // sempre acceso: il confronto e' SOLO sul rosso/verde __CPM_NO904
    if (o.rosso) window.__CPM_NO904 = true;
  }, { rosso: arm.rosso });

  let cdp = null, lastFrame = null;
  const res = { arm: arm.name, errs: [], glbReady: false, panchina: null, tri: null, fpsAvg: null, fpsSamples: [], photos: {} };

  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
    await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});

    cdp = await ctx.newCDPSession(page);
    cdp.on('Page.screencastFrame', e => { lastFrame = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'png', maxWidth: W, maxHeight: H, everyNthFrame: 1 });

    // a) corpo principale pronto, poi corpo panchina (caricato DOPO — puo' arrivare piu' tardi)
    try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: READY_BUDGET_MS }); res.glbReady = true; } catch (_e) { res.glbReady = false; }
    await sleep(400);
    const t0 = Date.now();
    let panchina = await page.evaluate(() => (window.__CPM_PANCHINA904 ? window.__CPM_PANCHINA904() : null));
    while (Date.now() - t0 < BENCH_BUDGET_MS && panchina && panchina.tot > 0 && panchina.glb < panchina.tot && !arm.rosso) {
      await sleep(500);
      panchina = await page.evaluate(() => (window.__CPM_PANCHINA904 ? window.__CPM_PANCHINA904() : null));
    }
    res.panchina = panchina;

    // b) triangoli + fps medi su 8s, camera sul dugout di casa
    await page.evaluate(() => { if (window.__CPM_CAM_DUGOUT904) window.__CPM_CAM_DUGOUT904('home'); });
    await sleep(1000);
    const fEnd = Date.now() + FPS_WINDOW_MS;
    while (Date.now() < fEnd) {
      const s = await page.evaluate(() => window.__CPM_FPS708 || null);
      if (s != null) res.fpsSamples.push(s);
      await sleep(500);
    }
    res.fpsAvg = res.fpsSamples.length ? res.fpsSamples.reduce((a, b2) => a + b2, 0) / res.fpsSamples.length : null;
    const panchina2 = await page.evaluate(() => (window.__CPM_PANCHINA904 ? window.__CPM_PANCHINA904() : null));
    res.tri = panchina2 ? panchina2.tri : null;
    if (panchina2) res.panchina = panchina2; // rilettura finale (piu' fresca) dopo la finestra fps

    // d) foto — dugout casa (gia' inquadrato)
    await shotCdp(cdp, () => lastFrame, path.join(OUT, `${arm.name}-dugout-home.png`));
    await page.evaluate(() => { if (window.__CPM_CAM_DUGOUT904) window.__CPM_CAM_DUGOUT904('away'); });
    await sleep(900);
    await shotCdp(cdp, () => lastFrame, path.join(OUT, `${arm.name}-dugout-away.png`));

    // d2) esultanza — gol forzato (stessa via di celebration-test.mjs), camera sul dugout marcatore (home).
    // Non ogni situation con reward "goal" produce una celebrazione al primo giro (misurato: celebration-test.mjs
    // ne prova fino a 8 prima di arrendersi) — stesso ventaglio qui, fermandosi al primo __CPM_CELEB visto.
    const GIS = await page.evaluate(() => {
      const S = window.__CPM_SITS || []; const out = [];
      for (let i = 0; i < S.length && out.length < 8; i++) { const s = S[i]; if (s && s.actions && s.actions[0] && s.actions[0].rew === 'goal' && !s.def) out.push(i); }
      return out;
    });
    let celebPhoto = 'non fotografata: nessuna situation gi con reward "goal" trovata';
    if (GIS.length) {
      await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(false); });
      await page.evaluate(() => { if (window.__CPM_CAM_DUGOUT904) window.__CPM_CAM_DUGOUT904('home'); });
      let celebSeen = false, triedN = 0;
      for (const gi of GIS) {
        triedN++;
        await page.evaluate(g => { window.__CPM_CELEB = null; window.__CPM_FORCE_SIT(g, true); }, gi);
        await sleep(600);
        await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (_e) {} });
        for (let i = 0; i < 10 && !celebSeen; i++) { await sleep(400); celebSeen = await page.evaluate(() => !!window.__CPM_CELEB); }
        if (celebSeen) break;
      }
      await sleep(celebSeen ? 1200 : 2000);
      const r = await shotCdp(cdp, () => lastFrame, path.join(OUT, `${arm.name}-esultanza.png`), { waitFirst: 1500, waitNext: 700, maxTries: 5 });
      celebPhoto = r.ok ? `${arm.name}-esultanza.png${celebSeen ? ` (gi tentati: ${triedN}/${GIS.length})` : ` (__CPM_CELEB mai visto su ${triedN} gi tentati — foto scattata comunque, dichiarata non verificata come esultanza vera)`}` : 'non fotografata: nessun fotogramma dallo screencast';
    }
    res.photos = {
      dugoutHome: `${arm.name}-dugout-home.png`,
      dugoutAway: `${arm.name}-dugout-away.png`,
      esultanza: celebPhoto,
    };
    await page.evaluate(() => { if (window.__CPM_CAM_RESET904) window.__CPM_CAM_RESET904(); });
  } finally {
    res.errs = errs;
    try { await cdp?.send('Page.stopScreencast'); } catch (_e) {}
    await ctx.close().catch(() => {});
    await b.close().catch(() => {});
    await new Promise(r => srv.close(r));
  }
  return res;
}

async function main() {
  console.log('braccio ROSSO (__CPM_NO904=true — figure procedurali)…');
  const rosso = await misuraBraccio({ name: 'rosso', rosso: true });
  console.log('braccio VERDE (CH38 alleggerito)…');
  const verde = await misuraBraccio({ name: 'verde', rosso: false });

  const line = (label, r) => {
    const p = r.panchina || {};
    const appoggio = p.appoggio || [];
    const piedi = appoggio.map(a => a.piedi).filter(v => v != null);
    const bacino = appoggio.filter(a => a.bacino != null).map(a => a.bacino);
    const minmax = arr => arr.length ? `${fmt(Math.min(...arr), 3)}–${fmt(Math.max(...arr), 3)}` : '—';
    console.log(`\n[${label}]`);
    console.log(`  glb pronto (__CPM_GLB_READY): ${r.glbReady}`);
    console.log(`  panchina: glb=${p.glb ?? '—'}/${p.tot ?? '—'}  seduti=${p.seduti ?? '—'}  coach=${p.coach ?? '—'}`);
    console.log(`  triangoli scena: ${r.tri ?? '—'}`);
    console.log(`  fps medi (8s, ${r.fpsSamples.length} campioni): ${fmt(r.fpsAvg)}`);
    console.log(`  appoggio piedi min–max (su ${piedi.length}/16): ${minmax(piedi)}  [budget 0,15u]`);
    console.log(`  appoggio bacino min–max (su ${bacino.length} seduti): ${minmax(bacino)}  [budget 0,25u]`);
    console.log(`  foto: ${JSON.stringify(r.photos)}`);
    console.log(`  pageerror: ${r.errs.length}${r.errs.length ? '\n    ' + r.errs.slice(0, 5).join('\n    ') : ''}`);
  };
  line('ROSSO — __CPM_NO904=true', rosso);
  line('VERDE — CH38 alleggerito', verde);

  console.log(`\nFoto salvate in: ${OUT}`);
  console.log('NON VERIFICATO: Chromium software (SwiftShader) non e\' l\'Android del PO — fps/triangoli sono indicativi.');

  const bad = rosso.errs.length + verde.errs.length;
  process.exit(bad ? 1 : 0);
}

main().catch(e => { console.error('FATALE:', e && e.stack || e); process.exit(2); });
