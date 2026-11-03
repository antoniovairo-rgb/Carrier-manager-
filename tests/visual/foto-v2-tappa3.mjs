#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 3] FOTO della partita (strumento, non guardiano): 2D, highlight in scelta, post partita, ingresso.
   CPM_FOTO_PREF=prima|dopo · CPM_FORMATI=tel,pc · esce in docs/sviluppo/foto-v2-tappa3/ (PNG piccoli: scala 0,5). */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriPartitaV2, forzaHL, finePartita } from './lib/partita-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PREF = process.env.CPM_FOTO_PREF || 'dopo';
const FORMATI = { tel: { k: 'tel', w: 412, h: 915, touch: true }, tab: { k: 'tab', w: 820, h: 1180, touch: true }, pc: { k: 'pc', w: 1440, h: 900, touch: false } };
const SCELTI = (process.env.CPM_FORMATI || 'tel,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
const SCHERMI = (process.env.CPM_SCHERMI || 'ingresso,partita2d,highlight,post').split(',');
const OUT = new URL('../../docs/sviluppo/foto-v2-tappa3/', import.meta.url).pathname;
const srv = await startServer(); const b = await launchBrowser();
const shot = async (page, n) => { await page.screenshot({ path: `${OUT}${PREF}-${n}.png`, scale: 'css' }); console.log('  foto', n); };
for (const f of SCELTI) {
  const errs = [];
  if (SCHERMI.includes('ingresso')) { const { ctx, page } = await apriPartitaV2(b, srv.address().port, f, { errs, ingresso: true }); await sleep(2500); await shot(page, 'ingresso-' + f.k); await ctx.close(); }
  const { ctx, page } = await apriPartitaV2(b, srv.address().port, f, { errs });
  if (SCHERMI.includes('partita2d')) { await sleep(1500); await shot(page, 'partita2d-' + f.k); }
  if (SCHERMI.includes('highlight')) { await forzaHL(page, +(process.env.CPM_GI || 4)); await shot(page, 'highlight-' + f.k); }
  if (SCHERMI.includes('post')) { const ok = await finePartita(page); await sleep(2000); console.log('  fine', ok); await shot(page, 'post-' + f.k); }
  console.log(f.k, errs.slice(0, 3).join(' | ')); await ctx.close();
}
await b.close(); srv.close();
