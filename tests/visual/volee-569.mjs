#!/usr/bin/env node
/* MISSIONE — VOLEE' E ROVESCIATA SONO DUE GESTI, E SI GUARDANO AL COLPO.
   Collaudo PO, sesta segnalazione: «la rovesciata e' proprio concepita al contrario, il piede che calcia
   non e' rivolto verso la porta». La frase chiude la diagnosi: `shot_volley` raccoglieva DUE famiglie —
   rovesciata/sforbiciata (spalle alla porta, acrobatica) e volee'/al volo (fronte alla porta, in piedi) —
   e le recitava con la STESSA posa acrobatica.
   Le mie tre correzioni precedenti hanno tutte lavorato sulla posa: era giusta la posa, sbagliata
   l'attribuzione. Qui si fotografa AL COLPO (si aspetta che il testimone dica u fra 0,35 e 0,65) una scena
   per famiglia, e si stampa quale ramo ha girato.
     CPM_CHROME=... node volee-569.mjs [CPM_TAG=dopo]                                                   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const OUT = 'out/rovesciata'; fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.CPM_TAG || 'dopo569';
const RX = /al volo|vol[eé]e|volee|rovesciat|sforbiciat/i;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 820 }, deviceScaleFactor: 2 });
await installCdnRoutes(page);
await page.addInitScript((sg) => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; if (sg) window.__CPM_ROV_SGN = sg; }, +(process.env.CPM_SGN || 0));
const { total } = await openMatch(page, port);
await sleep(600);
const cand = [];
for (let gi = 0; gi < total && cand.length < 40; gi++) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  const acts = await page.evaluate(() => (window.__CPM_ACTS ? window.__CPM_ACTS() : []));
  acts.forEach((l, ai) => { if (RX.test(l)) cand.push({ gi, ai, l }); });
}
const acro = cand.find(c => /rovesciat|sforbiciat/i.test(c.l));
const volee = cand.find(c => !/rovesciat|sforbiciat/i.test(c.l));
console.log(`\n  candidate: ${cand.length} · ACROBATICA scelta: ${acro ? acro.gi + ' «' + acro.l + '»' : 'nessuna'} · VOLEE scelta: ${volee ? volee.gi + ' «' + volee.l + '»' : 'nessuna'}\n`);
for (const c of [acro, volee].filter(Boolean)) {
  try { await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), c.gi); } catch (e) {}
  await sleep(500);
  await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_VOLLEY = null; });
  try { await page.evaluate(a => window.__CPM_RESOLVE(a), c.ai); } catch (e) { console.log(`  gi${c.gi}: RESOLVE fallita`); continue; }
  let w = null;
  for (let i = 0; i < 240; i++) { w = await page.evaluate(() => window.__CPM_VOLLEY || null); if (w && w.u >= 0.3 && w.u <= 0.7) break; await sleep(25); }
  const nome = `${OUT}/vol-${TAG}-gi${c.gi}-${/rovesciat|sforbiciat/i.test(c.l) ? 'ACRO' : 'VOLEE'}.png`;
  await page.screenshot({ path: nome });
  console.log(`  gi${c.gi} «${c.l}» → ${nome}`);
  console.log(`     testimone: ${w ? JSON.stringify(w) : 'nessuno (il ramo non e\' passato)'}`);
}
srv.close(); await b.close();
console.log('\nIl giudizio si da\' guardando: il piede che calcia deve puntare verso la porta.');
