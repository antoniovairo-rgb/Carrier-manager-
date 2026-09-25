#!/usr/bin/env node
/* SONDA — CREDIBILITA' DEGLI HIGHLIGHT (25/09, collaudo PO «passaggi e movimenti senza senso»). Solo misura, nessun giudizio.
   Flusso VERO (niente scene forzate), teatro acceso (__CPM_PRESENT), corpi procedurali per avere il tempo di scena vicino al reale.
   Campiona __CPM_STATE (22 + eroe + pallone, dalle mesh) e __CPM_ARC (voli del pallone) ogni ~120 ms nelle fasi hl_*.
   Uscita: out/hl-credibilita.json con i campioni grezzi; l'analisi la fa hl-credibilita-analisi.mjs. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'fs';
const N = +(process.env.CPM_PARTITE || 3), MS = +(process.env.CPM_MS || 150000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const tutte = [];
for (let k = 0; k < N; k++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Credibile' + k });
  await page.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 500 + k * 37);
  const t0 = Date.now(); const camp = [];
  while (Date.now() - t0 < MS) {
    const f = await page.evaluate(() => { try { const ph = window.__CPM_PHASE ? window.__CPM_PHASE() : null; if (!ph || !/^hl_/.test(ph)) return { ph };
      const s = window.__CPM_STATE(); const a = window.__CPM_ARC || null;
      return { ph, t: performance.now(), c: s.clock, P: s.players.map(p => [p.team === 'home' ? 1 : p.team === 'away' ? 2 : 0, p.gk ? 1 : 0, p.x, p.y]), H: [s.hero.x, s.hero.y], B: [s.ball.x, s.ball.y, s.ball.worldY],
        arc: a && a.arc ? a.arc : null, ht: a ? a.ht : null, ek: a ? a.ek : null }; } catch (e) { return { err: String(e).slice(0, 80) }; } });
    if (f && f.ph === 'ended') break;
    if (f && f.t) camp.push(f);
    await sleep(f && f.t ? 110 : 400);
  }
  console.log(`partita ${k}: ${camp.length} campioni negli highlight`);
  tutte.push(camp); await page.close();
}
await b.close(); srv.close();
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/hl-credibilita.json', JSON.stringify(tutte));
console.log('scritto out/hl-credibilita.json');
