#!/usr/bin/env node
/* [giro 63 PO-023] CRITERI MISURABILI DEL RENDER 3D: fps, tempo di caricamento, memoria, versione di Three.js.
   Una partita vera (provino, `playing` col clock vero, corpi GLB accesi come da direttiva CH38/CGTrader), pagina nuova.
   Misura:
     caricamento  — ms dalla navigazione al primo render della home (#root con figli) e dalla pressione di
                    «Inizia il provino» ai corpi pronti (`__CPM_CORPI232().pronti`)
     fps          — rAF in `playing` per CPM_FPS_MS (default 6000): media, p95 del fotogramma, 1% peggiore
     memoria      — heap JS a corpi pronti e dopo CPM_MEM_MS (default 20000) di gioco: crescita totale e pendenza;
                    texture/geometrie del renderer (`__CPM_RINFO769`)
     three        — THREE.REVISION === '128' (versione fissata in src/00-head.html)
   Le soglie sono PAVIMENTI HEADLESS (Chromium senza GPU, render software): prendono le regressioni grossolane
   (render-loop rotto, fuga di memoria, caricamento piantato), NON giudicano il telefono. Il numero per il telefono
   lo da' il taccuino del PO (`__CPM_FPS907`/`__CPM_FPS708`).
   ROSSO (CPM_ROSSO023=1, iniettato dalla sonda, non dal gioco): un divoratore di CPU nel rAF (CPM_ROSSO_MS, default 300
   ms a fotogramma) e una fuga di memoria (4 MB ogni 250 ms) — il guardiano deve uscire 1.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node render-3d-023.mjs                                           */
import { startServer, launchBrowser, installCdnRoutes, clickByText, sleep } from './lib/harness.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const ROSSO = process.env.CPM_ROSSO023 === '1';
const FPS_MS = +(process.env.CPM_FPS_MS || 6000);
const MEM_MS = +(process.env.CPM_MEM_MS || 20000);
/* soglie fissate sulle misure del giro 63 (vedi docs/sviluppo/RAPPORTO-giro63.md), con margine per i runner CI */
const TH = {
  homeMaxMs: +(process.env.CPM_TH_HOME || 60000),      // misurato 9-12 s (Babel in-browser su software-GL)
  corpiMaxMs: +(process.env.CPM_TH_CORPI || 60000),    // misurato 6-14 s
  fpsMin: +(process.env.CPM_TH_FPS || 4),              // misurato 9-13 fps
  p95MaxMs: +(process.env.CPM_TH_P95 || 600),          // misurato 120-200 ms
  heapMaxMB: +(process.env.CPM_TH_HEAP || 700),        // misurato ~250-330 MB
  crescitaMaxMB: +(process.env.CPM_TH_CRESCITA || 100), // misurato 15 MB in 20 s (rosso 145)
};

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
const issues = []; let errori = 0;
page.on('pageerror', e => { errori++; if (errori <= 3) console.log('pageerror: ' + String(e.message).slice(0, 140)); });
await page.addInitScript(rosso => {
  window.__T023 = {};
  const mo = new MutationObserver(() => { const r = document.getElementById('root'); if (r && r.children.length && !window.__T023.home) { window.__T023.home = performance.now(); mo.disconnect(); } });
  document.addEventListener('DOMContentLoaded', () => { const r = document.getElementById('root'); if (r) mo.observe(r, { childList: true }); });
  if (rosso) {
    const ms = +(window.__ROSSO_MS || 300);
    const hog = () => { const t = performance.now(); while (performance.now() - t < ms) {} requestAnimationFrame(hog); };
    requestAnimationFrame(hog);
    window.__LEAK023 = []; setInterval(() => { window.__LEAK023.push(new Float64Array(512 * 1024).fill(Math.random())); }, 250);
  }
}, ROSSO);
if (ROSSO) await page.addInitScript(ms => { window.__ROSSO_MS = ms; }, +(process.env.CPM_ROSSO_MS || 300));

await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => window.__T023 && window.__T023.home, null, { timeout: 120000 });
const tHome = await page.evaluate(() => Math.round(window.__T023.home));
if (!await clickByText(page, 'Nuova carriera')) issues.push('flusso: «Nuova carriera» non trovato');
await sleep(700);
await page.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Vairo'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
if (!await clickByText(page, 'INIZIA I PROVINI')) issues.push('flusso: «INIZIA I PROVINI» non trovato');
await sleep(400);
const tClick = await page.evaluate(() => performance.now());
if (!await clickByText(page, 'Inizia il provino')) issues.push('flusso: «Inizia il provino» non trovato');
let tCorpi = null;
try {
  await page.waitForFunction(() => { try { return typeof window.__CPM_CORPI232 === 'function' && window.__CPM_CORPI232().pronti; } catch (_e) { return false; } }, null, { timeout: 120000, polling: 200 });
  tCorpi = Math.round(await page.evaluate(() => performance.now()) - tClick);
} catch (_e) { issues.push('caricamento: corpi non pronti entro 120 s'); }
const corpi = await page.evaluate(() => { try { return window.__CPM_CORPI232(); } catch (_e) { return null; } });
const three = await page.evaluate(() => (window.THREE && window.THREE.REVISION) || null);

