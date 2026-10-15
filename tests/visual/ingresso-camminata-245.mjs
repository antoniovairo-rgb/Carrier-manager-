#!/usr/bin/env node
/* [giro 23 PO-245, questionario 15/10 «Camminata vera, ingresso piu' lungo»] GUARDIANO DELL'INGRESSO A PASSO DI CAMMINATA.
   Il giro 19 aveva tolto la traversata del campo (stesso tunnel) con un tetto di 6,5 u/s: un passo svelto, non una camminata.
   Ora il passo e' ~1,8 u/s e l'ingresso dura quanto serve perche' tutti arrivino al posto (WALK_DUR calcolato all'avvio).
   Misura: ingresso vero coi corpi GLB (__CPM_WALKTEST74), posizioni dei calciatori accompagnati in TEMPO DI SCENA (__CPM_WALK245),
   velocita' su finestre >= 0,5 s di scena; testimone __CPM_CAMM245 (letture del canale di locomozione: quota sulla clip «walk»,
   cadenza media in movimento, velocita' naturale della clip).
   VERDE: velocita' massima di ogni squadra <= 2,3 u/s, tutti al posto a fine ingresso (entro 1u), canale «walk» >= 90% delle
   letture e cadenza media in movimento fra 0,7 e 1,8 (piede d'appoggio fermo: cadenza = velocita' / velocita' naturale).
   ROSSO (__CPM_NO_CAMM245): passo del giro 19 (oltre 5 u/s) e nessuna lettura sulla camminata.
   Uso: node ingresso-camminata-245.mjs   (CPM_GLB=0 per i corpi procedurali: salta i controlli della clip) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const GLB = process.env.CPM_GLB !== '0';
const VMAX = +(process.env.CPM_VMAX || 2.3);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = !!o.glb; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_WALK245 = []; window.__CPM_CAMM245 = {}; if (o.r) window.__CPM_NO_CAMM245 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso, glb: GLB });
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
    const t0 = Date.now(); while (Date.now() - t0 < 480000) { const p = await ph(); if (p !== 'walkout') break; await sleep(1000); }
    out.realeS = Math.round((Date.now() - t0) / 1000);
    const W = await page.evaluate(() => window.__CPM_WALK245 || []);
    out.n = W.length; out.durata = await page.evaluate(() => window.__CPM_WALKDUR245 || null);
    const lato = casa => { const F = W.map(f => ({ t: f.t, P: f.p.filter(q => q[0] === (casa ? 1 : 0)) })); if (!F.length || !F[0].P.length) return null;
      const n = F[0].P.length; let vmax = 0;
      for (let j = 0; j < n; j++) { let a = 0;
        for (let i = 1; i < F.length; i++) { if (F[i].t - F[a].t < 0.5) continue; const d = Math.hypot(F[i].P[j][1] - F[a].P[j][1], F[i].P[j][2] - F[a].P[j][2]); vmax = Math.max(vmax, d / (F[i].t - F[a].t)); a = i; } }
      const L = F[F.length - 1].P; const lontani = L.filter(q => Math.hypot(q[1] - q[3], q[2] - q[4]) > 1).length;
      return { n, vmax: +vmax.toFixed(2), lontani, scena: +(F[F.length - 1].t - F[0].t).toFixed(1) }; };
    out.casa = lato(true); out.osp = lato(false);
    const K = await page.evaluate(() => window.__CPM_CAMM245 || {});
    out.clip = { letture: K.n || 0, walk: K.n ? +((K.walk || 0) / K.n).toFixed(3) : 0, cadenza: K.mov ? +(K.ts / K.mov).toFixed(2) : null, v0: K.v0 || null };
    await page.screenshot({ path: new URL('./out/ingresso-camminata-245' + (rosso ? '-rosso' : '') + '.png', import.meta.url).pathname }).catch(() => {});
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const V = await giro(false); console.log('VERDE ' + JSON.stringify(V));
const R = await giro(true); console.log('ROSSO ' + JSON.stringify(R));
await b.close(); srv.close();
const g = [];
if (!V.walk || !V.casa || !V.osp) g.push('verde: ingresso non misurato ' + JSON.stringify(V));
else {
  if (V.casa.vmax > VMAX || V.osp.vmax > VMAX) g.push('verde: non e\' una camminata (casa ' + V.casa.vmax + ', ospiti ' + V.osp.vmax + ' u/s, soglia ' + VMAX + ')');
  if (V.casa.lontani || V.osp.lontani) g.push('verde: a fine ingresso non tutti al loro posto (casa ' + V.casa.lontani + ', ospiti ' + V.osp.lontani + ')');
  if (GLB) { if (!(V.clip.walk >= 0.9)) g.push('verde: la clip di camminata non comanda il passo (' + V.clip.walk + ')');
    if (!(V.clip.cadenza >= 0.7 && V.clip.cadenza <= 1.8)) g.push('verde: cadenza fuori banda, i piedi pattinano (' + V.clip.cadenza + ')'); }
}
if (V.errori && V.errori.length) g.push('verde: errori di pagina ' + V.errori.join(' | '));
if (!R.casa || !R.osp || !(Math.max(R.casa.vmax, R.osp.vmax) > 5) || (GLB && R.clip.walk > 0)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ ingresso-camminata-245'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ingresso-camminata-245 verde (camminata, tutti al posto, clip di camminata) e il rosso si vede');
