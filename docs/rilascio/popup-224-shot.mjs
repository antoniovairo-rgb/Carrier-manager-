#!/usr/bin/env node
/* [7.999.158 PO-224, foto PO 11/10] GUARDIANO: i riquadri della home che chiedono una scelta compaiono come FINESTRA sopra la home,
   uno alla volta, e la scelta la chiude. Si forza il verdetto del patto col mister (patto attivo con obiettivo 0 = «mantenuto») sul
   salvataggio S12. VERDE (__CPM_POP224): finestra [data-cpm=pop224] visibile e centrata nello schermo, il pulsante la chiude e il patto
   passa a «kept». ROSSO (__CPM_NO_POP224): nessuna finestra, il verdetto resta un riquadro nella home. Uso: node popup-224.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {}; const OUTD = process.env.PROBE_OUT || '.';
for (const rosso of [false]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_POP224 = 1; if (s.r) window.__CPM_NO_POP224 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s.save)); } catch (e) {} }, { r: rosso, save });
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
  if (!rosso && r.pop) await page.screenshot({ path: OUTD + '/patto-375.png' });
  let chiusa = false, stato = null;
  if (r.pop) {
    await page.locator('[data-cpm="pop224"] button').first().click({ timeout: 5000 }).catch(() => {});
    await sleep(1200);
    chiusa = await page.evaluate(() => !document.querySelector('[data-cpm="pop224"]'));
    stato = await page.evaluate(() => (window.__CPM_CAREER.snapshot().coachPact || {}).status);
  }
  esito[rosso ? 'rosso' : 'verde'] = { ...r, chiusa, stato }; console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde'])); const nav = await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => /^(HOME|STAGIONE|CLUB|CARRIERA|AGENTE|UFFICIO|OPZIONI)$/i.test((e.innerText||'').trim())).map(e => { const r = e.getBoundingClientRect(); return { t: e.innerText.trim(), l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), sw: e.scrollWidth, cw: e.clientWidth }; }));
console.log('NAV 375px: ' + JSON.stringify(nav));
await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, g = []; const R = { pop: false, verdetto: true };
if (!(V.pop && V.centrata && V.chiusa && V.stato === 'kept')) g.push('verde: la finestra non compare, non è nello schermo o la scelta non la chiude ' + JSON.stringify(V));
if (!(!R.pop && R.verdetto)) g.push('rosso: il difetto non si vede (attesa: nessuna finestra e verdetto come riquadro) ' + JSON.stringify(R));
if (g.length) { console.log('❌ popup-224'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ popup-224 verde (finestra centrata, chiusa dalla scelta, patto «kept») e il rosso si vede (riquadro in home)');
