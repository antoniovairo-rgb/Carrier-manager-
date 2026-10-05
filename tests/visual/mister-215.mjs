#!/usr/bin/env node
/* [7.999.135 PO-215 «Ci sono ancora icone anziché figurine e c'è anche una potenziale omonimia tra mister»] GUARDIANO sul salvataggio S12
   (storico: Bellandi, Rossi, Verdiani, Mancuso, Tarantola). Due misure, verde e rosso (__CPM_NO_MISTER215) sulla stessa pagina:
   (1) OMONIMI: per tutti i club e la stagione corrente, il mister che l'offerta propone (coachDiClub23 col salvataggio) non porta un
       cognome gia' passato nella tua carriera. Verde: 0 club con omonimo. Rosso: almeno uno (l'estrazione di prima).
   (2) FIGURINE: la fisarmonica «Storico allenatori» del profilo mostra una figurina per riga (data-cpm="mister215") e nessuna icona 🧑‍💼,
       e ogni riga dice il club. Rosso: icone, nessuna figurina. Uso: node mister-215.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_MISTER215 = 1; const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const omo = await page.evaluate((s) => { const p = s.player || s; const usati = new Set((p.coachHistory || []).map(c => c.name).concat(p.coach ? [p.coach.name] : []));
    let n = 0, tot = 0; const es = []; for (const c of CLUBS.filter(x => !x.isU18)) { tot++; const co = coachDiClub23(c, p.season || 1, p); if (co && usati.has(co.name)) { n++; if (es.length < 3) es.push(c.n + ' → ' + co.name); } }
    return { club: tot, conOmonimo: n, esempi: es }; }, save);
  await page.evaluate(() => window.__CPM_CAREER.goTab('profile'));
  await sleep(1500);
  const fis = page.locator('text=Storico allenatori').first();
  try { await fis.scrollIntoViewIfNeeded({ timeout: 5000 }); await fis.click({ timeout: 5000 }); } catch (e) {}
  await sleep(1200);
  const vista = await page.evaluate(() => { const t = [...document.querySelectorAll('*')].find(e => e.textContent.trim() === 'Storico allenatori'); let box = t; for (let i = 0; i < 6 && box && box.parentElement; i++) box = box.parentElement;
    const txt = box ? box.innerText : ''; return { figurine: box ? box.querySelectorAll('[data-cpm="mister215"]').length : 0, icone: (txt.match(/🧑‍💼/g) || []).length, righe: (txt.match(/Fiducia/g) || []).length, conClub: (txt.match(/FC [A-Z]|Athletic|United|City|Real|Sporting/g) || []).length, testo: txt.slice(0, 400) }; });
  if (!rosso) await page.screenshot({ path: new URL('./out/mister-215.png', import.meta.url).pathname, fullPage: false }).catch(() => {});
  const _e = { omo, vista: { figurine: vista.figurine, icone: vista.icone, righe: vista.righe } };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(_e)); if (!rosso) console.log(vista.testo.replace(/\n/g, ' | '));
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (V.omo.conOmonimo !== 0) g.push('verde: club con mister omonimo ' + JSON.stringify(V.omo));
if (!(V.vista.righe >= 3 && V.vista.figurine === V.vista.righe && V.vista.icone === 0)) g.push('verde: storico senza figurine per riga ' + JSON.stringify(V.vista));
if (!(R.omo.conOmonimo >= 1)) g.push('rosso: omonimia non si vede ' + JSON.stringify(R.omo));
if (!(R.vista.icone >= 1 && R.vista.figurine === 0)) g.push('rosso: icone non si vedono ' + JSON.stringify(R.vista));
if (g.length) { console.log('❌ mister-215'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ mister-215 verde (e il rosso si vede)');
