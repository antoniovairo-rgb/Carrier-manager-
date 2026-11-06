#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 2] FOTO delle schermate di carriera (strumento, non guardiano). Stesso banco di grafica-v2.mjs.
   CPM_FOTO_PREF=prima|dopo · CPM_FORMATI=tel,pc · CPM_SCHERMI=dashboard,standings,... Esce in docs/sviluppo/foto-v2-tappa2/. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PREF = process.env.CPM_FOTO_PREF || 'dopo';
const FORMATI = { tel: { k: 'tel', w: 412, h: 915, touch: true }, tabv: { k: 'tabv', w: 820, h: 1180, touch: true }, tabo: { k: 'tabo', w: 1180, h: 820, touch: true }, pc: { k: 'pc', w: 1440, h: 900, touch: false } };
const SCELTI = (process.env.CPM_FORMATI || 'tel,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
const SCHERMI = (process.env.CPM_SCHERMI || 'dashboard,standings,calendar,club,agente,ufficio').split(',');
const OUT = new URL('../../docs/sviluppo/foto-v2-tappa2/', import.meta.url).pathname;
const srv = await startServer(); const b = await launchBrowser();
for (const f of SCELTI) {
  const { ctx, page } = await apriBancoV2(b, srv.address().port, f, {});
  if (!page) { console.log(f.k + ': carriera non raggiunta'); continue; }
  for (const t of SCHERMI) {
    await page.evaluate(t => window.__CPM_CAREER.goTab(t), t); await sleep(900);
    await page.evaluate(() => { const s = document.querySelector('.cpm-scroll'); if (s) s.scrollTop = 0; window.scrollTo(0, 0); });
    await page.screenshot({ path: `${OUT}${PREF}-${t}-${f.k}.jpg`, type: 'jpeg', quality: 55, fullPage: false });
  }
  await ctx.close();
}
await b.close(); srv.close(); console.log('foto in ' + OUT);
