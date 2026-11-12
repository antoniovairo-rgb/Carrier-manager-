#!/usr/bin/env node
/* [7.999.133 guardiano PO-208 + PO-213]
   PO-208, collaudo PO 04/10 «Tutte le figurine devono avere lo stesso contorno»; scelta PO: cornice sottile grigia. La carta resta
   (volto pieno) ma la cornice e' per tutte grigio chiaro (#e2e8f0), non il colore del club. Nella home S12 la carta dell'eroe deve avere la
   cornice grigia. Rosso __CPM_NO_FIG208: torna il colore del club.
   PO-213, collaudo PO 04/10 «le statistiche devono esserci tutte all'inizio anche se a zero»: con un tabellino a zero righeTabellino23
   restituisce tutte le voci (17). Rosso __CPM_NO_STAT213: solo Gol e Possesso (2). Uso: node figurine-208.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; if (s.r) { window.__CPM_NO_FIG208 = 1; window.__CPM_NO_STAT213 = 1; } const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(4000);
  /* [giro 174 PO-371] la home V2 (testata compatta, decisione PO 02/11) non mostra piu' la carta dell'eroe: la sonda contava 0 carte
     in entrambi i bracci (cieca). Le figurine oggi stanno in «Club» (compagni) e in «Agente» (il procuratore, il caso del PO-208): si
     leggono LI', tutte, e la regola vale per OGNI carta (prima: solo la prima carta della home). */
  const carteTab = {};
  for (const tab of ['Club', 'Agente']) { await page.getByText(tab, { exact: true }).last().click().catch(() => {}); await sleep(1500);
    carteTab[tab] = await page.evaluate(() => { const C = [...document.querySelectorAll('[data-cpm-volto]')]; return { n: C.length, grigie: C.filter(c => /e2e8f0|226, ?232, ?240/i.test(c.outerHTML || '')).length }; }); }
  esito[rosso ? 'rosso' : 'verde'] = await page.evaluate(() => {
    const z = { gol: 0, possesso: 0, tiri: 0, inPorta: 0, xg: 0, fascia: 0, cross: 0, dribbling: 0, dribblingOk: 0, passaggi: 0, passOk: 0, contrasti: 0, intercetti: 0, parate: 0, corner: 0, falli: 0, ammonizioni: 0, espulsioni: 0, rimesse: 0 };
    let righe = null; try { righe = righeTabellino23(z, z).length; } catch (e) { righe = 'errore ' + e.message; }
    return { righe };
  });
  const E = esito[rosso ? 'rosso' : 'verde']; E.tab = carteTab; E.carte = carteTab.Club.n + carteTab.Agente.n; E.grigie = carteTab.Club.grigie + carteTab.Agente.grigie;
  await ctx.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(esito));
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.tab.Club.n >= 1 && V.tab.Agente.n >= 1 && V.grigie === V.carte)) g.push('figurine verde ' + JSON.stringify(V));
if (!(R.tab.Club.n >= 1 && R.tab.Agente.n >= 1 && R.grigie === 0)) g.push('figurine rosso non si vede ' + JSON.stringify(R));
if (!(V.righe === 17)) g.push('statistiche verde ' + V.righe);
if (!(R.righe === 2)) g.push('statistiche rosso ' + R.righe);
if (g.length) { console.log('❌ figurine-208'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ figurine-208 verde (e il rosso si vede)');
