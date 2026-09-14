/* Diagnosi schermo nero provino: cattura TUTTA la console (error+warning) e misura la luminosità del canvas,
   sia con GLB ON che GLB OFF, per isolare la causa (shader/materiale GLB?). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;

async function run(glbOn) {
  const browser = await launchBrowser(); const page = await browser.newPage();
  await installCdnRoutes(page);
  if (!glbOn) await page.addInitScript(() => { window.__CPM_GLB = false; });
  const msgs = [];
  page.on('console', m => { const t = m.type(); if (t === 'error' || t === 'warning') msgs.push(t.toUpperCase() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => msgs.push('PAGEERROR: ' + String(e).slice(0, 300)));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1000);
  const click = (rs) => page.evaluate((s) => { const rx = new RegExp(s, 'i'); const b = [...document.querySelectorAll('button')].find(x => rx.test(x.textContent || '')); if (b) b.click(); }, rs);
  await click('nuova carriera'); await sleep(800);
  await page.evaluate(() => { const inp = document.querySelector('input[type="text"],input:not([type])'); if (inp) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(inp, 'Diag'); inp.dispatchEvent(new Event('input', { bubbles: true })); } });
  await sleep(400); await click('inizia i provini'); await sleep(800); await click('inizia il provino');
  await sleep(7000);
  const bright = await page.evaluate(() => {
    const c = document.querySelector('canvas'); if (!c) return { avg: -1 };
    const cp = document.createElement('canvas'); cp.width = 160; cp.height = 160; const ctx = cp.getContext('2d'); ctx.drawImage(c, 0, 0, 160, 160);
    const d = ctx.getImageData(0, 0, 160, 160).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3; return { avg: +(s / (d.length / 4)).toFixed(1) };
  });
  await browser.close();
  return { avg: bright.avg, msgs: [...new Set(msgs)] };
}

for (const glbOn of [true, false]) {
  const r = await run(glbOn);
  console.log('\n=== GLB ' + (glbOn ? 'ON (produzione)' : 'OFF (come il gate)') + ' ===');
  console.log('luminosità canvas: ' + r.avg + '/255 ' + (r.avg >= 0 && r.avg < 8 ? '→ ⚫ NERO' : '→ ok'));
  console.log('console/errori (' + r.msgs.length + '):');
  r.msgs.slice(0, 12).forEach(m => console.log('  ' + m));
}
srv.close();
