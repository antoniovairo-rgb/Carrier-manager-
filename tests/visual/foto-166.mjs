#!/usr/bin/env node
/* [giro 166] FOTO della partita a soli highlight (non e' un guardiano): prompt prima (rosso __CPM_NO_G166) e dopo, velo del gioco
   fluido, una scena, schermata finale — a 375 px (telefono) e 1366 px (PC). Scrive in docs/sviluppo/giro166/.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node foto-166.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { apriCarriera166, apriPrompt166, gioca166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/sviluppo/giro166'); fs.mkdirSync(OUT, { recursive: true });
const VP = [['375', { width: 375, height: 812 }], ['pc', { width: 1366, height: 768 }]];
for (const [tag, vp] of VP) {
  const R = await apriCarriera166({ vp, init: { __CPM_NO_G166: true } }); const pr = await apriPrompt166(R.page); await R.page.screenshot({ path: `${OUT}/${tag}-prompt-prima.png` }); await R.b.close(); R.srv.close();
  const A = await apriCarriera166({ vp }); const pd = await apriPrompt166(A.page); await A.page.screenshot({ path: `${OUT}/${tag}-prompt-dopo.png` });
  const r = await gioca166(A.page, 'solo', { foto: [
    { nome: 'velo', quando: s => s.v && s.m >= 8, file: `${OUT}/${tag}-velo.png` },
    { nome: 'scena', quando: s => s.f === 'hl_choose' || s.f === 'hl_move', file: `${OUT}/${tag}-scena.png` },
    { nome: 'esito', quando: s => s.f === 'hl_result', file: `${OUT}/${tag}-esito.png` }] });
  await sleep(800); await A.page.screenshot({ path: `${OUT}/${tag}-finale.png` });
  console.log(tag, 'prima', JSON.stringify(pr.bottoni), 'dopo', JSON.stringify(pd.bottoni), 'finita', r.finita, 'partita', (r.tPartita / 1000).toFixed(1) + ' s', 'errori', A.errs.length);
  await A.b.close(); A.srv.close();
}
