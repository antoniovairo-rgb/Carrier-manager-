#!/usr/bin/env node
/* [giro 19 PO-245] GUARDIANO DELL'INGRESSO IN CAMPO: le due squadre escono dallo STESSO tunnel e camminano, non corrono.
   Collaudo 165 N3: i calciatori ospiti partivano da z +36 (linea laterale opposta a quella del tunnel e delle panchine, z -36) e
   attraversavano il campo coi bambini a ~28 u/s. Causa (src/12, _placeRow): bocca del tunnel `side*36`, con side +1 per gli ospiti;
   e l'avvicinamento esponenziale (velocita' proporzionale alla distanza residua) fa correre chi parte lontano.
   Misura: ingresso vero (__CPM_WALKTEST74), posizioni dei calciatori accompagnati (__CPM_HYPER_MASCOT_LIST) campionate in pagina a
   ogni fotogramma con il TEMPO DI SCENA del renderer (__CPM_WALK245, testimone test-only), velocita' su finestre >= 0,25 s di scena.
   VERDE: partenza di casa e ospite dallo stesso lato (segno di z uguale), velocita' massima di ogni squadra <= 7 u/s, e a fine
   ingresso ogni calciatore al suo posto (entro 1u). ROSSO (__CPM_NO_ING245): ospiti dal lato opposto o velocita' oltre la soglia.
   Uso: node ingresso-245.mjs   (CPM_GLB=1 per i corpi GLB) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const VMAX = +(process.env.CPM_VMAX || 7);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = !!o.glb; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_WALK245 = []; if (o.r) window.__CPM_NO_ING245 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso, glb: !!process.env.CPM_GLB });
  const out = { rosso };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 60; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }); await sleep(700); }
    out.walk = (await ph()) === 'walkout';
    const t0 = Date.now(); while (Date.now() - t0 < 90000) { const p = await ph(); if (p !== 'walkout') break; await sleep(500); }
    const W = await page.evaluate(() => window.__CPM_WALK245 || []);
    out.n = W.length;
    const lato = casa => { const F = W.map(f => ({ t: f.t, P: f.p.filter(q => q[0] === (casa ? 1 : 0)) })); if (!F.length || !F[0].P.length) return null;
      const n = F[0].P.length; let vmax = 0, z0 = 0;
      for (let j = 0; j < n; j++) { z0 += F[0].P[j][2] / n; let a = 0;
        for (let i = 1; i < F.length; i++) { if (F[i].t - F[a].t < 0.25) continue; const d = Math.hypot(F[i].P[j][1] - F[a].P[j][1], F[i].P[j][2] - F[a].P[j][2]); vmax = Math.max(vmax, d / (F[i].t - F[a].t)); a = i; } }
      const L = F[F.length - 1].P; const lontani = L.filter(q => Math.hypot(q[1] - q[3], q[2] - q[4]) > 1).length;
      return { n, z0: +z0.toFixed(1), vmax: +vmax.toFixed(1), lontani, scena: +(F[F.length - 1].t - F[0].t).toFixed(1) }; };
    out.casa = lato(true); out.osp = lato(false);
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const V = await giro(false); console.log('VERDE ' + JSON.stringify(V));
const R = await giro(true); console.log('ROSSO ' + JSON.stringify(R));
await b.close(); srv.close();
const g = [];
if (!V.walk || !V.casa || !V.osp) g.push('verde: ingresso non misurato ' + JSON.stringify(V));
else {
  if (Math.sign(V.casa.z0) !== Math.sign(V.osp.z0)) g.push('verde: le squadre escono da lati opposti (z casa ' + V.casa.z0 + ', ospiti ' + V.osp.z0 + ')');
  if (V.casa.vmax > VMAX || V.osp.vmax > VMAX) g.push('verde: si corre (casa ' + V.casa.vmax + ', ospiti ' + V.osp.vmax + ' u/s, soglia ' + VMAX + ')');
  if (V.casa.lontani || V.osp.lontani) g.push('verde: a fine ingresso non tutti al loro posto (casa ' + V.casa.lontani + ', ospiti ' + V.osp.lontani + ')');
}
if (V.errori && V.errori.length) g.push('verde: errori di pagina');
if (!R.casa || !R.osp || (Math.sign(R.casa.z0) === Math.sign(R.osp.z0) && R.osp.vmax <= VMAX)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ ingresso-245'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ingresso-245 verde (stesso tunnel, passo da camminata, tutti al posto) e il rosso si vede');
