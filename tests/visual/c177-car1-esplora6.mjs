import { apri, shot, testo, sleep, DATI, caricaCarriera, bottoni, clic, overlay, clicIn, cta, snap, giocaPartita } from './c177-car1-lib.mjs';
import fs from 'node:fs'; import path from 'node:path';
const save = JSON.parse(fs.readFileSync(path.join(DATI, 'save-02-ingresso.json'), 'utf8')); save['cpm-match-speed'] = '2';
const g = await apri({ save, glb: true }); const { page } = g;
await caricaCarriera(page);
await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(500);
for (let i = 0; i < 6; i++) { const o = await overlay(page); if (o) { const idx = o.btns.findIndex(b => /Gioca la partita/.test(b)); await clicIn(page, idx >= 0 ? idx : 0); await sleep(1200); if (idx >= 0) break; continue; } await page.click('[data-cpm="avanza23"]'); await sleep(1500); }
console.log('PHASE', await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()));
console.log(await clic(page, /Vedi le formazioni/)); const t0 = Date.now(); let last = '';
for (let i = 0; i < 90; i++) {
  await sleep(1000);
  const ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null);
  const bt = (await bottoni(page)).slice(0, 8).join(' | ');
  const key = ph + '|' + bt;
  if (key !== last) { console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ph, bt, '|', (await testo(page)).replace(/\n/g, ' ').slice(0, 160)); last = key; }
  if (i % 2 === 0 && i < 40) await shot(page, `14-ingresso-${String(i).padStart(2, '0')}`);
  if (ph === 'playing' && i > 3) break;
  const c = await clic(page, /Ingresso in campo|Fischio|Entra in campo|Inizia la partita|Scendi in campo|Calcio d'inizio|Vai in campo/); if (c) console.log('click', c);
}
console.log('ERR', g.errs.filter(e => !/BABEL/.test(e)));
await g.close();
