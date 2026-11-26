#!/usr/bin/env node
/* [giro 389 PO-671 guardiano — «c'e' un highlight dove l'eroe cerca un fallo, se il fallo avviene in area deve esserci un rigore, fuori
   area una punizione»] Misurato prima (misura-389 / partite-389): il fallo cercato riuscito scriveva solo una riga «fallo» ASSEGNATA AGLI
   AVVERSARI nel punto dell'eroe del motore, poi si ripartiva su azione: nessun rigore e nessuna punizione, dentro o fuori area.
   Quattro bracci, ognuno «non giudicato» = rosso:
   A · regola (funzione pura __CPM_FALLO389): comanda l'area DISEGNATA (avanzamento >= 82,1 · |y-50| <= 29,65, linea compresa), anche
       nella fascia grigia fra area disegnata e regola dei falli del motore (>= 84 · <= 20).
   B · scena forzata 150 riuscita con l'eroe IN AREA (88/50 e fascia grigia 83/50): il motore fischia il RIGORE per la squadra dell'eroe
       sul dischetto, niente «fallo» per gli avversari.
   C · scena forzata 150 riuscita FUORI AREA (75/50): PUNIZIONE per la squadra dell'eroe dal punto del fallo, fuori dall'area disegnata.
   D · scena forzata 150 FALLITA (simulazione non fischiata): nessun fermo dalla scena.
   E · partita vera (partite-389, occasioni «spalle» chieste al motore, pilota sul fallo cercato): ogni fallo cercato riuscito ha il suo
       fischio coerente col punto; un rigore fischiato si calcia (scena o battuta).
   Rosso: CPM_RED=1 → window.__CPM_NO_G389 → FALLISCE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { provaFallo } from './misura-389.mjs';
import { giocaFallo } from './partite-389.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
const dentroDis = (x, y) => x >= 81.8 && Math.abs(y - 50) <= 29.95;
/* A · regola */
{ const page = await b.newPage(); await installCdnRoutes(page); await page.addInitScript(r => { if (r) window.__CPM_NO_G389 = 1; }, RED);
  await openMatch(page, port, { skipLoadAll: true, name: 'Regola389' });
  const R = await page.evaluate(() => { const f = window.__CPM_FALLO389; if (typeof f !== 'function') return null; return [[88, 50], [83, 50], [85, 25], [82.1, 79.6], [90, 82], [75, 50], [81.5, 50], [78, 66]].map(([x, y]) => ({ x, y, k: f(x, y).kind })); });
  const noG = await page.evaluate(() => !!window.__CPM_NO_G389); await page.close();
  ok(!!R, 'A: la regola del fischio esiste (__CPM_FALLO389)');
  for (const r of R || []) ok(r.k === (dentroDis(r.x, r.y) ? 'pen' : 'foul'), `A: fallo a ${r.x}/${r.y} → ${r.k === 'pen' ? 'rigore' : 'punizione'} (atteso ${dentroDis(r.x, r.y) ? 'rigore' : 'punizione'})`);
  ok(!noG, 'A: il braccio non gira col rosso acceso'); }
/* B, C · scena forzata riuscita */
const P = [[88, 50, 'pen'], [83, 50, 'pen'], [75, 50, 'foul']];
for (const [x, y, att] of P) { const r = await provaFallo(b, port, x, y, 0, RED);
  const sc = r.mev.findIndex(e => e.t === 'SCENA'); const dopo = sc >= 0 ? r.mev.slice(sc + 1) : [];
  const rig = dopo.find(e => e.t === 'rigore' && e.scena), pun = dopo.find(e => e.t === 'fallo' && e.scena && e.per === 'home'), avv = dopo.find(e => e.t === 'fallo' && e.scena && e.per === 'away');
  const br = att === 'pen' ? 'B' : 'C';
  ok(sc >= 0 && r.mev[sc].key === 'win_freekick', `${br}: scena 150 a ${x}/${y} giudicata (esito ${sc >= 0 ? r.mev[sc].key : 'nessuna scena'})`);
  ok(!!r.dec && r.dec.x === x && r.dec.y === y, `${br}: il punto del fallo e' quello della scena (${r.dec ? r.dec.x + '/' + r.dec.y : 'nessun testimone'})`);
  ok(!avv, `${br}: nessun «fallo» della scena assegnato agli avversari${avv ? ` (per away a ${avv.x}/${avv.y})` : ''}`);
  if (att === 'pen') ok(!!rig && rig.per === 'home' && rig.x === 89 && rig.y === 50 && !pun, `B: fallo in area → RIGORE per noi sul dischetto (${rig ? rig.per + ' ' + rig.x + '/' + rig.y : pun ? 'punizione a ' + pun.x + '/' + pun.y : 'niente'})`);
  else ok(!!pun && !rig && pun.x === x && pun.y === y && !dentroDis(pun.x, pun.y), `C: fallo fuori area → PUNIZIONE per noi dal punto (${pun ? pun.x + '/' + pun.y : rig ? 'rigore' : 'niente'})`); }
