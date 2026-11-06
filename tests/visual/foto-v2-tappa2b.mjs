#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 2b] FOTO delle finestre e dei momenti (strumento, non guardiano). Banco di grafica-v2 (banco-v2.mjs).
   CPM_FOTO_PREF=prima|dopo · CPM_FORMATI=tel,pc · CPM_SCHERMI=intervista,offerta,... Esce in docs/sviluppo/foto-v2-tappa2b/. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PREF = process.env.CPM_FOTO_PREF || 'dopo';
const FORMATI = { tel: { k: 'tel', w: 412, h: 915, touch: true }, tabv: { k: 'tabv', w: 820, h: 1180, touch: true }, tabo: { k: 'tabo', w: 1180, h: 820, touch: true }, pc: { k: 'pc', w: 1440, h: 900, touch: false } };
const SCELTI = (process.env.CPM_FORMATI || 'tel,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
export const APRI = {
  intervista: () => window.__CPM_CAREER.forceInterview('win'), offerta: () => window.__CPM_CAREER.forceOffer(),
  finestagione: () => window.__CPM_CAREER.apriFine302('stagione'), finecarriera: () => window.__CPM_CAREER.apriFine302('carriera'),
  calendario: () => window.__CPM_CAREER.goTab('calendar'), coppe: () => window.__CPM_CAREER.goTab('coppe'),
};
const SCHERMI = (process.env.CPM_SCHERMI || Object.keys(APRI).join(',')).split(',');
const OUT = new URL('../../docs/sviluppo/foto-v2-tappa2b/', import.meta.url).pathname;
const srv = await startServer(); const b = await launchBrowser();
for (const f of SCELTI) for (const t of SCHERMI) {
  const errs = []; const { ctx, page } = await apriBancoV2(b, srv.address().port, f, { errs });
  if (!page) { console.log(f.k + ': carriera non raggiunta'); continue; }
  const r = await page.evaluate(APRI[t]).catch(e => 'err ' + e.message); await sleep(1800);
  if (t === 'finecarriera') for (let k = 0; k < 4; k++) { const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => /^(Continua|Rivivi la carriera)/.test((b.textContent || '').trim())); if (x) x.click(); return !!x; }); if (!ok) break; await sleep(900); }/* la cerimonia d'addio prima della pagina */
  await page.evaluate(() => { const s = document.querySelector('.cpm-scroll'); if (s) s.scrollTop = 0; window.scrollTo(0, 0); });
  await page.screenshot({ path: `${OUT}${PREF}-${t}-${f.k}.jpg`, type: 'jpeg', quality: 50, fullPage: false });
  console.log(f.k, t, JSON.stringify(r), errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await b.close(); srv.close(); console.log('foto in ' + OUT);
