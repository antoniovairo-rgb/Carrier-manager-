#!/usr/bin/env node
/* [7.999.99 GUARDIANO rilievo Codex 27-B] Partita del provino «Rilievi23», autoplay seme 974734 a 2x (il caso di Codex: 4 punizioni
   dell'eroe, 3 schede di punizione diretta nel catalogo). Verde se OGNI piazzato dell'eroe (testimone __CPM_PIAZ99) ha trovato
   almeno una scheda candidata e ogni scena aperta subito dopo e' davvero un piazzato (intento freekick o rigore). Se la partita non
   produce almeno 4 piazzati il guardiano si dichiara CIECO ed esce != 0. CPM_RED=1 → __CPM_NO_PIAZ99: alla quarta punizione il catalogo
   e' vuoto (candidate 0) → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, matchPhase, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1', SEED = +(process.env.CPM_SEED || 974734), NAME = process.env.CPM_NAME || 'Rilievi23';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 360, height: 640 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_PIAZ99 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, RED);
await openMatch(page, port, { skipLoadAll: true, name: NAME });
await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEED);
const scene = []; let ultimo = -1; const t0 = Date.now();
while (Date.now() - t0 < 330000) {
  const ph = await matchPhase(page).catch(() => null); if (ph === 'ended' || ph === 'ceremony') break;
  const r = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if (!ph || !ph.startsWith('hl_')) return null; const s = window.__CPM_CURSIT && window.__CPM_CURSIT(); return s ? { i: s.i, t: s.t, intent: s.intent, nP: (window.__CPM_PIAZ99 || []).length } : null; }).catch(() => null);
  if (r && r.i !== ultimo) { ultimo = r.i; scene.push(r); }
  await sleep(250);
}
const P = await page.evaluate(() => window.__CPM_PIAZ99 || []).catch(() => []);
await b.close(); srv.close();
/* la scena aperta per l'i-esimo piazzato e' la prima scena registrata dopo che il testimone ha contato i+1 piazzati */
const aperte = P.map((p, k) => scene.find(s => s.nP >= k + 1) || null);
const errate = aperte.map((s, k) => ({ s, p: P[k] })).filter(x => !x.s || !/freekick|penalty/.test(String(x.s.intent)));
console.log(`piazzati dell'eroe ${P.length} · candidate ${P.map(p => p.candidate).join(',')} · scene: ${aperte.map(s => s ? '«' + String(s.t).slice(0, 28) + '» ' + s.intent : '—').join(' | ')}`);
if (P.length < 4) { console.log(`❌ CIECO: la partita ha prodotto ${P.length} piazzati (servono 4 per esaurire il catalogo)`); process.exit(2); }
const vuoti = P.filter(p => p.candidate === 0).length;
if (RED) { const ok = vuoti > 0; console.log(ok ? `✅ ROSSO come atteso: ${vuoti} piazzati con catalogo vuoto` : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const ok = vuoti === 0 && errate.length === 0;
console.log(ok ? '✅ PASS piazzati-catalogo' : `❌ FAIL piazzati-catalogo: ${vuoti} cataloghi vuoti, ${errate.length} scene non piazzate`); process.exit(ok ? 0 : 1);
