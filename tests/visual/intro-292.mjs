#!/usr/bin/env node
/* [PO-302 tappa 3 · pc-tablet-292 punto 5 «con Tab il fuoco non arriva a una scelta della punizione», instabile in tappa 1 e 2]
   CAUSA MISURATA (_p292b, 1 su 6 sul PC 1366): una scena forzata con intro (__CPM_FORCE_INTRO, il percorso delle sonde) armava DUE timer
   da 2,5 s sulla stessa intro — quello della forzatura verso hl_choose e l'avanzamento automatico dell'intro, che sui piazzati porta a
   hl_move. Se scadevano nello stesso giro vinceva l'ultimo: la punizione «in scelta» restava in hl_move, senza i tasti data-sp292.
   GUARDIANO DETERMINISTICO: la coincidenza si provoca apposta — la pagina resta occupata da 2,3 a 2,9 s dopo la forzatura, cosi' i due
   timer scadono nello stesso giro. Rigore (gi5) e punizione (gi13), 3 volte ciascuno: VERDE = sempre hl_choose con i tasti dei piazzati
   e il fuoco che col Tab ci arriva. ROSSO (CPM_PROVA_ROSSO=1 → __CPM_NO_INTRO292, i due timer di prima): almeno una scena finisce in hl_move. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriPartitaV2 } from './lib/partita-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const srv = await startServer(); const b = await launchBrowser(); const errs = [];
const { ctx, page } = await apriPartitaV2(b, srv.address().port, { k: 'pc', w: 1366, h: 768, touch: false }, { errs, rossi: ROSSO ? ['__CPM_NO_INTRO292'] : [] });
const esiti = [];
for (const gi of [5, 13]) for (let r = 0; r < 3; r++) {
  await page.evaluate(g => { window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2500; window.__CPM_FORCE_SIT(g, true);
    setTimeout(() => { const t = performance.now(); while (performance.now() - t < 600) {} }, 2300); }, gi);
  await sleep(4500);
  const st = await page.evaluate(() => ({ fase: window.__CPM_PHASE(), sp: document.querySelectorAll('[data-sp292]').length }));
  let fuoco = false; if (st.sp) for (let i = 0; i < 20 && !fuoco; i++) { await page.keyboard.press('Tab'); fuoco = await page.evaluate(() => { const a = document.activeElement; return !!(a && a.getAttribute && a.getAttribute('data-sp292') != null); }); }
  esiti.push({ gi, ...st, fuoco }); console.log(`  gi${gi} giro ${r + 1}: fase ${st.fase} · tasti dei piazzati ${st.sp} · fuoco col Tab ${fuoco}`);
  await page.mouse.click(3, 3); await sleep(400);
}
await ctx.close(); await b.close(); srv.close();
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 3).join(' | '));
let ok;
if (ROSSO) { ok = esiti.some(e => e.fase === 'hl_move'); console.log(ok ? 'ROSSO ATTESO OK: con i due timer di prima almeno una scena forzata resta in hl_move' : 'ROSSO NON RIUSCITO'); }
else { const ko = esiti.filter(e => e.fase !== 'hl_choose' || !e.sp || !e.fuoco); ok = !ko.length && !errs.length; console.log(ok ? `intro-292 VERDE: ${esiti.length}/${esiti.length} scene in hl_choose col fuoco sui piazzati` : `intro-292 ROSSO: ${ko.length} scene fuori scelta`); }
process.exit(ok ? 0 : 1);
