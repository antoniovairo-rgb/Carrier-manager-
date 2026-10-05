#!/usr/bin/env node
/* [7.999.134 PO-212 «nella preview di accettazione dell'offerta la posizione ed i punti erano diversi»] GUARDIANO sul salvataggio S12
   (professionista, settimana avanzata). Si apre il modale OFFERTA vero per un club di un'ALTRA lega, si legge cio' che l'anteprima mostra
   (testimone __CPM_ANTE212: posizione, punti, giocate), si preme «Accetta» e si legge la classifica che il giocatore trova davvero
   (__CPM_CAREER.get().standings). VERDE: posizione e punti uguali. ROSSO (__CPM_NO_ANTE212: l'anteprima torna alla classifica del
   mondo, calcWorldStandings): almeno uno dei due diverso — il difetto del collaudo. Uso: node anteprima-212.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_ANTE212 = 1; const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const club = await page.evaluate(() => {
    const g = window.__CPM_CAREER.get(); const mio = (g.standings || []).map(r => r.id);
    const lgMio = (CLUBS.find(c => c.id === mio[0]) || {}).lg;
    const c = CLUBS.find(x => !x.isU18 && x.lg && x.lg !== lgMio && !mio.includes(x.id) && CLUBS.filter(y => y.lg === x.lg && !y.isU18).length >= 10);
    window.__CPM_CAREER.setOffer({ club: c, type: 'trasferimento', wage: 900, duration: 2, fee: 1 });
    return { id: c.id, n: c.n, lg: c.lg };
  });
  await sleep(1500);
  const ante = await page.evaluate(() => window.__CPM_ANTE212 || null);
  await page.getByRole('button', { name: 'Accetta', exact: true }).first().click({ timeout: 10000 });
  await sleep(2500);
  const dopo = await page.evaluate((id) => { const st = (window.__CPM_CAREER.get().standings || []); const i = st.findIndex(r => r.id === id); return { pos: i + 1, pts: i >= 0 ? st[i].pts : null, n: st.length }; }, club.id);
  const _e = { club: club.n, lega: club.lg, anteprima: ante, dopo };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(_e));
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
}
await b.close(); srv.close();
const uguale = (e) => e.anteprima && e.dopo.pos > 0 && e.anteprima.pos === e.dopo.pos && e.anteprima.pts === e.dopo.pts;
const V = esito.verde, R = esito.rosso, g = [];
if (!V.anteprima || V.anteprima.fonte !== 'trasferimento') g.push('verde: testimone assente o fonte sbagliata ' + JSON.stringify(V.anteprima));
if (!uguale(V)) g.push('verde: anteprima e classifica dopo la firma diverse ' + JSON.stringify(V));
if (!R.anteprima || uguale(R)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ anteprima-212'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ anteprima-212 verde (e il rosso si vede)');
