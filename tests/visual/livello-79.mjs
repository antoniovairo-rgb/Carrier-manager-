#!/usr/bin/env node
/* [giro 79, collaudo carriera 7.999.175 F2 — rosso __CPM_NO_LIV79] SONDA/GUARDIANO «LIVELLO N/3 SU UNA RIGA».
   A 360 px, Ufficio → Staff privato, «Preparatore atletico · Livello 3/3»: «Livello» restava sulla riga del nome e «3/3» scendeva da solo
   (foto 360-B-*-06-ufficio.png del collaudo). Si carica la carriera (salvataggio save-190), si apre l'Ufficio e si contano le righe
   (rettangoli del testo, Range) di ogni etichetta [data-cpm=staff24-livello], a 360 e 412 px.
   VERDE: ogni etichetta su una riga sola a entrambe le larghezze, nessuno scroll orizzontale. ROSSO: almeno un'etichetta su due righe a 360 px.
   Foto in out/livello-79-<braccio>-<larghezza>.png. Uso: node livello-79.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
async function misura(rosso, w) {
  const ctx = await b.newContext({ viewport: { width: w, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const s = JSON.parse(JSON.stringify(SAVE)); const p = s.player || s; p.perkTrainer = true; p.perkTrainerLv = 3;/* il caso della foto: preparatore al livello 3 */
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_LIV79 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(500);
  const go = await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(1500);
  const r = await page.evaluate(() => {
    const L = [...document.querySelectorAll('[data-cpm=staff24-livello]')].map(el => { const rg = document.createRange(); rg.selectNodeContents(el);
      const tops = [...new Set([...rg.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top)))];
      const riga = el.closest('[data-lv]'); return { testo: (riga && riga.querySelector('[data-cpm=staff24-titolo]') ? riga.querySelector('[data-cpm=staff24-titolo]').textContent : '') , righe: tops.length }; });
    const el = document.querySelector('[data-cpm=staff24-livello]'); if (el) el.scrollIntoView({ block: 'center' });
    return { L, scrollX: document.documentElement.scrollWidth - innerWidth };
  });
  await sleep(300); await page.screenshot({ path: new URL(`./out/livello-79-${rosso ? 'rosso' : 'verde'}-${w}.png`, import.meta.url).pathname }).catch(() => {});
  await ctx.close(); return { ...r, go, errori: errs };
}
const R = {}, g = [];
for (const [br, ro] of [['verde', false], ['rosso', true]]) for (const w of [360, 412]) {
  const m = await misura(ro, w); R[br + w] = m;
  console.log(`${br} ${w}px: goTab ${m.go} · etichette ${m.L.length} · righe ${m.L.map(x => x.testo + '=' + x.righe).join(' | ')} · scroll orizzontale ${m.scrollX} · errori ${m.errori.length}`);
}
await b.close(); srv.close();
for (const w of [360, 412]) { const v = R['verde' + w];
  if (!v.L.length) g.push(`verde ${w}: nessuna etichetta Livello (Ufficio non aperto?)`);
  if (v.L.some(x => x.righe !== 1)) g.push(`verde ${w}: «Livello N/3» su piu' righe in ${v.L.filter(x => x.righe !== 1).length}/${v.L.length}`);
  if (v.scrollX > 0) g.push(`verde ${w}: scroll orizzontale ${v.scrollX}`); if (v.errori.length) g.push(`verde ${w}: errori ${v.errori.join(' | ')}`); }
let cieco = false; if (!R.rosso360.L.some(x => x.righe > 1)) { cieco = true; console.log('⚠️ rosso: a 360 px nessuna etichetta va a capo (il difetto di prima non si vede)'); }
if (g.length) { console.log('❌ livello-79\n  · ' + g.join('\n  · ')); process.exit(1); }
if (cieco) process.exit(2);
console.log('✅ livello-79 verde («Livello N/3» su una riga a 360 e 412 px) e il rosso si vede a 360 px');
