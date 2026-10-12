#!/usr/bin/env node
/* [7.999.161 PO-230 «tutte le finestre che compaiono in primo piano devono avere una grafica standard»] GUARDIANO derivato da
   popup-224: con la finestra-impulso aperta, la cornice [data-cpm=finestra230] ha la grafica del Modal (fondo TH.surface3, raggio
   RAD.xl) e la Card interna non ha piu' fondo proprio. VERDE: cornice opaca con raggio >=16 e Card interna trasparente. ROSSO
   (__CPM_NO_FIN230): cornice trasparente e Card col suo fondo. Uso: node finestra-230.mjs
   ORIGINE popup-224: [7.999.158 PO-224, foto PO 11/10] GUARDIANO: i riquadri della home che chiedono una scelta compaiono come FINESTRA sopra la home,
   uno alla volta, e la scelta la chiude. Si forza il verdetto del patto col mister (patto attivo con obiettivo 0 = «mantenuto») sul
   salvataggio S12. VERDE (__CPM_POP224): finestra [data-cpm=pop224] visibile e centrata nello schermo, il pulsante la chiude e il patto
   passa a «kept». ROSSO (__CPM_NO_POP224): nessuna finestra, il verdetto resta un riquadro nella home. Uso: node popup-224.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_POP224 = 1; if (s.r) window.__CPM_NO_FIN230 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s.save)); } catch (e) {} }, { r: rosso, save });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => { const p = window.__CPM_CAREER.get(); window.__CPM_CAREER.patch({ coachPact: { season: p.season || 1, fromWeek: 0, target: 0, games: 4, kind: 'gol', status: 'active' } }); window.__CPM_CAREER.goTab && window.__CPM_CAREER.goTab('dashboard'); });
  await sleep(1500);
  const r = await page.evaluate(() => {
    const el = document.querySelector('[data-cpm="pop224"]'); const vh = innerHeight;
    const card = el && el.firstElementChild ? el.firstElementChild.getBoundingClientRect() : null;
    const verdetto = [...document.querySelectorAll('div')].some(d => /Il patto col mister — verdetto/i.test(d.textContent || '') && d.children.length === 0);
    return { pop: !!el, centrata: !!card && card.top >= 0 && card.bottom <= vh && card.height > 40, verdetto };
  });
  const f = await page.evaluate(() => { const fr = document.querySelector('[data-cpm="finestra230"]'); if (!fr) return null; const cs = getComputedStyle(fr); const card = fr.firstElementChild; const cc = card ? getComputedStyle(card) : null;
    const tr = v => !v || v === 'transparent' || /rgba\(0, 0, 0, 0\)/.test(v);
    return { bg: cs.backgroundColor, raggio: parseFloat(cs.borderTopLeftRadius) || 0, cardBg: cc ? cc.backgroundColor : null, cornice: !tr(cs.backgroundColor), cardTrasp: cc ? tr(cc.backgroundColor) && !/gradient/.test(cc.backgroundImage) : null }; });
  if (process.env.CPM_FOTO) await page.screenshot({ path: process.env.CPM_FOTO + (rosso ? '-prima.png' : '-dopo.png') });
  esito[rosso ? 'rosso' : 'verde'] = { pop: r.pop, ...(f || {}) }; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.pop && V.cornice && V.raggio >= 16 && V.cardTrasp)) g.push('verde: la finestra non ha la cornice standard ' + JSON.stringify(V));
if (!(R.pop && !R.cornice && R.cardTrasp === false)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ finestra-230'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ finestra-230 verde (cornice standard, Card interna senza fondo proprio) e il rosso si vede');
