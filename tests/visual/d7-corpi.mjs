#!/usr/bin/env node
/* ============================================================================
   d7-corpi.mjs — D7 v2 grafica: CORPI CH38 ALLEGGERITI PER I 22 (+ portieri, arbitro)
   ----------------------------------------------------------------------------
   Direttiva PO: default leggero per i 22+GK+arbitro (rosso __CPM_NO907 = pieno,
   niente contatore/interruttore), interruttore TEMPORANEO «Corpi: leggeri/pieni»
   nel menu di pausa (localStorage 'cpm-corpi'), contatore fps a schermo.

   Chromium 412×915, GLB accesi. Misura:
     1) FOTO ravvicinate pieno / s0.5 (24.066 tri) / s0.3=lite (14.622 tri) sulla
        STESSA inquadratura (vicino all'eroe) — per la scelta del corpo leggero
     2) rosso (__CPM_NO907) vs verde: corpo in uso (triangoli in scena via
        window.__CPM_FPS907().tri — pieno atteso ~1,3M, leggero molto meno)
     3) contatore fps presente in verde con un numero, ASSENTE in rosso
     4) interruttore presente nel menu di pausa in verde, ASSENTE in rosso;
        in verde: dopo il tocco i triangoli cambiano entro 10s, gli avatar
        restano 23 (hero+21 incl. i 2 GK + arbitro — window.__CPM_VIS665().glb,
        gia' esistente), 0 pageerror
     5) foto della barra col contatore fps visibile

   NON VERIFICATO: Chromium software (SwiftShader) non e' l'Android del PO — fps
   e triangoli sono indicativi, non assoluti; nessuna verifica su device reale.

   Uso: node d7-corpi.mjs
   ============================================================================ */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const OUT = path.join(HERE, 'out', 'd7-corpi');
fs.mkdirSync(OUT, { recursive: true });
const W = 412, H = 915;
const READY_BUDGET_MS = 20000;
const SWAP_BUDGET_MS = 10000;

// G2X/G2Z (src/12-three-match-view.jsx r.86): coordinate gioco (0-100) → mondo three.js
const G2X = gx => (gx - 50) * 1.0;
const G2Z = gy => (gy - 50) * 0.68;

function fmt(n) { return n == null ? '—' : (typeof n === 'number' ? n.toLocaleString('it-IT') : n); }

async function shotCdp(cdp, getFrame, filePath, { waitFirst = 1500, waitNext = 700, maxTries = 6 } = {}) {
  let last = null;
  for (let i = 0; i < maxTries; i++) {
    await sleep(i === 0 ? waitFirst : waitNext);
    const buf = getFrame();
    if (!buf) continue;
    if (last && buf.equals(last) && i < maxTries - 1) continue;
    last = buf;
    fs.writeFileSync(filePath, buf);
    return { ok: true, tries: i + 1, bytes: buf.length };
  }
  if (last) fs.writeFileSync(filePath, last);
  return { ok: !!last, tries: maxTries };
}

/* -------------------------------------------------------------------------
   PARTE 1 — foto ravvicinate: stessa inquadratura, tre corpi diversi.
   ------------------------------------------------------------------------- */
async function fotoCorpo(label, glbUrl) {
  const srv = await startServer();
  const port = srv.address().port;
  const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.addInitScript((url) => { window.__CPM_GLB = true; if (url) window.__CPM_GLB_URL = url; }, glbUrl);

  let cdp = null, lastFrame = null;
  const res = { label, glbUrl, errs: [], photo: null };
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
    await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
    cdp = await ctx.newCDPSession(page);
    cdp.on('Page.screencastFrame', e => { lastFrame = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'png', maxWidth: W, maxHeight: H, everyNthFrame: 1 });

    try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: READY_BUDGET_MS }); } catch (_e) {}
    await sleep(600);
    // inquadratura ravvicinata sull'eroe (stessa per i tre corpi): camera generica di test già
    // esistente (window.__CPM_CAM904, sovrascrive la regia — vedi src/12 r.8365, non è un gancio nuovo).
    const hero = await page.evaluate(() => (window.__CPM_STATE ? window.__CPM_STATE().hero : null));
    if (hero) {
      const wx = G2X(hero.x), wz = G2Z(hero.y);
      await page.evaluate((c) => { window.__CPM_CAM904 = c; }, { x: wx + 1.7, y: 1.55, z: wz + 2.3, lx: wx, ly: 1.25, lz: wz });
    }
    await sleep(400);
    const r = await shotCdp(cdp, () => lastFrame, path.join(OUT, `corpo-${label}.png`), { waitFirst: 1600, waitNext: 700, maxTries: 6 });
    res.photo = r.ok ? `corpo-${label}.png` : 'NON SCATTATA (nessun fotogramma dallo screencast)';
    await page.evaluate(() => { if (window.__CPM_CAM_RESET904) window.__CPM_CAM_RESET904(); });
  } catch (e) {
    res.photo = 'ERRORE: ' + (e && e.message || e);
  } finally {
    res.errs = errs;
    try { await cdp?.send('Page.stopScreencast'); } catch (_e) {}
    await ctx.close().catch(() => {});
    await b.close().catch(() => {});
    await new Promise(r => srv.close(r));
  }
  return res;
}

