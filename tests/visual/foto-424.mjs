#!/usr/bin/env node
/* [giro 424, PO-653] FOTO di collaudo (non guardiano): la stessa scena di passaggio alla fine della lettura, prima (rosso __CPM_NO_G424)
   e dopo la correzione, GLB acceso, teatro acceso, vista telefono. Uscita: docs/collaudo-po/424-<scena>-prima|dopo.png */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri } from './misura-364.mjs';
const SC = (process.env.CPM_SCENE || '19,15').split(',').map(Number);
const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
for (const [nome, rossi] of [['prima', ['__CPM_NO_G424']], ['dopo', []]]) for (const gi of SC) {
  const pg = await apri(b, port, rossi);
  await pg.evaluate((gi) => { const z = SITUATIONS[gi].startZone; window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2200; window.__CPM_FORCE_SIT(gi, true, { x: (z.x[0] + z.x[1]) / 2, y: (z.y[0] + z.y[1]) / 2 }); }, gi);
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(2500); const f = `../../docs/collaudo-po/424-gi${gi}-${nome}.png`; await pg.screenshot({ path: f }); console.log('foto', f); await pg.close();
}
await b.close(); server.close();
