#!/usr/bin/env node
/* [giro 26 PO-256, collaudo 169 D3] GUARDIANO: un toast non copre mai un Modal aperto, aspetta la sua chiusura.
   Caso del collaudo: «Il confronto» col procuratore (Modal non chiudibile) aperto e l'avviso «L'investimento immobiliare rende…».
   412x915 e 360x800: apre il confronto (patch agentCheckin.due), accoda il toast, misura l'intersezione fra il toast e il pannello
   del Modal; poi chiude il confronto e verifica che il toast compaia DOPO (aspetta, non si perde).
   VERDE: 0 px² con il Modal aperto e toast visibile dopo la chiusura. ROSSO (__CPM_NO_TOAST256): il toast copre il Modal.
   Foto prima (rosso) e dopo (verde) in docs/sviluppo/foto-giro26/. Uso: node toast-256.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FOTO = new URL('../../docs/sviluppo/foto-giro26/', import.meta.url).pathname; fs.mkdirSync(FOTO, { recursive: true });
const MSG = "🏠 L'investimento immobiliare rende: +55.000€ sul conto!";
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso, w, h) {
  const page = await b.newPage({ viewport: { width: w, height: h } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_TOAST256 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.patch({ agentCheckin: { due: true, s: 12, w: 21 } })); await sleep(1500);
  await page.evaluate(m => window.__CPM_CAREER.notify247(m), MSG); await sleep(900);
  const misura = () => page.evaluate(() => { const c = document.querySelector('[data-cpm="confronto23"]'); const t = document.querySelector('[data-cpm="toast23"]');
    let pan = c; while (pan && pan.parentElement && !(pan.className || '').toString().includes('cpm-rise')) pan = pan.parentElement;
    const out = { modale: !!c, toast: !!t, testo: t ? t.innerText.trim() : null };
    if (c && t) { const T = t.getBoundingClientRect(), P = (pan || c).getBoundingClientRect();
      const bs = [...c.querySelectorAll('button')].map(x => x.getBoundingClientRect()).filter(x => x.width > 0);
      const inter = (A, B) => { const ww = Math.min(A.right, B.right) - Math.max(A.left, B.left), hh = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top); return ww > 0 && hh > 0 ? ww * hh : 0; };
      out.ovPannello = Math.round(inter(T, P)); out.ovRisposte = Math.round(bs.reduce((s, B) => s + inter(T, B), 0)); out.risposte = bs.length; }
    return out; });
  const aperto = await misura();
  await page.screenshot({ path: `${FOTO}toast-${w}-${rosso ? 'prima' : 'dopo'}.png` }).catch(() => {});
  await page.evaluate(() => window.__CPM_CAREER.patch({ agentCheckin: { due: false, s: 12, w: 21 } }));
  let dopo = null; for (let i = 0; i < 20; i++) { await sleep(150); dopo = await page.evaluate(() => { const t = document.querySelector('[data-cpm="toast23"]'); return { modale: !!document.querySelector('[data-cpm="confronto23"]'), toast: !!t, testo: t ? t.innerText.trim() : null }; }); if (dopo.toast && !dopo.modale) break; }
  if (!rosso) await page.screenshot({ path: `${FOTO}toast-${w}-dopo-chiusura.png` }).catch(() => {});
  await page.close(); return { aperto, dopo };
}
const g = [];
for (const [w, h] of [[412, 915], [360, 800]]) {
  const V = await giro(false, w, h), R = await giro(true, w, h);
  console.log(`${w}px VERDE ${JSON.stringify(V)}`); console.log(`${w}px ROSSO ${JSON.stringify(R)}`);
  if (!V.aperto.modale) g.push(`${w} verde: il confronto non si è aperto`);
  else if (V.aperto.toast) g.push(`${w} verde: toast visibile col Modal aperto (pannello ${V.aperto.ovPannello} px², risposte ${V.aperto.ovRisposte} px²)`);
  if (!(V.dopo && V.dopo.toast && !V.dopo.modale && /investimento/.test(V.dopo.testo || ''))) g.push(`${w} verde: il toast non compare dopo la chiusura ${JSON.stringify(V.dopo)}`);
  if (!(R.aperto.modale && R.aperto.toast && R.aperto.ovPannello > 0)) g.push(`${w} rosso: il difetto non si vede ${JSON.stringify(R.aperto)}`);
}
await b.close(); srv.close();
if (g.length) { console.log('❌ toast-256'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ toast-256 verde (il toast aspetta la chiusura del Modal e poi compare) e il rosso si vede (copre il Modal)');
