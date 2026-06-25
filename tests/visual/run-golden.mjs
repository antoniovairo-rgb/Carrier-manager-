#!/usr/bin/env node
/* ============================================================================
   CPM — VALIDAZIONE 3D BROWSER, PHASE 2b: GOLDEN VISUAL REGRESSION
   ----------------------------------------------------------------------------
   Determinismo (hook gated ?cpmtest=1, lato gioco):
     • Math.random seedato (mulberry32) da inizio script → crowd/roster riproducibili
     • window.__CPM_FROZEN=true → render loop usa dt=0 → frame statico deterministico

   Per ogni situation (0..N-1): __CPM_FORCE_SIT(i) → settle camera → freeze → screenshot
   del SOLO canvas 3D → perceptual hash (dHash 64-bit). Confronto con baseline
   (golden-hashes.json) via distanza di Hamming.
     • baseline assente → genera e committa golden-hashes.json
     • baseline presente → FAIL se una qualunque situation supera la soglia bit

   dHash sul crop del canvas (non la pagina): ignora il testo sidebar che cambia per
   situation, isola la regressione del RENDERING 3D (stadio/camera/giocatori/palla).

   Uso:  node run-golden.mjs            (confronta; genera baseline se assente)
         node run-golden.mjs --update   (rigenera la baseline)
         node run-golden.mjs --selftest (gira 2 volte, misura il jitter run-to-run)
   ============================================================================ */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const BASELINE = path.join(__dirname, 'golden-hashes.json');
const OUT = path.join(__dirname, 'out', 'golden');
fs.mkdirSync(OUT, { recursive: true });
const UPDATE = process.argv.includes('--update');
const SELFTEST = process.argv.includes('--selftest');
const FAIL_BITS = 12; // soglia: >12 bit di differenza (su 64) = regressione (jitter osservato << 12)

const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.glb':'model/gltf-binary', '.png':'image/png' };
function startServer() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => { let p = decodeURIComponent((q.url || '/').split('?')[0]); if (p === '/') p = '/CARRIER-MANAGER-AV.html'; const fp = path.join(ROOT, p); if (!fp.startsWith(ROOT)) { r.writeHead(403); return r.end(); } fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); r.end(d); }); });
    srv.listen(0, () => res(srv));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function clickByText(page, src, t = 8000) { const end = Date.now() + t; while (Date.now() < end) { const h = await page.evaluateHandle(s => { const rx = new RegExp(s, 'i'); return [...document.querySelectorAll('button')].find(b => rx.test((b.textContent || '').trim())) || null; }, src); const el = h.asElement(); if (el) { await el.click(); return true; } await sleep(200); } return false; }

// dHash 64-bit (16 hex) sul crop PNG
function dHash(buf) {
  const png = PNG.sync.read(buf); const { width: W, height: H, data } = png; const w = 9, h = 8;
  const gray = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const x0 = Math.floor(x * W / w), x1 = Math.max(x0 + 1, Math.floor((x + 1) * W / w));
    const y0 = Math.floor(y * H / h), y1 = Math.max(y0 + 1, Math.floor((y + 1) * H / h));
    let s = 0, n = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * W + xx) * 4; s += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; n++; }
    gray[y * w + x] = s / n;
  }
  let bits = '';
  for (let y = 0; y < h; y++) for (let x = 0; x < w - 1; x++) bits += (gray[y * w + x] < gray[y * w + x + 1]) ? '1' : '0';
  let hex = ''; for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}
function hamming(a, b) { if (!a || !b || a.length !== b.length) return 64; let d = 0; for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { d += x & 1; x >>= 1; } } return d; }

async function captureAllHashes(label) {
  const srv = await startServer(); const port = srv.address().port;
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const hashes = {};
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
    await clickByText(page, 'Nuova carriera'); await sleep(700);
    await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Golden'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
    await clickByText(page, 'INIZIA I PROVINI'); await sleep(400);
    await clickByText(page, 'Inizia il provino');
    await page.waitForFunction(() => typeof window.__CPM_FORCE_SIT === 'function', { timeout: 20000 });
    const total = await page.evaluate(() => window.__CPM_LOAD_ALL());
    await sleep(500);
    for (let gi = 0; gi < total; gi++) {
      await page.evaluate(i => window.__CPM_FORCE_SIT(i), gi);
      await sleep(650); // settle camera/eroe
      await page.evaluate(() => { window.__CPM_FROZEN = true; }); // congela il frame
      await sleep(120);
      const box = await page.evaluate(() => { const c = document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.width, 900 - r.x), height: Math.min(r.height, 900 - r.y) }; });
      const buf = await page.screenshot(box && box.width > 10 ? { clip: box } : {});
      hashes[gi] = dHash(buf);
      await page.evaluate(() => { window.__CPM_FROZEN = false; });
      if ((gi + 1) % 40 === 0) console.log(`  [${label}] …${gi + 1}/${total}`);
    }
  } finally { await browser.close(); srv.close(); }
  return hashes;
}

(async () => {
  if (SELFTEST) {
    console.log('SELFTEST: due passate, misuro il jitter run-to-run…');
    const a = await captureAllHashes('run1'); const b = await captureAllHashes('run2');
    let max = 0, sum = 0, n = 0; const worst = [];
    for (const k of Object.keys(a)) { const d = hamming(a[k], b[k]); max = Math.max(max, d); sum += d; n++; if (d > 0) worst.push({ gi: +k, bits: d }); }
    worst.sort((x, y) => y.bits - x.bits);
    console.log(`situations: ${n} · jitter medio: ${(sum / n).toFixed(2)} bit · jitter MAX: ${max} bit`);
    console.log('peggiori:', JSON.stringify(worst.slice(0, 10)));
    console.log(max <= FAIL_BITS ? `\n✅ stabile (max ${max} ≤ soglia ${FAIL_BITS})` : `\n⚠️ jitter alto (${max} > ${FAIL_BITS}) — alzare la soglia o il settle`);
    process.exit(max <= FAIL_BITS ? 0 : 1);
  }

  const cur = await captureAllHashes('golden');
  if (UPDATE || !fs.existsSync(BASELINE)) {
    fs.writeFileSync(BASELINE, JSON.stringify(cur, null, 0));
    console.log(`\n📸 baseline ${UPDATE ? 'aggiornata' : 'creata'}: ${Object.keys(cur).length} hash → ${path.basename(BASELINE)}`);
    console.log('Esegui di nuovo senza --update per validare (o committa la baseline).');
    process.exit(0);
  }
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const regressions = [];
  for (const k of Object.keys(cur)) { const d = hamming(base[k], cur[k]); if (d > FAIL_BITS) regressions.push({ gi: +k, bits: d, base: base[k], cur: cur[k] }); }
  const missing = Object.keys(cur).length !== Object.keys(base).length;
  console.log('\n=== GOLDEN REPORT ===');
  console.log(`situations: ${Object.keys(cur).length} · baseline: ${Object.keys(base).length} · soglia: ${FAIL_BITS} bit`);
  console.log(`regressioni (> soglia): ${regressions.length}`);
  if (regressions.length) console.log(JSON.stringify(regressions.slice(0, 20), null, 2));
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ regressions, total: Object.keys(cur).length }, null, 2));
  const ok = regressions.length === 0 && !missing;
  console.log(ok ? '\n✅ PASS (nessuna regressione visiva)' : '\n❌ FAIL');
  process.exit(ok ? 0 : 1);
})();
