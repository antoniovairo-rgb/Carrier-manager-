#!/usr/bin/env node
/* COLLAUDO 7.999.175 — memoria d'intervista «✨ Enfant prodige (N anni)» (src/09, memoriaTag).
   Eroe di 17 anni, SENZA tratto Enfant (build 175), senza record e senza Golden Boy: la schermata stampa
   dopo le prime partite deve dire ancora «Enfant prodige»? Lettura del testo a schermo, 412 px. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..');
const OUT = path.join(HERE, 'foto-7.999.175-carriera');
const SAVE = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'visual', 'fixtures', 'save-190-s12-ovr93.json'), 'utf8'));
SAVE.player.age = 17; SAVE.player.isU18 = true; SAVE.player.u18Seasons = 0; SAVE.player.proStatus = 'u18';
SAVE.player.matchHistory = []; SAVE.player.goldenBoys = []; SAVE.player.trophies = [];
SAVE.player.archetype = { id: 'finalizzatore', e: '🎯', name: 'Finalizzatore' };
SAVE.player.tratti = { enfant: false };
const srv = await startServer(ROOT); const port = srv.address().port;
const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(s => { try { localStorage.clear(); } catch (e) {} window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, SAVE);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 });
await sleep(2000);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await sleep(800);
const eta = await page.evaluate(() => window.__CPM_CAREER.snapshot().age);
let trovato = null; const passi = []; let fine = null;
for (let i = 0; i < 160 && !trovato; i++) {
  const scrNow = await page.evaluate(() => (window.__CPM_CAREER.screen && window.__CPM_CAREER.screen()) || null);
  if (scrNow === 'proTransition' || scrNow === 'clubPresentation' || scrNow === 'nationalCallup') {
    for (let k = 0; k < 12; k++) {
      const ok = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && /Salta|Che la|Avanti|Continua|Inizia|Vai|Firma|Accetta|Ok/i.test(x.textContent || '')); if (bt) { bt.click(); return bt.textContent.slice(0, 30); } return null; });
      await sleep(400); if (!ok) break;
    }
  }
  const res = await page.evaluate(() => { try { return window.__CPM_CAREER.step(); } catch (e) { return 'err:' + String(e).slice(0, 80); } });
  await sleep(700);
  const info = await page.evaluate(() => ({ t: document.body.innerText || '', scr: (window.__CPM_CAREER.screen && window.__CPM_CAREER.screen()) || null }));
  passi.push({ i, res: String(res).slice(0, 40), scr: info.scr });
  if (String(res) === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(500); await page.evaluate(() => window.__CPM_CAREER.dismiss()); }
  const m = info.t.match(/Enfant prodige[^\n]*/i);
  if (m) { trovato = m[0]; await page.screenshot({ path: path.join(OUT, '412-D01-intervista-enfant-prodige-17.png') }); break; }
  if (String(res).startsWith('error')) { fine = res; break; }
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(300);
}
const dopo = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { age: p.age, stile: (p.archetype && p.archetype.id) || p.archetype, tratto: !!(p.tratti && p.tratti.enfant) }; });
const partite = await page.evaluate(() => (window.__CPM_CAREER.snapshot().matchHistory || []).length);
console.log(JSON.stringify({ partiteGiocate: partite, etaIniziale: eta, dopo, trovato, passiFatti: passi.length, ultimiPassi: passi.slice(-4), fine, errori: errs }, null, 1));
await b.close(); srv.close();
