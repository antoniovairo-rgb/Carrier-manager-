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
  const _opts = { headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] };
  if (process.env.CPM_CHROME) _opts.executablePath = process.env.CPM_CHROME;
  return chromium.launch(_opts);
}

/* Route-interception: serve le UMD CDN (React/Three/Babel/Phaser) da node_modules locali.
   Necessario negli ambienti dove la policy di rete blocca i CDN (es. Claude Code web): l'HTML
   spedito resta invariato (usa i CDN). No-op se le lib locali non sono presenti. */
const _NM = path.join(__dirname, '..', 'node_modules');
const _CDN_MAP = [
  [/react-dom\.production\.min\.js/, path.join(_NM, 'react-dom/umd/react-dom.production.min.js')],
  [/react\.production\.min\.js/,     path.join(_NM, 'react/umd/react.production.min.js')],
  [/three\.min\.js/,                 path.join(_NM, 'three/build/three.min.js')],
  [/GLTFLoader\.js/,                 path.join(_NM, 'three/examples/js/loaders/GLTFLoader.js')],
  [/SkeletonUtils\.js/,              path.join(_NM, 'three/examples/js/utils/SkeletonUtils.js')],
  [/babel(\.min)?\.js/,              path.join(_NM, '@babel/standalone/babel.min.js')],
  [/phaser(\.min)?\.js/,             path.join(_NM, 'phaser/dist/phaser.min.js')],
];
export async function installCdnRoutes(page) {
  await page.route(/^https?:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//, route => {
    const url = route.request().url();
    const hit = _CDN_MAP.find(([rx]) => rx.test(url));
    if (hit && fs.existsSync(hit[1])) {
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(hit[1]) });
    }
    return route.continue();
  });
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
export async function forceSituation(page, gi, { settle = 650, freeze = false, choose = false } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, choose]);
  await sleep(settle);
  if (freeze) { await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(120); }
  const state = await page.evaluate(() => window.__CPM_STATE());
  return state;
}

export async function freeze(page) { await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(120); }
export async function unfreeze(page) { await page.evaluate(() => { window.__CPM_FROZEN = false; }); }

/* Campiona la traiettoria del POST-HIGHLIGHT: forza gi (choose), risolve l'azione k e
   poll camera/palla/giocatori a intervalli per la finestra data. Ritorna { gi, durMs, frames }.
   Usato dai check Fase 3 (durata dinamica, fluidità camera, coerenza animazioni, movimento tattico). */
export async function samplePostHighlight(page, gi, { settle = 600, k = 0, pollMs = 110, windowMs = 1100 } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(kk => window.__CPM_RESOLVE(kk), k);
  const frames = []; const end = Date.now() + windowMs; let durMs = null;
  while (Date.now() < end) {
    const d = await page.evaluate(() => ({
      dur: window.__CPM_RESULT_DUR || null,
      probe: typeof window.__CPM_PROBE === 'function' ? window.__CPM_PROBE() : null,
      st: typeof window.__CPM_STATE === 'function' ? window.__CPM_STATE() : null,
    }));
    if (d.dur) durMs = d.dur;
    if (d.probe && d.probe.ok) frames.push({
      cam: d.probe.camera,
      ball: d.probe.ball ? d.probe.ball.world : null,
      players: (d.st && d.st.players) ? d.st.players.map(p => ({ x: p.x, y: p.y })) : null,
      phase: d.st ? d.st.phase : null,
    });
    await sleep(pollMs);
  }
  return { gi, durMs, frames };
}

/* MOTION sampler (B2): forza gi al framing interattivo (choose), SBLOCCA il render (dt>0) e campiona le
   posizioni MESH reali (__CPM_STATE().players, derivate da mesh.position) durante la fase ATTIVA off-ball,
   SENZA risolvere l'azione. Ritorna metriche di vivacità: quanti giocatori si muovono davvero + salto max.
   Usato dal check `motion` (No Dead Players / liveness off-ball). */
