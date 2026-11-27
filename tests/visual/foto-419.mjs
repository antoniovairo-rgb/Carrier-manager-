#!/usr/bin/env node
/* [giro 419, PO-682] FOTO prima/dopo del colpo di testa dell'eroe da angolo e da cross sul percorso vero (origine _ORIG26), GLB acceso,
   scena ferma nel fotogramma in cui parte l'arco del colpo. «prima» = rosso __CPM_NO_G419, «dopo» = correzione. Scrive docs/collaudo-po/419-*.png */
import fs from 'node:fs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { CASI419, caso419 } from './misura-419.mjs';
const DIR = new URL('../../docs/collaudo-po/', import.meta.url).pathname; fs.mkdirSync(DIR, { recursive: true });
const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
for (const k of ['angolo-dx-ok', 'cross-dx-fail']) { const caso = CASI419.find(c => c.k === k);
  for (const [nome, rosso] of [['prima', ['__CPM_NO_G419']], ['dopo', []]]) {
    const f = `${DIR}419-${nome}-${k}.png`; const r = await caso419(b, port, caso, { rosso, foto: f });
    console.log(`${nome} ${k}: ${r.err || `corpo↔porta ${r.ang}° → ${fs.existsSync(f) ? f : 'FOTO NON SCATTATA'}`}`); } }
await b.close(); server.close();
