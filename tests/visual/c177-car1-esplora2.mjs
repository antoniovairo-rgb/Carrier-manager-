import { apri, shot, testo, sleep, clickByText, dumpLS } from './c177-car1-lib.mjs';
const g = await apri({ glb: process.env.GLB === '1' }); const { page } = g;
await clickByText(page, 'Nuova carriera'); await sleep(800);
await page.fill('input[placeholder="Es. Giovanni Pisano"]', 'Luca Ferraro'); await sleep(300);
await clickByText(page, 'Inizia i provini'); await sleep(1000);
await clickByText(page, 'Inizia il provino');
const t0 = Date.now(); let last = '';
for (let i = 0; i < 40; i++) {
  await sleep(2500);
  const info = await page.evaluate(() => ({ ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, btn: [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.textContent || '').trim().slice(0, 40)).slice(0, 12), t: document.body.innerText.slice(0, 200).replace(/\n/g, ' / ') }));
  const s = JSON.stringify(info); if (s !== last) { console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', s); last = s; }
  if (i % 6 == 5) await shot(page, 'tmp-live-' + i);
}
console.log(g.errs.filter(e => !/BABEL/.test(e)));
await g.close();
