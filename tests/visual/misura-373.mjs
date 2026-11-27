#!/usr/bin/env node
/* [giro 373 · PO-462] SONDA (non guardiano) misura-373: l'intervista dopo la partita a 1366x768 (PC), 390x844 (telefono),
   820x1180 e 1180x820 (tablet). Per ogni misura: altezza del pannello, contenuto, e quante risposte stanno tutte dentro
   la parte visibile del pannello e dello schermo SENZA scorrere. Uso: node misura-373.mjs [--rosso] */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
export const IV = process.env.CPM_IV373 || 'lunga';
export const VISTE = [[1366, 768, 'pc'], [1366, 657, 'pc-browser'], [1280, 720, 'pc-720'], [390, 844, 'telefono'], [820, 1180, 'tablet'], [1180, 820, 'tablet-orizz']];
export async function misuraIntervista(b, port, [w, h, nome], rosso, foto) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G373A = 1;
    for (const k of ['cpm-v3']) localStorage.setItem(k, JSON.stringify(s)); localStorage.setItem('cpm-active', 'cpm-v3'); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&iv373=${IV}`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {}); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const ok = await page.evaluate(() => { try { return window.__CPM_CAREER.forceIv183((()=>{const v=new URLSearchParams(location.search).get('iv373');if(v!=='lunga')return +v||0;let bi=0,bl=-1;IV_FATTI183.forEach((q,i)=>{const l=(q.q||'').length+(q.a||[]).reduce((t,a)=>t+(a.txt||'').length,0);if(l>bl){bl=l;bi=i;}});return bi;})(), 'win'); } catch (e) { return 'err ' + e.message; } });
  await page.waitForSelector('[data-cpm="risposta24"]', { timeout: 15000 }).catch(() => {}); await sleep(1500);
  const m = await page.evaluate(() => {
    const v = document.querySelector('[data-cpm="intervista231"]'); if (!v) return null; const p = v.querySelector('.cpm-pan150'); if (!p) return null;
    const rp = p.getBoundingClientRect(); const ris = [...p.querySelectorAll('[data-cpm="risposta24"]')].map(x => x.getBoundingClientRect());
    const vis = ris.filter(r => r.top >= rp.top - 0.5 && r.bottom <= rp.bottom + 0.5 && r.bottom <= innerHeight + 0.5 && r.top >= -0.5).length;
    return { pannello: [Math.round(rp.top), Math.round(rp.bottom)], alto: Math.round(rp.height), contenuto: p.scrollHeight, visibile: p.clientHeight,
      scorre: p.scrollHeight - p.clientHeight > 1, risposte: ris.length, visibili: vis, ultimaFondo: ris.length ? Math.round(ris[ris.length - 1].bottom) : null,
      schermo: innerHeight, largo: Math.round(rp.width), scena: v.className.indexOf('cpm-scena150') >= 0 };
  });
  if (foto) await page.screenshot({ path: new URL(`./out/intervista-373-${nome}${rosso ? '-rosso' : ''}.png`, import.meta.url).pathname }).catch(() => {});
  await ctx.close(); return { vista: nome, w, h, ok, ...(m || { manca: true }) };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const rosso = process.argv.includes('--rosso'); const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  for (const v of VISTE) console.log(JSON.stringify(await misuraIntervista(b, port, v, rosso, true)));
  await b.close(); srv.close();
}
