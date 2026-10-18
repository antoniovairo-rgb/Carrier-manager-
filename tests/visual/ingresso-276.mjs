#!/usr/bin/env node
/* [giro 64 PO-276 «walkout con fotogrammi a campo vuoto nei primi secondi e file lontane a fine ingresso»]
   SONDA/GUARDIANO sul percorso vero (salvataggio → partita → walkout), GLB ACCESO, rete del banco. Campiona ogni 150 ms il
   tempo di scena dell'ingresso (__CPM_WALK245) e proietta i 22 + l'eroe sulla camera vera: quanti calciatori stanno nel quadro
   e quanto sono alti (frazione dell'altezza dell'immagine, adimensionale: headless e telefono dicono lo stesso numero).
   Misure: «vuoto» = quota dei campioni con ZERO calciatori nel quadro (per finestra di scena), «fila» = altezza apparente
   mediana dei calciatori nel quadro negli ultimi 4 s di scena.
   Bracci: verde · rosso (__CPM_NO_ING276). Soglie: CPM_VUOTO_MAX (default 0,10), CPM_FILA_MIN (default 0,045).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node ingresso-276.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const VMAX = +(process.env.CPM_VUOTO_MAX || 0.10), FMIN = +(process.env.CPM_FILA_MIN || 0.045);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
fs.mkdirSync(new URL('./out/ingresso-276/', import.meta.url), { recursive: true });
async function giro(braccio) {
  const rosso = braccio === 'rosso';
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_WALK245 = []; window.__CPM_GLB = true; if (o.tod) window.__CPM_TOD = o.tod; if (o.r) window.__CPM_NO_ING276 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso, tod: process.env.CPM_TOD || null });
  const out = { braccio };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 60; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      await sleep(700); }
    out.walk = (await ph()) === 'walkout';
    const S = []; const t0 = Date.now(); const foto = new Set();
    while (Date.now() - t0 < +(process.env.CPM_TMAX || 300000)) {
      const s = await page.evaluate(() => {
        const T = window.__CPM3D, W = window.__CPM_WALK245 || []; if (!T) return { ph: window.__CPM_PHASE && window.__CPM_PHASE() };
        const cam = T.camera, V = new T.camera.position.constructor();
        let n = 0; const hs = [];
        const arr = [...(T.players || []).map(q => q && (q.mesh || q)), T.hero].filter(m => m && m.position && m.visible !== false);
        for (const m of arr) {
          V.set(m.position.x, 0, m.position.z).project(cam); const y0 = V.y, x0 = V.x, z0 = V.z;
          V.set(m.position.x, 1.85, m.position.z).project(cam); const y1 = V.y;
          if (z0 < 1 && z0 > -1 && Math.abs(x0) < 1 && y1 > -1 && y0 < 1) { n++; hs.push(Math.abs(y1 - y0) / 2); }
        }
        hs.sort((a, b) => a - b);
        return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), wt: W.length ? W[W.length - 1].t : null, dur: window.__CPM_WALKDUR245 || null, n, h: hs.length ? hs[Math.floor(hs.length / 2)] : 0 };
      }).catch(e => ({ err: String(e.message).slice(0, 120) }));
      if (!s) break; S.push(s); if (process.env.CPM_DEBUG && S.length < 6) console.log(JSON.stringify(s));
      if (s.ph !== 'walkout' && S.some(q => q.ph === 'walkout')) break;
      for (const ft of [1, 5, 9, 22]) if (s.ph === 'walkout' && s.wt != null && s.wt >= ft && !foto.has(ft)) { foto.add(ft); await page.screenshot({ path: new URL(`./out/ingresso-276/${braccio}-${process.env.CPM_TOD || 'tod'}-${ft}s.png`, import.meta.url).pathname }).catch(() => {}); }
      await sleep(150);
    }

    const W = S.filter(s => s.ph === 'walkout' && s.wt != null);
    const dur = (S.find(s => s.dur) || {}).dur || 24; out.dur = dur; out.campioni = W.length;
    const fin = (a, b2) => { const X = W.filter(s => s.wt >= a && s.wt < b2); return X.length ? { n: X.length, vuoto: +(X.filter(s => s.n === 0).length / X.length).toFixed(3), media: +(X.reduce((q, s) => q + s.n, 0) / X.length).toFixed(1), hMed: +(X.map(s => s.h).sort((p, q) => p - q)[Math.floor(X.length / 2)]).toFixed(3) } : null; };
    out.f0_3 = fin(0, 3.2); out.f3_12 = fin(3.2, 12); out.f12_fine = fin(12, dur - 4); out.coda = fin(dur - 4, dur + 1); out.tutto = fin(0, dur + 1);
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await ctx.close(); return out;
}
const R = {}; for (const br of BRACCI) { R[br] = await giro(br); console.log(br.toUpperCase() + ' ' + JSON.stringify(R[br])); }
fs.writeFileSync(new URL('./out/ingresso-276/esito-' + (process.env.CPM_TOD || 'tod') + '.json', import.meta.url), JSON.stringify(R, null, 1));
await b.close(); srv.close();
if (process.env.CPM_SOLO_MISURA) process.exit(0);
const g = []; const V = R.verde, Z = R.rosso;
if (V) { if (!V.walk || !V.tutto || V.tutto.n < 20) g.push('verde: ingresso non misurato ' + JSON.stringify(V));
  else { const vu = Math.max(V.f0_3 ? V.f0_3.vuoto : 0, V.f3_12 ? V.f3_12.vuoto : 0); if (vu > VMAX) g.push(`verde: campo vuoto nei primi 12 s ${vu} > ${VMAX}`);
    if (!(V.coda && V.coda.hMed >= FMIN)) g.push(`verde: fila lontana a fine ingresso (altezza mediana ${V.coda && V.coda.hMed} < ${FMIN})`); }
  if (V.errori.length) g.push('verde: errori ' + V.errori.join(' | ')); }
if (Z && Z.tutto) { const vu = Math.max(Z.f0_3 ? Z.f0_3.vuoto : 0, Z.f3_12 ? Z.f3_12.vuoto : 0); if (!(vu > VMAX || !(Z.coda && Z.coda.hMed >= FMIN))) g.push('rosso: il difetto non si vede ' + JSON.stringify(Z)); }
if (g.length) { console.log('❌ ingresso-276'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ingresso-276 verde (calciatori nel quadro nei primi 12 s, fila leggibile a fine ingresso) e il rosso si vede');
