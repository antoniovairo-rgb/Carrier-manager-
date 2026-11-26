/* [giro 399 PO-573] foto del messaggio «salvataggio di una versione piu' nuova» a 375 px e su PC. Sonda (non guardiano). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const sv = { phase: 'career', saveVersion: 10, player: { name: 'Futuro Prova', nation: 'Italia', avatarId: 0, season: 4, week: 6, proStatus: 'pro', ovr: 78, saveVersion: 10,
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' } } };
for (const [nome, vp] of [['375', { width: 375, height: 812 }], ['pc', { width: 1366, height: 800 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, serviceWorkers: 'block' });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(raw => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3-s2', raw); }, JSON.stringify(sv));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load' });
  const bt = page.getByRole('button', { name: /Continua/ }).first(); await bt.waitFor({ timeout: 40000 }); await bt.click();
  await page.waitForSelector('[data-cpm="nuovo-399"]', { timeout: 20000 }); await sleep(800);
  await page.screenshot({ path: `../../docs/sviluppo/giro399/messaggio-${nome}.png` });
  console.log(nome, 'ok'); await ctx.close();
}
await b.close(); srv.close();
