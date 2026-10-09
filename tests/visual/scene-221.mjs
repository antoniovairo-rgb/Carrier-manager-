#!/usr/bin/env node
/* [7.999.156 PO-221 «l'eroe fa un sacco di tiri e azioni (forse troppe) e difficilmente segna o effettua un passaggio/assist vincente»]
   GUARDIANO in due parti.
   1) ENUMERAZIONE (deterministica, giudica verde e rosso): 150 scene costruite per tipo con scenaDalMotore (src/04). Ogni scena con
      un compagno libero offre «Servi X libero», ogni punizione un'opzione di passaggio. MISURATO 09/10: verde conclusione 75/75 col
      compagno libero e punizione 150/150; rosso __CPM_NO_PASS221 42 e 102.
   2) PARTITE VERE (6 dal salvataggio S12, solo verde): scene dell'eroe a partita e gol dell'eroe. MISURATO 09/10 su 12 partite per
      braccio: scene 7,0 (mediana 6,5) contro 8,0; la differenza fra i bracci e' 1 scena, quindi su 6 partite il confronto col rosso
      sarebbe rumore: qui si tiene solo un pavimento largo (media fra 4 e 8,5 scene). Uso: node scene-221.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI = [7, 99, 1234, 2021, 5, 42];
const srv = await startServer(); const b = await launchBrowser(); const g = [];
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
{ const ctx = await b.newContext(); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 }); await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
  const E = await page.evaluate(() => { if (typeof scenaDalMotore !== 'function') return null; const out = {};
    for (const rosso of [false, true]) { window.__CPM_NO_PASS221 = rosso ? 1 : undefined; const o = { conLibero: 0, conLiberoPass: 0, pun: 0, punPass: 0 };
      for (const tipo of ['conclusione', 'punizione']) for (let sd = 1; sd <= 150; sd++) {
        const liberi = sd % 2; const occ = { tipo, x: (tipo === 'conclusione' ? 86 : 76) + (sd % 5) - 2, y: 45 + (sd % 7) - 3, press: sd % 3, liberi, cast: { ricevente: { i: 9, nome: 'Tom SPENCER' }, difensore: { i: 15, nome: 'Al QUINN' }, portiere: { i: 11, nome: 'Bo GRAY' } } };
        let s = null; try { s = scenaDalMotore(occ, { stats: {} }, sd * 7919); } catch (e) {} if (!s || !s.actions) continue;
        const pass = s.actions.some(a => a.rew === 'assist');
        if (tipo === 'conclusione' && liberi) { o.conLibero++; if (pass) o.conLiberoPass++; }
        if (tipo === 'punizione') { o.pun++; if (pass) o.punPass++; } }
      out[rosso ? 'rosso' : 'verde'] = o; } window.__CPM_NO_PASS221 = undefined; return out; });
  await ctx.close(); console.log('ENUMERAZIONE ' + JSON.stringify(E));
  if (!E) g.push('enumerazione: scenaDalMotore non raggiungibile');
  else { const V = E.verde, R = E.rosso;
    if (!(V.conLibero >= 50 && V.conLiberoPass === V.conLibero && V.pun >= 100 && V.punPass === V.pun)) g.push('verde (enumerazione): passaggio offerto in ' + V.conLiberoPass + '/' + V.conLibero + ' conclusioni col compagno libero e ' + V.punPass + '/' + V.pun + ' punizioni');
    if (!(R.conLiberoPass < R.conLibero && R.punPass < R.pun)) g.push('rosso (enumerazione): il difetto non si vede (' + R.conLiberoPass + '/' + R.conLibero + ', ' + R.punPass + '/' + R.pun + ')'); } }
const per = []; let gol = 0;
for (const sd of SEMI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
  await page.addInitScript(([s]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv]);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
  const R = await page.evaluate(() => ({ n: (window.__CPM_CAST219 || []).length, gol: (window.__CPM_RES218 || []).filter(r => r.ok && r.key === 'goal').length }));
  per.push(R.n); gol += R.gol; console.log('seme ' + sd + ' fine ' + ph + ' scene ' + R.n + ' gol eroe ' + R.gol); await ctx.close();
}
await b.close(); srv.close();
const media = per.reduce((a, x) => a + x, 0) / per.length;
console.log('PARTITE scene ' + JSON.stringify(per) + ' media ' + media.toFixed(2) + ' · gol eroe ' + (gol / per.length).toFixed(2) + ' a partita (informativo)');
if (!(media >= 4 && media <= 8.5)) g.push('partite: media ' + media.toFixed(2) + ' scene (pavimento 4-8,5)');
if (g.length) { console.log('❌ scene-221'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ scene-221 verde (scene ' + media.toFixed(2) + ' a partita; passaggio sempre offerto col compagno libero)');
