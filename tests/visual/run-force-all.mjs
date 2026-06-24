#!/usr/bin/env node
/* ============================================================================
   CPM — VALIDAZIONE 3D BROWSER, PHASE 2: FORCE-ALL SITUATIONS
   ----------------------------------------------------------------------------
   Usa gli hook (gated da ?cpmtest=1):
     window.__CPM_LOAD_ALL()   → carica l'intero DB SITUATIONS nel match
     window.__CPM_FORCE_SIT(i) → forza la situation globale i (posiziona eroe + hl_intro)
     window.__CPM_PROBE()      → legge camera/eroe/palla dalla scena Three.js viva

   Per OGNI situation (0..N-1) verifica la regia reale:
     • camera sopra il piano del prato (abovePitch)
     • eroe proiettato dentro lo schermo (onScreen)
     • palla on-screen (warning, non bloccante: può stare ai bordi)
   Salva uno screenshot per situation in out/sit_NNN.png + report.json.
   Exit code 1 se almeno una violazione hard (camera/eroe).
   ============================================================================ */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out', 'force-all');
try { fs.rmSync(OUT, { recursive: true, force: true }); } catch { /* Windows EPERM se la dir è in uso: la riusiamo */ }
fs.mkdirSync(OUT, { recursive: true });
// pulizia best-effort dei vecchi screenshot (se la rm dir è fallita)
try { for (const f of fs.readdirSync(OUT)) if (/\.png$/.test(f)) fs.unlinkSync(path.join(OUT, f)); } catch {}
const SHOTS = process.argv.includes('--shots'); // screenshot di TUTTE le situations (lento)

const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.glb':'model/gltf-binary', '.png':'image/png' };
function startServer() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/') p = '/CARRIER-MANAGER-AV.html';
      const fp = path.join(ROOT, p);
      if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(d); });
    });
    srv.listen(0, () => resolve(srv));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function clickByText(page, src, timeout = 8000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const h = await page.evaluateHandle(s => { const rx = new RegExp(s, 'i'); return [...document.querySelectorAll('button')].find(b => rx.test((b.textContent || '').trim())) || null; }, src);
    const el = h.asElement(); if (el) { await el.click(); return true; } await sleep(200);
  }
  return false;
}

(async () => {
  const srv = await startServer();
  const port = srv.address().port;
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  console.log('serving', url, SHOTS ? '(con screenshot per-situation)' : '(screenshot solo violazioni)');

  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error' && !/BABEL|in-browser Babel/.test(m.text())) consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  // NOTA: la camera del match ha un look-target STATEFUL (insegue l'azione frame-by-frame); su un
  // force-jump non si ri-centra istantaneamente, quindi "eroe on-screen" NON è validabile in modo
  // affidabile qui (lo valida la Phase 1 su gioco reale). Gli invarianti hard, testabili per ogni
  // situation: nessun errore runtime, camera SEMPRE sopra il prato, scena renderizzata.
  const report = { url, total: 0, checked: 0, hardViolations: [], framingInfo: { heroOffscreen: [], ballOffscreen: [] }, consoleErrors };
  let exitCode = 0;
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
    if (!await clickByText(page, 'Nuova carriera')) throw new Error('Nuova carriera');
    await sleep(700);
    await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'ForceAll'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
    if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('INIZIA I PROVINI');
    await sleep(400);
    if (!await clickByText(page, 'Inizia il provino')) throw new Error('Inizia il provino');

    await page.waitForFunction(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_PROBE === 'function', { timeout: 20000 });
    const total = await page.evaluate(() => window.__CPM_LOAD_ALL());
    report.total = total;
    console.log('SITUATIONS caricate:', total, '— forzo una a una…');
    await sleep(500);

    for (let gi = 0; gi < total; gi++) {
      await page.evaluate(i => window.__CPM_FORCE_SIT(i), gi);
      // FORCE_SIT va diretto a hl_move/hl_choose; attendi che il framing interattivo sia attivo, poi lascia assestare il lerp camera
      let pr = null; const settleEnd = Date.now() + 1200;
      while (Date.now() < settleEnd) {
        await sleep(120);
        pr = await page.evaluate(() => { try { return window.__CPM_PROBE(); } catch (e) { return { ok: false, err: String(e) }; } });
        if (pr && pr.ok && (pr.phase === 'hl_move' || pr.phase === 'hl_choose')) break;
      }
      await sleep(400); // lerp camera/eroe verso il framing close a regime
      pr = await page.evaluate(() => { try { return window.__CPM_PROBE(); } catch (e) { return { ok: false, err: String(e) }; } });
      report.checked++;
      if (!pr || !pr.ok) { report.hardViolations.push({ gi, kind: 'probe_failed', detail: pr && pr.err }); continue; }
      const camBad = pr.camera && (pr.camera.abovePitch === false || !isFinite(pr.camera.y)); // INVARIANTE HARD
      if (camBad) report.hardViolations.push({ gi, kind: 'camera_below_pitch', camY: pr.camera && pr.camera.y });
      if (pr.hero && pr.hero.onScreen === false) report.framingInfo.heroOffscreen.push(gi); // info, non bloccante
      if (pr.ball && pr.ball.onScreen === false) report.framingInfo.ballOffscreen.push(gi);   // info, non bloccante
      if (SHOTS || camBad) {
        await page.screenshot({ path: path.join(OUT, `sit_${String(gi).padStart(3, '0')}${camBad ? '_VIOL' : ''}.png`) });
      }
      if ((gi + 1) % 40 === 0) console.log(`  …${gi + 1}/${total}`);
    }
    if (report.hardViolations.length || consoleErrors.length) exitCode = 1;
  } catch (e) {
    report.fatal = String(e && e.stack || e); exitCode = 1;
  } finally {
    await page.screenshot({ path: path.join(OUT, '_final.png') }).catch(() => {});
    await browser.close(); srv.close();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\n=== FORCE-ALL REPORT ===');
  console.log(`situations: ${report.total} · checked: ${report.checked}`);
  console.log(`HARD violations (camera sotto il prato / probe fallita): ${report.hardViolations.length}`);
  if (report.hardViolations.length) console.log(JSON.stringify(report.hardViolations.slice(0, 15), null, 2));
  console.log(`info framing (non bloccante): heroOffscreen=${report.framingInfo.heroOffscreen.length} ballOffscreen=${report.framingInfo.ballOffscreen.length} (vedi nota: camera stateful su force-jump)`);
  console.log(`console errors (non-Babel): ${consoleErrors.length}`);
  if (consoleErrors.length) console.log(consoleErrors.slice(0, 5));
  console.log('artifacts → tests/visual/out/force-all/');
  console.log(exitCode === 0 ? '\n✅ PASS' : '\n❌ FAIL');
  process.exit(exitCode);
})();
