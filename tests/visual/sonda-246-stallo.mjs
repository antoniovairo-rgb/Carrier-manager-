#!/usr/bin/env node
/* [giro 44 PO-246] SONDA (strumento, non guardiano): perche' il braccio «giocatore» di schede-246 non finisce la partita.
   Stesso percorso del guardiano (save-194, pilota seedato, __CPM_SCFREEZE_TEST=1), ogni 400 ms registra fase, minuto, scheda a schermo,
   timer armati/scaduti/cancellati, righe salite sopra la scheda; quando il minuto resta fermo per 25 s in `playing` stampa lo stato e chiude.
   CPM_S259=1 = sistema vivo (senza __CPM_NO_SCHEDE259) · CPM_NOORD18=1 = arma __CPM_NO_ORD18 (il timer sceglie come una persona). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const I = +(process.env.CPM_I || 0), TETTO = +(process.env.CPM_TETTO_MS || 420000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = process.env.CPM_NOME || ('Guard246 ' + ['Rossi', 'Bianchi', 'Verdi', 'Neri'][I % 4] + I);
await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; if (!o.s259) window.__CPM_NO_SCHEDE259 = 1; window.__CPM_SCMS681 = 6000; window.__CPM_SCFREEZE_TEST = 1; if (o.noord) window.__CPM_NO_ORD18 = 1;
  localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, s259: !!process.env.CPM_S259, noord: !!process.env.CPM_NOORD18 });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {});
await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2460 + I * 37);
const t1 = Date.now(); let lastCk = null, tCk = Date.now(), esito = 'tetto';
while (Date.now() - t1 < TETTO) { await sleep(400);
  const d = await page.evaluate(() => { const el = document.querySelector('[data-cpm="pop919"]');
    return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), ck: window.__CPM_CLOCK && window.__CPM_CLOCK(), sc: el ? (el.innerText || '').replace(/\s+/g, ' ').slice(0, 70) : null,
      tmr: window.__CPM_SC681_TMR | 0, fire: window.__CPM_SC681_FIRE | 0, clr: window.__CPM_SC681_CLR | 0, inn: window.__CPM_SC681_IN | 0, top: (window.__CPM_SC681_TOP || []).slice(-3), nop: window.__CPM_SC681_NOPEND | 0,
      s259: window.__CPM_S259 ? { sch: window.__CPM_S259.schede.length, sce: window.__CPM_S259.scelte.length } : null, i226: window.__CPM_INT226 ? { sch: (window.__CPM_INT226.schede || []).length, sce: (window.__CPM_INT226.scelte || []).length } : null,
      intx: (window.__CPM_INTX669 || []).slice(-2) }; });
  if (d.ck !== lastCk) { lastCk = d.ck; tCk = Date.now(); }
  if (d.ph === 'ended' || d.ph === 'ceremony') { esito = 'finita al ' + d.ck; console.log(JSON.stringify(d)); break; }
  if (d.ph === 'playing' && Date.now() - tCk > 25000) { esito = 'STALLO in playing al ' + d.ck; console.log(JSON.stringify(d)); break; }
}
console.log('esito: ' + esito);
await b.close(); srv.close();
