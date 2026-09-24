#!/usr/bin/env node
/* [24/09 POC] OFFERTA DI TRASFERIMENTO — commento PO sull'anteprima 05: «prima di accettare/rifiutare mostra la situazione del
   club offerente (posizione ecc.)». Apre un'offerta a comando (`__CPM_CAREER.forceOffer`) e fotografa il Modal; stampa se la
   card `club-situazione23` c'e' e cosa dice. Scrive in tests/character-lab/anteprime-carriera/14-offerta.png */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = path.resolve('../character-lab/anteprime-carriera'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = {
    phase: 'career', player: {
      name: 'Ciclo Procuratore', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 20, age: 22, ovr: 74,
      club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
      stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 73, tiro: 75, passaggio: 73, dribbling: 74, posizionamento: 73 },
      form: 72, morale: 70, fatigue: 10, popularity: 34, value: 9, bankBalance: 60000,
      hasAgent: false, contract: { duration: 3, wage: 4000, expiresAtSeason: 5, years: 3 },
    },
  };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); } catch (e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.forceOffer), { timeout: 20000 });
await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(600);
let ok = false; for (let i = 0; i < 6 && ok !== true; i++) { ok = await page.evaluate(() => window.__CPM_CAREER.forceOffer()); await sleep(900); }
const card = await page.evaluate(() => { const c = document.querySelector('[data-cpm="club-situazione23"]'); return c ? c.innerText.replace(/\n+/g, ' · ') : null; });
await page.screenshot({ path: path.join(OUT, '14-offerta.png') });
console.log(JSON.stringify({ offerta: ok, card, errori: errors }));
await browser.close(); srv.close();
