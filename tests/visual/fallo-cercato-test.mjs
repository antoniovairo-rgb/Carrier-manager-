#!/usr/bin/env node
/* [7.999.38 guardiano — taccuino PO, SIT #150 «Guadagna una punizione!»: «nel dribbling il pallone e l'eroe si separano: gap oltre 4
   unita' per 1,9 s», codici 009 direzione sbagliata e 000 gesto scoordinato] Le azioni che PROMETTONO il fallo subito, riuscite:
   l'eroe inciampa e cade (sequenza trip → fallen della 7.999.8) e il pallone non se ne va lontano (distacco massimo pallone-eroe
   nell'esito <= 4,5 unita'). Prima: il gioco le rendeva come un passaggio a un compagno, pallone all'indietro fino a 10 unita' e
   ritorno, nessuna caduta. Rosso: CPM_RED=1 → __CPM_NO_FALLO38 → FALLISCE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const CASI = [[150, 0], [150, 1]];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [];
for (const [gi, ai] of CASI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO_FALLO38 = 1; }, RED);
  await openMatch(page, port, { skipLoadAll: true, name: 'Fallo' + gi + ai }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(1500);
  await page.evaluate(a => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, ai);
  let gapMax = 0, n = 0; const t0 = Date.now();
  while (Date.now() - t0 < 7000) { const r = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return { ph: window.__CPM_PHASE(), g: s.hero ? Math.hypot(s.hero.x - s.ball.x, (s.hero.y - s.ball.y) * 0.68) : null }; } catch (e) { return null; } }).catch(() => null);
    if (r && r.ph === 'hl_result' && r.g != null) { n++; gapMax = Math.max(gapMax, r.g); } await sleep(150); }
  const cad = await page.evaluate(() => (window.__CPM_CADUTA8 && window.__CPM_CADUTA8.seq) || []).catch(() => []);
  out.push({ gi, ai, campioni: n, gapMax: +gapMax.toFixed(1), caduta: cad }); console.log(JSON.stringify(out[out.length - 1])); await page.close();
}
await b.close(); srv.close();
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
for (const r of out) {
  ok(r.campioni >= 10, `gi${r.gi}/${r.ai}: esito misurato (${r.campioni} campioni)`);
  ok(r.caduta.includes('trip') && r.caduta.includes('fallen'), `gi${r.gi}/${r.ai}: l'eroe subisce il fallo e cade (${r.caduta.join(' → ') || 'nessuna caduta'})`);
  ok(r.gapMax <= 4.5, `gi${r.gi}/${r.ai}: il pallone resta con l'eroe (distacco massimo ${r.gapMax} u)`);
}
if (err.length) { console.log('\nFALLO CERCATO: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nFALLO CERCATO: PASS'); process.exit(0);
