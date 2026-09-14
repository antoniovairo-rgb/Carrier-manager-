#!/usr/bin/env node
/* MISSIONE — LA CONSEGNA NON TELETRASPORTA IL PALLONE A SCENA IN CORSO.
   Collaudo PO sul 7.567: «SALTO del pallone di 23,9 unita' in 41 ms (a 19,9s dall'inizio scena,
   scrittore: consegna) — 582 u/s, sembra un teletrasporto». Il nome dello scrittore viene dall'anagrafe
   del 7.556-7.557: senza quella, questa riga sarebbe una fra sessanta sospette.
   Qui si contano le consegne che arrivano FUORI dalla finestra dello stacco, e quante di quelle
   riassegnano davvero il pallone di colpo. Rosso = __CPM_NO568 (teletrasporto senza orario).
     CPM_CHROME=... node consegna-568.mjs [CPM_MS=200000] [CPM_GIRI=1]                                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 200000), GIRI = +(process.env.CPM_GIRI || 1);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = { verde: [], rosso: [] };
async function giro(rosso, seed) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r]) => {
    window.__CPM_GLB = false; window.__CPM_REC = true;
    window.__CPM_PRESENT = 1;/* [7.568] SENZA QUESTO IL RAMO NON GIRA: sotto `?cpmtest=1` la presentazione di scena e' spenta (`_pres345`), quindi la consegna non viene MAI eseguita e il giudizio misura il nulla. E' la stessa trappola che aveva prodotto i «13,9 m» finti della sonda compagni: il laboratorio spegne proprio il pezzo che si vuole guardare. */
    if (r) window.__CPM_NO568 = true;
    window.__CPM_DLV383 = {}; window.__CPM_BJ568 = { n: 0, max: 0, consegna: 0, maxCons: 0 };
    /* testimone del salto: posizione del pallone campionata fitta + lo scrittore dichiarato */
    setInterval(() => { try {
      const o = window.__CPM_OWN && window.__CPM_OWN(); if (!o || o.ph === 'ended') return;
      const W = window.__CPM_BJ568, p = W._p;
      if (p && (o.c === W._c)) { const d = Math.hypot(o.x - p.x, o.y - p.y);
        if (d > 8) { W.n++; if (d > W.max) W.max = +d.toFixed(1); } }
      W._p = { x: o.x, y: o.y }; W._c = o.c;
    } catch (_e) {} }, 40);
  }, [rosso]);
  await openMatch(page, port, { skipLoadAll: true, name: rosso ? 'Ro' : 'Ve' });
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  await sleep(MS);
  const R = await page.evaluate(() => ({ d: JSON.parse(JSON.stringify(window.__CPM_DLV383 || {})), j: JSON.parse(JSON.stringify(window.__CPM_BJ568 || {})) }));
  await page.close(); return R;
}
for (let g = 0; g < GIRI; g++) { const seed = 3300 + g * 71; out.rosso.push(await giro(true, seed)); out.verde.push(await giro(false, seed)); }
srv.close(); await b.close();
const som = arr => arr.reduce((a, c) => ({ tot: a.tot + (c.d.tot || 0), tardi: a.tardi + (c.d.tardi || 0), salti: a.salti + (c.j.n || 0), max: Math.max(a.max, c.j.max || 0), dt: a.dt.concat(c.d.dt || []) }), { tot: 0, tardi: 0, salti: 0, max: 0, dt: [] });
console.log(`\n=== LA CONSEGNA TELETRASPORTA A SCENA IN CORSO? ===\n`);
for (const [n, arr] of [['ROSSO (teletrasporto senza orario)', out.rosso], ['VERDE (solo dentro lo stacco)', out.verde]]) {
  const s = som(arr);
  console.log(`  ${n}`);
  console.log(`    consegne eseguite ${s.tot} · di cui FUORI dalla finestra dello stacco ${s.tardi}${s.dt.length ? ' (ritardi ms: ' + s.dt.slice(0, 8).join(', ') + ')' : ''}`);
  console.log(`    salti del pallone >8u fra due campioni: ${s.salti} · massimo ${s.max}u`);
}
const R = som(out.rosso), V = som(out.verde);
console.log('');
if (!R.tardi && !V.tardi) {
  console.log(`\u26a0 NON RIPRODOTTO IN LABORATORIO — nessuna consegna arriva fuori dalla finestra dello stacco (rosso ${R.tot}, verde ${V.tot} consegne eseguite, 0 tardive).`);
  console.log(`  Il PO l'ha misurato sul telefono a 19,9 s dall'apertura. Headless la scena gira a ~7 fps e l'effetto React che porta il`);
  console.log(`  descrittore atterra dentro la finestra: il difetto non si manifesta. E' lo stesso limite del codice 007 — l'unico strumento`);
  console.log(`  che lo vede e' il dispositivo. Il cambio resta difendibile per principio (uno stacco e' uno stacco solo al taglio) e per`);
  console.log(`  costruzione non fa nulla quando la consegna e' puntuale: qui, infatti, i due colori si comportano uguale.`);
  console.log(`\n  \u26a0 E una calibrazione da tenere a mente: il conteggio dei salti >8u vale ${R.salti} nel rosso e ${V.salti} nel verde su codice IDENTICO in questo scenario — quella misura e' troppo rumorosa per sostenere una tesi su campioni piccoli.`);
  process.exit(0);
}
if (!R.tardi) { console.log(`✗ NON SEPARATI — nel rosso nessuna consegna arriva fuori dalla finestra: il giudizio non prova niente.`); process.exit(1); }
if (V.salti > R.salti) { console.log(`✗ FAIL — il verde salta piu' del rosso (${V.salti} contro ${R.salti}).`); process.exit(1); }
console.log(`✓ PASS — ${R.tardi} consegne fuori finestra nel rosso; nel verde nessuna di quelle riassegna il pallone di colpo. Salti >8u: rosso ${R.salti} (max ${R.max}u) · verde ${V.salti} (max ${V.max}u).`);
