/* Collaudo 177 carriera 1: creazione eroe (attaccante), 3 provini dal vivo, offerte; salva lo stato */
import { apri, shot, testo, sleep, clickByText, dumpLS, giocaPartita, log, dif, DATI } from './c177-car1-lib.mjs';
import fs from 'node:fs'; import path from 'node:path';
const g = await apri({ save: { 'cpm-match-speed': '2' }, glb: process.env.GLB === '1' }); const { page } = g;
const bottoni = () => page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.textContent || '').trim().slice(0, 60)));
await shot(page, '01-home-avvio');
await clickByText(page, 'Nuova carriera'); await sleep(800);
await page.fill('input[placeholder="Es. Giovanni Pisano"]', 'Luca Ferraro'); await sleep(300);
await shot(page, '02-creazione-nome');
console.log('CREA', (await testo(page)).replace(/\n/g, ' | ').slice(0, 900));
await clickByText(page, 'Inizia i provini'); await sleep(1200);
for (let p = 1; p <= 3; p++) {
  console.log('--- PROVINO', p, 'pre:', (await testo(page)).replace(/\n/g, ' | ').slice(0, 400));
  if (p === 1) await shot(page, '03-provino1-intro');
  await clickByText(page, p === 1 ? 'Inizia il provino' : 'Vai al Provino'); await sleep(800); if (p > 1) { await clickByText(page, 'Inizia il provino', 4000); await sleep(500); }
  const r = await giocaPartita(page, { tag: `04-provino${p}`, politica: (n, sc) => (n + p) % sc.length, foto: p === 1 ? 2 : 0 });
  console.log('provino', p, 'highlight:', r.hls.length, 'ms', r.ms);
  for (const h of r.hls) console.log('  HL', h.min, '|', h.scelta, '=>', (h.esitoTxt || '').slice(0, 260), JSON.stringify(h.ball), JSON.stringify(h.act));
  fs.appendFileSync(path.join(DATI, 'highlight.jsonl'), r.hls.map(h => JSON.stringify({ fase: 'provino' + p, ...h })).join('\n') + '\n');
  await shot(page, `05-provino${p}-fine`);
  console.log('FINE', r.ph, (r.txt || '').replace(/\n/g, ' | ').slice(0, 700));
  await clickByText(page, 'Risultati provino'); await sleep(1500);
  console.log('dopo risultati:', (await testo(page)).replace(/\n/g, ' | ').slice(0, 900), '\nBTN', await bottoni());
  await shot(page, `06-provino${p}-risultati`);
  if (p < 3) { /* prossimo provino */ }
}
fs.writeFileSync(path.join(DATI, 'save-01-post-provini.json'), JSON.stringify(await dumpLS(page)));
console.log('ERR', g.errs.filter(e => !/BABEL/.test(e)));
await g.close();
