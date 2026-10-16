#!/usr/bin/env node
/* [giro 46 PO-071 fase 3 — strumento di collaudo, NON guardiano] L'INGRESSO IN CAMPO nelle tipologie di stadio: percorso vero
   (salvataggio → partita → walkout, come ingresso-245) con template e capienza forzati. Fotografa l'ingresso a intervalli e legge
   la quota della camera d'orbita (__CPM_CAMING246, armato da __CPM_REC) e il tunnel costruito (__CPM_STADI246.tunnel).
   Braccio rosso (__CPM_NO_STADI246) per il confronto. Foto in out/stadi-071-ingresso/. Uso: [CPM_CASI=borgo:3000,arena:60000] node stadi-071-ingresso.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, __dirname } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const CASI = (process.env.CPM_CASI || 'borgo:3000,arena:60000').split(',');
const OUT = path.join(__dirname, '..', 'out', 'stadi-071-ingresso'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(tpl, cap, rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TOD = 'night'; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_REC = 1;
    window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; if (o.r) window.__CPM_NO_STADI246 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso, tpl, cap });
  const out = { tpl, cap, rosso, foto: [], cam: [] };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 60; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(900); }
    out.walk = (await ph()) === 'walkout';
    out.tunnel = await page.evaluate(() => (window.__CPM_STADI246 || {}).tunnel || null);
    await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }).catch(() => {});
    for (let i = 0; i < 6 && (await ph()) === 'walkout'; i++) {
      await sleep(i ? 7000 : 2500);
      const f = path.join(OUT, `${tpl}-${cap}-${rosso ? 'oggi' : 'nuovo'}-${i}.png`);
      await page.screenshot({ path: f }); out.foto.push(path.basename(f));
      out.cam.push(await page.evaluate(() => window.__CPM_CAMING246 || null));
    }
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await ctx.close(); return out;
}
for (const c of CASI) { const [t, cap] = c.split(':');
  for (const r of [false, true]) { const o = await giro(t, +cap, r);
    console.log(`${c} ${r ? 'oggi ' : 'nuovo'} — walkout ${o.walk} · tunnel ${o.tunnel ? o.tunnel.stile + ' L' + o.tunnel.L : 'no'} · quote camera ${o.cam.map(x => x ? x.y : '-').join(' ')} · foto ${o.foto.length} · errori ${o.errori.length}${o.errore ? ' · ' + o.errore : ''}`); } }
await b.close(); srv.close();
