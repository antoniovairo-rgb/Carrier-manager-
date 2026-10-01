/* [7.919] I fondi della scheda azione e del D-pad, in chiaro: richiesta del PO del 16/09. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'pop919'); fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx); const page = await ctx.newPage();
  await page.addInitScript((r) => { window.__CPM_GLB = true; if (r) { window.__CPM_NO919 = true; } }, braccio === 'rosso');
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  await page.evaluate(() => { try { window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(4); } catch (_e) {} });
  for (let i = 0; i < 60; i++) { const ok = await page.evaluate(() => !!document.querySelector('[data-cpm="dpad"] button')); if (ok) break; await sleep(500); }
  const m = await page.evaluate(() => {
    const lum = (s) => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s || ''); return m ? Math.round((0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3]) / 255 * 1000) / 10 : null; };
    const dp = document.querySelector('[data-cpm="dpad"] button');
    const mo = document.querySelector('[data-cpm="mossa"]') || document.querySelector('[data-cpm="scelte"]');
    const primo = (s) => { const m = /rgba?\([^)]+\)/.exec(s || ''); return m ? m[0] : null; };
    return { dpad: dp ? { img: primo(getComputedStyle(dp).backgroundImage), lum: lum(primo(getComputedStyle(dp).backgroundImage) || getComputedStyle(dp).backgroundColor) } : null,
      scheda: mo ? { img: primo(getComputedStyle(mo).backgroundImage), lum: lum(primo(getComputedStyle(mo).backgroundImage) || getComputedStyle(mo).backgroundColor) } : null,
      fase: window.__CPM_PHASE && window.__CPM_PHASE() };
  });
  await page.screenshot({ path: path.join(OUT, `fondi-${braccio}.png`) }).catch(() => {});
  console.log(`${braccio}: fase ${m.fase} · D-pad ${m.dpad ? m.dpad.img + ' (chiarezza ' + m.dpad.lum + '%)' : 'n/d'} · scheda ${m.scheda ? m.scheda.img + ' (chiarezza ' + m.scheda.lum + '%)' : 'n/d'}`);
  await browser.close();
}
server.close();