/* fps: si misura in `playing` (clock vero); se la partita e' in un highlight si aspetta che torni al gioco fluido */
const fase = async () => page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } });
for (let k = 0; k < 60 && (await fase()) !== 'playing'; k++) await sleep(500);
const fasePrima = await fase();
const ds = await page.evaluate(win => new Promise(res => {
  const ds = []; let last = performance.now(); const t0 = last;
  const tick = now => { ds.push(now - last); last = now; (now - t0 < win) ? requestAnimationFrame(tick) : res(ds); };
  requestAnimationFrame(tick);
}), FPS_MS);
const s = ds.filter(d => d > 0).sort((a, b) => a - b); const n = s.length;
const avg = n ? s.reduce((a, b) => a + b, 0) / n : 0;
const p95 = n ? s[Math.min(n - 1, Math.floor(n * 0.95))] : 0;
const p99 = n ? s[Math.min(n - 1, Math.floor(n * 0.99))] : 0;
const fps = { n, media: avg ? +(1000 / avg).toFixed(1) : 0, p95ms: +p95.toFixed(0), basso1: p99 ? +(1000 / p99).toFixed(1) : 0, fase: fasePrima };

const heap = async () => page.evaluate(() => performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null);
const rinfo = async () => page.evaluate(() => { try { return window.__CPM_RINFO769 ? window.__CPM_RINFO769() : null; } catch (_e) { return null; } });
const h0 = await heap(); const r0 = await rinfo(); const heaps = [h0];
const passi = 5; for (let i = 0; i < passi; i++) { await sleep(MEM_MS / passi); heaps.push(await heap()); }
const r1 = await rinfo();
const crescita = h0 != null ? +(heaps[heaps.length - 1] - h0).toFixed(1) : null;
const mem = { heapMB: heaps, crescitaMB: crescita, pendenzaMBs: crescita != null ? +(crescita / (MEM_MS / 1000)).toFixed(2) : null,
  texture: r0 && r1 ? [r0.tex, r1.tex] : null, geometrie: r0 && r1 ? [r0.geo, r1.geo] : null, chiamate: r1 ? r1.calls : null, triangoli: r1 ? r1.tri : null };

console.log(`caricamento → home ${tHome} ms · corpi pronti ${tCorpi} ms dopo «Inizia il provino» (${corpi ? corpi.motivo : '?'}, corpi ${corpi && corpi.corpi != null ? corpi.corpi : '?'})`);
console.log(`fps (${fps.fase}, ${FPS_MS} ms, ${fps.n} fotogrammi) → media ${fps.media} · p95 ${fps.p95ms} ms · 1% peggiore ${fps.basso1} fps`);
console.log(`memoria → heap ${mem.heapMB.join(' → ')} MB · crescita ${mem.crescitaMB} MB in ${MEM_MS / 1000} s (${mem.pendenzaMBs} MB/s) · texture ${mem.texture} · geometrie ${mem.geometrie} · draw call ${mem.chiamate} · triangoli ${mem.triangoli}`);
console.log(`three → REVISION ${three} · errori di pagina ${errori}`);

if (tHome > TH.homeMaxMs) issues.push(`caricamento home ${tHome} ms > ${TH.homeMaxMs}`);
if (tCorpi != null && tCorpi > TH.corpiMaxMs) issues.push(`corpi pronti ${tCorpi} ms > ${TH.corpiMaxMs}`);
if (fps.fase !== 'playing') issues.push(`fps non misurati in playing (fase ${fps.fase})`);
if (fps.media < TH.fpsMin) issues.push(`fps medi ${fps.media} < ${TH.fpsMin}`);
if (fps.p95ms > TH.p95MaxMs) issues.push(`fotogramma p95 ${fps.p95ms} ms > ${TH.p95MaxMs}`);
if (h0 == null) issues.push('heap non misurabile (performance.memory assente)');
else {
  if (Math.max(...heaps) > TH.heapMaxMB) issues.push(`heap ${Math.max(...heaps)} MB > ${TH.heapMaxMB}`);
  if (crescita > TH.crescitaMaxMB) issues.push(`heap cresciuto di ${crescita} MB in ${MEM_MS / 1000} s > ${TH.crescitaMaxMB}`);
}
if (three !== '128') issues.push(`Three.js REVISION ${three}, attesa 128`);
if (errori) issues.push(`${errori} errori di pagina`);

try { mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  writeFileSync(new URL(`./out/render-3d-023${ROSSO ? '-rosso' : ''}.json`, import.meta.url), JSON.stringify({ rosso: ROSSO, tHome, tCorpi, corpi, fps, mem, three, errori, soglie: TH, issues }, null, 1)); } catch (_e) {}
await browser.close(); srv.close();
if (issues.length) { console.log(`\n❌ RENDER 3D${ROSSO ? ' (braccio rosso)' : ''} — ${issues.length} problemi:`); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ RENDER 3D entro i pavimenti headless (caricamento, fps, memoria, Three r128)');
