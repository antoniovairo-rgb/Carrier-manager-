#!/usr/bin/env node
/* [7.999.13] GUARDIANO — IL PANNELLO STATISTICHE/PAGELLE STA FERMO (collaudo PO «si muove in base alla lunghezza del testo della cronaca»).
   Un minuto e mezzo di partita 2D: si campiona la posizione della linguetta (data-cpm=linguette918) e dei riquadri di cronaca e panchina.
   Verde: la linguetta non si sposta mai (<= 1 px) e la cronaca non le finisce mai sopra. CPM_ROSSO=1 → __CPM_NO_FERMO13. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_FERMO13 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Fermo13' });
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 13, policy: 'seeded', tickMs: 300 }));
const pos = [], sovr = []; let maxRighe = 0; const t0 = Date.now();
while (Date.now() - t0 < 90000) { await sleep(400);
  const f = await page.evaluate(() => { const l = document.querySelector('[data-cpm="linguette918"]'); if (!l) return null; const lb = l.getBoundingClientRect();
    let sopra = 0, h = 0; for (const k of ['com661', 'voci']) { const n = document.querySelector('[data-cpm="' + k + '"]'); if (!n) continue; const b = n.getBoundingClientRect(); if (!b.height) continue; h = Math.max(h, b.height); if (b.top < lb.bottom - 1 && b.bottom > lb.top) sopra = Math.max(sopra, lb.bottom - b.top); }
    return { top: Math.round(lb.top), sopra: Math.round(sopra), h: Math.round(h) }; });
  if (f) { pos.push(f.top); if (f.sopra > 0) sovr.push(f.sopra); maxRighe = Math.max(maxRighe, f.h); } }
await b.close(); srv.close();
const escursione = pos.length ? Math.max(...pos) - Math.min(...pos) : null;
console.log(`campioni ${pos.length} · escursione della linguetta ${escursione} px · cronaca piu' alta ${maxRighe} px · sovrapposizioni ${sovr.length}${sovr.length ? ' (max ' + Math.max(...sovr) + ' px)' : ''}`);
const fails = [];
if (pos.length < 30) fails.push('sonda cieca: pannello non trovato');
else { if (escursione > 1) fails.push(`la linguetta si sposta di ${escursione} px`); if (sovr.length) fails.push(`la cronaca finisce sopra la linguetta ${sovr.length} volte`); }
if (ROSSO) { console.log(fails.some(f => /si sposta|sopra/.test(f)) ? '✅ ROSSO come atteso: senza il 7.999.13 il pannello si muove' : '❌ il rosso non riproduce il difetto in questa partita (serve una voce lunga)'); process.exit(0); }
console.log(fails.length ? '❌ FAIL pannello-fermo\n  ' + fails.join('\n  ') : '✅ PASS pannello-fermo'); process.exit(fails.length ? 1 : 0);
