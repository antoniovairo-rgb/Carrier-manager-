#!/usr/bin/env node
/* [giro 195 — collaudo] SOLO MISURA. Accessibilita' sulle schede di carriera a 375x667:
   Z  testo ingrandito SIMULATO (ogni corpo x1,3 e x1,6 via script: NON e' lo zoom testo di Android): overflow di pagina,
      testi tagliati, bersagli che escono dallo schermo;
   D  foto con vista simulata da Chromium (deuteranopia, protanopia, acromatopsia);
   L  albero di accessibilita' (CDP): ruoli, nodi con nome, bottoni senza nome, titoli;
   M  animazioni in corso con e senza «riduci animazioni». */
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, entraCarriera, MISURA } from './giro195-schermate.mjs';
const OUT = path.join(ROOT, 'docs', 'collaudo', 'giro195', 'accessibilita');
const DUMP = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const { ctx, page } = await apri(b, 375, 667, { ls: DUMP }); await entraCarriera(page, port);
const cdp = await ctx.newCDPSession(page); const SCH = ['dashboard', 'standings', 'calendar', 'club', 'profile', 'agente', 'ufficio']; const R = { Z: {}, L: {}, M: {} };
const ZOOM = (k) => { document.querySelectorAll('body *').forEach(el => { if (el.__fs0 == null) el.__fs0 = parseFloat(getComputedStyle(el).fontSize); }); document.querySelectorAll('body *').forEach(el => { if (el.__fs0) el.style.fontSize = (el.__fs0 * k) + 'px'; }); };
const DOPO = () => { const VW = innerWidth; const de = document.documentElement; let fuori = 0; const es = []; for (const el of document.querySelectorAll('button')) { const r = el.getBoundingClientRect(); if (r.width > 1 && (r.right > VW + 1 || r.left < -1)) { fuori++; if (es.length < 4) es.push((el.innerText || '').replace(/\s+/g, ' ').slice(0, 30) + ' →' + Math.round(r.right)); } } return { overflow: de.scrollWidth - de.clientWidth, bottoniFuori: fuori, es }; };
for (const t of SCH) { await page.evaluate(x => window.__CPM_CAREER.goTab(x), t); await sleep(800);
  const ax = await cdp.send('Accessibility.getFullAXTree'); const ruoli = {}; let senza = 0, btn = 0, titoli = 0, statici = 0; for (const n of ax.nodes) { if (n.ignored) continue; const r = n.role && n.role.value; ruoli[r] = (ruoli[r] || 0) + 1; if (r === 'button') { btn++; if (!(n.name && n.name.value && n.name.value.trim())) senza++; } if (r === 'heading') titoli++; if (r === 'StaticText') statici++; }
  R.L[t] = { bottoni: btn, bottoniSenzaNome: senza, titoli, testi: statici, ruoli: Object.fromEntries(Object.entries(ruoli).sort((a, b) => b[1] - a[1]).slice(0, 9)) };
  if (['dashboard', 'standings', 'calendar'].includes(t)) for (const v of ['deuteranopia', 'protanopia', 'achromatopsia']) { await cdp.send('Emulation.setEmulatedVisionDeficiency', { type: v }); await sleep(250); await page.screenshot({ path: path.join(OUT, `${v}-${t}.png`) }); await cdp.send('Emulation.setEmulatedVisionDeficiency', { type: 'none' }); }
  const m0 = await page.evaluate(MISURA); R.Z[t] = { base: { tagliati: m0.C.n, schermi: m0.S.schermi } };
  for (const k of [1.3, 1.6]) { await page.evaluate(ZOOM, k); await sleep(400); const m = await page.evaluate(MISURA); const d = await page.evaluate(DOPO); R.Z[t]['x' + k] = { ...d, tagliati: m.C.n, tagliatiEs: m.C.elenco.slice(0, 5).map(x => x.testo.slice(0, 28) + ' −' + x.mancano), schermi: m.S.schermi, vicini: m.V.n }; if (['dashboard', 'standings', 'agente'].includes(t)) await page.screenshot({ path: path.join(OUT, `zoom${k}-${t}.png`) }); }
  await page.evaluate(() => document.querySelectorAll('body *').forEach(el => { if (el.__fs0 != null) el.style.fontSize = ''; }));
  R.M[t] = { animazioni: await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length) }; }
await page.emulateMedia({ reducedMotion: 'reduce' }); await sleep(500);
for (const t of SCH) { await page.evaluate(x => window.__CPM_CAREER.goTab(x), t); await sleep(600); R.M[t].conRiduci = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length); }
R.meta = await page.evaluate(() => ({ viewport: document.querySelector('meta[name=viewport]').content, lang: document.documentElement.lang, title: document.title }));
fs.writeFileSync(path.join(OUT, 'accessibilita.json'), JSON.stringify(R, null, 1));
for (const t of SCH) console.log(t, 'Z', JSON.stringify(R.Z[t]).slice(0, 700), '\n   L', JSON.stringify(R.L[t]), 'M', JSON.stringify(R.M[t]));
console.log(JSON.stringify(R.meta)); await ctx.close(); await b.close(); srv.close();
