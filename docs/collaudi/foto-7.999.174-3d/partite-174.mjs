#!/usr/bin/env node
/* Collaudo 7.999.174: N partite intere in autoplay (flusso vero, GLB acceso, 412x915). Registra fasi, highlight, esiti, errori di pagina,
   punteggio, righe di cronaca e foto nei punti chiave. Sola lettura del prodotto. Uso: CPM_PART=1,2,3 node partite-174.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../../../tests/visual/lib/harness.mjs';
const SCR = process.env.CPM_SCR || '/tmp/p174/'; fs.mkdirSync(SCR, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const PART = (process.env.CPM_PART || '1,2,3').split(',').map(Number); const R = [];
for (const i of PART) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Coll174p' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 1500 + i * 71);
  const t0 = Date.now(); let ph = null, sc = null, shots = 0; const seen = {}; const fasi = {}; const hist = []; let lastPhT = Date.now(), stuck = 0;
  const foto = async (tag) => { if (shots >= 16) return; shots++; await page.screenshot({ path: `${SCR}p${i}-${String(shots).padStart(2, '0')}-${tag}.png` }).catch(() => {}); };
  while (Date.now() - t0 < 420000) {
    const s = await page.evaluate(() => ({ p: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK && window.__CPM_CLOCK(), sc: window.__CPM_SCORE ? JSON.stringify(window.__CPM_SCORE()) : null })).catch(() => ({}));
    if (s.p !== ph) { hist.push([s.p, s.c, Math.round((Date.now() - t0) / 1000)]); fasi[s.p] = (fasi[s.p] || 0) + 1; lastPhT = Date.now();
      if (!seen[s.p] && ['hl_intro', 'hl_choose', 'hl_result', 'ended', 'ceremony'].includes(s.p)) { seen[s.p] = 1; await sleep(s.p === 'hl_result' ? 1500 : 300); await foto(s.p + '-' + s.c); }
      ph = s.p; if (s.p === 'ended' || s.p === 'ceremony') { await sleep(1500); await foto('fine'); break; } }
    if (s.sc && s.sc !== sc) { if (sc != null) { await sleep(1200); await foto('gol-' + s.c + '-' + s.sc.replace(/[^0-9a-z]/gi, '')); } sc = s.sc; }
    if (s.p === 'playing' && s.c && ![ 'a', 'b', 'c' ].some(k => seen['pl' + k]) && s.c >= 20) { seen.pla = 1; await foto('cronaca-' + s.c); }
    if (s.p === 'playing' && s.c >= 55 && !seen.plb) { seen.plb = 1; await foto('cronaca-' + s.c); }
    if (s.p === 'playing' && s.c >= 80 && !seen.plc) { seen.plc = 1; await foto('cronaca-' + s.c); }
    if (Date.now() - lastPhT > 90000) { stuck++; lastPhT = Date.now(); await foto('fermo-' + s.p); if (stuck >= 2) break; }
    await sleep(200);
  }
  const fin = await page.evaluate(() => ({ sc: window.__CPM_SCORE ? window.__CPM_SCORE() : null, c: window.__CPM_CLOCK && window.__CPM_CLOCK(), p: window.__CPM_PHASE && window.__CPM_PHASE(),
    tl: (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).filter(e => /HighlightForced|ActionResolved/.test(e.type || e.t || '')).map(e => ({ t: e.type || e.t, i: e.intent, l: e.label, ok: e.ok, k: e.key, z: e.zone })),
    ev: (window.__CPM_EV || []).length, evg: (window.__CPM_EV || []).filter(e => /gol|goal/i.test(JSON.stringify(e).slice(0, 80))).length })).catch(() => ({}));
  R.push({ partita: i, durataS: Math.round((Date.now() - t0) / 1000), fasi, hist, errs: [...new Set(errs)], fin });
  console.log(`p${i}: ${R.at(-1).durataS}s · clock finale ${fin.c} · fase finale ${fin.p} · punteggio ${JSON.stringify(fin.sc)} · fasi ${JSON.stringify(fasi)} · errori ${R.at(-1).errs.length} ${R.at(-1).errs.slice(0, 3).join(' | ')}`);
  await ctx.close();
}
fs.writeFileSync(SCR + 'partite.json', JSON.stringify(R, null, 1)); await Promise.race([b.close(), sleep(5000)]); srv.close(); process.exit(0);
