#!/usr/bin/env node
/* [PO-259] foto delle schede nuove (finestra con premio e rischio) e della riga di riepilogo, a 412 e 360 px. Strumento di collaudo, non guardiano.
   Uso: node foto-schede-259.mjs  (CPM_NOMI="Rossi,Verdi" per scegliere le partite; scrive in docs/sviluppo/foto/po259/) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'po259'); fs.mkdirSync(OUT, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const NOMI = (process.env.CPM_NOMI || 'Rossi 0').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function foto(w, h, nome, k) {
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); await installCdnRoutes(page);
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + nome;
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 30000; window.__CPM_NO_ORD18 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save });
  const fatte = [];
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
  await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + k * 37);
  const t1 = Date.now(); let n = 0;
  while (Date.now() - t1 < 480000) { await sleep(300);
    const d = await page.evaluate(() => ({ ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, rp: !!document.querySelector('[data-cpm="pop919"] [data-cpm="rp259"]') }));
    if (d.rp) { await sleep(700); n++; const f = path.join(OUT, `scheda-${w}-${n}.png`); await page.screenshot({ path: f }); fatte.push(f);
      await page.evaluate(() => { const bt = document.querySelector('[data-cpm="pop919"] button'); if (bt) bt.click(); }); await sleep(1500); }
    if (d.ph === 'ended' || d.ph === 'ceremony') break; }
  await sleep(1500);
  const r = await page.evaluate(() => { const el = document.querySelector('[data-cpm="riep259"]'); if (el) el.scrollIntoView({ block: 'center' }); return el ? el.innerText : null; });
  if (r) { await sleep(400); const f = path.join(OUT, `riepilogo-${w}.png`); await page.screenshot({ path: f }); fatte.push(f); }
  const racc = await page.evaluate(() => (window.__CPM_S259 || {}).racconti || []);
  await page.close(); return { w, nome, fatte, riepilogo: r, racconti: racc.map(x => x.m1 + "' " + x.esito.testo + ' | ' + x.voce) };
}
const res = await Promise.all([foto(412, 915, NOMI[0], 0), foto(360, 780, NOMI[0], 0)]);
console.log(JSON.stringify(res, null, 1));
await b.close(); srv.close();
