#!/usr/bin/env node
/* SONDA — DOVE STA IL PALLONE QUANDO SI SCRIVE UN GOL, MINUTO PER MINUTO.
   Non e' un guardiano: misura. Il giudice della cronaca dice che la riga di gol dichiara la porta
   (98,50) e il pallone si vede a 27 unita' dalla linea, sempre allo stesso minuto. Prima di rimediare
   serve sapere SE il pallone ci arriva un minuto dopo (allora e' la finestra del giudice a chiudersi
   troppo presto) oppure NON ci arriva mai (allora e' il motore che non lo porta in rete).
   Stampa la traccia per minuto (`__CPM_TR571`) nei sei minuti attorno a ogni riga di gol. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.PARTITE || 2);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_TR571 = []; window.__CPM_K573 = { att: 0, log: [] }; });
  await openMatch(page, port, { skipLoadAll: true, name: (process.env.NOME || 'Gl') + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => ({
    righe: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'),
    trT: window.__CPM_TR571 || [], k573: (window.__CPM_K573 || {}).att | 0, klog: (window.__CPM_K573 || {}).log || [],
  })));
  await page.close();
}
srv.close(); await b.close();

console.log('\n=== DOVE STA IL PALLONE QUANDO SI SCRIVE UN GOL (' + PARTITE + ' partite) ===\n');
for (let i = 0; i < tutte.length; i++) {
  const { righe, trT } = tutte[i];
  const byMin = new Map(); for (const t of trT) byMin.set(t.c | 0, t);
  const gol = righe.filter(r => /goal$/.test(String(r.ef || '')));
  console.log('  partita ' + (i + 1) + ' — minuti tracciati ' + trT.length + ' · righe di gol ' + gol.length + ' · tick in cui la ripartenza HA ATTESO: ' + (tutte[i].k573 | 0));
  for (const g of gol) {
    const m = g.min | 0;
    console.log("    " + m + "'  ef=" + g.ef + '  dichiara (' + g.bx + ',' + g.by + ')');
    for (let k = m - 1; k <= m + 5; k++) {
      const t = byMin.get(k); if (!t) { console.log('        ' + k + "'  (nessun campione)"); continue; }
      console.log('        ' + k + "'  x " + t.x0.toFixed(0) + '→' + t.x.toFixed(0) + '  [' + t.xmin.toFixed(0) + '..' + t.xmax.toFixed(0) + ']   y ' + t.y.toFixed(0) + '   campioni ' + t.n);
    }
    const lg = (tutte[i].klog || []).filter(o => o.c >= m - 1 && o.c <= m + 6);
    if (lg.length) console.log('        ripartenza: ' + lg.map(o => o.c + "'kr" + o.kr + (o.gx == null ? '/gx-' : '/gx' + o.gx) + (o.in ? '/DENTRO' : '') + ' palla' + o.bx + '→bersaglio' + o.tx).join('  |  '));
    console.log('');
  }
}
const arrivi = [];
for (const { righe, trT } of tutte) {
  const byMin = new Map(); for (const t of trT) byMin.set(t.c | 0, t);
  for (const g of righe.filter(r => /goal$/.test(String(r.ef || '')))) {
    const m = g.min | 0, verso = (+g.bx >= 50) ? 1 : -1; let quando = null;
    for (let k = 0; k <= 8; k++) { const t = byMin.get(m + k); if (!t) continue;
      if (verso > 0 ? (t.xmax >= 95) : (t.xmin <= 5)) { quando = k; break; } }
    arrivi.push(quando);
  }
}
const ok = arrivi.filter(a => a != null && a <= 5).length, tardi = arrivi.filter(a => a != null && a > 5).length, mai = arrivi.filter(a => a == null).length;
const num = arrivi.filter(a => a != null);
console.log('  --- QUANTI TICK IMPIEGA IL PALLONE A ENTRARE, DA QUANDO IL GOL E\' SCRITTO ---');
console.log('  gol misurati ' + arrivi.length + '  ·  entra entro i 5 tick della ripartenza ' + ok + '  ·  entra TARDI ' + tardi + '  ·  non entra mai ' + mai);
if (num.length) console.log('  ritardo: minimo ' + Math.min(...num) + '  mediana ' + num.slice().sort((a,b)=>a-b)[num.length>>1] + '  massimo ' + Math.max(...num) + ' tick');
console.log('');
console.log('CENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
