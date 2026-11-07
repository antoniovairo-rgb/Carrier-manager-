/* [7.999.181 · PO 07/11 «Il puntino rosso sui pulsanti non mi fa impazzire» → «Lineetta oro sotto»] guardiano della barra in basso:
   sulla scheda attiva niente pallino del colore del club, una lineetta oro (#9c6a12) larga >= 14 px e alta 2-4 px SOTTO la scritta
   (telefono) o a SINISTRA (PC), con contrasto >= 3:1 sulla pillola chiara. Rosso __CPM_NO_PUNTINO181: torna il pallino 6x6 tondo. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
const FORMATI = [{ k: 't360', w: 360, h: 800, touch: true }, { k: 't412', w: 412, h: 915, touch: true }, { k: 'pc', w: 1440, h: 900, touch: false }];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const lum = (c) => { const v = c.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const cr = (a, c) => { const A = lum(a), B = lum(c); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };
let ok = true; const out = { verde: [], rosso: [] };
for (const rosso of [false, true]) for (const f of FORMATI) {
  const { ctx, page } = await apriBancoV2(b, port, f, { prep: '', errs: [] });
  if (!page) { console.log('✗ banco non aperto ' + f.k); ok = false; continue; }
  if (rosso) { /* lo stile della barra si scrive al montaggio di App: l'interruttore va acceso PRIMA del caricamento */
    await ctx.addInitScript(() => { window.__CPM_NO_PUNTINO181 = true; }); await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1000);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => {}); await sleep(900);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} }
  await page.evaluate(() => window.__CPM_CAREER.goTab('stagione')); await sleep(900);
  const m = await page.evaluate(() => { const bt = document.querySelector('.cpm-v2nav .cpm-nav-tabs button.cpm-tab-act'); if (!bt) return null;
    const a = getComputedStyle(bt, '::before'), d = bt.querySelector('div'), rb = bt.getBoundingClientRect(), rd = d.getBoundingClientRect();
    return { w: parseFloat(a.width), h: parseFloat(a.height), rad: a.borderRadius, bg: a.backgroundColor, order: a.order, pill: getComputedStyle(bt).backgroundColor, dir: getComputedStyle(bt).flexDirection, testo: d.textContent.trim() }; });
  const rgb = s => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  const c = m ? cr(rgb(m.bg), rgb(m.pill)) : 0;
  const linea = m && m.w >= 14 && m.h >= 2 && m.h <= 4 && c >= 3 && (m.dir === 'column' ? m.order === '2' : true);
  const pcLinea = m && f.k === 'pc' && m.w >= 2 && m.w <= 4 && m.h >= 14 && c >= 3;
  const giusto = f.k === 'pc' ? pcLinea : linea;
  console.log(`${rosso ? 'ROSSO' : 'VERDE'} ${f.k}: «${m && m.testo}» segno ${m && m.w}x${m && m.h} raggio ${m && m.rad} colore ${m && m.bg} su ${m && m.pill} contrasto ${c.toFixed(2)}:1 · ${giusto ? 'lineetta' : 'NON lineetta'}`);
  await page.screenshot({ path: `out/lineetta-181-${rosso ? 'rosso' : 'verde'}-${f.k}.png`, clip: f.k === 'pc' ? { x: 0, y: 0, width: 260, height: 500 } : { x: 0, y: f.h - 160, width: f.w, height: 160 } });
  (rosso ? out.rosso : out.verde).push(giusto); await ctx.close();
}
await b.close(); srv.close();
const vOK = out.verde.length === 3 && out.verde.every(Boolean), rOK = out.rosso.length === 3 && out.rosso.every(x => !x);
console.log(vOK ? '✅ verde: lineetta oro in 3 formati' : '❌ verde: manca la lineetta'); console.log(rOK ? '✅ rosso: torna il pallino (il guardiano lo vede)' : '❌ rosso cieco');
process.exit(vOK && rOK && ok ? 0 : 1);
