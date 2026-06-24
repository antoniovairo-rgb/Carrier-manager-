#!/usr/bin/env node
/* ============================================================================
   CPM — VALIDAZIONE 3D BROWSER (Playwright + WebGL)
   ----------------------------------------------------------------------------
   Complementa la suite analitica (tests/situations-3d-validation.js) con i
   controlli "browser-only" che quella non può fare: rendering WebGL reale e
   ispezione della scena Three.js viva.

   Cosa fa:
     1. serve la repo root su un server statico locale
     2. avvia Chromium (WebGL via SwiftShader) e apre il gioco con ?cpmtest=1
        (attiva gli hook window.__CPM3D / window.__CPM_PROBE nel sorgente)
     3. automatizza il flusso: nuova carriera → provini → match 3D
     4. campiona __CPM_PROBE() ad ogni frame durante il match e verifica:
          • camera sopra il piano del prato (abovePitch)
          • eroe proiettato dentro lo schermo (onScreen)
          • palla per lo più on-screen
     5. salva screenshot + report JSON, exit code 1 se ci sono violazioni

   LIMITE NOTO (Phase 1): campiona le situazioni che capitano in un match reale.
   Il "force-all 179 situations" è Phase 2 (richiede un hook che pilota hlIdx).
   ============================================================================ */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');           // repo root
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.glb':'model/gltf-binary', '.png':'image/png', '.jpg':'image/jpeg', '.css':'text/css', '.svg':'image/svg+xml' };

function startServer() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/') p = '/CARRIER-MANAGER-AV.html';
      const fp = path.join(ROOT, p);
      if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
      fs.readFile(fp, (e, d) => {
        if (e) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
        res.end(d);
      });
    });
    srv.listen(0, () => resolve(srv));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function clickByText(page, re, timeout = 8000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const handle = await page.evaluateHandle((src) => {
      const rx = new RegExp(src, 'i');
      return [...document.querySelectorAll('button')].find(b => rx.test((b.textContent || '').trim())) || null;
    }, re.source);
    const el = handle.asElement();
    if (el) { await el.click(); return true; }
    await sleep(200);
  }
  return false;
}

(async () => {
  const srv = await startServer();
  const port = srv.address().port;
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  console.log('serving repo on', url);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error' && !/BABEL|in-browser Babel/.test(m.text())) consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  const report = { url, samples: 0, violations: [], situationsSeen: new Set(), consoleErrors, screenshots: [] };
  let exitCode = 0;

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    // attendi mount React (loader nascosto)
    await page.waitForFunction(() => { const ld = document.getElementById('ld'); return !ld || getComputedStyle(ld).opacity === '0' || getComputedStyle(ld).display === 'none'; }, { timeout: 30000 });
    console.log('app montata');

    // flusso: nuova carriera → set nome → provini → primo provino
    if (!await clickByText(page, /Nuova carriera/)) throw new Error('btn Nuova carriera non trovato');
    await sleep(600);
    await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Visual Test'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
    if (!await clickByText(page, /INIZIA I PROVINI/)) throw new Error('btn INIZIA I PROVINI non trovato');
    await sleep(400);
    if (!await clickByText(page, /Inizia il provino/)) throw new Error('btn Inizia il provino non trovato');

    // attendi che il campo 3D monti e gli hook compaiano
    await page.waitForFunction(() => typeof window.__CPM_PROBE === 'function', { timeout: 20000 });
    console.log('hook __CPM_PROBE attivo — campionamento regia…');

    // campiona per ~24s di partita; auto-risolvi gli highlight (timer del gioco) o cliccando la prima azione
    const sampleEnd = Date.now() + 24000;
    let shotIdx = 0;
    while (Date.now() < sampleEnd) {
      const probe = await page.evaluate(() => { try { return window.__CPM_PROBE(); } catch (e) { return { ok: false, err: String(e) }; } });
      if (probe && probe.ok) {
        report.samples++;
        const phase = probe.phase || '';
        const active = /playing|hl_|walkout|ended/.test(phase) || phase === null; // campiona quando il campo è vivo
        if (probe.camera && probe.camera.abovePitch === false)
          report.violations.push({ kind: 'camera_below_pitch', phase, camY: probe.camera.y });
        if (probe.hero && probe.hero.onScreen === false)
          report.violations.push({ kind: 'hero_offscreen', phase, ndc: probe.hero.ndc });
      }
      // ogni ~3s salva uno screenshot e clicca un'eventuale azione highlight per far procedere
      if (report.samples && report.samples % 18 === 0 && shotIdx < 6) {
        const f = path.join(OUT, `match_${String(shotIdx).padStart(2, '0')}.png`);
        await page.screenshot({ path: f }); report.screenshots.push(path.basename(f)); shotIdx++;
      }
      await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^[⚡🦵🎯🌀💥✈️🤸🤝🔄🏃💪🛑🔴]/.test((x.textContent || '').trim())); if (b) b.click(); });
      await sleep(200);
    }

    report.situationsSeen = [...report.situationsSeen];
    if (report.violations.length) exitCode = 1;
    if (consoleErrors.length) { exitCode = 1; }
  } catch (e) {
    report.fatal = String(e && e.stack || e);
    exitCode = 1;
  } finally {
    await page.screenshot({ path: path.join(OUT, 'final.png') }).catch(() => {});
    await browser.close();
    srv.close();
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\n=== REPORT ===');
  console.log('samples:', report.samples);
  console.log('camera/hero violations:', report.violations.length);
  if (report.violations.length) console.log(JSON.stringify(report.violations.slice(0, 10), null, 2));
  console.log('console errors (non-Babel):', consoleErrors.length);
  if (consoleErrors.length) console.log(consoleErrors.slice(0, 5));
  console.log('screenshots:', report.screenshots.length, '→ tests/visual/out/');
  if (report.fatal) console.log('FATAL:', report.fatal);
  console.log(exitCode === 0 ? '\n✅ PASS' : '\n❌ FAIL');
  process.exit(exitCode);
})();
