import { apri, shot, testo, sleep, DATI, caricaCarriera, bottoni, clic, overlay, clicIn, cta, snap, giocaPartita } from './c177-car1-lib.mjs';
import fs from 'node:fs'; import path from 'node:path';
const save = JSON.parse(fs.readFileSync(path.join(DATI, 'save-02-ingresso.json'), 'utf8')); save['cpm-match-speed'] = '2';
const g = await apri({ save, glb: true }); const { page } = g;
await caricaCarriera(page);
await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(500);
let live = false;
for (let i = 0; i < 40; i++) {
  const ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null);
  if (ph && ph !== 'null') {
    const r = await giocaPartita(page, { tag: '13-w1', politica: (n, sc) => n % sc.length, foto: 1 });
    console.log('PARTITA FINITA', r.ph, r.hls.length, (r.txt || '').replace(/\n/g, ' | ').slice(0, 300)); live = true; await shot(page, '13-w1-postpartita');
    // post-partita
    for (let k = 0; k < 12; k++) { const bt = await bottoni(page); console.log('  POST BTN', bt.join(' | ')); console.log('  POST', (await testo(page)).replace(/\n/g, ' | ').slice(0, 400)); const c = await clic(page, /Continua|Avanti|Chiudi|Torna|Home|Prosegui|Fine|OK/); console.log('  click', c); await sleep(1500); await shot(page, `13-w1-post-${k}`); if (!c) break; if (await cta(page)) break; }
    break;
  }
  const o = await overlay(page);
  if (o) { console.log(`#${i} OVERLAY`, o.txt.replace(/\n/g, ' | ').slice(0, 500), '\n   BTN', o.btns); const idx = o.btns.findIndex(b => /Gioca la partita/.test(b)); await clicIn(page, idx >= 0 ? idx : 0); await sleep(1500); continue; }
  const c = await cta(page); console.log(`#${i} CTA`, JSON.stringify(c));
  await page.click('[data-cpm="avanza23"]').catch(e => console.log('noclick')); await sleep(1500);
}
console.log('ERR', g.errs.filter(e => !/BABEL/.test(e)));
console.log('SNAP', JSON.stringify(await snap(page)).slice(0, 300));
fs.writeFileSync(path.join(DATI, 'save-03-w2.json'), JSON.stringify(await (await import('./c177-car1-lib.mjs')).dumpLS(page)));
await g.close();
