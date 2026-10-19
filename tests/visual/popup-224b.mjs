#!/usr/bin/env node
/* [7.999.173 PO-224, giro 66] GUARDIANO: i quattro riquadri con scelta rimasti in home dopo il censimento («Il progetto del club»,
   «Sponsor», «Vita privata», «Non mi era mai successo») compaiono come FINESTRA, uno alla volta, e il pulsante la chiude.
   Si cammina per 8 settimane sul salvataggio S12 riportato alla W14 (prese d'atto riaperte) (handler veri, step()); a ogni settimana si legge la home: quali di quei titoli
   stanno in un riquadro della home (fuori dalla finestra [data-cpm=pop224]) e quale titolo ha la finestra; poi si risponde col
   primo pulsante della finestra, come farebbe il giocatore, fino a 6 finestre per settimana.
   VERDE (__CPM_POP224): 0 letture in home dei quattro titoli, almeno una finestra con uno dei quattro.
   ROSSO (__CPM_NO_POP224B): i quattro tornano riquadri → almeno una lettura in home. Uso: node popup-224b.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const TIT = ['Il progetto del club', 'Sponsor', 'Vita privata', 'Non mi era mai successo'];
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 140)));
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_POP224 = 1; if (s.r) window.__CPM_NO_POP224B = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s.save)); } catch (e) {} }, { r: rosso, save });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  /* il salvataggio e' a S12 W38 (fine stagione): si riporta a meta' stagione e si riaprono le prese d'atto del progetto e degli sponsor */
  await page.evaluate(() => window.__CPM_CAREER.patch({ week: 14, weekLived: false, clubProjSeen: null, stanceSeen: null })); await sleep(800);
  const leggi = () => page.evaluate((TIT) => {
    const pop = document.querySelector('[data-cpm="pop224"]');
    const fuori = [...document.querySelectorAll('body *')].filter(d => !(pop && pop.contains(d)) && d.children.length === 0)
      .map(d => (d.textContent || '').trim()).filter(t => t.length < 60 && TIT.some(x => t.includes(x)));
    const titoloPop = pop ? (pop.innerText || '').split('\n').map(x => x.trim()).filter(Boolean)[0] || '?' : null;
    return { fuori: [...new Set(fuori)], titoloPop };
  }, TIT);
  const inHome = new Set(), inPop = []; let finestre = 0;
  for (let w = 0; w < 8; w++) {
    try { await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab && window.__CPM_CAREER.goTab('dashboard'); }); } catch (e) {}
    await sleep(900);
    for (let k = 0; k < 6; k++) {
      const r = await leggi(); r.fuori.forEach(t => inHome.add(`S? W${w}: ${t}`));
      if (!r.titoloPop) break;
      finestre++; inPop.push(r.titoloPop);
      await page.locator('[data-cpm="pop224"] button').first().click({ timeout: 4000 }).catch(() => {});
      await sleep(700);
    }
    const r2 = await leggi(); r2.fuori.forEach(t => inHome.add(`W${w}: ${t}`));
    const st = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
    if (String(st).startsWith('blocked')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
    await sleep(500);
  }
  const deiQuattro = inPop.filter(t => TIT.some(x => t.includes(x)));
  esito[rosso ? 'rosso' : 'verde'] = { inHome: [...inHome], finestre, titoli: inPop, deiQuattro: deiQuattro.length, errori };
  await ctx.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(esito, null, 1));
const V = esito.verde, R = esito.rosso;
const okV = V.inHome.length === 0 && V.deiQuattro > 0 && V.errori.length === 0;
const okR = R.inHome.length > 0;
console.log(`verde: ${V.inHome.length} letture in home, ${V.deiQuattro} finestre dei quattro su ${V.finestre} · rosso: ${R.inHome.length} letture in home`);
console.log(okV && okR ? '✅ PASS popup-224b' : `❌ FAIL popup-224b${!okV ? ' (verde)' : ''}${!okR ? ' (rosso cieco)' : ''}`);
process.exit(okV && okR ? 0 : 1);