/* D · fallita: niente fermo */
{ const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_REC = true; if (r) window.__CPM_NO_G389 = 1; }, RED);
  await openMatch(page, port, { skipLoadAll: true, name: 'Simula389' });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing' && window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(), null, { timeout: 60000 }).catch(() => {});
  await sleep(1000); await page.evaluate(() => window.__CPM_FORCE_SIT(150, true, { x: 88, y: 50 }));
  await page.waitForFunction(() => window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {}); await sleep(600);
  const R = await page.evaluate(async () => { const M = window.__CPM_MOTORE_OBJ(); const W = []; const RE = M.risolviEroe.eventi; M.risolviEroe.eventi = function (k) { const r = RE.apply(this, arguments); W.push({ key: k, ev: (r || []).map(e => e.t + (e.per ? ':' + e.per : '')) }); return r; };
    window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); await new Promise(r => setTimeout(r, 2500)); return { W, pend: !!M._S.pend389, f: (window.__CPM_F389 || []).length }; });
  await page.close();
  ok(R.W.length === 1, `D: scena fallita giudicata (${R.W.length ? R.W[0].key : 'nessuna'})`);
  ok(R.W.length === 1 && !R.W[0].ev.some(e => /^(rigore|fallo)/.test(e)) && !R.pend && R.f === 0, `D: simulazione non fischiata → nessun fermo (${R.W.length ? R.W[0].ev.join(',') || 'nessun evento' : '—'})`); }
/* E · partita vera */
{ const G = await giocaFallo(b, port, 'Dbg389', RED, 300000);/* seme misurato: fallo in area al 1' (82,4/20,1, fascia grigia) e due fuori */ const C = G.casi;
  console.log('  partita vera: ' + JSON.stringify(C));
  ok(C.length >= 1, `E: almeno un fallo cercato riuscito in partita vera (${C.length}, fino al ${G.min}')`);
  for (const c of C) { const p = c.punto; ok(!!p, `E: ${c.min}' il punto del fallo arriva al motore${p ? ` (${p.x.toFixed(1)}/${p.y.toFixed(1)})` : ''}`); if (!p) continue;
    const inA = dentroDis(p.x, p.y);
    ok(!c.puAvv, `E: ${c.min}' nessuna punizione regalata agli avversari`);
    ok(inA ? !!c.rigore : (!!c.punizione && !c.rigore), `E: ${c.min}' fallo ${inA ? 'IN' : 'FUORI'} area → ${c.rigore ? 'rigore' : c.punizione ? 'punizione' : 'niente'}`);
    if (inA) ok(c.scenaPiazzato === 'rigore' || !!c.tiroRigore, `E: ${c.min}' il rigore si calcia (${c.scenaPiazzato === 'rigore' ? 'scena del rigore aperta' : c.tiroRigore ? c.tiroRigore.chi + ' ' + c.tiroRigore.esito : 'mai calciato'})`); }
  ok(C.some(c => c.punto && dentroDis(c.punto.x, c.punto.y)), `E: almeno un fallo cercato IN area giudicato in partita vera`); }
await b.close(); srv.close();
if (err.length) { console.log('\nFALLO 389: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nFALLO 389: PASS'); process.exit(0);
