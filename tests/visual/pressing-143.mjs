#!/usr/bin/env node
/* [giro 17 PO-123/PO-143 «difensori che pressano»] GUARDIANO. Due prove deterministiche, una pagina nuova ciascuna:
   (1) LETTURA DELLA PRESSIONE: il motore consegna `press` = distanza dell'avversario piu' vicino (src/14 r.258). Occasioni sintetiche a
       0,5 · 2 · 4 · 8 u: la scena generata deve dichiarare pressione alta, alta, media, bassa, e «spalle alla porta» solo sotto 1,2 u.
       Con __CPM_NO_PRESS143 la lettura e' quella di prima (distanza presa per intensita'): 8 u diventa «alta».
   (2) IL MARCATORE IN SCENA: scena di conclusione generata con difensore nominato a 2 u, teatro acceso; dopo la lettura il difensore
       piu' vicino all'eroe (mesh) deve stare entro 3,5 m. Con __CPM_NO_MARCA143 resta dove lo mette la linea (misurato 4,2-6,3 m).
   La misura sul flusso vero (4 partite, lettura umana 2,5 s) e' pressing-143-flusso.mjs: dichiara, non giudica (vedi RAPPORTO-giro17). */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const srv = await startServer(); const b = await launchBrowser(); const R = {};
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_REC = 1; window.__CPM_PRESENT = 1; if (r) { window.__CPM_NO_PRESS143 = 1; window.__CPM_NO_MARCA143 = 1; } }, rosso);
  await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Pressing143' }); await sleep(1500);
  const lett = await page.evaluate(() => { const C = { difensore: { i: 12, nome: 'X BAILEY' }, ricevente: { i: 5, nome: 'A SPENCER' }, portiere: { nome: 'G CARR' } };
    return [0.5, 2, 4, 8].map(d => { const out = {}; for (const [tipo, zona, x, y] of [['conclusione', 'limite', 80, 44], ['fra-le-linee', 'trequarti', 70, 50], ['cross', 'area', 90, 48]]) {
      const s = scenaDalMotore({ tipo, zona, x, y, press: d, liberi: 1, cast: C, origine: tipo === 'cross' ? { kind: 'cross' } : null }, { stats: {} }, 4242); out[tipo] = s ? { p: (s.tactic || {}).pressure, k: s._p6 } : null; } return { d, ...out }; }); });
  const pr = await page.evaluate(() => { const M = window.__CPM_MP(); let di = -1; M.forEach((p, i) => { if (di < 0 && p && p.t === 'away' && !p.gk) di = i; });
    const s = scenaDalMotore({ tipo: 'conclusione', zona: 'limite', x: 80, y: 44, press: 2, liberi: 1, cast: { difensore: { i: di, nome: 'X Y' }, ricevente: { i: 5, nome: 'A B' }, portiere: { nome: 'G K' } } }, { stats: {} }, 777);
    SITUATIONS.push(s); return { gi: SITUATIONS.length - 1 }; });
  await page.evaluate(gi => { window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, pr.gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  const ds = [];
  for (let k = 0; k < 16; k++) { await sleep(250); const d = await page.evaluate(() => { if (window.__CPM_PHASE() !== 'hl_choose') return null; const s = window.__CPM_STATE(); const H = s.hero; let jd = 99; for (const p of s.players) if (p.team === 'away' && !p.gk) jd = Math.min(jd, Math.hypot((p.x - H.x) * 1.05, (p.y - H.y) * 0.68)); return +jd.toFixed(2); }); if (d != null) ds.push(d); }
  const fine = ds.slice(-6).sort((a, b) => a - b); R[rosso ? 'rosso' : 'verde'] = { lett, marcatore: fine.length ? fine[fine.length >> 1] : null, campioni: ds.length };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(R[rosso ? 'rosso' : 'verde'])); await page.close();
}
await b.close(); srv.close();
const g = [], V = R.verde, X = R.rosso, attese = { 0.5: 'high', 2: 'high', 4: 'medium', 8: 'low' };
for (const r of V.lett) { for (const t of ['conclusione', 'fra-le-linee', 'cross']) { const o = r[t] || r.spalle; if (!r[t]) continue; if (t !== 'conclusione' && o.p !== attese[r.d]) g.push(`verde: ${t} a ${r.d} u dichiara «${o.p}» (atteso ${attese[r.d]})`); }
  const kc = r.conclusione && r.conclusione.k; if (kc !== (r.d < 1.2 ? 'spalle' : 'conclusione')) g.push(`verde: a ${r.d} u la scena e' «${kc}»`); }
if (!(V.marcatore != null && V.marcatore <= 3.5)) g.push('verde: marcatore a ' + V.marcatore + ' m (atteso <= 3,5)');
const x8 = X.lett.find(r => r.d === 8); if (!(x8 && x8['fra-le-linee'] && x8['fra-le-linee'].p === 'high')) g.push('rosso: la lettura di prima non si vede ' + JSON.stringify(x8));
if (!(X.marcatore != null && X.marcatore > 3.5)) g.push('rosso: marcatore vicino anche spento (' + X.marcatore + ' m)');
if (g.length) { console.log('❌ pressing-143'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ pressing-143 verde (e il rosso si vede)');
