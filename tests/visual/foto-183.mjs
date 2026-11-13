#!/usr/bin/env node
/* [giro 183 · PO-375] FOTO di tre domande nuove sui fatti della partita (derby vinto, gol all'ex club, rimonta), su telefono
   (412x915) e su PC (1280x900), salvataggio S12. Non e' un guardiano: e' la prova fotografica per il rapporto del giro.
   Uso: node foto-183.mjs  →  docs/sviluppo/giro183/*.png */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const OUT = new URL('../../docs/sviluppo/giro183/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const SCENE = [[0, 'derby-vinto', { hs: 2, as: 1, casa: true, voto: 7.6, gol: 1 }], [6, 'gol-ex-club', { hs: 1, as: 0, casa: false, voto: 7.4, gol: 1 }], [35, 'rimonta', { hs: 3, as: 2, casa: true, voto: 7.2, gol: 0 }]];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const fatti = [];
for (const [nome, vp] of [['telefono', { width: 412, height: 915 }], ['pc', { width: 1280, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(2000);
  for (const [i, tag, part] of SCENE) {
    try { await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163 && window.__CPM_CAREER.chiudi163(); }); } catch (e) {}
    await sleep(600);
    const q = await page.evaluate(([i, part]) => window.__CPM_CAREER.forceIv183(i, part.hs > part.as ? 'win' : part.hs === part.as ? 'draw' : 'loss', part), [i, part]);
    const ok = await page.waitForSelector('[data-cpm="intervista231"]', { timeout: 8000 }).then(() => true).catch(() => false);
    await sleep(900);
    const f = OUT + 'intervista-' + tag + '-' + nome + '.png'; await page.screenshot({ path: f });
    const testo = await page.evaluate(() => { const el = document.querySelector('[data-cpm="intervista231"]'); return el ? (el.innerText || '').replace(/\s+/g, ' ').slice(0, 160) : null; });
    fatti.push({ nome, tag, q, ok, testo }); console.log(nome, tag, ok ? 'finestra aperta' : 'FINESTRA NON TROVATA', '·', q);
  }
  await ctx.close();
}
await b.close(); srv.close();
const male = fatti.filter(x => !x.ok || !x.testo || !x.testo.includes(String(x.q).slice(0, 20)));
if (male.length) { console.log('❌ foto-183: ' + JSON.stringify(male)); process.exit(1); }
console.log('✅ foto-183: 6 foto in docs/sviluppo/giro183/');
