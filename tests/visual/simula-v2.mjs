#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 2 · decisione PO 02/11] GUARDIANO «SIMULA ACCANTO A GIOCA».
   A settimana vissuta: il tasto Simula del riquadro della prossima partita apre LO STESSO prompt della partita (decisione del
   mister) con la scelta Simula gia' fatta — niente «Gioca», il tasto di conferma e' Simula — e confermando la settimana avanza.
   A settimana non vissuta: Simula e' spento e dice il motivo.
   CON [tappa 4]: a settimana vissuta il testo del tasto Simula acceso ha contrasto WCAG >= 4,5:1 (3:1 sui testi grandi), lib/misura-v2.mjs.
   ROSSO [tappa 4] (CPM_PROVA_ROSSO=1): token alterati dal banco di prova (lib/tema-prova.mjs, notte sbiadita a basso contrasto) → cade CON.
   Fino alla tappa 3 il rosso era __CPM_NO_V2 (il tasto spariva con la grafica della 178): tolto col tema unico. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
import { MISURA } from './lib/misura-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const f = { k: 'tel', w: 412, h: 915, touch: true };
const srv = await startServer(); const b = await launchBrowser(); const ko = [], errs = [];
const statoSim = (page) => page.evaluate(() => { const x = document.querySelector('[data-cpm="simula-v2"]'); if (!x) return null; const r = x.getBoundingClientRect();
  const m = x.querySelector('[data-cpm="simula-motivo"]'); return { dis: x.disabled, motivo: m ? m.textContent.trim() : '', w: r.width, h: r.height }; });
/* 1) settimana non vissuta */
{ const { ctx, page } = await apriBancoV2(b, srv.address().port, f, { rosso: ROSSO, errs, prep: 'p.weekLived=false;' });
  const s = await statoSim(page);
  if (!s) ko.push('A: manca il tasto Simula'); else { if (!s.dis || !/vivi la settimana/.test(s.motivo)) ko.push('A: Simula non spento col motivo (' + s.motivo + ')'); if (s.h < 44 || s.w < 44) ko.push('A: tasto ' + Math.round(s.w) + 'x' + Math.round(s.h)); }
  console.log('  A settimana da vivere: ' + JSON.stringify(s)); await ctx.close(); }
/* 2) settimana vissuta: Simula apre il prompt con la scelta fatta */
{ const { ctx, page } = await apriBancoV2(b, srv.address().port, f, { rosso: ROSSO, errs, prep: 'p.weekLived=true;p.injured=false;p.isSuspended=false;' });
  const s = await statoSim(page); const w0 = await page.evaluate(() => document.querySelector('[data-cpm="testata-v2"]')?.textContent || '');
  if (!s) ko.push('B: manca il tasto Simula');
  else if (s.dis) ko.push('B: Simula spento a settimana vissuta (' + s.motivo + ')');
  else {
    const mc = await page.evaluate(MISURA, '[data-cpm="simula-v2"]'); console.log(`  B contrasto del tasto Simula: min ${mc.min} su ${mc.n} testi`);
    if (!mc.n) ko.push('B CON: nessun testo misurato nel tasto Simula'); else if (mc.peggiori.length) ko.push('B CON: ' + mc.peggiori.slice(0, 3).join(' | '));
    await page.click('[data-cpm="simula-v2"]'); await sleep(1200);
    const p = await page.evaluate(() => { const m = document.querySelector('[data-cpm="partita23"]'); if (!m) return null;
      return { scelta: !!m.querySelector('[data-cpm="simula-scelta"]'), gioca: [...m.querySelectorAll('button')].some(x => /^Gioca/.test((x.textContent || '').trim())), conf: !!m.querySelector('[data-cpm="simula-conferma"]'),
        mister: /titolare|panchina|convocato/i.test(m.textContent) }; });
    console.log('  B prompt: ' + JSON.stringify(p));
    if (!p) ko.push('B: Simula non apre il prompt della partita'); else { if (!p.scelta || p.gioca || !p.conf) ko.push('B: prompt senza la scelta Simula fatta ' + JSON.stringify(p)); if (!p.mister) ko.push('B: manca la decisione del mister'); }
    if (p) { await page.click('[data-cpm="simula-conferma"]'); await sleep(2500);
      const w1 = await page.evaluate(() => document.querySelector('[data-cpm="testata-v2"]')?.textContent || '');
      const sett = t => (t.match(/Sett\.\s*(\d+)/) || [])[1];
      console.log(`  B settimana ${sett(w0)} -> ${sett(w1)}`); if (!(+sett(w1) > +sett(w0))) ko.push('B: la conferma non ha avanzato la settimana'); }
  }
  await ctx.close(); }
await b.close(); srv.close();
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 3).join(' | '));
let ok;
if (ROSSO) { ok = ko.some(x => /^B CON: .*:1/.test(x)); console.log(ok ? 'ROSSO ATTESO OK: col tema di prova a basso contrasto cade CON sul tasto Simula' : 'ROSSO NON RIUSCITO: ' + ko.join(' | ')); }
else { ko.forEach(x => console.log('  ✗ ' + x)); ok = !ko.length && !errs.length; console.log(ok ? 'simula-v2 VERDE' : 'simula-v2 ROSSO'); }
process.exit(ok ? 0 : 1);
