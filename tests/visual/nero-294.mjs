#!/usr/bin/env node
/* [giro 294 PO-567] SONDA: all'apertura dell'ingresso, per quanto tempo il riquadro 3D e' NERO (luminanza media del riquadro < 12/255),
   e se intanto c'e' un segnale (velo «Si accendono i riflettori»). Corpi GLB, attesa vera (__CPM_WALKTEST74). Tempi del BANCO (grafica software). */
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const [w, h] of [[1366, 768], [1920, 1080], [375, 667]]) {
  const page = await b.newPage({ viewport: { width: w, height: h } }); await installCdnRoutes(page); const out = { quadro: w + 'x' + h };
  try {
    await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE });
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 40; k++) { if ((await ph()) === 'formations') break; await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /Vedi le formazioni|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '')); if (x) x.click(); }); await sleep(700); }
    await sleep(1500);
    const t0 = Date.now(); await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /Ingresso in campo/i.test(b.textContent || '')); if (x) x.click(); });
    const S = [];
    while (Date.now() - t0 < 45000) { const t = Date.now() - t0;
      const st = await page.evaluate(() => { const c = document.querySelector('canvas'); const r = c ? c.getBoundingClientRect() : null; return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), velo: !!document.querySelector('[data-cpm="walkhold74"]'), salta: !!document.querySelector('[data-cpm="salta-ingresso-v2"]'), r: r && r.width > 4 ? { x: r.x, y: r.y, width: r.width, height: r.height } : null }; }).catch(() => null);
      let lum = null; if (st && st.r) { try { const clip = { x: Math.max(0, st.r.x), y: Math.max(0, st.r.y), width: Math.min(st.r.width, w - Math.max(0, st.r.x)), height: Math.min(st.r.height, h - Math.max(0, st.r.y)) }; const png = PNG.sync.read(await page.screenshot({ clip })); let a = 0, n = 0; for (let i = 0; i < png.data.length; i += 4 * 37) { a += 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]; n++; } lum = +(a / n).toFixed(1); } catch (e) {} }
      S.push({ t, ph: st && st.ph, velo: st && st.velo, salta: st && st.salta, tela: !!(st && st.r), lum }); if (S.filter(x => x.lum != null && x.lum >= 12 && !x.velo).length >= 3) break; await sleep(150); }
    const W = S.filter(x => x.ph === 'walkout'); const prima = W.find(x => x.lum != null && x.lum >= 12 && !x.velo);
    const neri = W.filter(x => (x.lum == null || x.lum < 12) && (!prima || x.t < prima.t));
    out.campioni = W.length; out.primoWalkoutMs = W.length ? W[0].t : null; out.primaImmagineMs = prima ? prima.t : null; out.lumPrimaImmagine = prima ? prima.lum : null;
    out.neroSenzaVeloMs = neri.filter(x => !x.velo).length ? (neri.filter(x => !x.velo).slice(-1)[0].t - neri.filter(x => !x.velo)[0].t) : 0; out.neroSenzaVeloCampioni = neri.filter(x => !x.velo).length;
    out.conVeloCampioni = W.filter(x => x.velo).length; out.veloMs = W.filter(x => x.velo).length ? (W.filter(x => x.velo).slice(-1)[0].t - W.filter(x => x.velo)[0].t) : 0;
    out.saltaVisibileDurNero = neri.some(x => x.salta); out.traccia = S.filter((_, i) => i % Math.max(1, Math.floor(S.length / 14)) === 0).map(x => [x.t, x.ph, x.velo ? 'velo' : '-', x.lum]);
    await page.screenshot({ path: new URL('./out/nero-294-' + w + '.png', import.meta.url).pathname }).catch(() => {});
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  console.log('NERO-294 ' + JSON.stringify(out)); await page.close();
}
await b.close(); srv.close();
