#!/usr/bin/env node
/* [ARCHIVIATO giro 25, PO-254] Sostituito da tests/visual/crediti-254.mjs, che ne tiene i controlli di struttura. Gira solo con CPM_ROSSO=__CPM_NO_CREDITI254 (contenuto PO-238). Per rieseguirlo, riportarlo in tests/visual/ con git mv (vedi README). */
/* [PO-238 guardiano] «Nella home Page del gioco, non in carriera aggiungi una sezione crediti per elencare le risorse utilizzate».
   Carica il gioco su pagina pulita (home, nessuna carriera), a 360 e 412 px:
   - la voce «Crediti» c'e' nella home ([data-cpm=crediti238-voce-home]);
   - un click apre la finestra standard (Modal del kit: [data-cpm=crediti238] + pannello con testa/corpo/piede);
   - la finestra contiene le cinque sezioni attese, almeno una voce per sezione, e dichiara le voci «fonte da completare»;
   - niente scorrimento orizzontale; «Chiudi» la richiude.
   Foto: out/crediti-238/crediti-<larghezza>.png (+ -fondo: finestra scorsa fino in fondo).
   ROSSO: CPM_ROSSO=__CPM_NO_CREDITI238 → la voce sparisce, il guardiano deve uscire 1. */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO || '';
const SEZ = ['Modelli 3D e animazioni', 'Librerie software', 'Illustrazioni e immagini', 'Caratteri', 'Suoni'];
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'crediti-238'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let ko = [];
for (const w of [360, 412]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  if (ROSSO) await page.addInitScript(r => { String(r).split(',').forEach(k => { window[k.trim()] = 1; }); }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera/.test(x.textContent || '')), null, { timeout: 60000 }).catch(() => {});
  await sleep(600);
  const voce = await page.$('[data-cpm="crediti238-voce-home"]');
  if (!voce) { ko.push(`${w}px: voce «Crediti» assente nella home`); await ctx.close(); continue; }
  await voce.scrollIntoViewIfNeeded(); await voce.click(); await sleep(500);
  const r = await page.evaluate(() => { const m = document.querySelector('[data-cpm="crediti238"]'), p = document.querySelector('[data-cpm="crediti238-pannello"]');
    const sez = [...document.querySelectorAll('[data-cpm="crediti238-sez"]')].map(s => ({ t: (s.firstChild && s.firstChild.textContent) || '', n: s.querySelectorAll('[data-cpm="crediti238-voce"]').length }));
    return { modal: !!m, testa: !!(p && p.querySelector('[data-cpm="finestra-testa"]')), piede: !!(p && p.querySelector('[data-cpm="finestra-piede"]')), titolo: (p && p.querySelector('[data-cpm="finestra-titolo"]') || {}).textContent || '',
      sez, manca: document.querySelectorAll('[data-cpm="crediti238-manca"]').length, oriz: document.documentElement.scrollWidth - window.innerWidth, pOriz: p ? p.scrollWidth - p.clientWidth : 0 }; });
  await page.screenshot({ path: path.join(OUT, `crediti-${w}.png`) });
  await page.evaluate(() => { const p = document.querySelector('[data-cpm="crediti238-pannello"]'); if (p) p.scrollTop = p.scrollHeight; }); await sleep(200);
  await page.screenshot({ path: path.join(OUT, `crediti-${w}-fondo.png`) });
  const titoli = r.sez.map(s => s.t);
  const mancanti = SEZ.filter(s => !titoli.some(t => t.toLowerCase() === s.toLowerCase()));
  if (!r.modal || !r.testa || !r.piede || r.titolo !== 'Crediti') ko.push(`${w}px: la finestra non e' il Modal standard (${JSON.stringify({ modal: r.modal, testa: r.testa, piede: r.piede, titolo: r.titolo })})`);
  if (mancanti.length) ko.push(`${w}px: sezioni mancanti ${mancanti.join(', ')}`);
  if (r.sez.some(s => s.n < 1)) ko.push(`${w}px: sezione vuota`);
  if (r.manca < 1) ko.push(`${w}px: nessuna voce «fonte da completare» dichiarata`);
  if (r.oriz > 1 || r.pOriz > 1) ko.push(`${w}px: scorrimento orizzontale (${r.oriz}/${r.pOriz} px)`);
  const chiudi = await page.$('[data-cpm="crediti238-pannello"] [data-cpm="finestra-piede"] button'); if (chiudi) { await chiudi.click(); await sleep(300); }
  const aperta = await page.$('[data-cpm="crediti238"]'); if (aperta) ko.push(`${w}px: «Chiudi» non chiude`);
  if (errs.length) ko.push(`${w}px: pageerror ${errs[0]}`);
  console.log(`  ${w}px: sezioni ${r.sez.map(s => s.t + ' ' + s.n).join(' · ')} · da completare ${r.manca} · orizz ${r.oriz}/${r.pOriz}`);
  await ctx.close();
}
await b.close(); srv.close();
console.log(`PO-238 crediti · ${ROSSO ? 'ROSSO ' + ROSSO : 'verde'}`);
if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
console.log('✅ VERDE — Crediti nella home, finestra standard, cinque sezioni'); process.exit(0);
