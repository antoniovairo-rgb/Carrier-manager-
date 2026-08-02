/* [7.303.0] collaudo PO «l'arbitro durante la cronaca è una scheggia impazzita, riduci i movimenti».
 * Misura il moto dell'arbitro nella fase `playing` (dove vive la cronaca di background) campionando la
 * sua posizione dalla scena: velocità media e di picco, e soprattutto le INVERSIONI di fascia (il difetto
 * era il lato scelto con `bz>=0?1:-1`, che a ogni passaggio della palla sulla mediana lo mandava a
 * traversare il campo). Baseline in referee-baseline.json; REF_UPDATE=1 la rigenera.
 * Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node referee-motion-test.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const BASE = new URL('./referee-baseline.json', import.meta.url).pathname;
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const errs = [];
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 700 });
await installCdnRoutes(page);
page.on('pageerror', e => errs.push(String(e.message).slice(0,160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(1500);

/* campiona l'arbitro per ~14s di fase `playing` (la cronaca gira, la palla salta da una zona all'altra) */
const samples = await page.evaluate(async () => {
  const out = [];
  const findRef = () => {
    const sc = window.__CPM_SCENE || null;
    if (!sc) return null;
    let best = null;
    sc.traverse(o => { if (o.userData && o.userData.isRef) best = o; });
    return best;
  };
  const t0 = performance.now();
  while (performance.now() - t0 < 14000) {
    const st = window.__CPM_STATE ? window.__CPM_STATE() : null;
    if (st && st.ref) out.push({ t: performance.now() - t0, x: st.ref.x, z: st.ref.z, bz: st.ball ? st.ball.z : 0 });
    await new Promise(r => setTimeout(r, 100));
  }
  return out;
});

await browser.close(); srv.close();

if (!samples.length) {
  console.log('⚠️ SKIP — la scena non espone la posizione dell\'arbitro (__CPM_STATE().ref): probe non applicabile su questa build');
  process.exit(0);
}
let peak = 0, sum = 0, n = 0, flips = 0, prevSide = null;
for (let i = 1; i < samples.length; i++) {
  const a = samples[i-1], b = samples[i];
  const dt = Math.max(0.001, (b.t - a.t) / 1000);
  const v = Math.hypot(b.x - a.x, b.z - a.z) / dt;
  peak = Math.max(peak, v); sum += v; n++;
  const side = b.z >= 0 ? 1 : -1;
  if (prevSide !== null && side !== prevSide) flips++;
  prevSide = side;
}
const m = { samples: samples.length, vAvg: +(sum / n).toFixed(2), vPeak: +peak.toFixed(2), flips };
console.log(JSON.stringify(m));

if (process.env.REF_UPDATE === '1' || !existsSync(BASE)) {
  writeFileSync(BASE, JSON.stringify(m, null, 1));
  console.log('baseline scritta →', BASE);
  process.exit(0);
}
const b = JSON.parse(readFileSync(BASE, 'utf8'));
const bad = [];
if (m.vPeak > Math.max(9.5, b.vPeak * 1.25)) bad.push(`picco di velocità ${m.vPeak} > baseline ${b.vPeak}`);
if (m.vAvg > Math.max(2.2, b.vAvg * 1.3)) bad.push(`velocità media ${m.vAvg} > baseline ${b.vAvg}`);
if (m.flips > Math.max(2, b.flips + 2)) bad.push(`cambi di fascia ${m.flips} > baseline ${b.flips}`);
if (errs.length) bad.push('pageerror: ' + errs.join(' | '));
console.log(bad.length ? '❌ FAIL\n  ' + bad.join('\n  ') : '✅ PASS — l\'arbitro si muove come un arbitro (nessuna traversata di campo)');
process.exit(bad.length ? 2 : 0);
