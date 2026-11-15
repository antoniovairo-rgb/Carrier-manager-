#!/usr/bin/env node
/* [giro 213 · PO-475] FOTO prima/dopo del riscontro al tocco (non giudica). Telefono 375x667 dpr 2, tocco vero via CDP TENUTO
   (touchStart senza touchEnd) → foto del tasto premuto; poi la rotellina: sul tasto «Simula e avanza la settimana» (data-pesante213)
   la sonda sostituisce el.click con una funzione vuota e arma __CPM_FOTO213 (solo sotto ?cpmtest=1), cosi' l'azione non parte e la
   rotellina resta il tempo della foto — e' l'unico artificio, dichiarato: nel gioco l'azione parte dopo il fotogramma e la rotellina sparisce con lei.
   Uso: node foto-213.mjs [--rosso]  → docs/sviluppo/giro213/{prima|dopo}-*.png */
import path from 'node:path';
import { ROOT, sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.argv.includes('--rosso'); const pref = ROSSO ? 'prima' : 'dopo';
const DIR = path.join(ROOT, 'docs', 'sviluppo', 'giro213');
const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, init: ROSSO ? { __CPM_NO_G213: 1 } : {} });
const p = A.page; const cdp = await A.ctx.newCDPSession(p);
const centro = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: { x: Math.max(0, r.left - 24), y: Math.max(0, r.top - 24), width: Math.min(375, r.width + 48), height: r.height + 48 } }; }, sel);
async function tenuto(sel, nome) {
  const c = await centro(sel); if (!c) { console.log('  ! ' + sel + ' assente'); return; }
  await p.screenshot({ path: path.join(DIR, `${pref}-${nome}-riposo.png`), clip: c.r });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(250);
  await p.screenshot({ path: path.join(DIR, `${pref}-${nome}-premuto.png`), clip: c.r });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await sleep(400);
  console.log('  foto ' + nome);
}
try {
  await tenuto('[data-cpm="avanza23"]', 'vivi-settimana');
  await tenuto('[data-cpm="salta163-tasto"]', 'vai-al-momento');
  await apriPrompt166(p);
  await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Simula/.test((x.textContent || '').trim())); if (b) { b.setAttribute('data-foto213', ''); b.click = () => {}; } window.__CPM_FOTO213 = 1; });
  await tenuto('[data-foto213]', 'simula');
  const c = await centro('[data-foto213]');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(60);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(450);
  await p.screenshot({ path: path.join(DIR, `${pref}-simula-dopo-il-tocco-450ms.png`), clip: c.r });
  console.log('  rotellina: ' + await p.evaluate(() => !!document.querySelector('.cpm-rotella213')));
} catch (e) { console.log('  ! ' + e.message); }
await A.b.close(); A.srv.close();
