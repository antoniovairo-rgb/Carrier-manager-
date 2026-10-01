#!/usr/bin/env node
/* CENSIMENTO — IL CAMPO HA DEI BORDI? E QUANTE VOLTE LA PARTITA SI FERMA?
   Fase 7 della roadmap. NON e' un guardiano: non fallisce, misura. Tre domande, tre numeri.

   1. IL PALLONE TOCCA MAI LA LINEA? Il pallone logico e' clampato dentro [4,96]x[6,94]
      (r.22287-22288) e la mesh dentro [0,100]x[0,100] (r.22293): «fuori» non e' uno stato
      rappresentabile. Qui si contano i TOCCHI DI BORDO — i tick in cui il pallone arriva a
      ridosso del clamp — perche' sono le occasioni in cui, nel calcio vero, il gioco si ferma.
      La soglia si dichiara PRIMA: BORDO_X = 3 unita' dal clamp in x, BORDO_Y = 3 in y.

   2. QUANTE INTERRUZIONI SI VEDONO? Si contano le righe di cronaca che APRONO una giocata
      piazzata (marcatore `sp` nel registro, r.21849) e i calci d'inizio recitati, per tipo.
      Riferimento del calcio vero: >=25 interruzioni a partita fra falli, rimesse, angoli,
      fuorigioco e punizioni. Il numero di partenza noto (7.548) e' 2,7.

   3. PERCHE' I CORNER NON ESCONO? Si campiona la posizione VERA del pallone a ogni tick e si
      ricalcola OFFLINE il peso di zona che la pesca (r.21394-21395) assegnerebbe alle righe
      d'angolo, che vivono a x 90-93. Cosi' la causa non e' un'ipotesi: e' una distribuzione.

   USO:  CPM_PARTITE=2 node tests/visual/bordi-554.mjs
   Serve `tests/node_modules` (react/three/babel) e un chromium di playwright.                */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase, ROOT } from './lib/harness.mjs';

/* ---- la tabella vera del repertorio, letta dal sorgente: nessuna copia a mano ---- */
function leggiBgMatch() {
  const L = fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').split('\n');
  let s = -1, e = -1;
  for (let i = 0; i < L.length; i++) { if (s < 0 && /^const BG_MATCH=\[/.test(L[i])) s = i; else if (s >= 0 && /^\];/.test(L[i])) { e = i; break; } }
  const righe = L.slice(s, e + 1).filter(l => /^\s*\{txt:/.test(l));
  return righe.map(l => {
    const w = (l.match(/w:([0-9.]+)/) || [])[1];
    const bp = l.match(/bpos:\{x:(-?[0-9.]+),y:(-?[0-9.]+)\}/);
    return { w: w ? +w : 1, sp: (l.match(/sp:"([a-z_]+)"/) || [])[1] || null, pd: (l.match(/pd:"([a-z_]+)"/) || [])[1] || null,
             ef: (l.match(/ef:"([a-z_]+)"/) || [])[1] || null, bx: bp ? +bp[1] : 50, by: bp ? +bp[2] : 50 };
  }).filter(r => r.ef !== 'team_goal' && r.ef !== 'opp_goal'); /* i gol li decide il microsim, r.21374 */
}
const _VIC = { defend_goal:['retreat'], retreat:['defend_goal','midfield'], midfield:['retreat','attack','wide_right'],
  attack:['midfield','wide_right','attack_goal'], wide_right:['attack','midfield'], attack_goal:['attack','wide_right'], opp_goal:['defend_goal'] };
/* la stessa catena di pesi del gioco: zona (r.21394-21395) + decisione (r.21415-21418) */
function quotaSp(BG, bx, by) {
  const dec = bx < 25 ? 'defend_goal' : bx < 42 ? 'retreat' : bx < 60 ? 'midfield' : bx < 78 ? (Math.abs(by - 50) > 22 ? 'wide_right' : 'attack') : 'attack_goal';
  let tot = 0; const per = {};
  for (const r of BG) {
    const d = Math.hypot(r.bx - bx, (r.by - by) * 0.6);
    let w = r.w * (d <= 18 ? 3.0 : d <= 32 ? 1 : d <= 48 ? 0.18 : 0.05);
    if (r.pd) w *= (r.pd === dec) ? ((dec === 'attack_goal' || dec === 'defend_goal' || dec === 'wide_right') ? 7.0 : 3.0)
                                  : ((_VIC[dec] || []).indexOf(r.pd) >= 0 ? 0.8 : 0.14);
    tot += w; if (r.sp) per[r.sp] = (per[r.sp] || 0) + w;
  }
  const o = {}; for (const k in per) o[k] = per[k] / tot; return o;
}

const PARTITE = +(process.env.CPM_PARTITE || 2);
const BORDO_X = 3.0;    /* unita' dal clamp x (4/96) sotto le quali il pallone e' SULLA linea */
const BORDO_Y = 3.0;    /* unita' dal clamp y (6/94) */
const MAXMS   = +(process.env.CPM_MAXMS || 420000);

/* le righe d'angolo del repertorio (BG_MATCH r.3527-3536): x 90-93, y 5-96 */
const RIGHE_CORNER_FOR = [[90,95],[92,96],[90,94],[93,5],[91,93],[92,7]];
const pesoZona = (bx,by,ex,ey) => { const d = Math.hypot(ex-bx,(ey-by)*0.6); return d<=18?3.0:d<=32?1:d<=48?0.18:0.05; };

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false;
    window.__CPM_TR = [];
    setInterval(() => { try {
      const q = window.__CPM_BALL3 && window.__CPM_BALL3();
      if (q && q.l) window.__CPM_TR.push([q.c, q.l.x, q.l.y, q.m ? q.m.x : null, q.m ? q.m.y : null, q.t.x, q.t.y]);
    } catch (_e) {} }, 60);
  });
  await openMatch(page, port, { skipLoadAll: true, name: 'Bd' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 9100 + i * 41);
  const t0 = Date.now();
  while (Date.now() - t0 < MAXMS) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => ({
    righe: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'),
    tr: window.__CPM_TR || []
  })));
  await page.close();
}
srv.close(); await b.close();

