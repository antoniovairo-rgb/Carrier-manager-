#!/usr/bin/env node
/* [giro 72 — collaudo 7.999.172 carriera B1: «a 360 px CARRIERA e AGENTE della barra in basso quasi attaccate»]
   SONDA/GUARDIANO: carica la carriera (salvataggio save-190) a 360 e 412 px e misura, coi rettangoli REALI del testo (Range sul nodo
   di testo, non il box del bottone che e' sempre largo 1/6), lo spazio vuoto fra due etichette vicine della barra in basso.
   VERDE: spazio minimo >= CPM_GAP_MIN px (default 15; misurato prima 12,6 a 360 px, dopo 17,6) a entrambe le larghezze, nessuna etichetta oltre il proprio bottone.
   ROSSO (__CPM_NO_BARRA72, barra di prima: sei bottoni di larghezza uguale): spazio minimo a 360 px < 15 px. Larghezza minima di un bottone >= 40 px: a spazi uguali HOME misura 40,4 px a 360 (prima 51), alto ~46 — sopra i 24 px di WCAG 2.2 AA, sotto i 44 consigliati: scelta dichiarata nel RAPPORTO-giro72.
   Foto in out/barra-360-72-<braccio>-<larghezza>.png. Uso: node barra-360-72.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const GAP_MIN = +(process.env.CPM_GAP_MIN || 15);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function misura(rosso, w) {
  const ctx = await b.newContext({ viewport: { width: w, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_BARRA72 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(800);
  const r = await page.evaluate(() => {
    const nav = document.querySelector('.cpm-nav-tabs'); const bs = nav ? [...nav.querySelectorAll('button')].filter(b => b.offsetParent !== null && b.querySelector('div')) : [];
    const L = bs.map(b => { const d = b.querySelector('div'); const rg = document.createRange(); rg.selectNodeContents(d); const t = rg.getBoundingClientRect(), bb = b.getBoundingClientRect();
      return { l: d.textContent, x0: +t.left.toFixed(1), x1: +t.right.toFixed(1), b0: +bb.left.toFixed(1), b1: +bb.right.toFixed(1) }; }).sort((a, c) => a.x0 - c.x0);
    const gaps = L.slice(1).map((x, i) => ({ fra: L[i].l + '|' + x.l, px: +(x.x0 - L[i].x1).toFixed(1) }));
    return { L, gaps, fuori: L.filter(x => x.x0 < x.b0 - 0.5 || x.x1 > x.b1 + 0.5).map(x => x.l), scrollX: document.documentElement.scrollWidth - innerWidth };
  });
  await page.screenshot({ path: new URL(`./out/barra-360-72-${rosso ? 'rosso' : 'verde'}-${w}.png`, import.meta.url).pathname, clip: { x: 0, y: 915 - 90, width: w, height: 90 } }).catch(() => {});
  await ctx.close(); r.errori = errs; return r;
}
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
const R = {};
for (const [br, ro] of [['verde', false], ['rosso', true]]) for (const w of [360, 412]) {
  const m = await misura(ro, w); const min = m.gaps.length ? m.gaps.reduce((a, g) => g.px < a.px ? g : a) : null;
  R[br + w] = { ...m, min };
  console.log(`${br} ${w}px: etichette ${m.L.length} · spazio minimo ${min ? min.px + ' px (' + min.fra + ')' : '-'} · spazi ${m.gaps.map(g => g.px).join(' ')} · fuori dal bottone ${m.fuori.length} · scroll orizzontale ${m.scrollX} · errori ${m.errori.length}`);
}
await b.close(); srv.close();
const g = [];
for (const w of [360, 412]) { const v = R['verde' + w];
  if (!v.L.length || v.L.length < 5) g.push(`verde ${w}: barra non trovata (${v.L.length} etichette)`);
  else { const st = Math.min(...v.L.map(x => x.b1 - x.b0)); if (st < 40) g.push(`verde ${w}: bottone largo ${st.toFixed(1)} px (< 40)`); console.log(`  ${w}px: bottone piu' stretto ${st.toFixed(1)} px`);
    if (v.min.px < GAP_MIN) g.push(`verde ${w}: ${v.min.fra} a ${v.min.px} px (< ${GAP_MIN})`); if (v.fuori.length) g.push(`verde ${w}: etichette oltre il bottone ${v.fuori.join(',')}`); if (v.scrollX > 0) g.push(`verde ${w}: scroll orizzontale ${v.scrollX}`); }
  if (v.errori.length) g.push(`verde ${w}: errori di pagina ${v.errori.join(' | ')}`); }
if (!(R.rosso360.min && R.rosso360.min.px < GAP_MIN)) g.push('rosso: il difetto di prima non si vede a 360 px');
console.log(g.length ? '❌ barra-360-72\n  · ' + g.join('\n  · ') : '✅ barra-360-72 verde (etichette staccate a 360 e 412 px) e il rosso si vede');
process.exit(g.length ? 1 : 0);
