#!/usr/bin/env node
/* [giro 415, PO-679] FOTO prima/dopo del finalizzatore del «Cross a rientrare» al contatto (GLB acceso, teatro acceso).
   «prima» = rosso __CPM_NO_G415 (stesso comportamento misurato sulla 7.999.217), «dopo» = correzione. Scrive docs/collaudo-po/415-*.png */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { giocaCutback } from './misura-415.mjs';
const DIR = new URL('../../docs/collaudo-po/', import.meta.url).pathname; fs.mkdirSync(DIR, { recursive: true });
const SCENE = [[[72, 84, 1.2], 13, 'destra'], [[72, 16, 1.2], 23, 'sinistra']];
/* come apri() di misura-364, ma a deviceScaleFactor 2 (foto per il PO) */
async function apri(b, port, rossi) {
  const pg = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 }); await installCdnRoutes(pg); pg.__err364 = [];
  await pg.addInitScript((r) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC364 = 1; window.__CPM_REC241 = 1; window.__CPM_F364 = []; for (const k of r) window[k] = 1; }, rossi);
  await openMatch(pg, port, { skipLoadAll: true, name: 'Fasce364' }); await sleep(800);
  await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {}); return pg;
}
const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
for (const [nome, rossi] of [['prima', ['__CPM_NO_G415']], ['dopo', []]]) for (const [p, seme, lato] of SCENE) {
  const pg = await apri(b, port, rossi);
  const run = giocaCutback(pg, { occ: p, seme });
  /* la scena si ferma (dt 0) nel fotogramma in cui il compagno ha la clip di calcio avviata: la foto non dipende dalla latenza dello scatto */
  const nd = await pg.waitForFunction(() => { const w = (window.__CPM_FIN415 || []).find(w => w.g === 'kick' && w.gn === 'kick' && w.gt != null && w.gt >= 0.05); if (w) { window.__CPM_FROZEN = true; return w.nd || [0, 0]; } return false; }, null, { timeout: 40000, polling: 'raf' }).then(h => h.jsonValue()).catch(() => null);
  const f = `${DIR}415-${nome}-${lato}.png`;
  if (nd) { await sleep(400); await pg.screenshot({ path: f }); const R = await pg.evaluate(() => { const c = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }); const cx = R.x + (nd[0] + 1) / 2 * R.w, cy = R.y + (1 - nd[1]) / 2 * R.h;
    await pg.screenshot({ path: f.replace('.png', '-zoom.png'), clip: { x: Math.max(0, Math.min(412 - 160, cx - 80)), y: Math.max(0, Math.min(915 - 160, cy - 95)), width: 160, height: 160 } }); }
  console.log(`${nome} ${lato}: ${nd ? f + ' (finalizzatore a schermo ' + nd.join(',') + ')' : 'gesto non trovato'}`);
  await pg.evaluate(() => { window.__CPM_FROZEN = false; }).catch(() => {});
  await run.catch(() => {}); await pg.close();
}
await b.close(); server.close();
