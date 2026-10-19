import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url))); { const pl = save.player || save; const c = pl.calendar.find(x => !x.played && x.type !== 'cup' && x.opponentId);  }
const OUT = process.env.FOTO; fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const tpl of ['']) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, t]) => { window.__CPM_GLB = false; if (t) window.__CPM_STADIUM_TPL_FORCE = t; if (t) window.__CPM_STADIUM_CAP_FORCE = t === 'borgo' ? 3000 : 60000; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, tpl]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  for (const t of ['Club', 'Stadio']) { await page.evaluate(x => { const els = [...document.querySelectorAll('button,div,span')].filter(e => e.offsetParent !== null && (e.textContent || '').trim() === x && e.children.length < 3); (els[els.length - 1] || {}).click && els[els.length - 1].click(); }, t); await sleep(1500); }
  const info = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), txt: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 500), tipo: [...document.querySelectorAll('[data-cpm="tipo-stadio"]')].map(e => e.textContent) }));
  await page.screenshot({ path: path.join(OUT, `club-${tpl || 'club'}.png`) });
  console.log(tpl || 'club', JSON.stringify(info).slice(0, 600)); await ctx.close();
}
await b.close(); srv.close();
