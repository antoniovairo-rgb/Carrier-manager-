#!/usr/bin/env node
/* [giro 144] FOTO della sala stampa (piastrelle del pannello + tovaglia) e lettura dal DOM di ogni marchio «…rward». Uso: node stampa-144-foto.mjs <etichetta> (CPM_ROSSO=1 → __CPM_NO_G144M). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
export async function leggiStampa(page) {
  return page.evaluate(() => {
    const scena = document.querySelector('[data-cpm-scena="intervista2d"]');
    const pz = [...document.querySelectorAll('span')].filter(e => !e.closest('[data-cpm="marchio142"]') && !e.closest('svg') && [...e.childNodes].some(n => n.nodeType === 3 && /rward/.test(n.textContent)));
    const p144 = [...document.querySelectorAll('[data-cpm="marchio144p"]')].map(e => (e.innerText || e.textContent).replace(/\s+/g, ' ').trim());
    const t144 = [...document.querySelectorAll('[data-cpm="marchio144t"]')].map(e => e.textContent.replace(/\s+/g, ' ').trim());
    const piastrelle = pz.map(e => (e.innerText || e.textContent).replace(/\s+/g, ' ').trim());
    const tov = [...document.querySelectorAll('svg text')].filter(t => /rward/.test(t.textContent)).map(t => t.textContent.replace(/\s+/g, ' ').trim());
    return { scena: !!scena, piastrelle, tovaglia: tov, p144, t144 };
  });
}
export async function apriStampa(page, port, rosso) {
  await page.addInitScript((r) => { if (r) window.__CPM_NO_G144M = 1;
    const save = { phase: 'career', player: { name: 'Carrascito', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93,
      club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
      stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 },
      form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000, contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } };
    try { localStorage.setItem('cpm-v3', JSON.stringify(save)); localStorage.setItem('cpm-intro-seen', '1'); } catch (_e) {} }, rosso);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.forceInterview), null, { timeout: 25000 });
  await page.evaluate(() => window.__CPM_CAREER.forceInterview('win'));
  await page.waitForFunction(() => !!document.querySelector('[data-cpm-scena="intervista2d"]'), null, { timeout: 15000 });
  await sleep(2600);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const tag = process.argv[2] || 'misura'; fs.mkdirSync('out/g144', { recursive: true });
  const srv = await startServer(); const browser = await launchBrowser();
  for (const [w, h] of [[412, 915], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); await installCdnRoutes(ctx); const page = await ctx.newPage();
    await apriStampa(page, srv.address().port, !!process.env.CPM_ROSSO);
    console.log(w + 'x' + h, JSON.stringify(await leggiStampa(page)));
    await page.screenshot({ path: `out/g144/${tag}-stampa-${w}x${h}.png` }); await ctx.close();
  }
  await browser.close(); srv.close();
}
