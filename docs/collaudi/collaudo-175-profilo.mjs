#!/usr/bin/env node
/* COLLAUDO 7.999.175 — controllo DOM del Profilo sul salvataggio 174 (stile regista + Enfant acceso).
   Verde = build 175. Rosso = __CPM_NO_STILEUNICO75 (comportamento 174). Serve a dimostrare che la sonda
   vede la riga Enfant quando esiste, e dove sta la card «Stile di gioco». */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..');
const SAVE = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'visual', 'fixtures', 'save-190-s12-ovr93.json'), 'utf8'));
SAVE.player.archetype = { id: 'regista', e: '🎯', name: 'Regista' };
SAVE.player.tratti = { ...(SAVE.player.tratti || {}), enfant: true };
const srv = await startServer(ROOT); const port = srv.address().port;
const b = await launchBrowser();
const out = {};
for (const [nome, rosso] of [['verde', false], ['rosso', true]]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  await page.addInitScript(([s, r]) => { try { localStorage.clear(); } catch (e) {} window.__CPM_GLB = false; window.__CPM_FIS_APERTE = 1; if (r) window.__CPM_NO_STILEUNICO75 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [SAVE, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 });
  await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(800);
  await page.evaluate(() => { const nav = document.querySelector('.cpm-nav-tabs'); const bt = [...nav.querySelectorAll('button')].filter(x => x.offsetParent !== null && x.querySelector('div'))[3]; bt.click(); });
  await sleep(900);
  await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Profilo/.test(x.textContent || '') && x.offsetParent !== null); if (bt) bt.click(); });
  await sleep(1200);
  await page.evaluate(() => { const el = [...document.querySelectorAll('div,button,summary')].find(x => /Stile di gioco:/i.test(x.textContent || '') && x.children.length <= 3 && x.offsetParent !== null); if (el) el.click(); });
  await sleep(900);
  out[nome] = await page.evaluate(() => {
    const t = document.body.innerText || '';
    const righe = t.split('\n').filter(l => /Stile|Enfant/i.test(l));
    return { righeConStileOEnfant: righe.slice(0, 12), testoEnfantPagina: /Enfant/i.test(t), riga_dom: !!document.querySelector('[data-cpm="tratto-enfant-profilo"]'), altezzaPagina: document.documentElement.scrollHeight };
  });
  await ctx.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(out, null, 1));