/* -------------------------------------------------------------------------
   PARTE 2 — braccio rosso/verde: default, contatore, interruttore a caldo.
   ------------------------------------------------------------------------- */
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
    window.__CPM_GLB = true;
    try { localStorage.removeItem('cpm-corpi'); } catch (_e) {}
    if (o.rosso) window.__CPM_NO907 = true;
  }, { rosso: arm.rosso });

  let cdp = null, lastFrame = null;
  const res = {
    arm: arm.name, errs: [], glbReady: false,
    triInit: null, corpiInit: null, avatarsInit: null,
    fpsHookExists: null, fps5sInit: null,
    switchFound: false, switchClickable: false,
    triAfter: null, corpiAfter: null, avatarsAfter: null, triChanged: null, swapMs: null,
    photoBar: null,
  };

  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
    await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});

    cdp = await ctx.newCDPSession(page);
    cdp.on('Page.screencastFrame', e => { lastFrame = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'png', maxWidth: W, maxHeight: H, everyNthFrame: 1 });

    try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: READY_BUDGET_MS }); res.glbReady = true; } catch (_e) { res.glbReady = false; }
    await sleep(800);

    // corpo in uso + avatar count all'apertura
    const s0 = await page.evaluate(() => ({
      fps: (typeof window.__CPM_FPS907 === 'function') ? window.__CPM_FPS907() : null,
      vis: (typeof window.__CPM_VIS665 === 'function') ? window.__CPM_VIS665() : null,
    }));
    res.fpsHookExists = !!s0.fps;
    res.triInit = s0.fps ? s0.fps.tri : null;
    res.corpiInit = s0.fps ? s0.fps.corpi : null;
    res.avatarsInit = s0.vis ? s0.vis.glb : null;

    // contatore: aspetta fino a 6s che fps5s sia un numero (media mobile 5s, serve tempo per riempirsi)
    if (!arm.rosso) {
      const t0 = Date.now();
      let f5 = null;
      while (Date.now() - t0 < 6000) {
        const r = await page.evaluate(() => (typeof window.__CPM_FPS907 === 'function' ? window.__CPM_FPS907() : null));
        if (r && r.fps5s != null) { f5 = r.fps5s; break; }
        await sleep(500);
      }
      res.fps5sInit = f5;
    }

    // interruttore nel menu di pausa
    const pauseBtn = page.locator('button[title^="Pausa"]').first();
    if (await pauseBtn.count()) {
      await pauseBtn.click({ timeout: 3000 }).catch(() => {});
      await sleep(300);
      const corpoBtn = page.locator('button:has-text("Corpi:")').first();
      res.switchFound = (await corpoBtn.count()) > 0;
      if (res.switchFound && !arm.rosso) {
        res.switchClickable = true;
        const before = await page.evaluate(() => (typeof window.__CPM_FPS907 === 'function' ? window.__CPM_FPS907() : null));
        const t0 = Date.now();
        await corpoBtn.click({ timeout: 3000 }).catch(() => { res.switchClickable = false; });
        // sblocca la pausa per lasciare girare il motore mentre gli avatar si ricostruiscono
        const resumeBtn = page.locator('button[title^="Riprendi"]').first();
        if (await resumeBtn.count()) await resumeBtn.click({ timeout: 2000 }).catch(() => {});
        let after = before, changed = false;
        while (Date.now() - t0 < SWAP_BUDGET_MS) {
          await sleep(400);
          after = await page.evaluate(() => (typeof window.__CPM_FPS907 === 'function' ? window.__CPM_FPS907() : null));
          if (after && before && after.tri !== before.tri) { changed = true; break; }
        }
        res.swapMs = Date.now() - t0;
        res.triAfter = after ? after.tri : null;
        res.corpiAfter = after ? after.corpi : null;
        res.triChanged = changed;
        const visAfter = await page.evaluate(() => (typeof window.__CPM_VIS665 === 'function' ? window.__CPM_VIS665() : null));
        res.avatarsAfter = visAfter ? visAfter.glb : null;
      } else {
        // rosso: chiudi comunque la pausa
        const resumeBtn = page.locator('button[title^="Riprendi"]').first();
        if (await resumeBtn.count()) await resumeBtn.click({ timeout: 2000 }).catch(() => {});
      }
    }

    // foto della barra col contatore (solo verde: in rosso non c'e' nulla da fotografare li')
    if (!arm.rosso) {
      await sleep(1200);
      const r = await shotCdp(cdp, () => lastFrame, path.join(OUT, 'barra-fps.png'), { waitFirst: 1600, waitNext: 700, maxTries: 6 });
      res.photoBar = r.ok ? 'barra-fps.png' : 'NON SCATTATA';
    }
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
  // --- PARTE 1: foto per la scelta del corpo (pieno / s0.5 / lite=s0.3) ---
  const S05_SRC = path.join('/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad/d7', 'footballer-s0.5-e0.01.glb');
  const S05_TMP = path.join(ROOT, 'assets', '_d7tmp-s05.glb'); // copia TEMPORANEA solo per la sonda, rimossa a fine giro
  fs.copyFileSync(S05_SRC, S05_TMP);
  let foto;
  try {
    console.log('foto ravvicinate: pieno / s0.5 (24.066 tri) / lite=s0.3 (14.622 tri)…');
    const fPieno = await fotoCorpo('pieno', './assets/footballer.glb');
    const fS05 = await fotoCorpo('s05-24066tri', './assets/_d7tmp-s05.glb');
    const fLite = await fotoCorpo('lite-s03-14622tri', './assets/footballer-lite.glb');
    foto = [fPieno, fS05, fLite];
  } finally {
    try { fs.unlinkSync(S05_TMP); } catch (_e) {}
  }

  // --- PARTE 2: rosso/verde ---
  console.log('braccio ROSSO (__CPM_NO907=true — corpo pieno, niente contatore/interruttore)…');
  const rosso = await misuraBraccio({ name: 'rosso', rosso: true });
  console.log('braccio VERDE (default leggero + contatore + interruttore)…');
  const verde = await misuraBraccio({ name: 'verde', rosso: false });

  console.log('\n=== FOTO RAVVICINATE (scelta del corpo) ===');
  foto.forEach(f => console.log(`  [${f.label}] ${f.glbUrl} → ${OUT}/${f.photo}  pageerror:${f.errs.length}`));

  const line = (label, r) => {
    console.log(`\n[${label}]`);
    console.log(`  glb pronto: ${r.glbReady}`);
    console.log(`  corpo iniziale: ${r.corpiInit ?? '—'}  triangoli: ${fmt(r.triInit)}  avatar (hero+21+arbitro): ${r.avatarsInit ?? '—'}`);
    console.log(`  contatore fps: gancio presente=${r.fpsHookExists}  fps5s dopo attesa=${r.fps5sInit ?? '—'}`);
    console.log(`  interruttore nel menu di pausa: trovato=${r.switchFound}  cliccabile=${r.switchClickable}`);
    if (r.switchClickable) {
      console.log(`  dopo il tocco (entro ${SWAP_BUDGET_MS}ms, misurato ${r.swapMs}ms): triangoli ${fmt(r.triInit)} → ${fmt(r.triAfter)}  cambiati=${r.triChanged}  corpo=${r.corpiAfter}`);
      console.log(`  avatar dopo lo scambio: ${r.avatarsAfter ?? '—'} (invariato rispetto a ${r.avatarsInit ?? '—'} = ${r.avatarsAfter === r.avatarsInit})`);
    }
    if (r.photoBar) console.log(`  foto barra+contatore: ${OUT}/${r.photoBar}`);
    console.log(`  pageerror: ${r.errs.length}${r.errs.length ? '\n    ' + r.errs.slice(0, 6).join('\n    ') : ''}`);
  };
  line('ROSSO — __CPM_NO907=true', rosso);
  line('VERDE — default leggero', verde);

  console.log(`\nFoto salvate in: ${OUT}`);
  console.log('NON VERIFICATO: Chromium software (SwiftShader) non e\' l\'Android del PO — fps/triangoli sono indicativi, nessuna verifica su device reale.');

  const bad = rosso.errs.length + verde.errs.length + foto.reduce((a, f) => a + f.errs.length, 0)
    + (rosso.fpsHookExists ? 1 : 0) // rosso NON deve avere il contatore
    + (rosso.switchFound ? 1 : 0)   // rosso NON deve avere l'interruttore
    + (!verde.fpsHookExists ? 1 : 0)
    + (!verde.switchFound ? 1 : 0);
  process.exit(bad ? 1 : 0);
}

main().catch(e => { console.error('FATALE:', e && e.stack || e); process.exit(2); });
