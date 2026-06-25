/* ============================================================================
   CPM VALIDATION — INFRASTRUTTURA CONDIVISA (riuso, zero duplicazione)
   Server statico + browser WebGL + flusso→match + hook force/freeze + dHash.
   Usata dall'orchestratore validate-situations.mjs e dai check modulari.
   ============================================================================ */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..', '..', '..');           // repo root (tests/visual/lib → repo)
export const sleep = ms => new Promise(r => setTimeout(r, ms));

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png' };

export function startServer(root = ROOT) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/') p = '/CARRIER-MANAGER-AV.html';
      const fp = path.join(root, p);
      if (!fp.startsWith(root)) { res.writeHead(403); return res.end(); }
      fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(d); });
    });
    srv.listen(0, () => resolve(srv));
  });
}

export async function launchBrowser() {
  return chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
}

async function clickByText(page, src, timeout = 9000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const h = await page.evaluateHandle(s => { const rx = new RegExp(s, 'i'); return [...document.querySelectorAll('button')].find(b => rx.test((b.textContent || '').trim())) || null; }, src);
    const el = h.asElement(); if (el) { await el.click(); return true; } await sleep(200);
  }
  return false;
}

/* Apre il gioco con ?cpmtest=1, raggiunge un match (provino), carica tutte le SITUATIONS.
   Ritorna { total, consoleErrors } e lascia la pagina pronta per forceSituation(). */
export async function openMatch(page, port) {
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  if (!await clickByText(page, 'Nuova carriera')) throw new Error('flusso: "Nuova carriera" non trovato');
  await sleep(700);
  await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Validator'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
  if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('flusso: "INIZIA I PROVINI" non trovato');
  await sleep(400);
  if (!await clickByText(page, 'Inizia il provino')) throw new Error('flusso: "Inizia il provino" non trovato');
  await page.waitForFunction(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_STATE === 'function' && typeof window.__CPM_PROBE === 'function', { timeout: 20000 });
  const total = await page.evaluate(() => window.__CPM_LOAD_ALL());
  await sleep(500);
  return { total };
}

/* Forza la situation gi, lascia assestare la camera, opzionalmente congela il frame (dt=0).
   Ritorna lo stato completo (__CPM_STATE) dopo l'assestamento. */
export async function forceSituation(page, gi, { settle = 650, freeze = false } = {}) {
  await page.evaluate(i => window.__CPM_FORCE_SIT(i), gi);
  await sleep(settle);
  if (freeze) { await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(120); }
  const state = await page.evaluate(() => window.__CPM_STATE());
  return state;
}

export async function unfreeze(page) { await page.evaluate(() => { window.__CPM_FROZEN = false; }); }

/* Screenshot del SOLO canvas 3D (ignora la sidebar testuale che cambia per situation). */
export async function canvasShot(page) {
  const box = await page.evaluate(() => { const c = document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.width, 900 - Math.max(0, r.x)), height: Math.min(r.height, 900 - Math.max(0, r.y)) }; });
  return page.screenshot(box && box.width > 10 ? { clip: box } : {});
}

/* dHash percettivo 64-bit (16 hex) — robusto al jitter sub-pixel. */
export function dHash(buf) {
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
export function hamming(a, b) { if (!a || !b || a.length !== b.length) return 64; let d = 0; for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { d += x & 1; x >>= 1; } } return d; }

/* FIRMA DI STATO DETERMINISTICA — il "risultato/hash finale" per seed fissa.
   Usa i target LOGICI (heroTarget, deterministici con __CPM_RESEED) + possessore + camera + conteggi.
   NON include la posa mesh (lerp) né i compagni in drift (validati dai check tolleranti). */
export function stateSig(s) {
  if (!s || !s.ok) return null;
  const ht = s.heroTarget || {}, cn = s.counts || {};
  // solo campi PIENAMENTE deterministici (reseed): target logico eroe + camera + conteggi.
  // NB: il possessore (geometria sul nearest player in drift) NON è deterministico → escluso dalla firma,
  // la sua correttezza è verificata dal check initial-state (palla agganciata all'eroe).
  return { htx: ht.x ?? null, hty: ht.y ?? null, cam: !!(s.camera && s.camera.abovePitch), ch: cn.home ?? null, ca: cn.away ?? null };
}
export const sigStr = sig => (sig ? JSON.stringify(sig) : 'null');
export const sigEq = (a, b) => sigStr(a) === sigStr(b);
