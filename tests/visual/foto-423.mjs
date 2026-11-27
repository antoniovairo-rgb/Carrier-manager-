#!/usr/bin/env node
/* [giro 423 PO-642] FOTO DI COLLAUDO (non guardiano): la stessa partita vera (salvataggio 194, seme della sonda misura-423, GLB acceso,
   scheda eroe_marcato provocata al 25' con __CPM_FORZA423, «Seguo le indicazioni»), giocata due volte: col rosso __CPM_NO_G423 (prima)
   e senza (dopo). Foto a 26' (subito dopo la scelta) e a 32' (sei minuti dopo) → docs/collaudo-po/423-{prima,dopo}-{26,32}.png */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { partita423 } from './misura-423.mjs';
const DOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'collaudo-po');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const giro = async (nome, rossi) => { const foto = [26, 32].map(m => ({ min: m, path: path.join(DOC, `423-${nome}-${m}.png`) }));
  const p = await partita423(b, port, 3, { idx: 0, forza: 1, rossi, fino: 34, foto });
  console.log(nome, foto.map(f => `${f.min}': ${f.fatta ? `minuto ${f.ck}, eroe a ${Math.abs(f.hy - 50).toFixed(1)} dal centro (motore)` : 'NON FATTA'}`).join(' · '), p.errore || ''); };
await Promise.all([giro('prima', '__CPM_NO_G423'), giro('dopo', '')]);
await b.close(); srv.close();
