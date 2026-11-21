/* [giro 309] sonda di base: apre la pagina in carriera (nessuna partita 3D) ed espone le funzioni globali. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
export async function apri(player){
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errors=[]; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(pl => { window.__CPM_GLB = false;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, player);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => typeof window.__CPM_SIM_MOTORE === 'function' && typeof window.__CPM_simMatch==='function', { timeout: 90000 });
  return { page, browser, srv, errors };
}
export const EROE = { name: 'Misura Trecentonove', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 1, week: 1, age: 19, ovr: 66, tutorialDone: true,
  club: { id: 'aug', n: 'FC Augusta', a: 'AGS', p: 66, c: '#16a34a', c2: '#ffffff', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 },
  form: 70, morale: 70, fatigue: 10, contract: { duration: 3, wage: 3000, expiresAtSeason: 4 } };
