#!/usr/bin/env node
/* MISSIONE — IL PALLONE STA DENTRO L'INQUADRATURA? Solo fase di CRONACA.
   Collaudo PO 24 ago: «il pallone spesso esce fuori dalla scena, la telecamera non segue l'azione. Le
   giocate offensive avversarie sono nascoste dalla curva e tribuna». La rete che tiene il soggetto nel
   quadro gira solo negli highlight; in cronaca la camera larga sta sempre dietro la NOSTRA porta.
   Rosso/verde nello stesso processo quando ci sara' un rimedio (__CPM_NO561).
     CPM_CHROME=... node quadro-561.mjs [CPM_MS=200000] [CPM_GIRI=1]                                   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 200000), GIRI = +(process.env.CPM_GIRI || 1);
const ROSSO = !!process.env.CPM_ROSSO;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = { verde: [], rosso: [] };
async function giro(rosso, seed) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO564 = true; }, [rosso]);
  await openMatch(page, port, { skipLoadAll: true, name: rosso ? 'Ro' : 'Ve' });
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  await sleep(MS);
  const R = await page.evaluate(() => (window.__CPM_QUADRO561 ? JSON.parse(JSON.stringify(window.__CPM_QUADRO561)) : null));
  await page.close(); return R;
}
for (let g = 0; g < GIRI; g++) { const seed = 4400 + g * 61; out.rosso.push(await giro(true, seed)); out.verde.push(await giro(false, seed)); }
srv.close(); await b.close();
const som = arr => arr.filter(Boolean).reduce((a, c) => {
  a.f += c.f; a.fuori += c.fuori; a.sotto += c.sotto; a.sopra += c.sopra; a.lati += c.lati;
  a.nostra.f += c.nostra.f; a.nostra.fuori += c.nostra.fuori; a.loro.f += c.loro.f; a.loro.fuori += c.loro.fuori;
  a.ymin = Math.min(a.ymin, c.ymin); a.ymax = Math.max(a.ymax, c.ymax); return a;
}, { f: 0, fuori: 0, sotto: 0, sopra: 0, lati: 0, nostra: { f: 0, fuori: 0 }, loro: { f: 0, fuori: 0 }, ymin: 9, ymax: -9 });
const pc = (a, b2) => b2 ? (100 * a / b2).toFixed(1) + '%' : '—';
console.log(`\n=== IL PALLONE STA DENTRO L'INQUADRATURA? (solo cronaca) ===\n`);
for (const [n, arr] of [['ROSSO', out.rosso], ['VERDE', out.verde]]) {
  if (!arr.length) continue; const s2 = som(arr);
  if (!s2.f) { console.log(`  ${n}  nessun fotogramma di cronaca visto`); continue; }
  console.log(`  ${n}  fotogrammi ${s2.f} · FUORI QUADRO ${s2.fuori} (${pc(s2.fuori, s2.f)})`);
  console.log(`        quando attacca l'AVVERSARIO (palla nella nostra meta'): ${s2.nostra.fuori}/${s2.nostra.f} = ${pc(s2.nostra.fuori, s2.nostra.f)}`);
  console.log(`        quando attacchiamo NOI:                                ${s2.loro.fuori}/${s2.loro.f} = ${pc(s2.loro.fuori, s2.loro.f)}`);
  console.log(`        da dove esce: sotto ${s2.sotto} · sopra ${s2.sopra} · di lato ${s2.lati}`);
  console.log(`        escursione verticale nel quadro: ndc.y da ${s2.ymin} a ${s2.ymax}  (dentro = -1..+1)`);
}
console.log('\nCENSIMENTO. Non e\' un guardiano: non fallisce, misura.');
