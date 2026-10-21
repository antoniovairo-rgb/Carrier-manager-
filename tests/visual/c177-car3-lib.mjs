/* Collaudo 177 carriera 3 «Nazionale» — libreria comune del driver (solo collaudo, non tocca il gioco). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
export { sleep };
export const OUT = path.resolve('../../docs/collaudi/dati-carriera-177-3');
export const FOTO = path.resolve('../../docs/collaudi/foto-carriera-177-3');
export const SAVEF = path.join(OUT, 'salvataggio-corrente.json');
export async function apri({ salvataggio = null, glb = false } = {}) {
  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errori = [];
  page.on('pageerror', e => errori.push({ t: 'pageerror', m: String(e.message).slice(0, 300) }));
  page.on('console', m => { if (m.type() === 'error') errori.push({ t: 'console', m: m.text().slice(0, 300) }); });
  await page.addInitScript(([sv, g]) => { window.__CPM_GLB = !!g; if (sv) { try { for (const k in sv) if (!localStorage.getItem('__c177done')) localStorage.setItem(k, sv[k]); localStorage.setItem('__c177done', '1'); } catch (e) {} } }, [salvataggio, glb]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  return { page, browser, srv, errori };
}
export async function testo(page) { return page.evaluate(() => document.body.innerText); }
export async function foto(page, nome) { const f = path.join(FOTO, nome + '.png'); await page.screenshot({ path: f }); return f; }
export async function tocca(page, testoVisibile, timeout=5000){try{await page.getByText(testoVisibile,{exact:false}).first().click({timeout});return true;}catch(e){return false;}}
export async function clicca(page, rx, { exact = false, timeout = 4000 } = {}) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const ok = await page.evaluate(([s, ex]) => {
      const re = new RegExp(s, 'i');
      const els = [...document.querySelectorAll('button,[role=button],div,span')].filter(e => { const t = (e.innerText || '').trim(); return t && re.test(t) && t.length < 120; });
      // il più interno cliccabile
      els.sort((a, b) => (a.innerText.length - b.innerText.length));
      const el = els[0]; if (!el) return false; el.click(); return (el.innerText || '').trim().slice(0, 60);
    }, [rx, exact]);
    if (ok) return ok;
    await sleep(200);
  }
  return false;
}
