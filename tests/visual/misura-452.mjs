#!/usr/bin/env node
/* [giro 452] SONDA (solo misura): le scene PROVA/TARDI di prestacco-422 con il volo 274 e l'attesa 146 annotati.
   CPM_CPU442=N rallenta il processore via CDP; CPM_RIP=N ripete la lista. Stampa una riga per scena. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { scena, giudica } from './testa-342.mjs';
const L0 = process.env.CPM_CASI452 ? process.env.CPM_CASI452.split(',').map(x => x.split(':').map(Number)) : [[53, 1, 1], [48, 1, 1], [108, 0, 1], [108, 0, 2], [48, 1, 2]];
const L = []; for (let i = 0; i < +(process.env.CPM_RIP || 1); i++) L.push(...L0);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); let idx = 0;
const w = async () => { while (idx < L.length) { const [gi, k, p] = L[idx++]; const o = { w422: {}, cattura: {}, extra: p === 2 ? ['__CPM_TESTA422_PROVA', '__CPM_PROVA442_TARDI'] : ['__CPM_TESTA422_PROVA'] };
  const r = await scena(b, port, gi, k, 'success', o); if (process.env.CPM_DUMP) { const fs = await import('node:fs'); const f = `out/giro342/dump-${process.env.CPM_ETI || 'verde'}-gi${gi}-a${k}-success.json`; try { fs.renameSync(f, f.replace('.json', `-p${p}-${idx}.json`)); } catch (e) {} } const c = o.cattura.v || {}; const m = giudica(r);
  console.log(JSON.stringify({ gi, k, p, dCont: r.dCont, scPicco: r.scPicco, scatto: r.scatto, tScatto: r.tScatto, scClip: r.scClip, n: r.n, tc: r.tc, fps: c.fps && +c.fps.toFixed(1), t274: c.t274, w422: o.w422.v, boc: m })); } };
await Promise.all(Array.from({ length: +(process.env.CPM_PAR || 3) }, w)); await b.close(); srv.close();