console.log(`\n=== IL CAMPO HA DEI BORDI? · ${tutte.length} partite ===\n`);
let nT = 0, bx4 = 0, bx96 = 0, by6 = 0, by94 = 0, qq = [0,0,0,0,0], yy = [0,0,0,0,0];
let xmin = 999, xmax = -999, ymin = 999, ymax = -999;
let mymin = 999, mymax = -999, largo22 = 0, largo32 = 0, largo44 = 0;
let mesh0 = 0, mesh100 = 0, meshY0 = 0, meshY100 = 0;
let pesoTot = 0, pesoN = 0, inArea = 0;
const BG = leggiBgMatch();
const quote = {}; let quoteN = 0;
let sp = 0, spK = {}, rec = 0, recN = 0, righeTot = 0;
const bordoEventi = []; /* transizioni: entra nella fascia di bordo dopo esserne uscito */
for (const { righe, tr } of tutte) {
  righeTot += righe.length;
  for (const r of righe) { if (r.sp) { sp++; spK[r.sp] = (spK[r.sp] || 0) + 1; } if (r.rec) rec++; recN++; }
  let dentro = false, ev = 0;
  for (const [c, lx, ly, mx, my] of tr) {
    if (lx == null) continue;
    nT++;
    if (lx <= 4 + BORDO_X) bx4++;
    if (lx >= 96 - BORDO_X) bx96++;
    if (ly <= 6 + BORDO_Y) by6++;
    if (ly >= 94 - BORDO_Y) by94++;
    if (mx != null) { if (mx <= 1) mesh0++; if (mx >= 99) mesh100++; if (my <= 1) meshY0++; if (my >= 99) meshY100++; }
    const q = Math.min(4, Math.floor(lx / 20)); qq[q]++;
    yy[Math.min(4, Math.floor(ly / 20))]++;
    if (lx < xmin) xmin = lx; if (lx > xmax) xmax = lx;
    if (ly < ymin) ymin = ly; if (ly > ymax) ymax = ly;
    if (Math.abs(ly - 50) > 22) largo22++;      /* la banda `wide_right` della decisione, r.21185 */
    if (Math.abs(ly - 50) > 32) largo32++;      /* la banda `nearTouch` della lente difensiva, r.11151 */
    if (Math.abs(ly - 50) > 44) largo44++;      /* a un metro e mezzo dalla linea laterale */
    if (my != null) { if (my < mymin) mymin = my; if (my > mymax) mymax = my; }
    if (lx >= 78) inArea++;
    /* il peso che la pesca darebbe MEDIAMENTE a una riga d'angolo per noi, in questo istante */
    pesoTot += RIGHE_CORNER_FOR.reduce((s, [ex, ey]) => s + pesoZona(lx, ly, ex, ey), 0) / RIGHE_CORNER_FOR.length;
    pesoN++;
    const q2 = quotaSp(BG, lx, ly); for (const k in q2) quote[k] = (quote[k] || 0) + q2[k]; quoteN++;
    const suBordo = (lx <= 4 + BORDO_X || lx >= 96 - BORDO_X || ly <= 6 + BORDO_Y || ly >= 94 - BORDO_Y);
    if (suBordo && !dentro) ev++;
    dentro = suBordo;
  }
  bordoEventi.push(ev);
}
const pm = v => (v / tutte.length).toFixed(1);
console.log(`  campioni del pallone logico            ${nT}`);
console.log(`  quinti del campo (0-20 … 80-100)      ${qq.map(v => ((v / nT) * 100).toFixed(0) + '%').join(' · ')}`);
console.log(`  fasce in larghezza (y 0-20 … 80-100)  ${yy.map(v => ((v / nT) * 100).toFixed(0) + '%').join(' · ')}`);
console.log(`  pallone in zona d'attacco (x>=78)      ${((inArea / nT) * 100).toFixed(1)}%`);
console.log(`  quanto il gioco è LARGO   |y-50|>22 (banda wide_right) ${((largo22 / nT) * 100).toFixed(1)}%  ·  >32 (banda rimessa) ${((largo32 / nT) * 100).toFixed(1)}%  ·  >44 (sulla linea) ${((largo44 / nT) * 100).toFixed(2)}%`);
console.log(`  escursione della MESH (quella che si vede)   y [${mymin.toFixed(1)} … ${mymax.toFixed(1)}]`);
console.log(`  escursione vera del pallone           x [${xmin.toFixed(1)} … ${xmax.toFixed(1)}]   y [${ymin.toFixed(1)} … ${ymax.toFixed(1)}]   (clamp del codice: x[4,96] y[6,94], r.22287-22288)`);
console.log('');
console.log(`  tick a ridosso della linea di fondo NOSTRA  (x<=${4 + BORDO_X})   ${bx4}  = ${((bx4 / nT) * 100).toFixed(2)}%`);
console.log(`  tick a ridosso della linea di fondo LORO    (x>=${96 - BORDO_X})   ${bx96}  = ${((bx96 / nT) * 100).toFixed(2)}%`);
console.log(`  tick a ridosso della linea laterale bassa   (y<=${6 + BORDO_Y})   ${by6}  = ${((by6 / nT) * 100).toFixed(2)}%`);
console.log(`  tick a ridosso della linea laterale alta    (y>=${94 - BORDO_Y})   ${by94}  = ${((by94 / nT) * 100).toFixed(2)}%`);
console.log(`  ARRIVI sul bordo (transizioni fuori→bordo)  ${bordoEventi.join(' · ')}   media ${pm(bordoEventi.reduce((a, x) => a + x, 0))} a partita`);
console.log(`  mesh oltre il perimetro (x<=1 / x>=99 / y<=1 / y>=99)  ${mesh0} / ${mesh100} / ${meshY0} / ${meshY100}`);
console.log('');
console.log(`  righe di cronaca                        ${righeTot}  (${pm(righeTot)} a partita)`);
console.log(`  righe che APRONO una palla ferma (sp)   ${sp}  (${pm(sp)} a partita)   <- calcio vero: >=25`);
for (const [k, v] of Object.entries(spK)) console.log(`      ${k.padEnd(16)} ${v}  (${pm(v)} a partita)`);
if (!Object.keys(spK).length) console.log('      nessuna riga `sp` uscita');
console.log(`  righe dirottate da una recita (rec)     ${rec}/${recN}`);
console.log('');
console.log(`  peso MEDIO che la pesca dà a una riga d'angolo per noi:  ×${(pesoTot / pesoN).toFixed(3)}`);
console.log(`     (×3,0 se il pallone è entro 18u dalla bandierina · ×0,05 oltre 48u — r.21394-21395)`);
console.log('');
console.log(`  PROBABILITÀ CHE UNA PESCATA APRA UNA PALLA FERMA — ricalcolata tick per tick sulla posizione VERA,`);
console.log(`  con la catena di pesi del gioco (zona r.21394 + decisione r.21415) sulla tabella vera (${BG.length} voci):`);
const righePerPartita = righeTot / tutte.length;
for (const k of ['corner_for', 'corner_against', 'foul_for', 'pen_for']) {
  const p = (quote[k] || 0) / Math.max(1, quoteN);
  console.log(`    ${k.padEnd(16)} ${(p * 100).toFixed(2)}% per pescata  ->  attese ${(p * righePerPartita).toFixed(2)} a partita`);
}
console.log('\nCENSIMENTO. Non è un guardiano: non fallisce, misura.');
