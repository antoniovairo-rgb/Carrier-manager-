#!/usr/bin/env node
/* [giro 23 PO-247, questionario 15/10 «Dopo l'intervista»] GUARDIANO: l'avviso dei premi non compare durante l'intervista, ma subito
   dopo. Il giro 19 lo spostava in alto (toast-247): non copriva piu' le risposte ma copriva la riga del punteggio. Ora la coda dei
   toast si ferma con l'intervista aperta (src/18 _drainNotif) e riparte alla chiusura.
   Telefono 412x915: intervista aperta (forceInterview), un avviso dei premi (notify247), campioni per 3 s con l'intervista a schermo;
   poi due risposte e «Chiudi», campioni per 6 s.
   VERDE: 0 campioni con toast durante l'intervista e il toast compare dopo la chiusura con il testo dei premi.
   ROSSO (__CPM_NO_IV247): toast visibile durante l'intervista. Uso: node toast-intervista-247.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_IV247 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(4500);/* i toast d'avvio della carriera si esauriscono prima della misura */
  await page.evaluate(() => window.__CPM_CAREER.forceInterview('win')); await sleep(1500);
  await page.evaluate(() => window.__CPM_CAREER.notify247());
  const stato = () => page.evaluate(() => { const iv = document.querySelector('[data-cpm="intervista231"]'); const t = document.querySelector('[data-cpm="toast23"]'); return { iv: !!iv, toast: t ? t.textContent : null }; });
  const out = { rosso, durante: 0, campioniIv: 0, dopo: null };
  for (let i = 0; i < 10; i++) { await sleep(300); const s = await stato(); if (s.iv) { out.campioniIv++; if (s.toast) out.durante++; } }
  for (let k = 0; k < 4; k++) { const ch = await page.evaluate(() => { const iv = document.querySelector('[data-cpm="intervista231"]'); if (!iv) return 'chiusa';
      const bs = [...iv.querySelectorAll('button')].filter(x => x.offsetParent !== null); const c = bs.find(x => /^\s*Chiudi\s*$/.test(x.textContent || '')); if (c) { c.click(); return 'chiudi'; } if (bs[0]) { bs[0].click(); return 'risposta'; } return 'nessuno'; });
    if (ch === 'chiusa') break; await sleep(900); }
  out.chiusa = !(await stato()).iv;
  for (let i = 0; i < 20; i++) { await sleep(300); const s = await stato(); if (!s.iv && s.toast && /\+3/.test(s.toast)) { out.dopo = s.toast.trim(); break; } }
  await page.screenshot({ path: new URL('./out/toast-intervista-247' + (rosso ? '-rosso' : '') + '.png', import.meta.url).pathname }).catch(() => {});
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const V = await giro(false), R = await giro(true);
console.log('VERDE ' + JSON.stringify(V)); console.log('ROSSO ' + JSON.stringify(R));
await b.close(); srv.close();
const g = [];
if (!(V.campioniIv >= 5)) g.push('verde: intervista non misurata ' + JSON.stringify(V));
if (V.durante > 0) g.push('verde: toast visibile durante l\'intervista (' + V.durante + ' campioni)');
if (!V.chiusa || !V.dopo) g.push('verde: il toast dei premi non compare dopo la chiusura ' + JSON.stringify(V));
if (V.errori.length) g.push('verde: errori di pagina ' + V.errori.join(' | '));
if (!(R.durante > 0)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ toast-intervista-247'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ toast-intervista-247 verde (premi dopo l\'intervista) e il rosso si vede');
