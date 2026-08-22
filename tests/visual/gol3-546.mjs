#!/usr/bin/env node
/* DIAGNOSI — I TRE PALLONI AL MOMENTO DEL GOL.
   `gol-546` dice che il pallone arriva in area (7-13u dalla linea) ma non entra. La riga del gol porta
   `bpos:{x:98}` e il gol del microsim RIUSA quella riga (r.21183), quindi il BERSAGLIO dovrebbe andare in
   rete. Questa distingue le tre possibilita':
     (a) il bersaglio NON va a 98            -> qualcuno lo riscrive
     (b) il bersaglio ci va, la mesh no      -> la corsa e' troppo lenta per i 4 tick di `kickRef`
     (c) ci arrivano entrambi ma dopo il kickoff -> la finestra e' troppo corta
   Campiona bersaglio, logico e mesh a 60ms e stampa i tick attorno a ogni gol. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 3);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false; window.__CPM_B3 = [];
    setInterval(() => { try { const q = window.__CPM_BALL3 && window.__CPM_BALL3(); if (q) window.__CPM_B3.push(q); } catch (_e) {} }, 60);
  });
  await openMatch(page, port, { skipLoadAll: true, name: 'G3' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  out.push(await page.evaluate(() => ({
    gol: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle' && /goal/.test(String(e.ef || ''))).map(e => ({ min: e.min, ef: e.ef })),
    b3: window.__CPM_B3 || []
  })));
  await page.close();
}
srv.close(); await b.close();
console.log('\n=== I TRE PALLONI AL MOMENTO DEL GOL ===');
console.log('   t = bersaglio · l = logico · m = mesh · ko/kf = conto del calcio d\'inizio\n');
let bersOk = 0, meshOk = 0, tot = 0;
for (const { gol, b3 } of out) for (const g of gol) {
  tot++;
  const gx = /opp/.test(g.ef) ? 0 : 100;
  const w = b3.filter(q => q.c >= g.min - 1 && q.c <= g.min + 6);
  if (!w.length) { console.log(`  ${g.min}' — nessun campione`); continue; }
  const bt = Math.min(...w.map(q => Math.abs(gx - q.t.x)));
  const bm = Math.min(...w.map(q => q.m ? Math.abs(gx - q.m.x) : 1e9));
  const bl = Math.min(...w.map(q => Math.abs(gx - q.l.x)));
  if (bt <= 4) bersOk++; if (bm <= 6) meshOk++;
  console.log(`  ${String(g.min).padStart(2)}' ${g.ef.padEnd(10)} bersaglio ${bt.toFixed(1)}u · logico ${bl.toFixed(1)}u · mesh ${bm.toFixed(1)}u  dalla linea`);
  /* la corsa, tick per tick, da quando il bersaglio entra in area */
  const seq = w.filter(q => Math.abs(gx - q.t.x) <= 12).slice(0, 10);
  if (seq.length) console.log(`        corsa: ${seq.map(q => `t${q.t.x.toFixed(0)}/m${q.m ? q.m.x.toFixed(0) : '?'}${(q.g?'[COLLA]':'')+(q.src?'{'+q.src+'}':'{-}')+(q.ko ? '[ko' + q.ko + ']' : '')}${q.kf ? '[kf' + q.kf + ']' : ''}`).join(' -> ')}`);
}
console.log(`\n  bersaglio in rete (<=4u): ${bersOk}/${tot}   ·   mesh in rete (<=6u): ${meshOk}/${tot}`);
console.log(bersOk > meshOk ? '\n>> IL BERSAGLIO CI VA, LA MESH NO: la corsa non sta nei tick del calcio d\'inizio.'
          : meshOk === tot ? '\n>> Bersaglio e mesh arrivano entrambi: la finestra basta.'
          : bersOk < tot ? '\n>> Nemmeno il bersaglio ci va: qualcuno lo riscrive prima.'
          : '\n>> Bersaglio e mesh pari sotto il totale: il residuo non e\' la finestra.');
console.log('⚠️ campione piccolo: queste distanze NON sono ripetibili fra giri (caso 7.545), il tasso vale poco.');
