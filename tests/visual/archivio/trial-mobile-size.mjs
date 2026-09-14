/* Riproduce il caso MOBILE: viewport da telefono (portrait). Misura le dimensioni REALI del canvas 3D del
   provino. Se l'altezza è ~0/minima, il campo collassa (wrapper senza altezza) → "il campo non si vede". */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 }); // iPhone-ish portrait
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1200);
const click = (rs) => page.evaluate((s) => { const rx = new RegExp(s, 'i'); const b = [...document.querySelectorAll('button')].find(x => rx.test(x.textContent || '')); if (b) b.click(); }, rs);
await click('nuova carriera'); await sleep(1200);
await page.evaluate(() => { const inp = document.querySelector('input[type="text"],input:not([type])'); if (inp) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(inp, 'M'); inp.dispatchEvent(new Event('input', { bubbles: true })); } });
await sleep(400); await click('inizia i provini'); await sleep(900); await click('inizia il provino');
await sleep(4000);
const m = await page.evaluate(() => {
  const c = document.querySelector('canvas'); if (!c) return { noCanvas: true };
  const r = c.getBoundingClientRect();
  const mount = c.parentElement; const mr = mount ? mount.getBoundingClientRect() : null;
  return { cw: c.width, ch: c.height, rectW: Math.round(r.width), rectH: Math.round(r.height), mountH: mr ? Math.round(mr.height) : null, visible: r.width > 4 && r.height > 4 };
});
await browser.close(); srv.close();

console.log('viewport MOBILE 390x844 — provino:');
console.log('  canvas buffer: ' + (m.noCanvas ? 'ASSENTE' : m.cw + 'x' + m.ch));
console.log('  canvas su schermo (rect): ' + (m.noCanvas ? '-' : m.rectW + 'x' + m.rectH) + ' · altezza mount: ' + m.mountH);
// il campo si vede E riempie lo spazio: il canvas deve avere altezza ~= al contenitore (niente fascia nera)
const gap = m.noCanvas ? 999 : Math.abs(m.mountH - m.rectH);
const okMount = !m.noCanvas && m.mountH > 100 && gap <= 12;
console.log(m.noCanvas ? '❌ nessun canvas' : (okMount
  ? '✅ CAMPO PIENO — canvas ' + m.rectH + 'px riempie il contenitore ' + m.mountH + 'px (gap ' + gap + 'px) → niente fascia nera'
  : (m.mountH <= 100 ? '❌ CAMPO COLLASSATO — mount ' + m.mountH + 'px' : '⚠️ FASCIA NERA — canvas ' + m.rectH + 'px < contenitore ' + m.mountH + 'px (gap ' + gap + 'px)')));
process.exit(okMount ? 0 : 1);
