#!/usr/bin/env node
/* [7.999.10] GUARDIANO — L'INTERCETTO SI FA DOVE UN AVVERSARIO PUO' ARRIVARCI (collaudo PO «passaggi senza senso»).
   Scene di PASSAGGIO forzate con esito «intercettato»: al lancio si misura la distanza fra l'intercettore e il punto di taglio e la
   velocita' che gli servirebbe per arrivarci prima del pallone (distanza / durata del volo). Riferimento: 8 m/s e' una corsa
   sostenuta (un velocista d'elite supera i 10 m/s solo al picco). Soglie: mediana <= 8 m/s e al massimo il 15% sopra 10 m/s.
   Pagina nuova ogni 10 scene (lezione 7.483: una pagina stanca non e' il gioco).
   CPM_ROSSO=1 → __CPM_NO_INT10: torna il taglio fisso al 55% e l'intercettore piu' vicino a quel punto; deve andare ROSSO. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errors = []; let campioni = [], gis = null;
for (let giro = 0; giro < 3; giro++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_INT10 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Intercetto' + giro });
  if (!gis) gis = await page.evaluate(() => { const out = []; const S = window.__CPM_SITS || []; for (let i = 0; i < S.length; i++) { let h = null; try { h = window.deriveHL(S[i], (S[i].actions || [])[0]); } catch (e) {} if (h && h.type === 'pass') out.push(i); } return out; });
  for (const gi of gis.slice(giro * 10, giro * 10 + 10)) {
    const n0 = await page.evaluate(() => (window.__CPM_INT10 || []).length);
    await page.evaluate(g => { window.__CPM_FORCE_KIND = 'intercepted'; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_SIT(g, true); }, gi);
    await sleep(900);
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
    for (let k = 0; k < 20; k++) { await sleep(300); if (await page.evaluate(n => { const c = (window.__CPM_INT10 || [])[n]; return !!(c && c.arrivo != null); }, n0)) break; }
    const c = await page.evaluate(n => (window.__CPM_INT10 || [])[n] || null, n0);
    if (c) campioni.push({ gi, ...c });
  }
  await page.close();
}
await b.close(); srv.close();
const v = campioni.map(c => c.v).sort((a, b) => a - b), d = campioni.map(c => c.d).sort((a, b) => a - b);
const arr = campioni.filter(c => c.arrivo != null).map(c => c.arrivo).sort((a, b) => a - b);
const med = a => a.length ? a[a.length >> 1] : null, oltre10 = v.length ? 100 * v.filter(x => x > 10).length / v.length : null;
console.log(`all'arrivo del pallone l'intercettore e' a: mediana ${med(arr)} m su ${arr.length} (entro 1,5 m: ${arr.length ? (100 * arr.filter(x => x <= 1.5).length / arr.length).toFixed(0) : '-'}%)`);
console.log(`scene di passaggio: ${gis.length} · intercetti misurati: ${campioni.length}`);
console.log(`intercettore → punto di taglio: mediana ${med(d)} m (max ${d[d.length - 1]}) · velocita' necessaria: mediana ${med(v)} m/s · sopra 10 m/s: ${oltre10 == null ? '-' : oltre10.toFixed(0)}%`);
const fails = [];
if (campioni.length < 8) fails.push(`solo ${campioni.length} intercetti misurati: sonda cieca`);
else { if (med(v) > 8) fails.push(`velocita' mediana dell'intercettore ${med(v)} m/s > 8`); if (oltre10 > 15) fails.push(`${oltre10.toFixed(0)}% degli intercetti chiede piu' di 10 m/s`); }
if (!ROSSO && arr.length >= 8 && 100 * arr.filter(x => x <= 1.5).length / arr.length < 70) fails.push(`all'arrivo del pallone l'intercettore e' sul punto solo nel ${(100 * arr.filter(x => x <= 1.5).length / arr.length).toFixed(0)}% dei casi`);
if (errors.length) fails.push('errori di pagina: ' + errors.slice(0, 2).join(' | '));
if (ROSSO) { const ok = fails.some(f => /velocita|chiede/.test(f));
  console.log(ok ? '✅ ROSSO come atteso: col taglio fisso l\'intercettore vola' : '❌ il rosso non riproduce il difetto\n  ' + fails.join('\n  ')); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL intercetto-credibile\n  ' + fails.join('\n  ') : '✅ PASS intercetto-credibile'); process.exit(fails.length ? 1 : 0);