export async function sampleMotion(page, gi, { settle = 500, pollMs = 100, windowMs = 1000 } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); // off-ball AI gira solo con dt>0
  const frames = []; const end = Date.now() + windowMs;
  while (Date.now() < end) {
    const st = await page.evaluate(() => (typeof window.__CPM_STATE === 'function' ? window.__CPM_STATE() : null));
    const players = ((st && st.players) || []).map(p => ({ x: p.x, y: p.y, team: p.team, gk: p.gk }));
    const ball = (st && st.ball) ? { x: st.ball.x, y: st.ball.y } : null;
    frames.push({ players, ball });
    await sleep(pollMs);
  }
  const n = frames.length ? frames[0].players.length : 0;
  const disp = new Array(n).fill(0); let maxD = 0;
  for (let f = 1; f < frames.length; f++) for (let p = 0; p < n; p++) {
    const a = frames[f - 1].players[p], c = frames[f].players[p]; if (!a || !c) continue;
    const d = Math.hypot(c.x - a.x, c.y - a.y); disp[p] += d; if (d > maxD) maxD = d;
  }
  // soglia "alive" ricalibrata 1.0→0.7u dopo il rallentamento dei movimenti (5.47.9): col gioco più lento un giocatore che si
  // sposta >0.7u nella finestra è chiaramente VIVO (morto = ~0); evita falsi "dead players" sulle situation quasi-statiche in software-GL.
  let alive = 0; for (let p = 0; p < n; p++) if (disp[p] > 0.7) alive++;
  // REACTIVITY (#24, Every Player Reacts): il portatore è home → gli away PRESSANO. Distanza minima
  // away(non-gk)→palla sull'intera finestra + n. difensori entro 15u (impegno sul portatore).
  let defMinEver = 99, defNear = 0, bxSum = 0, bxN = 0;
  for (const fr of frames) {
    if (!fr.ball) continue;
    bxSum += fr.ball.x; bxN++;
    let near = 0;
    for (const p of fr.players) { if (p.team !== 'away' || p.gk) continue; const d = Math.hypot(p.x - fr.ball.x, p.y - fr.ball.y); if (d < defMinEver) defMinEver = d; if (d < 15) near++; }
    if (near > defNear) defNear = near;
  }
  return { gi, players: n, alive, maxFrameDelta: +maxD.toFixed(1), avgDisp: +(disp.reduce((a, b) => a + b, 0) / (n || 1)).toFixed(1), defMinEver: +defMinEver.toFixed(1), defNear, ballX: bxN ? +(bxSum / bxN).toFixed(1) : null };
}

/* BALL-PATH sampler (#41): forza gi (choose), risolve l'azione e campiona la x della palla (coord gioco
   0..100, x=100 = porta attaccata) durante la conclusione. Ritorna {intent, startX, net, maxBackStep, minX}.
   Usato dal check `ball-motion` (no-boomerang / progressione coerente sulle azioni offensive). */
export async function sampleBallPath(page, gi, { settle = 450, pollMs = 90, windowMs = 1100 } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const intent = await page.evaluate(g => (window.__CPM_SITS && window.__CPM_SITS[g] && window.__CPM_SITS[g].intent) || null, gi);
  const bx = () => page.evaluate(() => { const s = (typeof window.__CPM_STATE === 'function') && window.__CPM_STATE(); return s && s.ball ? s.ball.x : null; });
  const start = await bx();
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
  const xs = []; if (start != null) xs.push(start);
  const end = Date.now() + windowMs;
  while (Date.now() < end) { const x = await bx(); if (x != null) xs.push(x); await sleep(pollMs); }
  let maxBack = 0; for (let i = 1; i < xs.length; i++) { const d = xs[i] - xs[i - 1]; if (d < maxBack) maxBack = d; }
  return { gi, intent, startX: xs.length ? +xs[0].toFixed(1) : null, net: xs.length ? +(xs[xs.length - 1] - xs[0]).toFixed(1) : null,
    maxBackStep: +maxBack.toFixed(1), minX: xs.length ? +Math.min(...xs).toFixed(1) : null, n: xs.length };
}

/* Risolve l'azione k della Situation corrente, attende l'esito, ritorna {outcome, finalState}.
   Lo stato finale è catturato quando la PALLA SI FERMA (l'arco di conclusione — es. gol dopo
   dribbling/build-up — può durare oltre `wait` su HW lento → cattura prematura = falso positivo
   final-state, il flake storico gi=40). Polling fino a settle, cap a settleMax. */
export async function resolveAction(page, k = 0, { wait = 850, settleMax = 2800 } = {}) {
  await page.evaluate(kk => window.__CPM_RESOLVE(kk), k);
  await sleep(wait);
  const outcome = await page.evaluate(() => window.__CPM_OUTCOME);
  let finalState = await page.evaluate(() => window.__CPM_STATE());
  const t0 = Date.now();
  while (Date.now() - t0 < settleMax) {
    await sleep(120);
    const s = await page.evaluate(() => window.__CPM_STATE());
    if (!s || !s.ok || !s.ball || !finalState || !finalState.ball) { if (s) finalState = s; continue; }
    const moved = Math.hypot((s.ball.x || 0) - (finalState.ball.x || 0), (s.ball.y || 0) - (finalState.ball.y || 0));
    finalState = s;
    if (moved < 0.4) break; // palla ferma → stato finale stabile
  }
  return { outcome, finalState };
}

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
