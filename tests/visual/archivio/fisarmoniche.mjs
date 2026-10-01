#!/usr/bin/env node
/* [24/09 POC] FISARMONICHE + TENDINA: fotografa Club/Carriera/Agente/Stagione (collaudo PO «mancano diversi accordion», «evidenziazione invadente») e conta le fisarmoniche per scheda. CPM_ROSSO=<flag>.
   Derivata da ANTEPRIME DELLA CARRIERA per la revisione col PO (a misura di telefono 412x915): guida una carriera vera con
   `__CPM_CAREER` e fotografa, alla prima comparsa, i momenti del procuratore (reminder, ingaggio, ambizione, firma, confronto,
   iniziativa) e la schermata di FINE STAGIONE (in alto e scorsa in basso). Scrive in tests/character-lab/anteprime-carriera/. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = path.resolve('../character-lab/fisarmoniche'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript((r) => { if (r) window[r] = true;
  window.__CPM_GLB = false;
  const save = {
    phase: 'career', player: {
      name: 'Ciclo Procuratore', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 2, age: 22, ovr: 74,
      club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
      stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 73, tiro: 75, passaggio: 73, dribbling: 74, posizionamento: 73 },
      form: 72, morale: 70, fatigue: 10, popularity: 34, value: 9, bankBalance: 60000,
      hasAgent: false, contract: { duration: 3, wage: 4000, expiresAtSeason: 5, years: 3 },
    },
  };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, process.env.CPM_ROSSO || '');
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
/* una carriera VISSUTA: procuratore attivo e ~30 settimane giocate coi comandi del gioco, cosi' diario, premi e achievement esistono */
await page.evaluate(() => window.__CPM_CAREER.patch({ hasAgent: true })); await sleep(300);
for (let k = 0; k < 30; k++) { const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; }); if (r === 'seasonEnd') break; await sleep(60); }
await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
for (let k = 0; k < 4; k++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Diplomatico|Chiudi|Continua/.test(x.textContent || '')); if (b) b.click(); }); await sleep(400); }
await page.setViewportSize({ width: 412, height: 2600 });
const TAG = process.env.CPM_ROSSO ? '-rosso' : '';
const R = {};
for (const t of ['club', 'profile', 'agente', 'ufficio', 'standings']) {
  await page.evaluate(x => window.__CPM_CAREER.goTab(x), t); await sleep(900);
  R[t] = await page.evaluate(() => [...document.querySelectorAll('button[aria-expanded]')].map(b => b.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean));
  await page.screenshot({ path: path.join(OUT, t + TAG + '.png'), fullPage: true });
}
/* la tendina: fuoco, scelta, e cosa resta disegnato */
await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(700);
const sel = await page.$('[data-cpm="lega23"]');
if (sel) { await sel.focus(); await sleep(200); R.tendinaAttiva = await page.evaluate(() => { const s = document.querySelector('[data-cpm="lega23"]'); const cs = getComputedStyle(s); return { outline: cs.outlineWidth + ' ' + cs.outlineStyle, boxShadow: cs.boxShadow, bordoRiga: getComputedStyle(s.parentNode).borderColor }; });
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-cpm="lega23"] option')].map(o => o.value));
  if (opts[1]) await sel.selectOption(opts[1]); await sleep(500);
  R.dopoScelta = await page.evaluate(() => { const s = document.querySelector('[data-cpm="lega23"]'); const cs = getComputedStyle(s); return { focus: document.activeElement === s, outline: cs.outlineWidth + ' ' + cs.outlineStyle, boxShadow: cs.boxShadow, bordoRiga: getComputedStyle(s.parentNode).borderColor }; });
  await page.screenshot({ path: path.join(OUT, 'tendina' + TAG + '.png') }); }
R.errori = errors; console.log(JSON.stringify(R, null, 1));
await browser.close(); srv.close();
