#!/usr/bin/env node
/* [giro 58 PO-278 «anche il pallino 2D», decisione PO 17/10] guardiano del pallino del pallone sulla lavagna 2D in `playing`.
   Testimone inerte __CPM_PALL2D (raggio pedina r e raggio pallino rb disegnati) + misura dei pixel sullo schermo 412x915:
   diametro della parte bianca del pallino (lato del riquadro dei pixel chiari attorno al centro) e nitidezza (quota dei pixel
   di transizione grigia sul bordo, 0 = netto). VERDE: rb/r <= 0,40 e ≥ 0,25. ROSSO (__CPM_NO_PALL2D): rb/r ≥ 0,50.
   Foto: out/pallino-278/{verde,rosso}.png (+ ingrandimento). Uso: node pallino-278.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const OUT = new URL('./out/pallino-278/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
async function braccio(rosso) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); let errori = 0; page.on('pageerror', () => { errori++; });
  await page.addInitScript((r) => { window.__CPM_PALL2D = {}; if (r) window.__CPM_NO_PALL2D = true; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  const misure = []; let foto = null;
  for (let i = 0; i < 120 && misure.length < 6; i++) { await sleep(500);
    const st = await page.evaluate(() => { const c = document.querySelector('canvas[data-cpm="campo2d"]'); const b = c && c.getBoundingClientRect();
      return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), w: window.__CPM_PALL2D, c: b && b.width > 0 ? { x: b.x, y: b.y, w: b.width, h: b.height } : null }; });
    if (st.ph !== 'playing' || !st.c || !st.w || st.w.rb == null) continue;
    /* lettura nello STESSO fotogramma del disegno: un rAF registrato ora gira dopo quello del campo, quindi testimone e pixel sono coerenti */
    const m = await page.evaluate(async () => { await new Promise(r => requestAnimationFrame(r)); const w = window.__CPM_PALL2D; const c = document.querySelector('canvas[data-cpm="campo2d"]');
      const k = c.width / c.getBoundingClientRect().width, R = 14, cx = Math.round(w.x * k), cy = Math.round(w.y * k);
      const d = c.getContext('2d').getImageData(cx - R, cy - R, 2 * R, 2 * R).data; let x0 = 99, x1 = -1, y0 = 99, y1 = -1, grigi = 0, chiari = 0;
      for (let y = 0; y < 2 * R; y++) for (let x = 0; x < 2 * R; x++) { const i = (y * 2 * R + x) * 4, L = (d[i] + d[i + 1] + d[i + 2]) / 3;
        if (Math.hypot(x - R, y - R) > w.rb * k + 1.5) continue;
        if (L > 225) { chiari++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } else if (L > 150) grigi++; }
      const z = document.createElement('canvas'); z.width = 400; z.height = 300; const zg = z.getContext('2d'); zg.imageSmoothingEnabled = false; zg.drawImage(c, cx - 40 * k, cy - 30 * k, 80 * k, 60 * k, 0, 0, 400, 300);
      return { zoom: z.toDataURL('image/png'), w, k, dPx: x1 >= 0 ? Math.max(x1 - x0 + 1, y1 - y0 + 1) / k : 0, grigi, chiari }; });
    const w = m.w, cx = Math.round(st.c.x + w.x), cy = Math.round(st.c.y + w.y), grigi = m.grigi, chiari = m.chiari;
    const dPx = +m.dPx.toFixed(1);
    misure.push({ r: w.r, rb: w.rb, rapp: w.rapp, dBianco: dPx, dPedina: +(2 * w.r).toFixed(1), rappPx: +(dPx / (2 * w.r)).toFixed(3), grigi: +(grigi / Math.max(1, grigi + chiari)).toFixed(2) });
    if (!foto) { foto = 1; const nome = rosso ? 'rosso' : 'verde'; await page.screenshot({ path: OUT + nome + '.png' });
      fs.writeFileSync(OUT + nome + '-zoom.png', Buffer.from(m.zoom.split(',')[1], 'base64')); }/* ingrandimento x5 del campo 2D attorno al pallino, dallo stesso fotogramma della misura */
    await sleep(1500); }
  await ctx.close(); return { misure, errori };
}
const v = await braccio(false), r = await braccio(true);
const med = (a, k) => { const s = a.map(x => x[k]).sort((p, q) => p - q); return s.length ? s[s.length >> 1] : null; };
const sv = { n: v.misure.length, rapp: med(v.misure, 'rapp'), rappPx: med(v.misure, 'rappPx'), grigi: med(v.misure, 'grigi'), r: med(v.misure, 'r'), errori: v.errori };
const sr = { n: r.misure.length, rapp: med(r.misure, 'rapp'), rappPx: med(r.misure, 'rappPx'), grigi: med(r.misure, 'grigi'), r: med(r.misure, 'r'), errori: r.errori };
console.log('VERDE:', JSON.stringify(sv), JSON.stringify(v.misure)); console.log('ROSSO (__CPM_NO_PALL2D):', JSON.stringify(sr), JSON.stringify(r.misure));
const ok = sv.n >= 3 && sr.n >= 3 && sv.rapp <= 0.40 && sv.rapp >= 0.25 && sr.rapp >= 0.50 && !v.errori;
await browser.close(); srv.close();
console.log(ok ? '✅ pallino-278 verde (e il rosso si vede) — foto in out/pallino-278/' : '❌ pallino-278 ROSSO'); process.exit(ok ? 0 : 1);
