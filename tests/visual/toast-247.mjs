#!/usr/bin/env node
/* [giro 19 PO-247, collaudo 164 N4] GUARDIANO: l'avviso dei punti («💪 +3 ⚡+14 ⭐+12») non copre le risposte dell'intervista.
   Il toast stava in basso, sopra la barra (src/11 Notif), proprio dove l'intervista mette i bottoni delle risposte.
   Telefono 412x915: intervista aperta (forceInterview), poi un avviso; misura l'intersezione fra il rettangolo del toast e quelli
   dei bottoni dell'intervista. VERDE: 0 px² di sovrapposizione. ROSSO (__CPM_NO_TOAST247): il toast torna in basso e copre.
   Uso: node toast-247.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_NO_IV247 = 1;/* [giro 23] dal giro 23 il toast non compare proprio durante l'intervista (toast-intervista-247): qui si collauda il collocamento del giro 19, che resta come ripiego */ if (o.r) window.__CPM_NO_TOAST247 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.forceInterview('win')); await sleep(2500);
  await page.evaluate(() => window.__CPM_CAREER.notify247()); await sleep(900);
  const r = await page.evaluate(() => { const iv = document.querySelector('[data-cpm="intervista231"]'); const t = document.querySelector('[data-cpm="toast23"]');
    if (!iv || !t) return { iv: !!iv, toast: !!t };
    const T = t.getBoundingClientRect(); const bs = [...iv.querySelectorAll('button')].map(x => x.getBoundingClientRect()).filter(x => x.width > 0);
    let ov = 0; for (const B of bs) { const w = Math.min(T.right, B.right) - Math.max(T.left, B.left), h = Math.min(T.bottom, B.bottom) - Math.max(T.top, B.top); if (w > 0 && h > 0) ov += w * h; }
    return { iv: true, toast: true, bottoni: bs.length, ov: Math.round(ov), toastY: [Math.round(T.top), Math.round(T.bottom)] }; });
  await page.screenshot({ path: new URL('./out/toast-247' + (rosso ? '-rosso' : '') + '.png', import.meta.url).pathname }).catch(() => {});
  await page.close(); return r;
}
const V = await giro(false), R = await giro(true);
console.log('VERDE ' + JSON.stringify(V)); console.log('ROSSO ' + JSON.stringify(R));
await b.close(); srv.close();
const g = [];
if (!V.iv || !V.toast || !(V.bottoni >= 3)) g.push('verde: intervista o toast non misurati ' + JSON.stringify(V));
else if (V.ov > 0) g.push('verde: il toast copre le risposte (' + V.ov + ' px²)');
if (!(R.ov > 0)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ toast-247'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ toast-247 verde (il toast non copre le risposte) e il rosso si vede');
