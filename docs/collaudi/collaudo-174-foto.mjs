#!/usr/bin/env node
/* COLLAUDO 7.999.174 (carriera) — sonda di fotografia, NON gioco.
   Carica il salvataggio di prova a 412x915 e 360 px, scorre le schede della barra in basso
   (.cpm-nav-tabs) e salva una foto per ogni scheda. Stampa l'elenco delle schede viste e gli errori di pagina.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node collaudo-174-foto.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'foto-7.999.174-carriera');
const SAVE = JSON.parse(fs.readFileSync(path.join(HERE, '..', '..', 'tests', 'visual', 'fixtures', 'save-190-s12-ovr93.json'), 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

const srv = await startServer(path.join(HERE, '..', '..')); const port = srv.address().port;
const b = await launchBrowser();
const report = {};

async function giro(w) {
  const ctx = await b.newContext({ viewport: { width: w, height: 915 }, serviceWorkers: 'block' });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(s => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, SAVE);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(800);

  const labels = await page.evaluate(() => {
    const nav = document.querySelector('.cpm-nav-tabs');
    return nav ? [...nav.querySelectorAll('button')].filter(x => x.offsetParent !== null && x.querySelector('div')).map(x => x.querySelector('div').textContent) : [];
  });
  await page.screenshot({ path: path.join(OUT, `${w}-00-avvio.png`) });
  const visti = [];
  for (let i = 0; i < labels.length; i++) {
    const lab = labels[i];
    try {
      await page.evaluate(idx => {
        const nav = document.querySelector('.cpm-nav-tabs');
        const bt = [...nav.querySelectorAll('button')].filter(x => x.offsetParent !== null && x.querySelector('div'))[idx];
        bt.click();
      }, i);
      await sleep(900);
      const slug = lab.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await page.screenshot({ path: path.join(OUT, `${w}-${String(i + 1).padStart(2, '0')}-${slug}.png`) });
      visti.push(lab);
    } catch (e) { visti.push(`${lab} (non cliccabile: ${String(e.message).slice(0, 80)})`); }
  }
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  report[w] = { schede: visti, scrollOrizzontale: scroll, errori: errs };
  await ctx.close();
}

await giro(412);
await giro(360);
await b.close(); srv.close();
console.log(JSON.stringify(report, null, 1));
